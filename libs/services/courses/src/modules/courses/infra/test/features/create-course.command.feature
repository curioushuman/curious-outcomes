Feature: Create Course

Scenario: Successfully creating a course
  Given the request is valid
  When I attempt to create a course
  Then a new record should have been created

# Scenario: Fail; Invalid request
Scenario: Fail; Invalid request, invalid data
  Given the request contains invalid data
  When I attempt to create a course
  Then I should receive a RequestInvalidError
