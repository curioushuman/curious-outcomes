import { CreateCourseDto } from './create-course.dto';
import { CreateCourseRequestDto } from '../../../infra/dto/create-course.request.dto';
import { FindCourseSourceDto } from '../../queries/find-course-source/find-course-source.dto';
import { CourseSource } from '../../../domain/entities/course-source';
import { Course } from '../../../domain/entities/course';
import { createSlug } from '../../../../../shared/domain/value-objects/slug';
import { FindCourseDto } from '../../queries/find-course/find-course.dto';
import { createCourseId } from '../../../domain/value-objects/course-id';

/**
 * TODO
 * - create base abstract class for mappers
 */
export class CreateCourseMapper {
  public static fromRequestDto(dto: CreateCourseRequestDto): CreateCourseDto {
    return CreateCourseDto.check({
      externalId: dto.externalId,
    });
  }

  public static toFindCourseSourceDto(
    dto: CreateCourseDto
  ): FindCourseSourceDto {
    return FindCourseSourceDto.check({
      id: dto.externalId,
    });
  }

  /**
   * TODO
   * - [ ] move this to a better home
   */
  public static fromSourceToCourse(source: CourseSource): Course {
    const id = source.courseId ? source.courseId : createCourseId();
    const slug = source.slug ? source.slug : createSlug(source.name);
    return Course.check({
      externalId: source.id,
      name: source.name,
      slug,
      id,
    });
  }

  public static fromSourceToFindCourseDto(source: CourseSource): FindCourseDto {
    return FindCourseDto.check({
      externalId: source.id,
    });
  }
}
