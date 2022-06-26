import { LoggerService } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { ErrorFactory } from '../domain/errors/error-factory';

/**
 * Standardized way to log an action; good or bad.
 *
 * Full credit to VincentJouanne
 * - https://github.com/VincentJouanne/nest-clean-architecture
 */

export const logAction =
  <ErrorLike extends Error, DataLike>(
    logger: LoggerService,
    errorFactory: ErrorFactory,
    successMessage: string,
    warningMessage: string
  ) =>
  (
    task: TE.TaskEither<ErrorLike, DataLike>
  ): TE.TaskEither<ErrorLike, DataLike> => {
    return pipe(
      task,
      TE.mapLeft((error: ErrorLike) => {
        logger.warn(warningMessage);
        const mappedError = errorFactory.error(error) as ErrorLike;
        logger.debug ? logger.debug(error) : logger.error(error);
        return mappedError;
      }),
      TE.map((data: DataLike) => {
        logger.debug
          ? logger.debug(successMessage)
          : logger.log(successMessage);
        logger.verbose ? logger.verbose(data) : logger.log(data);
        return data;
      })
    );
  };
