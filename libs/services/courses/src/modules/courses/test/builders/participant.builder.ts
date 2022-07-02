import { CreateParticipantDto } from '../../application/commands/create-participant/create-participant.dto';
import { Participant } from '../../domain/entities/participant';
import { ParticipantSource } from '../../domain/entities/participant-source';
import { CreateParticipantRequestDto } from '../../infra/dto/create-participant.request.dto';
import { ParticipantSourceBuilder } from './participant-source.builder';
import { CourseBuilder, defaultCourseId } from './course.builder';
import { defaultUserId } from '../../../../identity-and-access/test/builders/user.builder';

/**
 * A builder for Participants to play with in testing.
 *
 * NOTES
 * - We include alphas, betas etc to overcome duplicates during testing
 */

export const defaultParticipantId = '365a67b2-8ffe-47b5-8e1f-6d1325600a02';

export const ParticipantBuilder = () => {
  /**
   * Default properties don't exist in source repository
   */
  const defaultProperties = {
    id: defaultParticipantId,
    firstName: 'Jake',
    lastName: 'Blues',
    email: 'jake@blues.com',
    externalId: '5008s987619CjIAAU',
    courseId: defaultCourseId,
    userId: defaultUserId,
  };
  const overrides = {
    id: defaultParticipantId,
    firstName: 'Jake',
    lastName: 'Blues',
    email: 'jake@blues.com',
    externalId: '5008s987619CjIAAU',
    courseId: defaultCourseId,
    userId: defaultUserId,
  };

  return {
    funkyChars() {
      overrides.lastName = "Mc'O'Dowell!";
      return this;
    },

    alpha() {
      // ID DOES NOT EXIST IN SF
      overrides.externalId = '5000K9876567GEYQA3';
      overrides.firstName = 'Sister Mary';
      overrides.lastName = 'Stigmata';
      overrides.email = 'sister@stigmata.com';
      return this;
    },

    beta() {
      // ID DOES NOT EXIST IN SF
      overrides.externalId = '5000K1111567GEYQA3';
      overrides.firstName = 'Elwood';
      overrides.email = 'elwood@blues.com';
      return this;
    },

    invalidSource() {
      overrides.externalId = ParticipantSourceBuilder()
        .invalidSource()
        .buildNoCheck().id;
      return this;
    },

    withParticipant() {
      overrides.externalId = ParticipantSourceBuilder()
        .withParticipant()
        .build().id;
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
      overrides.externalId = ParticipantSourceBuilder().exists().build().id;
      overrides.courseId = CourseBuilder().exists().build().id;
      return this;
    },

    doesntExist() {
      overrides.externalId = 'ParticipantDoesntExist';
      return this;
    },

    forTidy(context: string) {
      overrides.lastName = overrides.lastName.concat(' ', context);
      return this;
    },

    fromSource(source: ParticipantSource) {
      overrides.externalId = source.id;
      overrides.firstName = source.firstName;
      overrides.lastName = source.lastName;
      overrides.email = source.email;
      return this;
    },

    build(): Participant {
      return Participant.check({
        ...defaultProperties,
        ...overrides,
      });
    },

    buildNoCheck(): Participant {
      return {
        ...defaultProperties,
        ...overrides,
      } as Participant;
    },

    buildDto(): CreateParticipantDto {
      return CreateParticipantDto.check({
        externalId: this.buildNoCheck().externalId,
      });
    },

    buildRequestDto(): CreateParticipantRequestDto {
      return {
        externalId: this.buildNoCheck().externalId,
      } as CreateParticipantRequestDto;
    },
  };
};
