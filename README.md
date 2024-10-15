# @quave/eslint-plugin-meteor-quave

[![npm version](https://badge.fury.io/js/@quave%2Feslint-plugin-meteor-quave.svg)](https://badge.fury.io/js/@quave%2Feslint-plugin-meteor-quave)

`@quave/eslint-plugin-meteor-quave` is a plugin for eslint to ensure Javascript and Meteor standards.

## Why
This plugin will help you with your Meteor 3.0 migration.

## Installation

We recommend you to use this plugin via [quave-eslint-config](https://github.com/quavedev/eslint-config) but you can also install it directly.

Install the npm dependency
```sh
npm i -D @quave/eslint-plugin-meteor-quave
```

## Debug

You can debug by providing the `METEOR_ESLINT_PLUGIN_DEBUG` env var as `1` for example, so you will see more logs.

Run your eslint task like: `METEOR_ESLINT_PLUGIN_DEBUG=1 eslint .`

## Options

- Env var `METEOR_ESLINT_PLUGIN_EXPIRES_CACHE_IN_SECONDS`: default is `5`. You can customize the cache expiration time in seconds. - **This is especially important if you have a big project with several files and it takes a lot of time to analyze. If this value is too low, the cache will expire while the analysis is running, and the lint won´t work.**
- Env var `METEOR_ESLINT_PLUGIN_DEBUG`: default is disabled. You can pass this to enable debug mode and see more logs.
- Env var `METEOR_ESLINT_PLUGIN_IGNORE_CACHE`: default is false. You can pass this to ignore the cache.
- Env var `METEOR_ESLINT_PLUGIN_FILES`: use this if you want to lint a specific file.

## Changelog

[CHANGELOG](./CHANGELOG.md)

## License

MIT
