# Security Policy

## Supported Versions

Currently supported versions of Disc Radio with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via:
- **GitHub Security Advisories**: [Report a vulnerability](https://github.com/idiegocs/radiocalico/security/advisories/new)
- **Email**: Contact the maintainer directly

Include the following information:
- Type of vulnerability (e.g., SQL injection, XSS, CSRF)
- Full paths of source file(s) affected
- Location of the affected code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability
- Suggested fix (if available)

## Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 1 week
- **Status Update**: Every 2 weeks
- **Fix Release**: Depends on severity
  - Critical: < 7 days
  - High: < 30 days
  - Medium: < 90 days

## Security Measures

### Automated Scanning

This project uses automated security scanning:

- **SAST (Static Analysis)**: Semgrep for code vulnerability detection
- **Dependency Scanning**: npm audit + GitHub Dependabot
- **Container Scanning**: Trivy for Docker image vulnerabilities
- **Code Review**: ESLint with security plugins

All security scans run automatically on every push and pull request.

### Dependency Management

- Dependencies are reviewed weekly via Dependabot
- Security patches are applied immediately
- Major version updates are tested before merging
- Currently 0 known vulnerabilities in dependencies

### Secure Development Practices

- **SQL Queries**: All database queries use parameterized statements to prevent SQL injection
- **Environment Variables**: Sensitive configuration stored in environment variables
- **Error Handling**: Generic error messages in production (detailed errors only in development)
- **TypeScript**: Strict type checking enabled for type safety
- **Regular Audits**: Automated security scans on every commit

## Security Checklist for Contributors

Before submitting a PR, ensure:

- [ ] No hardcoded secrets or credentials
- [ ] SQL queries use parameterized statements (e.g., `pool.query('SELECT * FROM table WHERE id = $1', [id])`)
- [ ] User inputs are validated and sanitized
- [ ] Error messages don't expose sensitive information
- [ ] Dependencies are up-to-date (`npm audit` shows 0 vulnerabilities)
- [ ] ESLint security rules pass (`npm run lint:security`)
- [ ] Docker images use latest base images
- [ ] No new security warnings from Semgrep

## Known Security Considerations

### Docker Compose Passwords

The default PostgreSQL password in `.env.development` is for development only.

**NEVER use the default password in production.**

Change passwords in `.env.production` before deploying:
```env
POSTGRES_PASSWORD=YourSecurePasswordHere
```

### Missing Security Features

The following security features are not yet implemented (see issues for tracking):

1. **Authentication/Authorization**: No user authentication system
2. **Rate Limiting**: No protection against brute force or DDoS
3. **CORS Configuration**: CORS is not configured
4. **Security Headers**: helmet.js not implemented
5. **Input Validation**: No request validation middleware

These are known limitations and will be addressed in future releases.

### Environment Variables in Git

The `.env.development` and `.env.production` files are tracked in git for convenience. They contain:
- Development credentials only
- Default passwords that MUST be changed in production
- Non-sensitive configuration

Local overrides (`.env`, `.env.local`, `.env.*.local`) are gitignored.

## Security Disclosure Policy

Once a vulnerability is fixed:
1. A security advisory will be published
2. Credit will be given to the reporter (if desired)
3. A CVE may be requested for critical vulnerabilities
4. Release notes will include security fix details

## Viewing Security Reports

### GitHub Security Tab
View security findings at: [Security Tab](https://github.com/idiegocs/radiocalico/security)

- **Code Scanning**: Semgrep and Trivy results
- **Dependabot Alerts**: Dependency vulnerabilities
- **Secret Scanning**: Detected secrets (if enabled)

### GitHub Actions
View security scan results:
1. Go to [Actions](https://github.com/idiegocs/radiocalico/actions)
2. Select latest workflow run
3. View "Security Scan Results" summary
4. Download `npm-audit-report` artifact for details

## Contact

For security questions or concerns:
- **GitHub**: [@idiegocs](https://github.com/idiegocs)
- **Security Advisories**: Use GitHub's private vulnerability reporting
- **General Questions**: Open a discussion (not an issue)

## Acknowledgments

We thank the security research community for responsible disclosure of vulnerabilities.
