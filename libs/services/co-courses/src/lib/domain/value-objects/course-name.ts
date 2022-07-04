/**
 * Heavily inspired by: https://github.com/VincentJouanne/nest-clean-architecture
 */
import { Static, String } from 'runtypes';

/**
 * TODO
 * - [ ] Double check whether or not there should be constraints
 */

export const CourseName = String.withBrand('Name');

export type CourseName = Static<typeof CourseName>;
