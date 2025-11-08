#!/bin/bash

source .env

npm run build

npx chromatic --project-token="$PROJECT_TOKEN" --build-script-name=build-storybook-docs --exit-zero-on-changes