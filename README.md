## Things that need to be outlined

- OpenAPI file
  - In separate files
    - Inc. link
  - Drawn together during build
- Talk about the multi-stage build process
  - TODO: would be nice to use Nx a bit more for this
    - so we can skip cached bits
- CDK setup
  - https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html
    - Bootstrapping
      - cdk bootstrap aws://793735516609/ap-southeast-2
    - See if you can get some of this into a setup script
- Web packed vs packaged
  - Short term for shared libs we're web-packing them into service libs
  - Long term they should be broken out into their own packages
- Handlers
  - NO BUILD from Nx
  - CDK will use esbuild to bundle and minify
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
