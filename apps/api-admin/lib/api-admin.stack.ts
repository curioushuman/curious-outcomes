import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sns from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';

import { resolve as pathResolve } from 'path';

// Importing utilities for use in infrastructure processes
// Initially we're going to import from local sources
import { CoApiConstruct } from '../../../dist/local/@curioushuman/co-cdk-utils/src';
// Long term we'll put them into packages
// import { CoApiConstruct } from '@curioushuman/co-cdk-utils';

import { FindOneConstruct } from '../src/courses/find-one/find-one.construct';

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
     * Course
     * NOTE: the below does not include the externalId
     *       as this is not necessary info for the admin
     * TODO
     * - [ ] can we move this to a schema dir or similar
     * - [ ] we also need to align with the openapi schema yaml
     */
    apiAdmin.addResponseModel('course-response-dto', {
      properties: {
        id: { type: apigateway.JsonSchemaType.STRING },
        externalId: { type: apigateway.JsonSchemaType.STRING },
        name: { type: apigateway.JsonSchemaType.STRING },
        slug: { type: apigateway.JsonSchemaType.STRING },
      },
    });

    /**
     * Root Resources for the API
     */
    const courses = apiAdmin.api.root.addResource('courses');

    /**
     * findOne
     * GET /courses/{id}?{slug?}
     */
    const coursesFind = courses.addResource('{externalId}');

    /**
     * findOne construct
     * NOTE: this pares away a lot of the setup for this resource
     */
    const coursesFindConstruct = new FindOneConstruct(
      this,
      'courses-find-one',
      { apiConstruct: apiAdmin }
    );

    /**
     * findOne: request mapping template
     * to convert API input/params/body, into acceptable lambda input
     */
    const coursesFindRequestTemplate = CoApiConstruct.vtlTemplateFromFile(
      pathResolve(__dirname, '../src/courses/find-one/find-one.map-request.vtl')
    );

    /**
     * findOne: response mapping template
     * to convert results from lambda into API response
     */
    const coursesFindResponseTemplate = CoApiConstruct.vtlTemplateFromFile(
      pathResolve(
        __dirname,
        '../src/courses/find-one/find-one.map-response.vtl'
      )
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
    const coursesFindOneFunctionNotFoundErrorResponse =
      CoApiConstruct.notFoundErrorResponse();

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
          coursesFindOneFunctionNotFoundErrorResponse,
          coursesFindOneFunctionSuccessResponse,
        ],
      }
    );

    /**
     * findOne: method definition
     * - custom (non-proxy) lambda integration
     */
    coursesFind.addMethod(
      'GET',
      coursesFindOneFunctionIntegration,
      coursesFindConstruct.methodOptions
    );

    /**
     * Outputs
     */
    new cdk.CfnOutput(this, 'apiUrl', { value: apiAdmin.api.urlForPath() });
  }
}
