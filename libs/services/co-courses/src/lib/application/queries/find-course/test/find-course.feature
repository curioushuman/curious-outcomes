Feature: Find Course

Scenario: Success; found course by Id
  Given the request is valid
  And a matching record exists
  When I attempt to find a course
  Then the matching course is returned

Scenario: Success; found course by External Id
  Given the request is valid
  And a matching record exists
  When I attempt to find a course
  Then the matching course is returned

Scenario: Success; found course by Slug
  Given the request is valid
  And a matching record exists
  When I attempt to find a course
  Then the matching course is returned

Scenario: Fail; Invalid request
  Given the request is invalid
  When I attempt to find a course
  Then I should receive a RequestInvalidError

Scenario: Fail; Invalid identifier
  Given the identifier is invalid
  When I attempt to find a course
  Then I should receive a RequestInvalidError

Scenario: Fail; course not found
  Given the request is valid
  And no record exists that matches our request
  When I attempt to find a course
  Then I should receive a RepositoryItemNotFoundError

# TODO
# Scenario: Fail; Error occurs retrieving course
