# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Shared constants module (`scripts/lib/constants.mjs`) for centralized configuration
- Enhanced `fs-utils.mjs` with `readJsonFile`, `readTextFile`, `existsNonEmpty`, and `copyRecursive` helpers
- JSDoc type annotations for better IDE support and documentation
- CHANGELOG.md for version tracking

### Fixed
- Fixed regex bug in `findMissingVerifyScripts` where `\\w` was incorrectly escaped as `\\\\w`
- Fixed unused variable warnings in `init-wizard.mjs` (removed `execSync`, `repoRoot`, `argv`, `taskDir`)
- Fixed unused parameter in VitePress config (`md` → `_md`)
- Added missing JSDoc `@returns` declarations in VitePress config
- Fixed JSDoc sentence completeness (periods at end of descriptions)

### Changed
- Improved code organization with shared constants and utilities
- Enhanced error handling patterns throughout codebase

## [0.2.46] - 2026-01-05

### Added
- Initial public release
- Governance CLI with install, validate, doctor, upgrade commands
- Pack system for modular governance rules
- Pointer and full installation modes
- Profile-based severity (creative, delivery, release)
- Spec-kit compatibility for SDD workflow
- Agent loop pack for automated governance loops
- MCP integration support
- CI/CD workflow generation

[Unreleased]: https://github.com/jscraik/amyga-governance/compare/v0.2.46...HEAD
[0.2.46]: https://github.com/jscraik/amyga-governance/releases/tag/v0.2.46
