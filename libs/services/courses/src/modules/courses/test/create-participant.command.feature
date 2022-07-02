Feature: Create Participant

Scenario: Successfully creating a participant
  Given the request is valid
  And a matching record is found at the source
  When I attempt to create a participant
  Then a new record should have been created
  And a positive response received

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to create a participant
  Then I should receive a RequestInvalidError/BadRequestException

Scenario: Fail; Source not found for ID provided
  Given the request is valid
  And no record exists that matches our request
  When I attempt to create a participant
  Then I should receive a RepositoryItemNotFoundError/NotFoundException

# We don't worry about this
# Handled sufficiently in unit tests
# Scenario: Fail; Source does not translate into a valid participant

# TODO
# Scenario: Fail; Source is already associated with a participant
#   Given a matching record is found at the source
#   And the returned source is already associated with a participant
#   When I attempt to create a participant
#   Then I should receive a SourceInvalidError

Scenario: Fail; Source already exists in our DB
  Given the request is valid
  And a matching record is found at the source
  And the returned source populates a valid participant
  And the source DOES already exist in our DB
  When I attempt to create a participant
  Then I should receive an RepositoryItemConflictError/ConflictException
