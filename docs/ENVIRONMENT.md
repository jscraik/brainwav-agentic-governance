# Environment Variables

This document describes environment variables used by the AMYGA Governance CLI.

## Configuration

### `GOVERNANCE_PROFILE`

Override the default governance profile.

**Values:** `creative`, `delivery`, `release`

**Default:** `delivery`

**Example:**
```bash
GOVERNANCE_PROFILE=release pnpm exec brainwav-governance validate
```

### `BRAINWAV_PROFILE`

Alias for `GOVERNANCE_PROFILE`. If both are set, `GOVERNANCE_PROFILE` takes precedence.

### `BRAINWAV_JSON`

When set to `1`, forces JSON output mode for CLI commands.

**Values:** `1` (enabled)

**Example:**
```bash
BRAINWAV_JSON=1 pnpm exec brainwav-governance doctor
```

## Validation Settings

### `STANDARDS_MAX_AGE_DAYS`

Maximum age in days for `standards.versions.json` before triggering a freshness warning.

**Default:** `90`

**Example:**
```bash
STANDARDS_MAX_AGE_DAYS=180 pnpm exec brainwav-governance validate
```

## Tooling

### `GITLEAKS_VERSION`

Fallback version string for gitleaks when version detection fails.

**Example:**
```bash
GITLEAKS_VERSION=8.24.0 pnpm exec brainwav-governance doctor
```

## CI/CD Integration

### `CI`

When set (standard in most CI environments), certain interactive prompts are disabled.

### `GITHUB_ACTIONS`

When set to `true`, GitHub Actions-specific output formatting is enabled.

## Development

### `DEBUG`

Enable debug logging for troubleshooting.

**Example:**
```bash
DEBUG=1 pnpm exec brainwav-governance validate --verbose
```

## Example `.env` File

```bash
# .env.local (do not commit)
GOVERNANCE_PROFILE=delivery
STANDARDS_MAX_AGE_DAYS=90
```

Note: The CLI does not automatically load `.env` files. Use a tool like `dotenv-cli` or export variables manually.
