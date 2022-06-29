Feature: Transform Event

Scenario: Successfully transforming external event to event
  Given the request is valid
  When I attempt to transform an event
  Then a matching event should be returned

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to transform an event
  Then I should receive a RequestInvalidError
