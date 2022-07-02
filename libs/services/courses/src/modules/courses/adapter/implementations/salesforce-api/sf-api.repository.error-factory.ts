import { Injectable } from '@nestjs/common';
import { RepositoryErrorFactory } from '../../../../../shared/domain/errors/repository.error-factory';

interface SalesforceApiRepositoryErrorDataObject {
  error?: string;
  errorCode?: string;
  error_description?: string;
  message?: string;
}

type SalesforceApiRepositoryErrorDataArray =
  SalesforceApiRepositoryErrorDataObject[];

type SalesforceApiRepositoryErrorData =
  | SalesforceApiRepositoryErrorDataObject
  | SalesforceApiRepositoryErrorDataArray;

export interface SalesforceApiRepositoryError extends Error {
  response?: {
    status: number;
    statusText: string;
    data: SalesforceApiRepositoryErrorData;
  };
}

type SalesforceApiRepositoryErrorOrArray =
  | SalesforceApiRepositoryError
  | SalesforceApiRepositoryErrorDataArray;

/**
 * Factory to interpret and produce consistent errors from the riddled mess
 * that is returned from Salesforce. Two types of individual error, or maybe
 * even an array of errors.
 */

@Injectable()
export class SalesforceApiRepositoryErrorFactory extends RepositoryErrorFactory {
  private sfErrorCodes = {
    NOT_FOUND: 404,
  };

  public errorStatusCode(
    errorOrArray: SalesforceApiRepositoryErrorOrArray
  ): number {
    return Array.isArray(errorOrArray)
      ? this.errorStatusCodeFromArray(errorOrArray)
      : this.errorStatusCodeFromSalesforceError(errorOrArray);
  }

  private errorStatusCodeFromSalesforceError(
    error: SalesforceApiRepositoryError
  ): number {
    return error.response === undefined ? 500 : error.response.status;
  }

  private errorStatusCodeFromArray(
    errorArray: SalesforceApiRepositoryErrorDataArray
  ): number {
    return this.sfErrorCodes[errorArray[0].errorCode] ?? 500;
  }

  public errorDescription(
    errorOrArray: SalesforceApiRepositoryErrorOrArray
  ): string {
    return Array.isArray(errorOrArray)
      ? this.errorDescriptionFromArray(errorOrArray)
      : this.errorDescriptionFromSalesforceError(errorOrArray);
  }

  private errorDescriptionFromSalesforceError(
    error: SalesforceApiRepositoryError
  ): string {
    return error.response === undefined
      ? error.message
      : this.errorDescriptionFromData(error);
  }

  private errorDescriptionFromData(
    error: SalesforceApiRepositoryError
  ): string {
    const description = Array.isArray(error.response.data)
      ? error.response.data.map((d) => d.message).join('\n')
      : error.response.data.error_description;
    return description;
  }

  private errorDescriptionFromArray(
    errorArray: SalesforceApiRepositoryErrorDataArray
  ): string {
    return errorArray[0].message;
  }
}
