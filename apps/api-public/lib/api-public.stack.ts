import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

import { resolve as pathResolve } from 'path';
import { readFileSync } from 'fs';

export class ApiPublicStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * API Gateway
     * https://{restapi_id}.execute-api.{region}.amazonaws.com/{stage_name}/
     * https://ap-southeast-2.console.aws.amazon.com/apigateway/home?region=ap-southeast-2#/apis/txi21niwmd/stages/dev
     */
    const api = new apigateway.RestApi(this, 'api-public', {
      description: 'Curious Outcomes Public API',
      deployOptions: {
        metricsEnabled: true,
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        stageName: 'dev',
      },
    });

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

    /**
     * Root Resources for the API
     */
    const courses = api.root.addResource('courses');

    /**
     * GET /courses/{courseId}?{slug?}
     *
     * ! THERE ARE NO TESTS FOR THIS YET (as I was rushing for review)
     */
    const coursesFind = courses.addResource('{courseId}');

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
          'method.request.path.courseId': true,
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
