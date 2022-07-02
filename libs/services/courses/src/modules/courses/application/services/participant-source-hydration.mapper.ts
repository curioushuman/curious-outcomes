import { ParticipantSource } from '../../domain/entities/participant-source';
import { FindCourseDto } from '../queries/find-course/find-course.dto';

export class ParticipantSourceHydrationMapper {
  public static fromSourceToFindCourseDto(
    source: ParticipantSource
  ): FindCourseDto {
    return FindCourseDto.check({
      externalId: source.externalCourseId,
    });
  }
}
