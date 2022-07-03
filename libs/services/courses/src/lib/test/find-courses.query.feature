Feature: Find Courses

Scenario: Success; found requested courses
  Given the request is valid
  And records exist that match the request
  When I attempt to find courses matching the request
  Then a successful response is received
  And a list of related courses are returned with it

Scenario: Fail; Invalid request
  Given the request is invalid
  When I attempt to find courses matching the request
  Then I should receive a RequestInvalidError/BadRequestException

Scenario: Fail; Source not found for ID provided
  Given the request is valid
  And no record exists that matches our request
  When I attempt to find courses matching the request
  Then a successful response is received
  And an empty list is returned with it
