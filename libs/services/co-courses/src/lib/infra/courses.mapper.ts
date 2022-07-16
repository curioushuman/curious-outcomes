import { CourseResponseDto } from './dto/course.response.dto';
import { Course } from '../domain/entities/course';

/**
 * TODO
 * - Should we do more checking of CourseResponseDto?
 */
export class CoursesMapper {
  public static toResponseDto(course: Course): CourseResponseDto {
    return {
      id: course.id,
      externalId: course.externalId,
      name: course.name,
      slug: course.slug,
    } as CourseResponseDto;
  }
}
