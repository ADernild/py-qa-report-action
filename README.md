# Python QA Report Action

A GitHub Action that parses pytest, bandit, and ruff results and posts a comprehensive quality report as a comment on pull requests.

## Features

- 🧪 **Pytest Integration** - Parse test results with pass/fail counts and failure details
- 🔒 **Bandit Security Scan** - Display security issues grouped by severity with code snippets
- 🔧 **Ruff Linting** - Summarize linting issues with links to documentation
- 💬 **Smart PR Comments** - Automatically updates existing comments instead of spamming new ones
- ✅ **Flexible** - Use any combination of the three tools
- ⚡ **Fast** - Written in TypeScript with minimal dependencies
