import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

/**
 * The environment we'll be deploying to
 */
const devEnv = {
  account: '793735516609',
  region: 'ap-southeast-2',
};

/**
 * Current environment
 */
const env = devEnv;

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
     * Lambda layers
     *
     * NOTES
     * - we currently use unqualified ARNs for our layers
     *    Q: arn:aws:lambda:${env.region}:${env.account}:layer:TsCdkCoCourses:2
     *    UnQ: arn:aws:lambda:${env.region}:${env.account}:layer:TsCdkCoCourses
     *   this means they will always request the latest version
     *   for now this is sufficient
     */
    const lambdaLayers = [
      lambda.LayerVersion.fromLayerVersionArn(
        this,
        'CdkLayerCoCourses',
        `arn:aws:lambda:${env.region}:${env.account}:layer:TsCdkCoCourses`
      ),
      lambda.LayerVersion.fromLayerVersionArn(
        this,
        'CdkLayerCoNodeModules',
        `arn:aws:lambda:${env.region}:${env.account}:layer:TsCdkCoNodeModules`
      ),
      lambda.LayerVersion.fromLayerVersionArn(
        this,
        'CdkLayerCoShared',
        `arn:aws:lambda:${env.region}:${env.account}:layer:TsCdkCoShared`
      ),
    ];

    /**
     * Functions
     */
    const findCourseFunction = new NodejsFunction(this, 'FindCourseFunction', {
      entry: './src/functions/find-course/main.ts',
      layers: lambdaLayers,
      ...lambdaProps,
    });

    /**
     * API Gateway
     */
    const api = new apigateway.RestApi(this, 'api', {
      description: 'Courses API',
      deployOptions: {
        stageName: 'dev',
      },
      defaultCorsPreflightOptions: {
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
        ],
        // allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowMethods: ['OPTIONS', 'GET'],
        allowCredentials: true,
        allowOrigins: ['http://localhost:3000'],
      },
    });

    const courses = api.root.addResource('courses');
    // courses.addMethod('GET'); // GET /courses
    // courses.addMethod('POST'); // POST /courses

    const course = courses.addResource('{course}');
    course.addMethod(
      'GET',
      new apigateway.LambdaIntegration(findCourseFunction)
    );

    /**
     * Outputs
     */
    new cdk.CfnOutput(this, 'apiUrl', { value: api.url });
  }
}
