import { FindCourseSourceDto } from './find-course-source.dto';
import { FindCourseSourceRequestDto } from '../../../infra/dto/find-course-source.request.dto';
import { CourseSourceResponseDto } from '../../../infra/dto/course-source.response.dto';
import { CourseSource } from '../../../domain/entities/course-source';

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

  public static toResponseDto(
    courseSource: CourseSource
  ): CourseSourceResponseDto {
    return {
      id: courseSource.id,
      courseId: courseSource.courseId,
      name: courseSource.name,
      slug: courseSource.slug,
    } as CourseSourceResponseDto;
  }
}
