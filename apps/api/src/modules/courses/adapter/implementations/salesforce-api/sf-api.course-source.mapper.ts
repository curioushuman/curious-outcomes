import { CourseSource } from '../../../domain/entities/course-source';
import { Slug } from '../../../../../shared/domain/value-objects/slug';
import { SalesforceApiCourseSource } from './types/sf-api.course-source';

export class SalesforceApiCourseSourceMapper {
  /**
   * Note: responsibility for slug creation left to the create-course.command
   */
  public static toDomain(source: SalesforceApiCourseSource): CourseSource {
    // Check for slug separately for more granular error reporting
    const slug = Slug.check(source.Slug__c);
    return CourseSource.check({
      id: source.Id,
      name: source.Summary_quick_year__c,
      courseId: source.CO_course_ID__c,
      slug,
    });
  }
}
