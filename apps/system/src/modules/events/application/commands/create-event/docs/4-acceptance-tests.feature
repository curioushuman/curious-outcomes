Feature: Create Event

Scenario: Successfully creating event, from external event
  Given the request is valid
  When I attempt to create a event
  Then a matching event should be emitted
  And no result is returned

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to create a event
  Then I should receive a RequestInvalidError
  And no result is returned

Scenario: Fail; Unable to emit event
Given the request is valid
  And athere is a problem emitting the event
  When I attempt to create a event
  Then I should receive a EventFailedError
  And no result is returned
