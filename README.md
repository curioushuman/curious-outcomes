# Curious Outcomes Monorepo

This will be the home for all things Curious Outcomes. For now the focus has been on the backend.

**Please note** this README is a garbled mess. Working towards a deadline, and still experimenting with infrastructure, then I will come back and tidy this up.

## Things that need to be outlined

- OpenAPI file
  - In separate files
    - Inc. link
  - Drawn together during build
- CDK setup
  - https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html
    - Bootstrapping
      - cdk bootstrap aws://793735516609/ap-southeast-2
    - See if you can get some of this into a setup script
- Web packed vs packaged AKA Bundling process
  - Short term for shared libs we're web-packing them into service libs
  - Long term they should be broken out into their own packages
  - Talk to the other options we could try
    - e.g. bundle everything (inc. node_modules) into minified lambdas
    - Experiment and measure
- Handlers
  - Nx builds the layers
  - CDK will use esbuild to bundle and minify the handlers
    - Make sure esbuild is installed locally to speed up deployments / local testing
- libs/services
  - these are compiled by tsc only
  - they are not bundled with any of their dependent packages
- Options
  - We could webpack bundle some things into the package
    - e.g. the shared libs
  - OR we can keep everything separate
  - Simplicity, complexity, update management, version tracking, etc

## Big issues

- API Gateway Validation
  - Params / querystring validation
    - Currently it is not possible to do any kind of validation outside of required / not required
      - https://stackoverflow.com/questions/47849438/aws-api-gateway-query-parameter-validation
    - This moots it's value a little bit
    - Particularly when considering it from an asynchronous point of view
      - How do we inform the client of a bad request if it has been passed on through
    - **Option:** we'll always have access to their personal identification
        - Which is how we would have informed them of success/failure in other ways
    - **FOR NOW** we'll move forward with this level of validation
      - Coupled with type checking in the lambda
      - And asynchronous notification of success/error
      - While we wait for AWS to provide this function

## Decisions

- libs/services
  - Will use a single module, and a single controller
    - As these are going to be imported by the handlers as a separate package
    - There is less need to break them into smaller files/functions for bundling
- source map
  - we're going for the environment variable method
- lambda response
  - Use APIGatewayProxyResult for everything

```javascript
const response: APIGatewayProxyResult = {
  statusCode: 200,
  headers: {
    'Content-Type': 'application/json',
  },
  body: 'Hurrah',
};
```

## Rough optimization measurements

- 2.5ms Basic lambda
- 2.5ms Including layers (w?)
- 2.4ms Loading Nest modules (w?)
- 2.4ms Loading course modules (w?)
- 216.87ms initiating app (c!)
- 231.86ms with some basic logs (c!)
- 82.37 same as previous, but (w!)
- 285.23ms logging, without error (c!)
- 60.63 same as previous (w!)

## TODO

- [ ] use OpenAPI for internal APIs as well (for now)
  - At some point something like the AWS CDK docs would be better
  - i.e. interfaces, methods, etc
  - But for now, let's keep it simple and consistent
  - And hope there is a docs generator we can use

## Space for rough notes

### Multiple access points, to the same endpoint

Or something like that...

An example is GET/courses

Admin will want /courses/{externalId}
Public will want /courses/{slug}
RESTapi should be /courses/{id}

Then there is the service layer...

One way

- api-admin
  - /courses/{externalId}
  - handler
    - return FindCourseController.find({externalId})
  - controller
    - FindCoursesQuery({externalId})
    - return first
  - query/service
    - Repository.find({externalId})
  - repository
    - Varies
- api-public
  - /courses/{id}
  - handler
    - return FindCourseController.find({id})
  - controller
    - return FindCourseQuery({id})
  - query/service
    - return Repository.findOne({externalId})
  - repository
    - Varies
- api-public
  - /courses/{id?}?{slug?}
  - handler
    - return FindCourseController.find({id, slug})
  - controller
    - if ID
      - return FindCourseQuery({id})
    - else
      - FindCoursesQuery({externalId})
      - return first
  - query/service
    - Repository.findOne({externalId})
    - OR
    - Repository.find({externalId})
  - repository
    - Varies

The answers

- repository
  - find
  - findOne(byId)
- Queries/service
  - findOne
  - find
  - search
    - More serious version of find
- Controller
  - findOne(id or slug or external id)
    - if id
      - findOne
    - else
      - find
      - return first
  - find(dto)
    - find
  - search
    - search
- handler
  - supported by findOne
- api
  - can vary based on need
