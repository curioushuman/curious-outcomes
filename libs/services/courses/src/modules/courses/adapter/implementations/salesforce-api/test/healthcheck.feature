Feature: Course Source Liveness probe

Scenario: Successful connection to repository
Given the repository is live
  When I attempt attempt to check live status
  Then I should receive a positive result

Scenario: Fail; Unable to connect to source repository
Given the repository is NOT live
  When I attempt to access the source
  Then I should receive a RepositoryServerUnavailableError
  And no result is returned
