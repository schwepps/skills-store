# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Skills Store, please report it responsibly.

### How to Report

**Do NOT open a public issue for security vulnerabilities.**

Instead, please send an email with:

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Suggested fix (if any)

### What to Expect

- **Response Time**: We will acknowledge your report within 48 hours
- **Updates**: We will keep you informed of our progress
- **Credit**: We will credit you in our security advisories (unless you prefer anonymity)

## Supported Versions

| Version  | Supported          |
| -------- | ------------------ |
| Latest   | :white_check_mark: |
| < Latest | :x:                |

## Security Best Practices

When contributing to this project, please follow these security guidelines:

### Environment Variables

- Never commit `.env.local` or any file containing secrets
- Use `.env.example` as a template (secrets should be placeholder values only)
- GitHub tokens should have minimal required permissions

### API Security

- All external API calls should use HTTPS
- Rate limiting should be respected
- User input should be validated with Zod schemas

### Dependencies

- Keep dependencies up to date
- Review dependency changes in PRs
- Use `pnpm audit` to check for known vulnerabilities

## Scope

This security policy applies to:

- The Skills Store web application
- Official Skills Store repositories
- Deployment infrastructure

Thank you for helping keep Skills Store secure!
