import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

import { resolve as pathResolve } from 'path';

/**
 * Most functions will share the same basic props
 * Variations can ben handled below in the stack definition
 */
const lambdaProps = {
  architecture: lambda.Architecture.X86_64,
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
  memorySize: 128,
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
        this.getLambdaLayerArn('TsCdkCoCourses')
      ),
      lambda.LayerVersion.fromLayerVersionArn(
        this,
        'CdkLayerCoNodeModules',
        this.getLambdaLayerArn('TsCdkCoNodeModules')
      ),
      lambda.LayerVersion.fromLayerVersionArn(
        this,
        'CdkLayerCoShared',
        this.getLambdaLayerArn('TsCdkCoShared')
      ),
    ];

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

    /**
     * Outputs
     * (If any)
     */
  }

  private getLambdaLayerArn(layerName: string) {
    const version = this.getLambdaLayerVersion(layerName);
    const accountId =
      process.env.NODE_ENV === 'hybrid'
        ? process.env.CDK_LIVE_ACCOUNT
        : cdk.Aws.ACCOUNT_ID;
    return `arn:aws:lambda:${cdk.Aws.REGION}:${accountId}:layer:${layerName}:${version}`;
  }

  /**
   * This is a dirty way of hard coding the layer version numbers
   * However, it leaves us open to replacing it with more dynamic versions later on
   *
   * TODO
   * - [ ] replace with dynamic method
   *       https://stackoverflow.com/questions/55749294/latest-lambda-layer-arn
   *       'aws lambda list-layers' might be useful as well
   *
   * * DON'T FORGET TO UPDATE THE add-live-layer-permissions COMMAND IN co-layers/project.json
   *   If any of the version numbers change, you'll need to update the command
   *   to give localstack access to the correct layer version.
   */
  private getLambdaLayerVersion(layerName: string) {
    if (process.env.NODE_ENV === 'local') {
      return 1;
    }
    let version = 1;
    switch (layerName) {
      case 'TsCdkCoCourses':
        version = 7;
        break;
      case 'TsCdkCoNodeModules':
        version = 1;
        break;
      case 'TsCdkCoShared':
        version = 7;
        break;
    }
    return version;
  }
}
