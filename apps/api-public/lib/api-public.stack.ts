import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

import { resolve as pathResolve } from 'path';
import { readFileSync } from 'fs';

export class ApiPublicStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * Resources this API will use
     */

    /**
     * findOne: Lambda Function
     */
    const coursesFindOneFunction = lambda.Function.fromFunctionAttributes(
      this,
      'CoApiPublicCourses-FindCourseFunction',
      {
        functionArn: `arn:aws:lambda:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:function:CoFindCourseFunction`,
        sameEnvironment: true,
      }
    );

    /**
     * API Gateway
     * https://{restapi_id}.execute-api.{region}.amazonaws.com/{stage_name}/
     * https://ap-southeast-2.console.aws.amazon.com/apigateway/home?region=ap-southeast-2#/apis/txi21niwmd/stages/dev
     *
     * NOTES
     * - no proxy for all routes, integration defined per route
     * - if you make policy changes (even deletion) you'll need to redeploy the API (manually within the console)
     *   https://stackoverflow.com/questions/53016110/aws-api-gateway-user-anonymous-is-not-authorized-to-execute-api
     *
     * TODO
     * - [ ] tighten up the CORS defaults below
     */
    const api = new apigateway.RestApi(this, 'api-public', {
      description: 'Curious Outcomes Public API',
      deployOptions: {
        metricsEnabled: true,
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        stageName: 'dev',
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
      },
    });

    /**
     * Allow our gateway to invoke the lambda function
     *
     * TODO:
     * - [ ] is this a policy tautology?
     * - [ ] use ArnPrincipal(apiPublic) for assumedBy below
     */
    const apiLambdaRole = new iam.Role(this, 'ApiLambdaRole', {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      inlinePolicies: {
        InvokeFindCourseFunctionPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['lambda:InvokeFunction'],
              resources: [coursesFindOneFunction.functionArn],
            }),
          ],
        }),
      },
    });
    coursesFindOneFunction.grantInvoke(apiLambdaRole);

    /**
     * Common response models
     * i.e. these are the structures for data that will be returned from THIS API
     */

    /**
     * Error
     */
    const errorResponseModel = api.addModel('ErrorResponseModel', {
      contentType: 'application/json',
      modelName: 'CoApiPublicErrorResponseModel',
      schema: {
        schema: apigateway.JsonSchemaVersion.DRAFT4,
        title: 'ApiErrorResponse',
        type: apigateway.JsonSchemaType.OBJECT,
        // this is the actual structure
        properties: {
          message: { type: apigateway.JsonSchemaType.STRING },
        },
      },
    });
    /**
     * Course
     * NOTE: the below does not include the externalId
     *       as this is not necessary info for the public
     * TODO
     * - [ ] can we move this to a schema dir or similar
     * - [ ] we also need to align with the openapi schema yaml
     */
    const courseResponseDtoModel = api.addModel('CourseResponseDtoModel', {
      contentType: 'application/json',
      modelName: 'CoApiPublicCourseResponseDtoModel',
      schema: {
        schema: apigateway.JsonSchemaVersion.DRAFT4,
        title: 'CourseResponseDto',
        type: apigateway.JsonSchemaType.OBJECT,
        // this is the actual structure
        properties: {
          id: { type: apigateway.JsonSchemaType.STRING },
          name: { type: apigateway.JsonSchemaType.STRING },
          slug: { type: apigateway.JsonSchemaType.STRING },
        },
      },
    });

    /**
     * Default method response parameters
     */
    // CORS
    const defaultMethodResponseParametersCors: Record<string, boolean> = {
      'method.response.header.Content-Type': true,
      'method.response.header.Access-Control-Allow-Origin': true,
      'method.response.header.Access-Control-Allow-Credentials': true,
    };

    /**
     * Request Validator
     */
    // const basicGetRequestValidator = new apigateway.RequestValidator(
    //   this,
    //   'ApiAdmin-BasicGetRequestValidator',
    //   {
    //     restApi: api,

    //     // the properties below are optional
    //     requestValidatorName: 'ApiAdmin-basicGetRequestValidator',
    //     validateRequestBody: false,
    //     validateRequestParameters: true,
    //   }
    // );

    /**
     * Root Resources for the API
     */
    const courses = api.root.addResource('courses');

    /**
     * findOne
     * GET /courses/{id}?{slug?}
     *
     * ! THERE ARE NO TESTS FOR THIS YET (as I was rushing for review)
     */
    const coursesFind = courses.addResource('{id}');

    /**
     * findOne: request mapping template
     * to convert API input/params/body, into acceptable lambda input
     */
    const coursesFindRequestTemplate = readFileSync(
      pathResolve(
        __dirname,
        '../src/courses/find-one/find-one.map-request.vtl'
      ),
      'utf8'
    ).replace(/(\r\n|\n|\r)/gm, '');

    /**
     * findOne: response mapping template
     * to convert results from lambda into API response
     */
    const coursesFindResponseTemplate = readFileSync(
      pathResolve(
        __dirname,
        '../src/courses/find-one/find-one.map-response.vtl'
      ),
      'utf8'
    ).replace(/(\r\n|\n|\r)/gm, '');

    /**
     * findOne: Accepted Lambda Function Responses
     * i.e. this is what THIS API will accept as a response (from the lambda), and how it will interpret it
     *
     * Non-proxy lambda integrations don't just pass-through all response from the lambda.
     * They need to be funneled through one or more response structures
     */

    // RE selectionPattern
    // this is a regex that allows us to match an actual response from the lambda
    // to one of these defined/allowable responses (that we are saying our API will accept).
    // It is here we can whittle from a number of different custom errors, to a shortlist of
    // HTTP Exceptions we're comfortable communicating to the public client.

    // NOTES
    // _"If the back end is an AWS Lambda function, the AWS Lambda
    // function error header is matched. For all other HTTP and AWS back
    // ends, the HTTP status code is matched."_
    // https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_apigateway.IntegrationResponse.html
    // ---
    // defining no selectionPattern defines denotes the default response
    // https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-integration-settings-integration-response.html

    // SUCCESS
    const coursesFindOneFunctionSuccessResponse: apigateway.IntegrationResponse =
      {
        statusCode: '200',
        responseTemplates: {
          'application/json': coursesFindResponseTemplate,
        },
      };
    const coursesFindOneFunctionServerErrorResponse: apigateway.IntegrationResponse =
      {
        // Anything that the client has no control over, or that is not a known error
        selectionPattern: '^Invalid internal communication',
        statusCode: '500',
        responseTemplates: {
          'application/json': JSON.stringify({
            message: "$util.escapeJavaScript($input.path('$.errorMessage'))",
          }),
        },
        // TODO: is this necessary? Why?
        // is it covered by our CORS defaults above (in API definition)?
        // essentially, this is about passing params from the lambda to the API
        // this sample code doesn't even include anything from the lambda
        // it's just assuming CORS is needed by the API...
        // this doesn't feel like the right place for this
        // responseParameters: {
        //   'method.response.header.Content-Type': "'application/json'",
        //   'method.response.header.Access-Control-Allow-Origin': "'*'",
        //   'method.response.header.Access-Control-Allow-Credentials':
        //     "'true'",
        // },
      };
    // ERROR
    const coursesFindOneFunctionClientErrorResponse: apigateway.IntegrationResponse =
      {
        // we're going to catch all errors with this one for now
        // TODO: review the error patterns that are returned, then separate into multiple responses
        selectionPattern: '.+',
        statusCode: '400',
        responseTemplates: {
          'application/json': JSON.stringify({
            message: "$util.escapeJavaScript($input.path('$.errorMessage'))",
          }),
        },
        // TODO: is this necessary? Why?
        // is it covered by our CORS defaults above (in API definition)?
        // essentially, this is about passing params from the lambda to the API
        // this sample code doesn't even include anything from the lambda
        // it's just assuming CORS is needed by the API...
        // this doesn't feel like the right place for this
        // responseParameters: {
        //   'method.response.header.Content-Type': "'application/json'",
        //   'method.response.header.Access-Control-Allow-Origin': "'*'",
        //   'method.response.header.Access-Control-Allow-Credentials':
        //     "'true'",
        // },
      };

    /**
     * findOne: Lambda Function Integration
     */
    const coursesFindOneFunctionIntegration = new apigateway.LambdaIntegration(
      coursesFindOneFunction,
      {
        // not a proxy, we're taking control of what is sent/received to/from integration
        proxy: false,

        // ---
        // request handling
        // ---

        // we're not passing any of the request parameters (directly) through
        // to this integration. All will be routed through the template (below)
        // requestParameters: {},
        passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
        // this is where we convert request params into lambda input
        requestTemplates: {
          'application/json': coursesFindRequestTemplate,
        },

        // ---
        // non-integration response handling
        // i.e. these responses happen without even hitting the back-end
        // e.g. (API gateway based) request validation
        // ---

        // we are not currently going to mess with API gateway responses
        // we might need to later on if we want to add additional info to error
        // or if we need to add CORS info to response.
        // https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-gatewayResponse-definition.html
        // gatewayResponses: [],

        // ---
        // integration response handling
        // ---
        integrationResponses: [
          coursesFindOneFunctionServerErrorResponse,
          coursesFindOneFunctionClientErrorResponse,
          coursesFindOneFunctionSuccessResponse,
        ],
      }
    );

    /**
     * findOne: method definition
     * - custom (non-proxy) lambda integration
     */
    coursesFind.addMethod('GET', coursesFindOneFunctionIntegration, {
      // Here we can define path, querystring, and acceptable headers (for this method)
      requestParameters: {
        'method.request.path.id': false,
        'method.request.querystring.slug': false,
      },
      // No point including a validator, as both params are optional
      // requestValidator: basicGetRequestValidator,

      // now we have funneled
      // - all possible responses from our Lambda
      // - into a single success response
      // - and a couple of (acceptable) error responses
      // we can define what exactly these look like when they are sent back to the client
      // there should be a response per status code defined in your acceptable integration responses
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: { ...defaultMethodResponseParametersCors },
          responseModels: {
            'application/json': courseResponseDtoModel,
          },
        },
        {
          statusCode: '400',
          responseParameters: { ...defaultMethodResponseParametersCors },
          responseModels: {
            'application/json': errorResponseModel,
          },
        },
      ],
    });

    /**
     * Outputs
     */
    new cdk.CfnOutput(this, 'apiUrl', { value: api.urlForPath() });
  }
}
