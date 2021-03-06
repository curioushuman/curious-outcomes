import { ExternalId } from '@curioushuman/co-common';

import { CourseSource } from '../../domain/entities/course-source';
import { CourseBuilder } from './course.builder';

/**
 * A builder for Course Sources to play with in testing.
 */

/**
 * * NOTE: if you switch to a different source repository type (i.e. not Salesforce)
 * ! you'll need to update this builder.
 *
 * TODO
 * - [ ] support multiple source repositories concurrently during testing
 *
 * Heavily inspired by: https://github.com/VincentJouanne/nest-clean-architecture
 */

export const defaultCourseSourceId = '5008s1234519CjIAAU';

/**
 * This is basically a looser mimic of Course
 * For the purpose of being able to create invalid Courses & DTOs and such
 */
type CourseSourceBuildBase = {
  [K in keyof CourseSource]?: CourseSource[K] | string;
};

export const CourseSourceBuilder = () => {
  /**
   * Default properties don't exist in source repository
   */
  const defaultProperties: CourseSourceBuildBase = {
    id: defaultCourseSourceId,
    name: 'Learn to be a dancer',
    courseId: null,
  };
  const overrides: CourseSourceBuildBase = {
    id: defaultProperties.id,
    name: defaultProperties.name,
    courseId: defaultProperties.courseId,
  };

  return {
    alpha() {
      overrides.id = CourseBuilder().alpha().build().externalId;
      overrides.name = 'Dance, like an alpha';
      return this;
    },

    beta() {
      overrides.id = CourseBuilder().beta().build().externalId;
      overrides.name = 'Beta ray dancing';
      return this;
    },

    noMatchingSource() {
      return this;
    },

    withCourse() {
      overrides.id = ExternalId.check('SourceWithCourseForFakeRepoId');
      overrides.name = 'Already associated';
      // NOTE: this is a random UUID that matches to nothing
      overrides.courseId = 'b0acf835-6fe3-4821-8381-9be7c336dce6';
      return this;
    },

    invalidSource() {
      overrides.id = ExternalId.check('InvalidIdForFakeRepo');
      overrides.name = '';
      return this;
    },

    exists() {
      overrides.id = ExternalId.check('ThisSourceExists');
      return this;
    },

    build(): CourseSource {
      return CourseSource.check({
        ...defaultProperties,
        ...overrides,
      });
    },

    buildNoCheck(): CourseSource {
      return {
        ...defaultProperties,
        ...overrides,
      } as CourseSource;
    },
  };
};
