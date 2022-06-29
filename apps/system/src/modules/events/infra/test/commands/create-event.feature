Feature: Create Event

Scenario: Successfully creating a Event
  Given the request is valid
  When I attempt to create a Event
  Then a new record should have been created

# Scenario: Fail; Invalid request
Scenario: Fail; Invalid request, invalid data
  Given the request contains invalid data
  When I attempt to create a Event
  Then I should receive a RequestInvalidError
