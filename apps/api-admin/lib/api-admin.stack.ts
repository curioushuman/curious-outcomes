import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sns from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';

import { resolve as pathResolve } from 'path';
import { readFileSync } from 'fs';

export class ApiAdminStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * SNS Topic for External events
     * Our API Gateway posts messages directly to this
     *
     * TODO
     * - [ ] configure dead letter queue
     *       maybe off lambda?
     *       https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda-readme.html#lambda-with-dlq
     */
    const topicExternalEvents = new sns.Topic(this, 'allExternalEventsTopic', {
      displayName: 'SNS topic for throughput of ALL external events',
      topicName: 'allExternalEventsTopic',
    });

    /**
     * API Gateway
     * https://{restapi_id}.execute-api.{region}.amazonaws.com/{stage_name}/
     * https://ap-southeast-2.console.aws.amazon.com/apigateway/home?region=ap-southeast-2#/apis/txi21niwmd/stages/dev
     */
    const api = new apigateway.RestApi(this, 'api-admin', {
      description: 'Curious Outcomes Admin API',
      deployOptions: {
        metricsEnabled: true,
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        stageName: 'dev',
      },
    });

    /**
     * Allow our gateway to publish to the topic
     */
    const apiSnsRole = new iam.Role(this, 'ApiSnsRole', {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      inlinePolicies: {
        // I assume this locks it down to only publish to the topic
        // TODO: investigate (IAM) further
        PublishExternalEventPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['sns:Publish'],
              resources: [topicExternalEvents.topicArn],
            }),
          ],
        }),
      },
    });
    topicExternalEvents.grantPublish(apiSnsRole);

    /**
     * Response models for the API; valid and error
     */
    const responseModel = api.addModel('ResponseModel', {
      contentType: 'application/json',
      modelName: 'ResponseModel',
      schema: {
        schema: apigateway.JsonSchemaVersion.DRAFT4,
        title: 'pollResponse',
        type: apigateway.JsonSchemaType.OBJECT,
        properties: { message: { type: apigateway.JsonSchemaType.STRING } },
      },
    });
    const errorResponseModel = api.addModel('ErrorResponseModel', {
      contentType: 'application/json',
      modelName: 'ErrorResponseModel',
      schema: {
        schema: apigateway.JsonSchemaVersion.DRAFT4,
        title: 'errorResponse',
        type: apigateway.JsonSchemaType.OBJECT,
        properties: {
          state: { type: apigateway.JsonSchemaType.STRING },
          message: { type: apigateway.JsonSchemaType.STRING },
        },
      },
    });

    /**
     * Root Resources for the API
     *
     * TODO:
     * - [ ] models from types
     *       https://matt.martz.codes/how-to-automatically-generate-request-models-from-typescript-interfaces
     */
    const courses = api.root.addResource('courses');

    /**
     * Resources/methods for the /courses endpoint
     */
    /**
     * GET /courses/{eventType}/{courseSourceId}?{updatedStatus?}
     *
     * TODO:
     * - [ ] idempotency for the hook
     *       do we assume each hit of the hook is an independent event?
     *       can we do it another way? Maybe specific to the event?
     *       https://aws.amazon.com/premiumsupport/knowledge-center/lambda-function-idempotent/
     */
    const coursesHook = courses.addResource('hook');
    const coursesHookType = coursesHook.addResource('{eventType}');
    const coursesHookTypeAndId =
      coursesHookType.addResource('{courseSourceId}');

    /**
     * Mapping template for this resource/method
     */
    const coursesHookTypeAndIdRequestTemplate = readFileSync(
      pathResolve(__dirname, '../src/courses/hook/hook.mapping-template.vtl'),
      'utf8'
    ).replace(/(\r\n|\n|\r)/gm, '');

    /**
     * Request Validator
     */
    const basicGetRequestValidator = new apigateway.RequestValidator(
      this,
      'ApiAdmin-BasicGetRequestValidator',
      {
        restApi: api,

        // the properties below are optional
        requestValidatorName: 'ApiAdmin-basicGetRequestValidator',
        validateRequestBody: false,
        validateRequestParameters: true,
      }
    );

    // integration with SNS topic for external events
    // source: https://github.com/cdk-patterns/serverless/blob/main/the-big-fan/typescript/lib/the-big-fan-stack.ts
    coursesHookTypeAndId.addMethod(
      'GET',
      new apigateway.AwsIntegration({
        service: 'sns',
        integrationHttpMethod: 'POST',
        path: `${cdk.Aws.ACCOUNT_ID}/${topicExternalEvents.topicName}`,
        options: {
          credentialsRole: apiSnsRole,
          // Tell api gw to send our payload as query params
          // TODO: seems standard, but why?
          requestParameters: {
            'integration.request.header.Content-Type':
              "'application/x-www-form-urlencoded'",
          },
          // TODO: once removed, add VTL unit tests
          //       http://mapping-template-checker.toqoz.net/
          //       https://github.com/ToQoz/api-gateway-mapping-template
          // TODO:
          // - [ ] better string replacement below
          requestTemplates: {
            'application/json': coursesHookTypeAndIdRequestTemplate.replace(
              'topicExternalEvents.topicArn',
              topicExternalEvents.topicArn
            ),
          },
          passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
          integrationResponses: [
            {
              // if the return code from SNS is 200, use the success response
              statusCode: '200',
              responseTemplates: {
                // Just respond with a generic message
                'application/json': JSON.stringify({
                  message: 'message added to topic',
                }),
              },
            },
            {
              // NOTE: _If the back end is an AWS Lambda function, the AWS Lambda
              // function error header is matched. For all other HTTP and AWS back
              // ends, the HTTP status code is matched._
              // https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_apigateway.IntegrationResponse.html
              // selectionPattern: '^.*(Error|40|50).*$',
              // prettier-ignore
              // eslint-disable-next-line no-useless-escape
              selectionPattern: "400",
              statusCode: '400',
              responseTemplates: {
                'application/json': JSON.stringify({
                  state: 'error',
                  message:
                    "$util.escapeJavaScript($input.path('$.Error.Message'))",
                }),
              },
              responseParameters: {
                'method.response.header.Content-Type': "'application/json'",
                'method.response.header.Access-Control-Allow-Origin': "'*'",
                'method.response.header.Access-Control-Allow-Credentials':
                  "'true'",
              },
            },
          ],
        },
      }),
      {
        // Here we can define path, querystring, and acceptable headers
        requestParameters: {
          'method.request.path.eventType': true,
          'method.request.path.courseSourceId': true,
          'method.request.querystring.updatedStatus': false,
        },
        requestValidator: basicGetRequestValidator,
        // what we allow to be returned as a response
        methodResponses: [
          {
            statusCode: '200',
            responseParameters: {
              'method.response.header.Content-Type': true,
              'method.response.header.Access-Control-Allow-Origin': true,
              'method.response.header.Access-Control-Allow-Credentials': true,
            },
            responseModels: {
              'application/json': responseModel,
            },
          },
          {
            statusCode: '400',
            responseParameters: {
              'method.response.header.Content-Type': true,
              'method.response.header.Access-Control-Allow-Origin': true,
              'method.response.header.Access-Control-Allow-Credentials': true,
            },
            responseModels: {
              'application/json': errorResponseModel,
            },
          },
        ],
      }
    );

    /**
     * GET /courses/{courseSourceId}
     *
     * ! THERE ARE NO TESTS FOR THIS YET (as I was rushing for review)
     */
    const coursesFind = courses.addResource('{courseSourceId}');

    /**
     * Mapping template for this resource/method
     */
    const coursesFindRequestTemplate = readFileSync(
      pathResolve(
        __dirname,
        '../src/courses/find-one/find-one.mapping-template.vtl'
      ),
      'utf8'
    ).replace(/(\r\n|\n|\r)/gm, '');

    const coursesFindOneFunction = lambda.Function.fromFunctionArn(
      this,
      'Function',
      `arn:aws:lambda:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:function:FindCourseFunction`
    );

    coursesFind.addMethod(
      'GET',
      new apigateway.LambdaIntegration(coursesFindOneFunction, {
        // TODO: once removed, add VTL unit tests
        //       http://mapping-template-checker.toqoz.net/
        //       https://github.com/ToQoz/api-gateway-mapping-template
        requestTemplates: {
          'application/json': coursesFindRequestTemplate,
        },
        passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
        // ! UP TO: everything below here needs completion
        integrationResponses: [
          {
            // if the return code from SNS is 200, use the success response
            statusCode: '200',
            responseTemplates: {
              // Just respond with a generic message
              'application/json': JSON.stringify({
                message: 'message added to topic',
              }),
            },
          },
          {
            // NOTE: _If the back end is an AWS Lambda function, the AWS Lambda
            // function error header is matched. For all other HTTP and AWS back
            // ends, the HTTP status code is matched._
            // https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_apigateway.IntegrationResponse.html
            // selectionPattern: '^.*(Error|40|50).*$',
            // prettier-ignore
            // eslint-disable-next-line no-useless-escape
            selectionPattern: "400",
            statusCode: '400',
            responseTemplates: {
              'application/json': JSON.stringify({
                state: 'error',
                message:
                  "$util.escapeJavaScript($input.path('$.Error.Message'))",
              }),
            },
            responseParameters: {
              'method.response.header.Content-Type': "'application/json'",
              'method.response.header.Access-Control-Allow-Origin': "'*'",
              'method.response.header.Access-Control-Allow-Credentials':
                "'true'",
            },
          },
        ],
        // Here we can define path, querystring, and acceptable headers
        requestParameters: {
          'method.request.path.courseSourceId': true,
        },
        requestValidator: basicGetRequestValidator,
        // what we allow to be returned as a response
        methodResponses: [
          {
            statusCode: '200',
            responseParameters: {
              'method.response.header.Content-Type': true,
              'method.response.header.Access-Control-Allow-Origin': true,
              'method.response.header.Access-Control-Allow-Credentials': true,
            },
            responseModels: {
              'application/json': responseModel,
            },
          },
          {
            statusCode: '400',
            responseParameters: {
              'method.response.header.Content-Type': true,
              'method.response.header.Access-Control-Allow-Origin': true,
              'method.response.header.Access-Control-Allow-Credentials': true,
            },
            responseModels: {
              'application/json': errorResponseModel,
            },
          },
        ],
      })
    );

    /**
     * Outputs
     */
    new cdk.CfnOutput(this, 'apiUrl', { value: api.urlForPath() });
  }
}
