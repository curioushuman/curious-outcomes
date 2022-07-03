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

## Decisions

- libs/services
  - Will use a single module, and a single controller
    - As these are going to be imported by the handlers as a separate package
    - There is less need to break them into smaller files/functions for bundling
