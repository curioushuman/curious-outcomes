import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

import { resolve as pathResolve } from 'path';

/**
 * Most functions will share the same basic props
 * Variations can ben handled below in the stack definition
 */
const lambdaProps = {
  architecture: lambda.Architecture.ARM_64,
  bundling: {
    minify: true,
    sourceMap: true,
    externalModules: [
      'aws-sdk',
      '@curioushuman/co-courses',
      '@curioushuman/loggable',
      '@nestjs/common',
      '@nestjs/core',
    ],
  },
  environment: {
    NODE_OPTIONS: '--enable-source-maps',
  },
  logRetention: logs.RetentionDays.ONE_DAY,
  runtime: lambda.Runtime.NODEJS_16_X,
  memorySize: 512,
  handler: 'handler',
  // timeout: cdk.Duration.minutes(1),
};

/**
 * These are the components required for the courses stack
 */
export class CoursesStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * Required layers
     */
    const lambdaLayers = [
      lambda.LayerVersion.fromLayerVersionArn(
        this,
        'CdkLayerCoCourses',
        `arn:aws:lambda:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:layer:TsCdkCoCourses:6`
      ),
      lambda.LayerVersion.fromLayerVersionArn(
        this,
        'CdkLayerCoNodeModules',
        `arn:aws:lambda:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:layer:TsCdkCoNodeModules:1`
      ),
      lambda.LayerVersion.fromLayerVersionArn(
        this,
        'CdkLayerCoShared',
        `arn:aws:lambda:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:layer:TsCdkCoShared:5`
      ),
    ];

    /**
     * Function: Create Course
     *
     * NOTES:
     * - functionName required for importing into other stacks
     *
     * TODO:
     * - [ ] idempotency
     *       https://aws.amazon.com/premiumsupport/knowledge-center/lambda-function-idempotent/
     * - [ ] configure retry attempts (upon failure)
     */
    const createCourseFunction = new NodejsFunction(
      this,
      'CreateCourseFunction',
      {
        functionName: 'CoCreateCourseFunction',
        entry: pathResolve(__dirname, '../src/functions/create-course/main.ts'),
        layers: lambdaLayers,
        ...lambdaProps,
      }
    );
    // ALWAYS ADD TAGS
    cdk.Tags.of(createCourseFunction).add('identifier', 'CreateCourseFunction');

    // Subscribe the function to external events
    // Filter = object = course, type = create
    const externalEventsTopic = sns.Topic.fromTopicArn(
      this,
      'CoursesStack-allExternalEventsTopic',
      `arn:aws:sns:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:allExternalEventsTopic`
    );
    const createCourseExternalEventSubscription =
      new subscriptions.LambdaSubscription(createCourseFunction, {
        filterPolicy: {
          object: sns.SubscriptionFilter.stringFilter({
            allowlist: ['Course'],
          }),
          type: sns.SubscriptionFilter.stringFilter({
            allowlist: ['Created'],
          }),
        },
      });
    externalEventsTopic.addSubscription(createCourseExternalEventSubscription);

    /**
     * Function: Find Course
     *
     * NOTES:
     * - functionName required for importing into other stacks
     *
     * TODO:
     * - [ ] configure retry attempts (upon failure)
     */
    const findCourseFunction = new NodejsFunction(this, 'FindCourseFunction', {
      functionName: 'CoFindCourseFunction',
      entry: pathResolve(__dirname, '../src/functions/find-course/main.ts'),
      layers: lambdaLayers,
      ...lambdaProps,
    });
    // ALWAYS ADD TAGS
    cdk.Tags.of(findCourseFunction).add('identifier', 'FindCourseFunction');

    /**
     * Outputs
     * (If any)
     */
  }
}
