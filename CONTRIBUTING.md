# Contributing to Repair-Web-Calendar

Thanks for your interest in contributing! This document explains how to set up your environment, follow the project style, and submit changes.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Project Overview](#project-overview)
- [Set Up Your Environment](#set-up-your-environment)
- [Running the App](#running-the-app)
- [Formatting & Style](#formatting--style)
- [Testing](#testing)
- [Branching & Commit Messages](#branching--commit-messages)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Issue Reports & Feature Requests](#issue-reports--feature-requests)
- [Security](#security)
- [License](#license)

## Code of Conduct
Be respectful and constructive. Assume good intent and focus on making the software better for everyone. Harassment or discrimination of any kind is not tolerated.

## Project Overview
Repair-Web-Calendar is a Java/Spring-based web application with HTML templates and a small amount of front-end JavaScript. The repository also includes Prettier configuration for consistent formatting across Java, HTML, and JS.

## Set Up Your Environment
Prerequisites:
- Java 21
- Maven 3.8+
- Node.js and npm (for running Prettier formatting)
- Git

Steps:
1. Fork the repository and clone your fork.
2. Create a local branch for your change: `git checkout -b feature/short-description`.
3. Copy environment variables if needed: `env.example` → create your local `.env` with the right values.
4. Import the project into your IDE as a Maven project.

## Running the App
- From the command line:
  - Build: `mvn clean package`
  - Run: `mvn spring-boot:run`
- Or use your IDE’s Spring Boot run configuration.

## Formatting & Style
This repo uses Prettier (including `prettier-plugin-java`) and a GitHub Actions workflow to enforce formatting.

- One-time install (if needed): `npm ci` (or `npm install`)
- Format all files: `npx prettier --write .`
- Check formatting (CI will do this too): `npx prettier --check .`

Guidelines:
- Java, HTML, JS, and other supported files must be formatted with Prettier using the repo’s `.prettierrc.yaml`.
- Keep changes focused and small; avoid unrelated reformatting in the same PR. If you must reformat, do it in a dedicated commit.
- Follow existing naming and code patterns for consistency.

## Testing
- Run the full test suite: `mvn test`
- Ensure all tests pass locally before pushing.
- If you add or change behavior, add corresponding tests under `src/test/java`.

## Branching & Commit Messages
- Branch naming: `feature/...`, `fix/...`, `chore/...`, `docs/...`, `refactor/...`.
- Prefer Conventional Commits for clarity:
  - `feat: added calendar color-coding`
  - `fix: corrected null handling for job details`
  - `docs: added CONTRIBUTING guide`
  - `refactor: simplified job service logic`
  - `test: added controller unit tests`

## Submitting a Pull Request
Before opening a PR, please:
1. Rebase your branch on the latest `main` (or the active default branch).
2. Ensure code builds: `mvn clean verify`.
3. Run format check: `npx prettier --check .` (or format with `--write`).
4. Run tests: `mvn test` and ensure green.
5. Update `README.md` or other docs if behavior changes.
6. Provide a clear PR description: what changed, why, and how to verify.

PR Checklist:
- [ ] Code builds and tests pass locally
- [ ] Formatting applied (Prettier)
- [ ] Tests added/updated (if applicable)
- [ ] Docs updated (if applicable)

## Issue Reports & Feature Requests
- Search existing issues first to avoid duplicates.
- When filing a bug, include:
  - Steps to reproduce
  - Expected vs. actual behavior
  - Relevant logs/stack traces
  - Environment info (OS, Java version)
- For features, describe the use case and suggested approach. Small, incremental proposals are preferred.

## Security
Please do not open public issues for security vulnerabilities. Instead, report them privately to the maintainers. We will coordinate a responsible disclosure and fix.

## License
By contributing, you agree that your contributions will be licensed under the project’s existing license (see [`LICENSE`](LICENSE)).
