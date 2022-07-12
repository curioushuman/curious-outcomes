Feature: Find Course

Scenario: Success; found courses by External Id
  Given the request is valid
  And a matching record exists
  When I attempt to find a course
  Then the matching course is returned

Scenario: Success; found courses by Slug
  Given the request is valid
  And a matching record exists
  When I attempt to find a course
  Then the matching course is returned

Scenario: Fail; Invalid request
  Given the request is invalid
  When I attempt to find a course
  Then I should receive a BadRequestException

Scenario: Fail; courses not found
  Given the request is valid
  And no record exists that matches our request
  When I attempt to find a course
  Then I should receive a NotFoundException

# TODO
# Scenario: Fail; Error occurs retrieving course