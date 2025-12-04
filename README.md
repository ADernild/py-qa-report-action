# py-qa-report-action

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/ADernild/py-qa-report-action)](https://github.com/ADernild/py-qa-report-action/releases)
[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-Python%20QA%20Report-blue?logo=github)](https://github.com/marketplace/actions/py-qa-report-action)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub](https://img.shields.io/github/followers/adernild?label=follow&style=social)](https://github.com/ADernild "Follow ADernild on GitHub")
[![Become a sponsor to ADernild](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=%23fe8e86)](https://github.com/sponsors/ADernild "Become a sponsor to ADernild")

A GitHub Action to parse [pytest](https://pytest.org), [bandit](https://bandit.readthedocs.io), and [ruff](https://github.com/astral-sh/ruff) results and post a comprehensive quality report as a comment on pull requests.

## Contents

- [Features](#features)
- [Usage](#usage)
  - [Basic](#basic)
  - [Complete workflow example](#complete-workflow-example)
  - [Single tool](#single-tool)
  - [Fail on errors](#fail-on-errors)
  - [Using outputs](#using-outputs)
- [Inputs](#inputs)
- [Outputs](#outputs)
- [License](#license)

## Features

- 📊 **Comprehensive Reports** - Combines pytest, bandit, and ruff results in a single PR comment
- 🔗 **GitHub Integration** - Clickable links directly to files and line numbers in your code
- 💬 **Smart Comments** - Updates existing comments instead of creating duplicates
- ✅ **Flexible** - Use any combination of tools, or just one
- ⚡ **Fast & Lightweight** - Native TypeScript with minimal dependencies

## Usage

### Basic

```yaml
- uses: ADernild/py-qa-report-action@v1
  with:
    pytest-results: pytest-report.json
    bandit-results: bandit-report.json
    ruff-results: ruff-report.json
```

### Complete workflow example

```yaml
name: Code Quality

on:
  pull_request:
    branches: [main]

jobs:
  quality-check:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    
    steps:
      - name: Checkout the repository
        uses: actions/checkout@v6
      
      - name: Install uv
        uses: astral-sh/setup-uv@v6
        with:
          enable-cache: true
    
      - name: Install the project
        run: uv sync --locked --all-extras --all-groups
      
    
      - name: Run pytest
        run: uv run pytest --json-report --json-report-file=pytest-report.json
        continue-on-error: true
      
      - name: Run bandit
        run: uvx bandit -r src/ -f json -o bandit-report.json
        continue-on-error: true
      
      - name: Run ruff
        run: uvx ruff check --output-format=json src/ > ruff-report.json
        continue-on-error: true
      
      - name: Post Quality Report
        uses: ADernild/py-qa-report-action@v1
        with:
          pytest-results: pytest-report.json
          bandit-results: bandit-report.json
          ruff-results: ruff-report.json
```

### Single tool

Use only the tools you need:

```yaml
# Pytest only
- uses: ADernild/py-qa-report-action@v1
  with:
    pytest-results: pytest-report.json

# Bandit and Ruff only
- uses: ADernild/py-qa-report-action@v1
  with:
    bandit-results: bandit-report.json
    ruff-results: ruff-report.json
```

### Fail on errors

Make the workflow fail if quality issues are found:

```yaml
- uses: ADernild/py-qa-report-action@v1
  with:
    pytest-results: pytest-report.json
    bandit-results: bandit-report.json
    ruff-results: ruff-report.json
    fail-on-errors: true
```

### Using outputs

```yaml
- name: Post Quality Report
  id: qa-report
  uses: ADernild/py-qa-report-action@v1
  with:
    pytest-results: pytest-report.json
    bandit-results: bandit-report.json
    ruff-results: ruff-report.json

- name: Check results
  run: |
    echo "Comment ID: ${{ steps.qa-report.outputs.comment-id }}"
    echo "Has errors: ${{ steps.qa-report.outputs.has-errors }}"
    echo "Tests passed: ${{ steps.qa-report.outputs.pytest-passed }}"
```

## Inputs

All inputs are optional except for `github-token`, which defaults to the automatic `GITHUB_TOKEN`.

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `github-token` | GitHub token for posting comments. Uses the automatic token by default. | No | `${{ github.token }}` |
| `pytest-results` | Path to pytest JSON results file (requires `pytest-json-report` plugin) | No | `""` |
| `bandit-results` | Path to bandit JSON results file | No | `""` |
| `ruff-results` | Path to ruff JSON results file | No | `""` |
| `fail-on-errors` | Fail the workflow if errors are found (pytest failures, high/medium bandit issues, or any ruff issues) | No | `false` |
| `update-comment` | Update the existing report comment instead of creating a new one | No | `true` |

## Outputs

| Output | Description |
|--------|-------------|
| `comment-id` | ID of the comment that was created or updated |
| `has-errors` | Whether any errors were found (`true` or `false`) |
| `pytest-passed` | Number of pytest tests that passed |
| `pytest-failed` | Number of pytest tests that failed |
| `bandit-issues` | Number of bandit security issues found |
| `ruff-issues` | Number of ruff linting issues found |

## License 
MIT License see [LICENSE](LICENSE)
