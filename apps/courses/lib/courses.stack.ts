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
  architecture: lambda.Architecture.ARM_64,
  bundling: {
    minify: true,
    sourceMap: true,
    // externalModules: [
    //   'aws-sdk',
    //   '@curioushuman/co-courses',
    //   '@nestjs/common',
    //   '@nestjs/core',
    // ],
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
     * Function: Create Course
     */
    const createCourseFunction = new NodejsFunction(
      this,
      'CreateCourseFunction',
      {
        entry: pathResolve(__dirname, '../src/functions/create-course/main.ts'),
        // layers: lambdaLayers,
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
}
