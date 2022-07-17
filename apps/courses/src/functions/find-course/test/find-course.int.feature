Feature: Find Course

Scenario: Fail; Invalid request
  Given the request is invalid
  When I attempt to find a course
  Then I should receive a RequestInvalidError
