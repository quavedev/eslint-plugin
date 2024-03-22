# Changelog

## 1.4.2 - 2024-03-22

### Bug fixes

- Detect new files after 5 seconds as now the cache is expiring. You can customize this time by providing `METEOR_ESLINT_PLUGIN_EXPIRES_CACHE_IN_SECONDS` env var.

### Changes

- Adds more debug statements to be logged when using `METEOR_ESLINT_PLUGIN_DEBUG` env var.
- Adds an option to expires the cache after an amount of seconds, by default its 5. Env var `METEOR_ESLINT_PLUGIN_EXPIRES_CACHE_IN_SECONDS`

