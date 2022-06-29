Feature: Transform Event

Scenario: Successfully transforming external event to event
  Given the request is valid
  When I attempt to transform an event
  Then a matching event should be returned

Scenario: Fail; Event not found
  Given the request does not relate to an internal event
  When I attempt to transform an event
  Then I should receive a EventNotFoundError
