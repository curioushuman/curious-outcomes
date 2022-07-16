import { RequestInvalidError } from '@curioushuman/error-factory';

import { FindCourseDto } from './find-course.dto';
import { FindCourseRequestDto } from '../../../infra/find-course/dto/find-course.request.dto';
import {
  CourseIdentifier,
  courseIdentifierParsers,
  courseIdentifiers,
} from '../../../domain/entities/course';

export class FindCourseMapper {
  public static fromRequestDto(dto: FindCourseRequestDto): FindCourseDto {
    const identifier = FindCourseMapper.identifyIdentifier(dto);
    if (!identifier) {
      // caught in the controller
      throw new RequestInvalidError('Missing valid identifier');
    }
    return FindCourseDto.check({
      identifier,
      value: dto[identifier],
    });
  }

  /**
   * NOTE: this function is here (in the mapper) as it pertains to both the
   *  - requestDto
   *  - AND the CourseIdentifier enum
   */
  public static identifyIdentifier(
    dto: FindCourseRequestDto
  ): CourseIdentifier {
    let identifier: CourseIdentifier;
    for (const id of courseIdentifiers) {
      if (dto[id]) {
        identifier = id;
      }
    }
    return identifier;
  }
}
