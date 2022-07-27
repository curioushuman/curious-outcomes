import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

import { readFileSync } from 'fs';

// Importing utilities for use in infrastructure processes
// Initially we're going to import from local sources
// import {
//   clientErrors,
//   serverErrors,
// } from '../../../../../../dist/layers/co-shared/nodejs/node_modules/@curioushuman/error-factory/src/index.js';
// Long term we'll put them into packages
// import { clientErrors, serverErrors } from '@curioushuman/error-factory';
// ! UPDATE
// Importing locally won't work, we'll need to deploy as a package
// Until then I've removed the use of the @curioushuman/error-factory package

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
 * Props required to initialize a CO API Response Model
 */
export interface CoApiRequestValidatorProps {
  validateRequestBody: boolean;
  validateRequestParameters: boolean;
}

type SupportedResourceType = 'ResponseModel' | 'RequestValidator';

/**
 * CO API Construct
 * i.e. a standard API implementation, and some helpers
 *
 * TODO
 * - [ ] validation or camelCasing of applicationNamePrefix
 */
export class CoApiConstruct extends Construct {
  public id: string;
  public api: apigateway.RestApi;
  public role: iam.Role;
  public responseModels: { [name: string]: apigateway.Model };
  public requestValidators: { [name: string]: apigateway.RequestValidator };

  private namePrefix: string;

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

    /**
     * Required response models
     * NOTE: I'm aware the method itself adds the model to the object
     * this here is only to instantiate the object
     */
    this.responseModels = {
      error: this.addErrorResponseModel(),
    };

    /**
     * Basic request validators
     */
    this.requestValidators = {
      BasicGet: this.requestValidator('basic-get', {
        validateRequestBody: false,
        validateRequestParameters: true,
      }),
    };
  }

  /**
   * Non-error response model
   */
  public requestValidator(
    id: string,
    props: CoApiRequestValidatorProps
  ): apigateway.RequestValidator {
    const { validateRequestBody, validateRequestParameters } = props;
    const requestValidatorId = `${this.id}-request-validator-${id}`;
    const requestValidatorName = this.transformIdToResourceName(
      requestValidatorId,
      'ResponseModel'
    );
    return new apigateway.RequestValidator(this, requestValidatorId, {
      restApi: this.api,
      // the properties below are optional
      requestValidatorName,
      validateRequestBody,
      validateRequestParameters,
    });
  }

  /**
   * Allows us to keep our VTL templates in a file. This will pull in VTL as a string
   * and remove any new lines (as this is what is required by SNS).
   *
   * @param absoluteFilepath a filepath that has already been put through `resolve`
   * @returns VTL template as a single string
   */
  public static vtlTemplateFromFile(absoluteFilepath: string): string {
    return readFileSync(absoluteFilepath, 'utf8').replace(/(\r\n|\n|\r)/gm, '');
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
    return this.addResponseModelToApi('error', {
      properties,
    });
  }

  /**
   * Adds a response model to the API
   */
  public addResponseModelToApi(
    id: string,
    props: CoApiResponseModelProps
  ): apigateway.Model {
    const { properties } = props;
    // NOTE: we don't prepend with id as AWS does this for us
    const modelId = `response-model-${id}`;
    const modelName = this.transformIdToResourceName(modelId, 'ResponseModel');
    const title = this.transformIdToResourceTitle(modelId, 'ResponseModel');
    return this.api.addModel(modelId, {
      contentType: 'application/json',
      modelName,
      schema: {
        schema: apigateway.JsonSchemaVersion.DRAFT4,
        type: apigateway.JsonSchemaType.OBJECT,
        title,
        properties,
      },
    });
  }

  /**
   * This adds to the API, and retains it in the API construct for future use
   */
  public addResponseModel(
    id: string,
    props: CoApiResponseModelProps
  ): apigateway.Model {
    this.responseModels[id] = this.addResponseModelToApi(id, props);
    return this.responseModels[id];
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
    return CoApiConstruct.errorResponse(
      '500',
      CoApiConstruct.serverErrorRegex()
    );
  }

  /**
   * Utility to pull together a regex based on our custom errors
   * that are indicative of an internal server error.
   *
   * TODO
   * - [ ] pull the error messages directly from error-factory
   */
  private static serverErrorRegex(): string {
    // const errorMessages = Object.values(serverErrors).map(
    //   (errorClass) => new errorClass().message.split(':')[0]
    // );
    const errorMessages = [
      'Invalid internal communication',
      'Source already exists within our database',
      'Source contains insufficient or invalid data',
      'Error authenticating at repository',
      'Error connecting to repository',
      'The repository is currently unavailable',
      'This particular feature does not yet exist, but is on our roadmap',
      'Something unexpected happened',
    ];
    return `^(${errorMessages.join('|')}).+`;
  }

  /**
   * A standard format for our API client errors
   * Things we need to offer feedback to them for
   *
   * TODO:
   * - [ ] similar RE CORS stuff
   */
  public static clientErrorResponse(): apigateway.IntegrationResponse {
    return CoApiConstruct.errorResponse(
      '400',
      CoApiConstruct.clientErrorRegex()
    );
  }

  /**
   * Utility to pull together a regex based on our custom errors
   * that are indicative of a client error
   *
   * TODO
   * - [ ] pull the error messages directly from error-factory
   */
  private static clientErrorRegex(): string {
    // const errorMessages = Object.values(clientErrors).map(
    //   (errorClass) => new errorClass().message.split(':')[0]
    // );
    const errorMessages = ['Invalid request'];
    return `^(${errorMessages.join('|')}).+`;
  }

  /**
   * A standard format for our API client errors
   * Things we need to offer feedback to them for
   *
   * TODO:
   * - [ ] similar RE CORS stuff
   */
  public static notFoundErrorResponse(): apigateway.IntegrationResponse {
    return CoApiConstruct.errorResponse(
      '404',
      CoApiConstruct.notFoundErrorRegex()
    );
  }

  /**
   * Utility to pull together a regex based on our custom errors
   * that are indicative of an item not found scenario
   *
   * TODO
   * - [ ] pull the error messages directly from error-factory
   */
  private static notFoundErrorRegex(): string {
    // const errorMessages = Object.values(clientErrors).map(
    //   (errorClass) => new errorClass().message.split(':')[0]
    // );
    const errorMessages = ['A matching item could not be found'];
    return `^(${errorMessages.join('|')}).+`;
  }

  /**
   * A standard format for our API client errors
   * Things we need to offer feedback to them for
   *
   * TODO:
   * - [ ] similar RE CORS stuff
   */
  public static errorResponse(
    statusCode: string,
    selectionPattern: string
  ): apigateway.IntegrationResponse {
    return {
      selectionPattern,
      statusCode,
      responseTemplates: {
        'application/json': JSON.stringify({
          message: "$util.escapeJavaScript($input.path('$.errorMessage'))",
        }),
      },
    };
  }

  /**
   * A temp holding place for CORS stuff
   */
  public static methodResponseParametersCors(): Record<string, boolean> {
    return {
      'method.response.header.Content-Type': true,
      'method.response.header.Access-Control-Allow-Origin': true,
      'method.response.header.Access-Control-Allow-Credentials': true,
    };
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
  private transformIdToResourceName(
    resourceId: string,
    resourceType: SupportedResourceType
  ): string {
    return (
      this.namePrefix +
      this.transformIdToResourceTitle(resourceId, resourceType)
    );
  }

  /**
   * Using camelCase for our response naming convention
   */
  private transformIdToResourceTitle(
    resourceId: string,
    resourceType: SupportedResourceType
  ): string {
    return `${this.camelCase(resourceId)}${resourceType}`;
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
