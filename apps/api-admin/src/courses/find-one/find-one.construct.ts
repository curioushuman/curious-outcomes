import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

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

  public methodOptions: apigateway.MethodOptions;

  constructor(scope: Construct, id: string, props: FindOneProps) {
    super(scope, id);

    this.apiConstruct = props.apiConstruct;

    /**
     * Default method response parameters
     */
    // CORS
    const defaultMethodResponseParametersCors =
      CoApiConstruct.methodResponseParametersCors();

    this.methodOptions = {
      // Here we can define path, querystring, and acceptable headers (for this method)
      requestParameters: {
        'method.request.path.externalId': true,
      },
      // basic GET validator
      requestValidator: this.apiConstruct.requestValidators['BasicGet'],

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
