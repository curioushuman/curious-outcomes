/**
 * This is the structure of data the world will receive
 *
 * TODO
 * - Add swagger ApiProperty to all
 * - later, if/when necessary, add underlying interface
 */
export class CourseResponseDto {
  name!: string;
  slug!: string;
  externalId!: string;
}
