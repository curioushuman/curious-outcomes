import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sns from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';

export class ApiAdminStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * SNS Topic for External events
     * Our API Gateway posts messages directly to this
     */
    const topicExternalEvents = new sns.Topic(this, 'allExternalEventsTopic', {
      displayName: 'SNS topic for throughput of ALL external events',
    });

    /**
     * API Gateway
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
     */
    const courses = api.root.addResource('courses');

    /**
     * Resources/methods for the /courses endpoint
     */
    /**
     * GET /courses/{eventType}/{courseId}?status={status}
     */
    const coursesHook = courses.addResource('hook');
    const coursesHookType = coursesHook.addResource('{eventType}');
    const coursesHookTypeAndId = coursesHookType.addResource('{courseId}');
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
          requestTemplates: {
            'application/json':
              '#set($allParams = $input.params())\n' +
              "#set($pathParams = $allParams.get('path'))\n" +
              'Action=Publish&' +
              "TargetArn=$util.urlEncode('" +
              topicExternalEvents.topicArn +
              "')&" +
              'MessageStructure=json&' +
              // NOTE: when using JSON as MessageStructure (for SNS) you must define a message
              //       per (consuming) AWS service; AND a default message is required.
              //       https://docs.aws.amazon.com/sns/latest/api/API_Publish.html
              // TODO:
              // - [ ] SQS, similar to Lambda
              // - [ ] improve the default message
              'Message={' +
              '"lambda":"{\n' +
              '#foreach($paramName in $pathParams.keySet())\n' +
              '\\"$paramName\\" : \\"$util.escapeJavaScript($pathParams.get($paramName))\\"\n' +
              '#if($foreach.hasNext),#end\n' +
              '#end\n' +
              '#if($input.params(\'status\'))\\"status\\":\\"$util.escapeJavaScript($input.params(\'status\'))\\"#end\n' +
              '"default":"$util.urlEncode($input.params(\'eventType\')):$util.urlEncode($input.params(\'courseId\'))"' +
              +'}&' +
              'Version=2010-03-31&' +
              'MessageAttributes.entry.1.Name=type&' +
              'MessageAttributes.entry.1.Value.DataType=String&' +
              "MessageAttributes.entry.1.Value.StringValue=$util.urlEncode($input.params('eventType'))&" +
              'MessageAttributes.entry.2.Name=status&' +
              'MessageAttributes.entry.2.Value.DataType=String&' +
              "MessageAttributes.entry.2.Value.StringValue=$util.urlEncode($input.params('status'))",
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
              // If the response includes the word Error, use the error response
              // source: https://github.com/cdk-patterns/serverless/blob/main/the-big-fan/typescript/lib/the-big-fan-stack.ts
              // prettier-ignore
              // eslint-disable-next-line no-useless-escape
              selectionPattern: "^\[Error\].*",
              statusCode: '400',
              responseTemplates: {
                'application/json': JSON.stringify({
                  state: 'error',
                  message:
                    "$util.escapeJavaScript($input.path('$.errorMessage'))",
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
        methodResponses: [
          //We need to define what models are allowed on our method response
          {
            // Successful response from the integration
            statusCode: '200',
            // Define what parameters are allowed or not
            responseParameters: {
              'method.response.header.Content-Type': true,
              'method.response.header.Access-Control-Allow-Origin': true,
              'method.response.header.Access-Control-Allow-Credentials': true,
            },
            // Validate the schema on the response
            responseModels: {
              'application/json': responseModel,
            },
          },
          {
            // Same thing for the error responses
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
     * Outputs
     */
    new cdk.CfnOutput(this, 'apiUrl', { value: api.urlForPath() });
  }
}
