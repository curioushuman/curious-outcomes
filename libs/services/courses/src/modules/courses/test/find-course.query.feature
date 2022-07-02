Feature: Find Course

Scenario: Success; found requested course
  Given the request is valid
  And a matching record exists
  When I attempt to find a course
  Then the matching course is returned

Scenario: Fail; Invalid request
  Given the request is invalid
  When I attempt to find a course
  Then I should receive a RequestInvalidError/BadRequestException

Scenario: Fail; Source not found for ID provided
  Given the request is valid
  And no record exists that matches our request
  When I attempt to find a course
  Then I should receive a RepositoryItemNotFoundError/NotFoundException
