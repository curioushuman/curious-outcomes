Feature: Find Course

# Scenario: Success; found course by Id
#   Given the request is valid
#   And a matching record exists
#   When I attempt to find a course
#   Then the matching course is returned

# Scenario: Success; found course by External Id
#   Given the request is valid
#   And a matching record exists
#   When I attempt to find a course
#   Then the matching course is returned

# Scenario: Success; found course by Slug
#   Given the request is valid
#   And a matching record exists
#   When I attempt to find a course
#   Then the matching course is returned

Scenario: Fail; Invalid request
  Given the request is invalid
  When I attempt to find a course
  Then I should receive an InternalRequestInvalidError

Scenario: Fail; Empty request
  Given the request is empty
  When I attempt to find a course
  Then I should receive an InternalRequestInvalidError

Scenario: Fail; Empty values request
  Given the request contains empty values
  When I attempt to find a course
  Then I should receive an InternalRequestInvalidError

# Scenario: Fail; course not found by Id
#   Given the request is valid
#   And no record exists that matches our request
#   When I attempt to find a course
#   Then I should receive a RepositoryItemNotFoundError

# Scenario: Fail; course not found by other than Id
#   Given the request is valid
#   And no record exists that matches our request
#   When I attempt to find a course
#   Then I should receive a RepositoryItemNotFoundError

# TODO
# Scenario: Fail; Error occurs retrieving course
