import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

/**
 * Props required to initialize a CO API Construct
 */
export interface CoApiProps {
  description: string;
  stageName?: string;
}

/**
 * CO API Construct
 * i.e. a standard API implementation, and some helpers
 */
export class CoApiConstruct extends Construct {
  public api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: CoApiProps) {
    super(scope, id);

    /**
     * API Gateway
     * https://{restapi_id}.execute-api.{region}.amazonaws.com/{stage_name}/
     * https://ap-southeast-2.console.aws.amazon.com/apigateway/home?region=ap-southeast-2#/apis/txi21niwmd/stages/dev
     *
     * NOTES
     * - no proxy for all routes, integration defined per route
     * - if you make policy changes (even deletion) you'll need to redeploy the API (manually within the console)
     *   https://stackoverflow.com/questions/53016110/aws-api-gateway-user-anonymous-is-not-authorized-to-execute-api
     *
     * TODO
     * - [ ] tighten up the CORS defaults below
     */
    this.api = new apigateway.RestApi(this, 'api-public', {
      description: props.description,
      deployOptions: {
        metricsEnabled: true,
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        stageName: props.stageName || 'dev',
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
      },
    });
  }

  /**
   * Integration responses
   * Non-proxy lambda integrations don't just pass-through all response from the lambda.
   * They need to be funneled through one or more response structures
   * These define what THIS API will accept as a response (from the lambda),
   * and how it will interpret it.
   *
   * RE selectionPattern
   * this is a regex that allows us to match an actual response from the lambda
   * to one of these defined/allowable responses (that we are saying our API will accept).
   * It is here we can whittle from a number of different custom errors, to a shortlist of
   * HTTP Exceptions we're comfortable communicating to the public client.
   *
   * NOTES
   * _"If the back end is an AWS Lambda function, the AWS Lambda
   * function error header is matched. For all other HTTP and AWS back
   * ends, the HTTP status code is matched."_
   * https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_apigateway.IntegrationResponse.html
   * ---
   * defining no selectionPattern defines denotes the default response
   * https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-integration-settings-integration-response.html
   *
   */

  /**
   * A standard format for our API server errors
   * Anything that the client has no control over, or that is not a known error
   *
   * TODO:
   * - [ ] work out if all the CORS stuff is necessary here
   *   responseParameters: {
   *    'method.response.header.Content-Type': "'application/json'",
   *    'method.response.header.Access-Control-Allow-Origin': "'*'",
   *    'method.response.header.Access-Control-Allow-Credentials':
   *      "'true'",
   *    },
   */
  public static serverErrorResponse(): apigateway.IntegrationResponse {
    return {
      selectionPattern: CoApiConstruct.serverErrorRegex(),
      statusCode: '500',
      responseTemplates: {
        'application/json': JSON.stringify({
          message: "$util.escapeJavaScript($input.path('$.errorMessage'))",
        }),
      },
    };
  }

  private static serverErrorRegex(): string {
    return '^(Invalid internal communication).+';
  }

  /**
   * A standard format for our API client errors
   * Things we need to offer feedback to them for
   *
   * TODO:
   * - [ ] similar RE CORS stuff
   */
  public static clientErrorResponse(): apigateway.IntegrationResponse {
    return {
      selectionPattern: CoApiConstruct.clientErrorRegex(),
      statusCode: '400',
      responseTemplates: {
        'application/json': JSON.stringify({
          message: "$util.escapeJavaScript($input.path('$.errorMessage'))",
        }),
      },
    };
  }

  private static clientErrorRegex(): string {
    return '^^(Invalid request).+';
  }
}