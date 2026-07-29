# Changelog

All notable changes to Cache will be documented in this file.

The project follows [Semantic Versioning](https://semver.org/) after `1.0.0`.

## [Unreleased]

### Added

- Zero-configuration local CLI database initialization
- Publishable `@tanrdev/cache` CLI workspace
- Responsive local web application shell
- Dedicated marketing-deployment route boundary

### Changed

- Consolidated product and command naming around **Cache**
- Reworked the public site around the local-first product workflow
- Made CLI configuration writes atomic and owner-readable only

### Fixed

- Local profiles no longer require web-server authentication secrets
- Local profiles seed their database owner before writing snippets
- `cache storage validate` no longer mutates profile settings
- The `cache rm` alias receives the same interactive confirmation as the long
  delete command
- Marketing deployments no longer expose setup, sign-in, or application APIs
