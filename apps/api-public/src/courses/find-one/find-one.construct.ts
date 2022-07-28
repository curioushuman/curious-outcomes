import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

import { resolve as pathResolve } from 'path';

import { CoApiConstruct } from '../../../../../dist/local/@curioushuman/co-cdk-utils/src';

/**
 * Props required to initialize a CO API Construct
 */
export interface FindOneProps {
  apiConstruct: CoApiConstruct;
}

/**
 * Components required for the api-admin stack courses:find-one resource
 */
export class FindOneConstruct extends Construct {
  private apiConstruct: CoApiConstruct;
  private lambda: lambda.IFunction;

  public readonly lambdaIntegration: apigateway.LambdaIntegration;
  public readonly methodOptions: apigateway.MethodOptions;

  constructor(scope: Construct, id: string, props: FindOneProps) {
    super(scope, id);

    this.apiConstruct = props.apiConstruct;

    /**
     * Resources this API will use
     */

    /**
     * courses-findOne: Lambda Function
     */
    this.lambda = lambda.Function.fromFunctionAttributes(
      this,
      this.apiConstruct.transformIdToResourceTitle(`${id}`, 'Lambda'),
      {
        functionArn: `arn:aws:lambda:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:function:CoFindCourseFunction`,
        sameEnvironment: true,
      }
    );
    // Allow access for API
    this.lambda.grantInvoke(this.apiConstruct.role);

    /**
     * findOne: request mapping template
     * to convert API input/params/body, into acceptable lambda input
     */
    const coursesFindRequestTemplate = CoApiConstruct.vtlTemplateFromFile(
      pathResolve(__dirname, './find-one.map-request.vtl')
    );

    /**
     * findOne: response mapping template
     * to convert results from lambda into API response
     */
    const coursesFindResponseTemplate = CoApiConstruct.vtlTemplateFromFile(
      pathResolve(__dirname, './find-one.map-response.vtl')
    );

    /**
     * findOne: Accepted Lambda Function Responses
     * For more info on integrationResponses check CoApiConstruct
     */

    // SUCCESS
    const coursesFindOneFunctionSuccessResponse: apigateway.IntegrationResponse =
      {
        statusCode: '200',
        responseTemplates: {
          'application/json': coursesFindResponseTemplate,
        },
      };
    // ERROR
    const coursesFindOneFunctionServerErrorResponse =
      CoApiConstruct.serverErrorResponse();
    const coursesFindOneFunctionClientErrorResponse =
      CoApiConstruct.clientErrorResponse();
    const coursesFindOneFunctionNotFoundErrorResponse =
      CoApiConstruct.notFoundErrorResponse();

    /**
     * findOne: Lambda Function Integration
     */
    this.lambdaIntegration = new apigateway.LambdaIntegration(this.lambda, {
      // not a proxy, we're taking control of what is sent/received to/from integration
      proxy: false,

      // ---
      // request handling
      // ---

      // we're not passing any of the request parameters (directly) through
      // to this integration. All will be routed through the template (below)
      // requestParameters: {},
      passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
      // this is where we convert request params into lambda input
      requestTemplates: {
        'application/json': coursesFindRequestTemplate,
      },

      // ---
      // non-integration response handling
      // i.e. these responses happen without even hitting the back-end
      // e.g. (API gateway based) request validation
      // ---

      // we are not currently going to mess with API gateway responses
      // we might need to later on if we want to add additional info to error
      // or if we need to add CORS info to response.
      // https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-gatewayResponse-definition.html
      // gatewayResponses: [],

      // ---
      // integration response handling
      // ---
      integrationResponses: [
        coursesFindOneFunctionServerErrorResponse,
        coursesFindOneFunctionClientErrorResponse,
        coursesFindOneFunctionNotFoundErrorResponse,
        coursesFindOneFunctionSuccessResponse,
      ],
    });

    /**
     * Default method response parameters
     */
    // CORS
    const defaultMethodResponseParametersCors =
      CoApiConstruct.methodResponseParametersCors();

    this.methodOptions = {
      // Here we can define path, querystring, and acceptable headers (for this method)
      requestParameters: {
        'method.request.path.id': false,
        'method.request.querystring.slug': false,
      },
      // no validator, as both params are optional
      // even though at least one is required, that level of validation unavailable here
      // requestValidator: this.apiConstruct.requestValidators['BasicGet'],

      // now we have funneled
      // - all possible responses from our Lambda
      // - into a single success response
      // - and a couple of (acceptable) error responses
      // we can define what exactly these look like when they are sent back to the client
      // there should be a response per status code defined in your acceptable integration responses
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: { ...defaultMethodResponseParametersCors },
          responseModels: {
            'application/json':
              this.apiConstruct.responseModels['course-response-dto'],
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
          statusCode: '404',
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
