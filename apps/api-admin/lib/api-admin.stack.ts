import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sns from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';

// Importing utilities for use in infrastructure processes
// Initially we're going to import from local sources
import { CoApiConstruct } from '../../../dist/local/@curioushuman/co-cdk-utils/src';
// Long term we'll put them into packages
// import { CoApiConstruct } from '@curioushuman/co-cdk-utils';

export class ApiAdminStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * API Gateway
     */
    const apiAdmin = new CoApiConstruct(this, 'api-admin', {
      description: 'Curious Outcomes Admin API',
      applicationNamePrefix: 'Co',
      stageName: 'dev',
    });

    /**
     * Resources this API will use
     */

    /**
     * courses-findOne: Lambda Function
     */
    const coursesFindOneFunction = lambda.Function.fromFunctionAttributes(
      this,
      'CoApiAdminCourses-FindCourseFunction',
      {
        functionArn: `arn:aws:lambda:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:function:CoFindCourseFunction`,
        sameEnvironment: true,
      }
    );
    // Allow access for API
    coursesFindOneFunction.grantInvoke(apiAdmin.role);

    /**
     * courses-create: Lambda Function
     */
    const coursesCreateFunction = lambda.Function.fromFunctionAttributes(
      this,
      'CoApiAdminCourses-CreateCourseFunction',
      {
        functionArn: `arn:aws:lambda:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:function:CoCreateCourseFunction`,
        sameEnvironment: true,
      }
    );
    // Allow access for API
    coursesCreateFunction.grantInvoke(apiAdmin.role);

    /**
     * SNS Topic for External events
     * Our API Gateway posts messages directly to this
     *
     * TODO
     * - [ ] configure dead letter queue
     *       maybe off lambda?
     *       https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda-readme.html#lambda-with-dlq
     */
    const topicExternalEvents = new sns.Topic(
      this,
      'CoAllExternalEventsTopic',
      {
        displayName: 'SNS topic for throughput of ALL external events',
        topicName: 'allExternalEventsTopic',
      }
    );
    topicExternalEvents.grantPublish(apiAdmin.role);

    /**
     * Common response models
     * i.e. these are the structures for data that will be returned from THIS API
     */

    /**
     * Error
     */
    const errorModel = apiAdmin.addErrorResponseModel();

    /**
     * Course
     * NOTE: the below does not include the externalId
     *       as this is not necessary info for the admin
     * TODO
     * - [ ] can we move this to a schema dir or similar
     * - [ ] we also need to align with the openapi schema yaml
     */
    const courseResponseDtoModel = apiAdmin.addResponseModel(
      'course-response-dto',
      {
        properties: {
          id: { type: apigateway.JsonSchemaType.STRING },
          externalId: { type: apigateway.JsonSchemaType.STRING },
          name: { type: apigateway.JsonSchemaType.STRING },
          slug: { type: apigateway.JsonSchemaType.STRING },
        },
      }
    );

    /**
     * Root Resources for the API
     */
    const courses = apiAdmin.api.root.addResource('courses');

    /**
     * findOne
     * GET /courses/{id}?{slug?}
     *
     * ! THERE ARE NO TESTS FOR THIS YET (as I was rushing for review)
     */
    const coursesFind = courses.addResource('{externalId}');

    /**
     * findOne: request mapping template
     * to convert API input/params/body, into acceptable lambda input
     */
    const coursesFindRequestTemplate = CoApiConstruct.vtlTemplateFromFile(
      'src/courses/find-one/find-one.map-request.vtl'
    );

    /**
     * findOne: response mapping template
     * to convert results from lambda into API response
     */
    const coursesFindResponseTemplate = CoApiConstruct.vtlTemplateFromFile(
      'src/courses/find-one/find-one.map-response.vtl'
    );

    /**
     * findOne: Accepted Lambda Function Responses
     * For more info on integrationResponses check CoApiConstruct
     */

    // SUCCESS
    const coursesFindOneFunctionSuccessResponse: apigateway.IntegrationResponse =
      {
        statusCode: '200',
        responseTemplates: {
          'application/json': coursesFindResponseTemplate,
        },
      };
    // ERROR
    const coursesFindOneFunctionServerErrorResponse =
      CoApiConstruct.serverErrorResponse();
    const coursesFindOneFunctionClientErrorResponse =
      CoApiConstruct.clientErrorResponse();

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
     * Default method response parameters
     */
    // CORS
    const defaultMethodResponseParametersCors: Record<string, boolean> = {
      'method.response.header.Content-Type': true,
      'method.response.header.Access-Control-Allow-Origin': true,
      'method.response.header.Access-Control-Allow-Credentials': true,
    };

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
            'application/json': errorModel,
          },
        },
      ],
    });

    /**
     * Outputs
     */
    new cdk.CfnOutput(this, 'apiUrl', { value: apiAdmin.api.urlForPath() });
  }
}
