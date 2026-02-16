# Security Policy

## Supported Versions
Security updates are applied to the active production branch.

## Reporting a Vulnerability
- Email security contact (set internally before public release).
- Include reproduction steps and impact analysis.

## Security Requirements
- No insecure local auth session fallback in production.
- All auth/session tokens must be server-verifiable.
- Admin actions require strong auth + audit logs.
- Secrets must never be committed to git.
- Rotate compromised credentials immediately.

## Hardening Controls
- Content Security Policy and strict CORS.
- Rate limits and abuse protection.
- Structured security logging and alerting.
