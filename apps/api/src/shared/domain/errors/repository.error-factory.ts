import { Injectable } from '@nestjs/common';
import { ValidationError } from 'runtypes';

import { RepositoryItemConflictError } from './repository/item-conflict.error';
import { RepositoryAuthenticationError } from './repository/authentication.error';
import { RepositoryItemNotFoundError } from './repository/item-not-found.error';
import { RepositoryServerError } from './repository/server.error';
import { RequestInvalidError } from './request-invalid.error';
import { SourceInvalidError } from './repository/source-invalid.error';
import { ErrorFactory } from './error-factory';

const allowedErrors = {
  RepositoryItemConflictError,
  RepositoryAuthenticationError,
  RepositoryItemNotFoundError,
  RepositoryServerError,
  RequestInvalidError,
  SourceInvalidError,
};
export type AllowedErrorTypeName = keyof typeof allowedErrors;

const errorMap = {
  400: RepositoryServerError,
  401: RepositoryAuthenticationError,
  404: RepositoryItemNotFoundError,
  500: RepositoryServerError,
};

@Injectable()
export abstract class RepositoryErrorFactory extends ErrorFactory<AllowedErrorTypeName> {
  constructor() {
    super(errorMap);
  }

  /**
   * We ask our repositories to return a valid Type
   * Validation errors are not repository specific
   * Anything that is returned from any repository
   * that is invalid should return a SourceInvalidError
   */
  private isValidationError(error: Error): boolean {
    return error instanceof ValidationError;
  }

  /**
   * We override the main error function to catch ValidationErrors
   * in this repository context.
   */
  public error(error: Error, asErrorType?: AllowedErrorTypeName): Error {
    return this.isValidationError(error)
      ? super.error(error, 'SourceInvalidError')
      : super.error(error, asErrorType);
  }

  abstract errorStatusCode(error: Error): number;
  abstract errorDescription(error: Error): string;
}
