import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export class ApiAdminStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

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
     * Outputs
     */
    new cdk.CfnOutput(this, 'apiUrl', { value: api.urlForPath() });
  }
}
