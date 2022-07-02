import { Controller } from '@nestjs/common';

import { LoggableLogger } from '@curioushuman/loggable';

/**
 * Controller for courses; transforming input/output and routing to commands
 */

@Controller('courses')
export class FindCourseController {
  constructor(private logger: LoggableLogger) {
    this.logger.setContext(FindCourseController.name);
  }
}
