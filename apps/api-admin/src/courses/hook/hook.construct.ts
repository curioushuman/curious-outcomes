import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import { Construct } from 'constructs';

import { resolve as pathResolve } from 'path';

import { CoApiConstruct } from '../../../../../dist/local/@curioushuman/co-cdk-utils/src';

/**
 * Props required to initialize a CO API Construct
 */
export interface HookProps {
  apiConstruct: CoApiConstruct;
}

/**
 * Components required for the api-admin stack courses:hook resource
 */
export class HookConstruct extends Construct {
  private apiConstruct: CoApiConstruct;
  private topic: sns.Topic;

  public readonly snsIntegration: apigateway.AwsIntegration;
  public readonly methodOptions: apigateway.MethodOptions;

  constructor(scope: Construct, id: string, props: HookProps) {
    super(scope, id);

    this.apiConstruct = props.apiConstruct;

    /**
     * SNS Topic for External events
     * Our API Gateway posts messages directly to this
     *
     * TODO
     * - [ ] configure dead letter queue
     *       maybe off lambda?
     *       https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda-readme.html#lambda-with-dlq
     * - [ ] should this and subscribers be in it's own stack?
     */
    const topicId = 'all-external-events';
    this.topic = new sns.Topic(
      this,
      this.apiConstruct.transformIdToResourceTitle(topicId, 'Topic'),
      {
        displayName: 'SNS topic for throughput of ALL external events',
        topicName: this.apiConstruct.transformIdToResourceName(
          topicId,
          'Topic'
        ),
      }
    );
    this.topic.grantPublish(this.apiConstruct.role);

    /**
     * Subscribers to the topic
     */

    /**
     * Create course Lambda Function
     * Filter: object = course, type = create
     */
    const coursesCreateFunction = lambda.Function.fromFunctionAttributes(
      this,
      this.apiConstruct.transformIdToResourceTitle(
        `${id}-create-course`,
        'Lambda'
      ),
      {
        functionArn: `arn:aws:lambda:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:function:CoCreateCourseFunction`,
        sameEnvironment: true,
      }
    );

    const createCourseExternalEventSubscription =
      new subscriptions.LambdaSubscription(coursesCreateFunction, {
        filterPolicy: {
          object: sns.SubscriptionFilter.stringFilter({
            allowlist: ['Course'],
          }),
          type: sns.SubscriptionFilter.stringFilter({
            allowlist: ['Created'],
          }),
        },
      });
    this.topic.addSubscription(createCourseExternalEventSubscription);

    /**
     * Response model
     * NOTES
     * - we'll keep it in here, as no-one else will find it useful
     */
    this.apiConstruct.addResponseModel('hook-event-success', {
      properties: {
        message: { type: apigateway.JsonSchemaType.STRING },
      },
    });

    /**
     * hook: request mapping template
     * to convert API input/params/body, into acceptable lambda input
     */
    const coursesHookRequestTemplate = CoApiConstruct.vtlTemplateFromFile(
      pathResolve(__dirname, './hook.map-request.vtl')
    );

    /**
     * hook: Acceptable Responses from SNS
     * For more info on integrationResponses check CoApiConstruct
     */

    // SUCCESS
    // NOTE: our success template uses nothing from the SNS message
    const coursesHookFunctionSuccessResponse: apigateway.IntegrationResponse = {
      statusCode: '200',
      responseTemplates: {
        'application/json': JSON.stringify({
          message: 'Event received',
        }),
      },
    };
    // ERROR
    const coursesHookFunctionServerErrorResponse =
      CoApiConstruct.serverErrorResponse();
    const coursesHookFunctionClientErrorResponse =
      CoApiConstruct.clientErrorResponse();

    /**
     * hook: SNS Integration
     */
    this.snsIntegration = new apigateway.AwsIntegration({
      service: 'sns',
      integrationHttpMethod: 'POST',
      path: `${cdk.Aws.ACCOUNT_ID}/${this.topic.topicName}`,
      options: {
        // TODO: is this necessary?
        // credentialsRole: apiSnsRole,
        // Tell api gw to send our payload as query params
        // TODO: seems standard, but why?
        requestParameters: {
          'integration.request.header.Content-Type':
            "'application/x-www-form-urlencoded'",
        },
        // TODO:
        // - [ ] better string replacement below
        requestTemplates: {
          'application/json': coursesHookRequestTemplate.replace(
            'topicExternalEvents.topicArn',
            this.topic.topicArn
          ),
        },
        passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
        integrationResponses: [
          coursesHookFunctionSuccessResponse,
          coursesHookFunctionServerErrorResponse,
          coursesHookFunctionClientErrorResponse,
        ],
      },
    });

    /**
     * Default method response parameters
     */
    // CORS
    const defaultMethodResponseParametersCors =
      CoApiConstruct.methodResponseParametersCors();

    this.methodOptions = {
      // Here we can define path, querystring, and acceptable headers
      requestParameters: {
        'method.request.path.eventType': true,
        'method.request.path.courseSourceId': true,
        'method.request.querystring.updatedStatus': false,
      },
      requestValidator: this.apiConstruct.requestValidators['BasicGet'],
      // what we allow to be returned as a response
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: { ...defaultMethodResponseParametersCors },
          responseModels: {
            'application/json':
              this.apiConstruct.responseModels['hook-event-success'],
          },
        },
        {
          statusCode: '400',
          responseParameters: { ...defaultMethodResponseParametersCors },
          responseModels: {
            'application/json': this.apiConstruct.responseModels['error'],
          },
        },
        {
          statusCode: '500',
          responseParameters: { ...defaultMethodResponseParametersCors },
          responseModels: {
            'application/json': this.apiConstruct.responseModels['error'],
          },
        },
      ],
    };
  }
}
