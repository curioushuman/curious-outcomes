# Curious Outcomes Communities

Using community-supported learning to drive the most necessary outcomes.

## Built with

- Nx
- Quasar
- Nest.js
- K8s
- Skaffold

# Setup

## Install K8s

- Clone the [curious-outcomes-k8s repo](https://github.com/curioushuman/curious-outcomes-k8s) to the same directory as this repo
- Follow the (Simple) setup steps from that repo

## Software

*Apologies:* this is directed towards those on MacOS.

### nx cli

```bash
$ npm i -g nx
```

**Note:** This is optional, but without it you'll need to replace any commands starting with:

```bash
$ nx <do_a_thing>
```

With:

```bash
$ npx nx <do_a_thing>
```

### skaffold cli

```bash
$ brew install skaffold
```

## Environment variables

We use a combination of Dotenv and K8s for environment variables.

- Dotenv for running local tests **outside** of the (K8s) infrastructure
- K8s configuration and sealed secrets **inside** of the (K8s) infrastructure

K8s setup is baked into the accompanying repo, but for local test running you'll need to create a .env file with the following variables present.

### Salesforce

```bash

# An example sandbox setup
SALESFORCE_URL_AUTH="https://test.salesforce.com"
SALESFORCE_URL_DATA="https://customurl--sandboxname.my.salesforce.com/services/data"
SALESFORCE_URL_DATA_VERSION="v54.0"
SALESFORCE_USER="sf.username@you.use.sandboxname"
SALESFORCE_CONSUMER_KEY="obtainedFromYourSalesforceConnectedApp"
SALESFORCE_CERTIFICATE_KEY="-----BEGIN PRIVATE KEY-----\nsome\nlines\of\key\n-----END PRIVATE KEY-----"

```

# Working locally

Spin up the local k8s environment:

```bash
# From root
$ skaffold dev
```

Then access web interface via:

- [http://curious-outcomes-web.dev](http://curious-outcomes-web.dev)

If you are presented with an HTTPS error, type `thisisunsafe` to resolve locally.

To access API:

- [http://curious-outcomes-api.dev](http://curious-outcomes-api.dev)

You can run some basic manual tests via the `~/apps/api/requests.http` file so long as you have the [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) extension installed.

# Testing

## Approach to testing

After you have done your Event Storming or similar, and you have your list of commands/queries, the following is our approach to testing on a **per command basis**. This is heavily based on the amazing book by Khalil Stemmler (links below in DDD section); remember, it all starts with [use cases/features](https://wiki.solidbook.io/13-Features-(use-cases)-are-the-key-193ca4bbb8604c0eada33d1ac86ed517).

### 1. Write out the docs for the Feature

1. Feature summary
2. Data types
3. Feature workflow

### 2. Create high level acceptance tests

The success path, and the various failure paths determined during workflow. All subsequent tests are largely derived from these acceptance tests; with the occasional exception for specific corners of the system e.g. repository authentication.

### 3. Use BDD and TDD to come from outside in, and inside out

**3.1. Start with failing unit test for complete use case**

- Based on your acceptance test using Given, When, Then
- Write a unit test at the use case level that mocks/fakes any third party systems
  - supertest for http
  - fake repository
- Focus on the success/failure of this one use case

This is your *outside in test*.

*3.1.1. Write minimum amount of code to make it pass*

- This can be either
  - False pass
  - Actual code pass

Generally at the use case level you are probably going to start with a false pass. i.e. just return a 200 response so we know the vertical slice is working.

**3.2. Incrementally add/update code to make the *outside in test* proper pass**

This will be a series of iterations of the Red, Green, Refactor (RGR). i.e.

- Add some code to move towards an **actual** pass of the use case test
  - During this process your *outside in test* will be in a failed state
- Use smaller, internal **RGR** loop(s) to create this code
  - e.g. if you're adding a repository, start with failing tests for the repository
  - Then make these pass
- Until your *outside in test* is also passing with this new/updated code in place

**Note:** it is during this step you will notice that the tests you write for your internal RGR loops should mostly be derivatives of your over-arching acceptance tests; albeit with some conditions missing.

e.g. when testing the controller it's only responsibilities are validating the request, calling the command bus, and returning the response. Therefore a complete acceptance test such as:

```cucumber
Scenario: Successfully creating a course
  Given the request is valid
  And I am authorised to access the source
  And a matching record is found at the source
  And the returned source populates a valid course
  And the source does not already exist in our DB
  When I create a course
  Then a new record should have been created in the repository
  And no result is returned
```

Might simply be:

```cucumber
Scenario: Successfully creating a course
  Given the request is valid
  When I attempt to create a course
  Then a new record should have been created
```

The other situation that might arise is tests required that do not fall under one of the over-arching acceptance tests; but are no less important. e.g. authenticating with an external API based repository. To keep things consistent I've kept the Given, When, Then pattern.

```cucumber
Scenario: Successful authentication with repository
Given the repository is live
  And I am authorised to access the source
  When I attempt attempt to authenticate
  Then I should receive a positive result
```

**3.3. Commit the passing code**

Commit often; every time a test passes essentially. Pick and choose what you commit though, so the repo is always in a passing state.

## Technologies employed

- Jest
  - Included/recommended by Nest.js
- jest-cucumber
  - A fantastic addition that allows us to write our tests files using Given, When Then
  - Which maps directly to our acceptance tests

**NOTE:** we still use vanilla Jest occasionally for super simple tests e.g. value-objects.

## Levels/breakdown of testing

We have our unit, integration, and e2e testing like everyone else. In this instance I would like to clarify further what we mean by, and how we approach each. What kind of developer experience we have baked in based on this.

### 1. Reliant on nothing; faked/mocked

These tests have no external dependencies, they are:

- Supported with fakes/mocks (where appropriate)
- Are very quick to run
- Intended to be **watch**ed as you work
- Designed to make sure independent **unit**'s work
- As well as the **integration** of OUR various layers
  - e.g. controller, CQRS, repository, etc

As it sounds, this involves a combination of **unit** and **integration** tests.

### 2. Integrations with third parties

These are the various APIs we'll be working with. They do not require our infrastructure to be in place to be tested, so we can run them without spinning up our K8s. They can be run using Nx from the command line, you could in fact have these running alongside level 1 as you work.

These will all be considered **integration** tests as they test how our system *integrates* with another.

### 3. Reliant on K8s infrastructure

This is our databases, caching, and potentially any microservices we eventually might include. These will require a manual step to run; which should occur both during local development, and as an automated step during deployment.

These will be a combination of **integration** (e.g. testing DB repositories) and **e2e** tests (e.g. from authentication, to response, through all the layers).

# Running tests

## API

### Manual tests

This method is an alternative to something like Postman. Either honestly does a great job, this is just for quick and dirty manual testing and is handy because it's available within VS Code.

- Install [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)
- Open [~/apps/api/requests.http](apps/api/requests.http)
- Use the available tests
- OR add your own

### Level 1; reliant on nothing

Handled *outside of k8s* via Jest, managed by Nx.

```bash
$ nx run api:test
# To leave it running
$ nx run api:test --watch
```

Matches files with the regular jest pattern matching e.g. `*.(test|spec).ts`.

### Level 2; reliant on third parties

Possible *outside of k8s* via Jest, managed by Nx. Also will be run within K8s during development (outlined below), and during automated tests.

```bash
$ nx run api:test-ext
```

Matches files with the file pattern `*.ext-spec.ts`.

### Level 3: reliant on infrastructure (K8s)

Handled **INSIDE of k8s** via Jest, supported by Nx, enabled via Skaffold.

```bash
# Tells skaffold.yaml to use the 'test' stage of Docker container
$ nx run api:pre-test
# Then tests are automatically run and watched within k8s
$ skaffold dev
```

Matches files with the file pattern `*.k8s-spec.ts`.

**NOTE:** all tests will be run within K8s when tests are run in this way.

### Manual testing within Kubernetes

Handled **INSIDE of k8s** via Nest cli, supported by Nx, enabled via Skaffold.

```bash
# Tells skaffold.yaml to use the 'development' stage of Docker container
$ nx run api:pre-dev
# Skaffold will deploy k8s and Nest will start
$ skaffold dev
```

This will spin up the k8s cluster, and start Nest with:

- hot reloading
- watch

**Note:** you only have to run pre-dev if you've previously been running level 3 tests.

## App

TBC

## All

TBC

# Troubleshooting

## xVariable cannot be found; on a class (even though it exists)

I'm still learning Functional Programming (FP) and this catches me out every now and then; i.e. the combination of FP and Object Oriented Programming (OO). Essentially it comes down to wanting to include a method of a class, in an FP program, that itself relies on relationships to other classes (more than likely injected by Nest).

In the end it was the simple change of using arrow style functions in my classes, rather than the classic style:

```javascript
class exampleRepository {

  constructor(private httpService: HttpService) {}

  // Use this
  findOne = (dto: FindCourseSourceDto): TE.TaskEither<Error, CourseSource> => {}

  // Rather than this
  public findOne(dto: FindCourseSourceDto): TE.TaskEither<Error, CourseSource> {}

}
```

# Appendix

## Connecting to third party APIs

### Salesforce

For machine to machine communication you need to use the OAuth 2.0 JWT Bearer Flow. Official (rubbish) docs:

- https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_jwt_flow.htm&type=5

Better instructions can be found at either of the following:

- https://medium.com/@salesforce.notes/salesforce-oauth-jwt-bearer-flow-cc70bfc626c2
- https://gist.github.com/booleangate/30d345ecf0617db0ea19c54c7a44d06f

The above includes all the steps required e.g. setting up a connected app in Salesforce. One of the most important, and easily overlooked steps is to authorise a specific user by visiting the link below. Once there, login using the Salesforce user account you want to use in your code. **NOTE:** this may not be your own personal user.

```
# Template
https://<your_salesforce_url/services/oauth2/authorize?response_type=token&client_id=<consumer key>&redirect_uri=<your_callback>

# Staging example
https://asiapacificforum--sandboxname.lightning.force.com/services/oauth2/authorize?response_type=token&client_id=3MVG9e2-this-sdsdf-is-kjnsdfsdf-not-a-sdsdfsdf-real-key&redirect_uri=https://oauth.pstmn.io/v1/callback

# Production example
https://asiapacificforum.lightning.force.com/services/oauth2/authorize?response_type=token&client_id=3MVG9e2-this-sdsdf-is-kjnsdfsdf-not-a-sdsdfsdf-real-key&https://oauth.pstmn.io/v1/callback

```

***Important notes***

- When requesting the access token (within your code) you must use test.salesforce.com / login.salesforce.com rather than your custom URL
- When sending the body it **DOES INDEED NEED TO BE** stringified
- The callback doesn't matter, but I've used one that works well with postman so you can use it for manual testing.

## TODO

### Value Objects being more OO

At the moment they piggyback on runtypes (which I love) but are not super Type safe nor OO. For now they do the job (well) but in the future this needs revisiting.

### Runtypes validation errors returning better messages

Currently they're a little verbose. Just need to trim them down a little bit to make them more readable while still being useful.

## Inspiration

### Domain Driven Development (DDD)

Khalil Stemmler and his fantastic book + supporting repo:

- https://solidbook.io/
- https://github.com/stemmlerjs/ddd-forum

### API

* [VincentJouanne/nest-clean-architecture](https://github.com/VincentJouanne/nest-clean-architecture)
  * Very tidy, very advanced combination of Nest.js & DDD

## Important notes / decisions

### Nx/monorepo

At this stage, we don't employ *all* of the benefits of Nx as a monorepo provider. This is mainly down to:

- K8s for service delivery
- Inconsistent results for Vue (et al) within Nx

Things I would like to work on next:

- Taking full advantage of Nx build and build caching
  - Currently we build within the respective Dockerfiles
    - Which means semi-duplicated package.json files
    - And potential productivity costs
  - When there is time I will play with this further
    - May require some faffing on the Quasar front
- Shared repo for UI elements

### Testing

**#1 We have specifically not included skaffold within Nx**

- It disables Skaffold's natural rollback function upon CTRL+C (as the CTRL C is picked up only by Nx)
- It has no dependencies that Nx can help us with (as Skaffold will rebuild from Dockerfile anyway)
- It disables Skaffold terminal colours

I'm sure there are solutions to some of these, but they're low priority when we already have a working solution.

**#2 *pre-test-e2e* and *pre-dev* do not build the docker containers**

Because Skaffold does.

### Leaner Value Objects (VO) & Domain Objects (DO)

I love the purity of Stemmler's approach to VO, Entities, AggregateRoots but as we enfold his pure DDD into a Nest.js context; where a lot of DDD/CQRS things are already handled; there was always going to be a need to refine/remove aspects. The [RunTypes](https://github.com/pelotom/runtypes) library (introduced by Vincent) is fantastic, at it's core it contributes runtime type checking on top of compile time checking, as well as:

- Data validation
- Value constraint definition / validation
- Type guarding
- Object matching
- And much more...

Links and articles [below](#runtypes) in the [packages](#packageslibraries) section.

## Packages/libraries

### Runtypes

Borrowed from [VincentJouanne](https://github.com/VincentJouanne), they use it to implement very neat encapsulated Value Objects.

* [Runtypes](https://github.com/pelotom/runtypes)
* [A good article about Runtypes](https://blog.logrocket.com/using-typescript-to-stop-unexpected-data-from-breaking-your-app/)
