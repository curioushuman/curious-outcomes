/**
 * This is the structure of data returned from our Lambda
 */
export class CourseResponseDto {
  id!: string;
  name!: string;
  slug!: string;
  externalId!: string;
}
