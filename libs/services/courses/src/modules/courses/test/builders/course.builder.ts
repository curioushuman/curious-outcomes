import { CreateCourseDto } from '../../application/commands/create-course/create-course.dto';
import { Course } from '../../domain/entities/course';
import { CourseSource } from '../../domain/entities/course-source';
import { createSlug } from '../../../../shared/domain/value-objects/slug';
import { CreateCourseRequestDto } from '../../infra/dto/create-course.request.dto';
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

export const CourseBuilder = () => {
  /**
   * Default properties don't exist in source repository
   */
  const defaultProperties = {
    id: defaultCourseId,
    name: 'Learn to be a dancer',
    slug: 'learn-to-be-a-dancer',
    externalId: '5008s1234519CjIAAU',
  };
  const overrides = {
    id: defaultCourseId,
    name: 'Learn to be a dancer',
    slug: 'learn-to-be-a-dancer',
    externalId: '5008s1234519CjIAAU',
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
      delete defaultProperties.externalId;
      delete overrides.externalId;
      return this;
    },

    exists() {
      overrides.externalId = CourseSourceBuilder().exists().build().id;
      return this;
    },

    doesntExist() {
      overrides.externalId = 'CourseDoesntExist';
      return this;
    },

    forTidy(context: string) {
      overrides.name = overrides.name.concat(' ', context);
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

    buildDto(): CreateCourseDto {
      return CreateCourseDto.check({
        externalId: this.buildNoCheck().externalId,
      });
    },

    buildRequestDto(): CreateCourseRequestDto {
      return {
        externalId: this.buildNoCheck().externalId,
      } as CreateCourseRequestDto;
    },
  };
};
