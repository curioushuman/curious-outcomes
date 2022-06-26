import { Injectable } from '@nestjs/common';
import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';

import { UnknownException } from './unknown.error';
import { RequestInvalidError } from './request-invalid.error';
import { RepositoryItemConflictError } from './repository/item-conflict.error';
import { SourceInvalidError } from './repository/source-invalid.error';
import { RepositoryAuthenticationError } from './repository/authentication.error';
import { RepositoryItemNotFoundError } from './repository/item-not-found.error';
import { RepositoryServerError } from './repository/server.error';
import { RepositoryServerUnavailableError } from './repository/server-unavailable.error';
import { NotYetImplementedError } from './not-yet-implemented.error';

/**
 * This is the minimum aspects of an error message you must provide
 * NOTE: additional context may be provided at time of error
 */
export interface ErrorMessageComponents {
  base: string;
  action: string;
}

/**
 * Responsible for returning the error we want our users to see
 * based on what occurs when we interact with external resources
 *
 * NOTES
 * - All custom errors must extend HttpException
 *
 * TODO
 * - [ ] this could be split into repo & validation error services
 *       IN FACT it should be, as currently validationError will accept
 *       various error types it shouldn't
 * - [ ] is there a better way than registering ALL errors here?
 */

// * MUST INCLUDE all error definitions below
// I attempted to include them in the individual subclasses
// but couldn't get the generic type for this class to work
const errorDefinitions = {
  NotYetImplementedError,
  RepositoryAuthenticationError,
  RepositoryItemConflictError,
  RepositoryItemNotFoundError,
  RepositoryServerError,
  RepositoryServerUnavailableError,
  RequestInvalidError,
  SourceInvalidError,
};

export type AllErrorTypeNames = keyof typeof errorDefinitions;
type ErrorType = typeof errorDefinitions[AllErrorTypeNames];

// TODO - should move to utils
type ExtractInstanceType<T> = T extends new () => infer R ? R : never;

@Injectable()
export abstract class ErrorFactory<
  AllowedErrorTypeName extends AllErrorTypeNames = AllErrorTypeNames
> {
  constructor(protected errorMap: Record<number, ErrorType>) {}

  public error(error: Error, asErrorType?: AllowedErrorTypeName): Error {
    // console.log(error);
    const err = this.isKnown(error) ? error : this.newError(error, asErrorType);
    return err;
  }

  private newError(error: Error, asErrorType?: AllowedErrorTypeName): Error {
    return asErrorType
      ? this.newErrorAsType(error, asErrorType)
      : this.newMappedError(error);
  }

  /**
   * A known error is one WE have a specific definition for
   */
  private isKnown(error: Error): boolean {
    const knownError = Object.keys(this.errorMap).find(
      (k) => this.errorMap[k].name === error.name
    );
    return 'response' in error && 'status' in error && knownError !== undefined;
  }

  /**
   * A mapped error is one that exists in our error map
   */
  private isMapped(error: Error): boolean {
    return Object.keys(this.errorMap).includes(
      this.errorStatusCode(error).toString()
    );
  }

  private newMappedError(error: Error): ExtractInstanceType<ErrorType> {
    return this.isMapped(error)
      ? new this.errorMap[this.errorStatusCode(error)](
          this.errorDescription(error)
        )
      : this.newUnknownError(error);
  }

  private newErrorAsType(
    error: Error | string,
    asErrorType: AllowedErrorTypeName
  ): ExtractInstanceType<ErrorType> {
    const errorMessage =
      typeof error === 'string' ? error : this.errorDescription(error);
    return new errorDefinitions[asErrorType](errorMessage);
  }

  private newUnknownError(error: Error): UnknownException {
    return new UnknownException(this.errorDescription(error));
  }

  public errorAsString(error: Error): string {
    const status = this.errorStatusCode(error);
    const description = this.errorDescription(error);
    return `${status}: ${description}`;
  }

  /**
   * These functions will allow us to interpret various
   * types of errors returned from various repositories
   * by instantiating them in sub classes
   */
  abstract errorStatusCode(error: Error): number;
  abstract errorDescription(error: Error): string;

  /**
   * Static functions for use where inheritance cannot exist
   */
  public static formatMessage(
    components: ErrorMessageComponents,
    context: string
  ): string {
    return pipe(
      context,
      O.fromNullable,
      O.fold(
        () => `${components.base}. ${components.action}.`,
        (c) => {
          return `${components.base}; ${c}. ${components.action}.`;
        }
      )
    );
  }
}
