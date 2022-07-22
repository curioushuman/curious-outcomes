import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

import { resolve as pathResolve } from 'path';
import { readFileSync } from 'fs';

/**
 * Props required to initialize a CO API Construct
 */
export interface CoApiProps {
  description: string;
  /**
   * This will be added to the front of resource names
   * to make sure they are unique, but accessible.
   */
  applicationNamePrefix: string;
  stageName?: string;
}

/**
 * Props required to initialize a CO API Response Model
 */
export interface CoApiResponseModelProps {
  properties: {
    [name: string]: apigateway.JsonSchema;
  };
}

/**
 * CO API Construct
 * i.e. a standard API implementation, and some helpers
 *
 * TODO
 * - [ ] validation or camelCasing of prefix
 */
export class CoApiConstruct extends Construct {
  public id: string;
  private namePrefix: string;
  public api: apigateway.RestApi;
  public role: iam.Role;

  constructor(scope: Construct, id: string, props: CoApiProps) {
    super(scope, id);

    this.id = id;
    this.namePrefix = props.applicationNamePrefix;

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
    this.api = new apigateway.RestApi(this, id, {
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

    /**
     * IAM Role for our API gateway
     *
     * TODO:
     * - [ ] use ArnPrincipal(apiPublic) for assumedBy below
     */
    this.role = new iam.Role(this, `${id}-role`, {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
    });
  }

  /**
   * Request Validator
   * TODO
   * - [ ] this has simply been copied from original, needs to be revamped
   */
  // const basicGetRequestValidator = new apigateway.RequestValidator(
  //   this,
  //   'ApiAdmin-BasicGetRequestValidator',
  //   {
  //     restApi: api,

  //     // the properties below are optional
  //     requestValidatorName: 'ApiAdmin-basicGetRequestValidator',
  //     validateRequestBody: false,
  //     validateRequestParameters: true,
  //   }
  // );

  /**
   * Allows us to keep our VTL templates in a file. This will pull in VTL as a string
   * and remove any new lines (as this is what is required by SNS).
   *
   * @param appRootRelativeFilepath a filepath relative to root of application
   * @returns VTL template as a single string
   */
  public static vtlTemplateFromFile(appRootRelativeFilepath: string): string {
    return readFileSync(
      pathResolve(process.cwd(), appRootRelativeFilepath),
      'utf8'
    ).replace(/(\r\n|\n|\r)/gm, '');
  }

  /**
   * Response models
   * i.e. these are the structures for data that will be returned from THIS API
   */

  /**
   * Error response model FROM this API
   */
  public addErrorResponseModel(
    props?: CoApiResponseModelProps
  ): apigateway.Model {
    // destructure, or assign default
    const { properties } = props || {
      properties: {
        message: { type: apigateway.JsonSchemaType.STRING },
      },
    };
    return this.addResponseModel('error', {
      properties,
    });
  }

  /**
   * Non-error response model
   */
  public addResponseModel(
    id: string,
    props: CoApiResponseModelProps
  ): apigateway.Model {
    const { properties } = props;
    const modelId = `${this.id}-response-model-${id}`;
    const modelName = this.transformIdToName(modelId);
    const title = this.transformIdToResponseModelTitle(id);
    return this.api.addModel(modelId, {
      contentType: 'application/json',
      modelName: modelName,
      schema: {
        schema: apigateway.JsonSchemaVersion.DRAFT4,
        type: apigateway.JsonSchemaType.OBJECT,
        title,
        properties,
      },
    });
  }

  /**
   * Using camelCase for our response naming convention
   */
  private transformIdToResponseModelTitle(id: string): string {
    return `${this.camelCase(id)}Response`;
  }

  /**
   * Integration responses
   * Non-proxy lambda integrations don't just pass-through all response from the lambda.
   * They need to be funneled through one or more response structures
   * These define what THIS API will accept as a response (FROM the lambda),
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
    return '^(Invalid request).+';
  }

  /**
   * Utility functions
   *
   * TODO
   * - [ ] these should probably be somewhere else
   */

  /**
   * Using camelCase for our resource naming convention
   */
  private transformIdToName(id: string): string {
    return this.namePrefix + this.camelCase(id);
  }

  /**
   * Converting a dashed string to camelCase
   */
  private camelCase(str: string): string {
    return str
      .split('-')
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join('');
  }
}
