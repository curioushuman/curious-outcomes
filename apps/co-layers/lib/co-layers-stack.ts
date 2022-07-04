import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

const layerProps = {
  compatibleRuntimes: [lambda.Runtime.NODEJS_16_X],
  compatibleArchitectures: [lambda.Architecture.X86_64],
  removalPolicy: cdk.RemovalPolicy.DESTROY,
};

const layerLocation = '../../dist/layers';

export class CoLayersStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new lambda.LayerVersion(this, 'CoCourses', {
      ...layerProps,
      layerVersionName: 'TsCdkCoCourses',
      code: lambda.Code.fromAsset(`${layerLocation}/co-courses`),
    });

    new lambda.LayerVersion(this, 'CoNodeModules', {
      ...layerProps,
      layerVersionName: 'TsCdkCoNodeModules',
      code: lambda.Code.fromAsset(`${layerLocation}/co-node-modules`),
    });

    new lambda.LayerVersion(this, 'CoShared', {
      ...layerProps,
      layerVersionName: 'TsCdkCoShared',
      code: lambda.Code.fromAsset(`${layerLocation}/co-shared`),
    });
  }
}
