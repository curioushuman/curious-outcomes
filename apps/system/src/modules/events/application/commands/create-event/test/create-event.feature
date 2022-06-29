Feature: Create Event

Scenario: Successfully creating a Event
  Given a matching record is found at the source
  And the returned source populates a valid Event
  And the source does not already exist in our DB
  When I attempt to create a Event
  Then a new record should have been created
  And no result is returned

Scenario: Fail; Source not found for ID provided
  Given no record exists that matches our request
  When I attempt to create a Event
  Then I should receive a RepositoryItemNotFoundError

Scenario: Fail; Source does not translate into a valid Event
  Given a matching record is found at the source
  And the returned source does not populate a valid Event
  When I attempt to create a Event
  Then I should receive a SourceInvalidError

Scenario: Fail; Source is already associated with a Event
  Given a matching record is found at the source
  And the returned source is already associated with a Event
  When I attempt to create a Event
  Then I should receive a SourceInvalidError

Scenario: Fail; Source already exists in our DB
  Given a matching record is found at the source
  And the returned source populates a valid Event
  And the source DOES already exist in our DB
  When I attempt to create a Event
  Then I should receive an RepositoryItemConflictError
