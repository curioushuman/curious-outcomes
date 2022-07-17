import { createSlug } from '@curioushuman/co-common';

import { Course } from '../../domain/entities/course';
import { CourseSource } from '../../domain/entities/course-source';
import { CourseResponseDto } from '../../infra/dto/course.response.dto';
import { FindCourseRequestDto } from '../../infra/find-course/dto/find-course.request.dto';
import { CourseSourceBuilder } from './course-source.builder';

/**
 * A builder for Courses to play with in testing.
 *
 * NOTES
 * - We include alphas, betas etc to overcome duplicates during testing
 *
 * TODO
 * - [ ] support multiple source repositories concurrently during testing
 *
 * Heavily inspired by: https://github.com/VincentJouanne/nest-clean-architecture
 */

export const defaultCourseId = '1e72ef98-f21e-4e0a-aff1-a45ed7328ae6';

/**
 * This is basically a looser mimic of Course
 * For the purpose of being able to create invalid Courses & DTOs and such
 */
type CourseBuildBase = {
  [K in keyof Course]?: Course[K] | string;
};

export const CourseBuilder = () => {
  /**
   * Default properties don't exist in source repository
   */
  const defaultProperties: CourseBuildBase = {
    id: defaultCourseId,
    name: 'Learn to be a dancer',
    slug: 'learn-to-be-a-dancer',
    externalId: '5008s1234519CjIAAU',
  };
  const overrides: CourseBuildBase = {
    id: defaultProperties.id,
    name: defaultProperties.name,
    slug: defaultProperties.slug,
    externalId: defaultProperties.externalId,
  };

  return {
    funkyChars() {
      overrides.name = "I'm gonna be a dancer!";
      overrides.slug = createSlug(overrides.name);
      return this;
    },

    alpha() {
      // ID DOES NOT EXIST IN SF
      overrides.externalId = '5000K1234567GEYQA3';
      overrides.name = 'Dance, like an alpha';
      overrides.slug = createSlug(overrides.name);
      return this;
    },

    beta() {
      // ID DOES NOT EXIST IN SF
      overrides.externalId = '5008s000000y7LUAAY';
      overrides.name = 'Beta ray dancing';
      overrides.slug = createSlug(overrides.name);
      return this;
    },

    invalidSource() {
      overrides.externalId = CourseSourceBuilder().invalidSource().build().id;
      return this;
    },

    withCourse() {
      overrides.externalId = CourseSourceBuilder().withCourse().build().id;
      return this;
    },

    noMatchingSource() {
      return this;
    },

    invalid() {
      overrides.id = 'NotAUUID';
      delete defaultProperties.externalId;
      delete overrides.externalId;
      delete defaultProperties.slug;
      delete overrides.slug;
      return this;
    },

    exists() {
      overrides.externalId = CourseSourceBuilder().exists().build().id;
      return this;
    },

    doesntExist() {
      overrides.externalId = 'CourseDoesntExist';
      overrides.slug = 'course-doesnt-exist';
      delete defaultProperties.id;
      delete overrides.id;
      return this;
    },

    doesntExistId() {
      overrides.id = '1e72ef98-f21e-4e0a-aff1-a45ed7328123';
      delete defaultProperties.externalId;
      delete overrides.externalId;
      delete defaultProperties.slug;
      delete overrides.slug;
      return this;
    },

    forTidy(context: string) {
      overrides.name = overrides.name
        ? overrides.name.concat(' ', context)
        : context;
      overrides.slug = createSlug(overrides.name);
      return this;
    },

    fromSource(source: CourseSource) {
      overrides.externalId = source.id;
      overrides.name = source.name;
      overrides.slug = source.slug;
      return this;
    },

    build(): Course {
      return Course.check({
        ...defaultProperties,
        ...overrides,
      });
    },

    buildNoCheck(): Course {
      return {
        ...defaultProperties,
        ...overrides,
      } as Course;
    },

    buildFindRequestDto(): FindCourseRequestDto {
      const dto: FindCourseRequestDto = {};
      if (this.buildNoCheck().id) {
        dto.id = this.buildNoCheck().id;
      }
      if (this.buildNoCheck().externalId) {
        dto.externalId = this.buildNoCheck().externalId;
      }
      if (this.buildNoCheck().slug) {
        dto.slug = this.buildNoCheck().slug;
      }
      return dto;
    },

    buildCourseResponseDto(): CourseResponseDto {
      return {
        ...defaultProperties,
        ...overrides,
      } as CourseResponseDto;
    },
  };
};
