import { RequestInvalidError } from '@curioushuman/error-factory';

import { FindCourseDto, courseIdentifiers } from './find-course.dto';
import { FindCourseRequestDto } from '../../../infra/find-course/dto/find-course.request.dto';
import { CourseIdentifier } from '../../../domain/entities/course';

export class FindCourseMapper {
  public static fromRequestDto(dto: FindCourseRequestDto): FindCourseDto {
    const identifier = FindCourseMapper.identifyIdentifier(dto);
    if (identifier === false) {
      // caught in the controller
      throw new RequestInvalidError('Missing valid identifier');
    }
    // We know the below is the FTO structure so it's OK to assert
    // we know that a false
    return {
      identifier,
      value: dto[identifier],
    } as FindCourseDto;
  }

  /**
   * NOTE: this function is here (in the mapper) as it pertains to both the
   *  - requestDto
   *  - AND the CourseIdentifier enum
   */
  public static identifyIdentifier(
    dto: FindCourseRequestDto
  ): CourseIdentifier | false {
    let identifier: CourseIdentifier | false = false;
    for (const id of courseIdentifiers) {
      if (dto[id]) {
        identifier = id;
      }
    }
    return identifier;
  }
}
