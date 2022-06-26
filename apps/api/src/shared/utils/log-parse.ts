import { LoggerService } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import {
  AllowedErrorTypeName,
  ValidationErrorFactory,
} from '../domain/errors/validation.error-factory';

/**
 * Standardized way to log an action; good or bad.
 *
 * NOTES
 * We always use the validationErrorFactory for these errors
 *
 * Full credit to VincentJouanne
 * - https://github.com/VincentJouanne/nest-clean-architecture
 */

const validationErrorFactory = new ValidationErrorFactory();

export const logParse =
  <ErrorLike extends Error, DataLike>(
    logger: LoggerService,
    asErrorType?: AllowedErrorTypeName
  ) =>
  (
    task: TE.TaskEither<ErrorLike, DataLike>
  ): TE.TaskEither<ErrorLike, DataLike> => {
    return pipe(
      task,
      TE.mapLeft((error: ErrorLike) => {
        const mappedError = validationErrorFactory.error(
          error,
          asErrorType
        ) as ErrorLike;
        logger.warn(error.constructor.name);
        logger.debug ? logger.debug(error) : logger.error(error);
        return mappedError;
      }),
      TE.map((data: DataLike) => {
        // I've moved this log into the tryCatch itself
        // this way we get to see the data, whether it's successful or not
        // logger.verbose ? logger.verbose(data) : logger.log(data);
        return data;
      })
    );
  };
