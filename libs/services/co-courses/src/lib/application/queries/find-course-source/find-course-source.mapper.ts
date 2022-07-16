import { FindCourseSourceDto } from './find-course-source.dto';
import { FindCourseSourceRequestDto } from '../../../infra/dto/find-course-source.request.dto';

/**
 * TODO
 * - Should we do more checking of CourseResponseDto?
 */
export class FindCourseSourceMapper {
  public static fromRequestDto(
    dto: FindCourseSourceRequestDto
  ): FindCourseSourceDto {
    return FindCourseSourceDto.check({
      id: dto.id,
    });
  }
}
