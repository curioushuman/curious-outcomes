import { FindCourseDto } from './find-course.dto';
import { FindCourseRequestDto } from '../../../infra/find-course/dto/find-course.request.dto';
import { CourseResponseDto } from '../../../infra/dto/course.response.dto';
import { Course } from '../../../domain/entities/course';

/**
 * TODO
 * - Should we do more checking of CourseResponseDto?
 */
export class FindCourseMapper {
  public static fromRequestDto(dto: FindCourseRequestDto): FindCourseDto {
    return FindCourseDto.check({
      id: dto.id,
    });
  }

  public static toResponseDto(course: Course): CourseResponseDto {
    return {
      id: course.id,
      externalId: course.externalId,
      name: course.name,
      slug: course.slug,
    } as CourseResponseDto;
  }
}
