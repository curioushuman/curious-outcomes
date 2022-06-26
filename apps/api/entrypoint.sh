#!/bin/bash

# start node based on ENV
if [ $NODE_ENV == "production" ]; then
  echo "Running in production..."
  node /usr/src/app/dist/api/main.js
elif [ $NODE_ENV == "test" ]; then
  echo "Running tests..."
  sleep 5
  node_modules/.bin/jest --config /usr/src/app/jest.config-k8s.js --watchAll
else
  echo "Running in development..."
  sleep 5
  npx @nestjs/cli build --webpack --webpackPath webpack-hmr.config.js --path apps/api/tsconfig.build.json --watch
fi
