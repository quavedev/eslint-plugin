# Changelog

## 1.5.1 and 1.5.2 - 2024-10-15

### Bug fixes

- Fix issue where eager loaded files were not being linted when not using meteor main modules.

## 1.5.0 - 2024-04-26

### Bug fixes

- Fix error when babel config is not found by returning an empty array.
- Add guard to `auditArgumentChecks` since `node` could be empty.

### Changes

- Add support to `TS` and `TSX` files by `pre-compiling` it with the `typescript` compiler.
- You can ignore the cache from the `.eslint-meteor-file` by passing `METEOR_ESLINT_PLUGIN_IGNORE_CACHE` as an environment variable.

## 1.4.2 - 2024-03-22

### Bug fixes

- Detect new files after 5 seconds as now the cache is expiring. You can customize this time by providing `METEOR_ESLINT_PLUGIN_EXPIRES_CACHE_IN_SECONDS` env var.

### Changes

- Adds more debug statements to be logged when using `METEOR_ESLINT_PLUGIN_DEBUG` env var.
- Adds an option to expires the cache after an amount of seconds, by default its 5. Env var `METEOR_ESLINT_PLUGIN_EXPIRES_CACHE_IN_SECONDS`

## 1.4.1

> This version was not released but the fix is included into 1.4.2

### Bug fixes

- Issue linting collection hooks [#6](https://github.com/quavedev/eslint-plugin/pull/6)
