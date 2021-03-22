# Contributing

Try to keep PRs as small and focused as possible. A big PR is much less likely to be approved

## Local Development

You can use a Codesandbox environment or one of the examples in the examples folder to test your code. You will need to use `npm` or `yarn link` to link the latest version to the example app. In order to build them interactively, you will also need to run `npm run watch` in another terminal so that your package is rebuilt automatically on any code changes.

## Testing

All tests must pass. If you submit a PR with a bug fix or a new feature, it is unlikely to be approved without 100% diff coverage. To run the tests with coverage, run: `npm run test:coverage`.

## Commit Messages

Please use [Angular Commit Message Conventions](https://github.com/semantic-release/semantic-release#commit-message-format). There is a Github action that will look for commit messages like `feat(some-feature): something` and `bug(some-bug): bug` to generate semantic release versions and publish them to npm.

## Linting

Linting is done using ESLint and Prettier via a husky pre-commit hook.

## Where to Start

Start by browsing through the list of issues, particularly those flagged as `help wanted`.
