Feature: Hydrate Participant Source

Scenario: Successfully hydrate a Participant Source
  Given I have a valid Participant Source
  And a course exists that relates to the externalCourseId
  When I attempt to hydrate
  Then a hydrated Participant Source should be returned
  And it should include a courseId related to externalCourseId

Scenario: Fail; Source does not include course
  Given I have an invalid Participant Source
  When I attempt to hydrate
  Then I should receive a SourceInvalidError
  And no result is returned

Scenario: Fail; A related course could not be found
  Given I have a valid Participant Source
  And a course DOES NOT exist that relates to the externalCourseId
  When I attempt to hydrate
  Then I should receive a RepositoryItemNotFoundError
  And no result is returned
