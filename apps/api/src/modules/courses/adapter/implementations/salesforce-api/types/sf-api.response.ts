import { Boolean, Record, Static, String, Unknown } from 'runtypes';

export const SalesforceApiResponseAuth = Record({
  access_token: String,
});

export type SalesforceApiResponseAuth = Static<
  typeof SalesforceApiResponseAuth
>;

export const SalesforceApiResponseRecord = Record({
  attributes: Unknown,
});

export type SalesforceApiResponseRecord = Static<
  typeof SalesforceApiResponseRecord
>;

/**
 * We use the below for testing only
 *
 * TODO
 * - [ ] if we ever properly use this, you'll need to include errors[] in the below
 */
export const SalesforceApiResponseCreate = Record({
  id: String,
  success: Boolean,
});

export type SalesforceApiResponseCreate = Static<
  typeof SalesforceApiResponseCreate
>;
