# Security Policy

## Supported versions

We accept security reports for the latest released version of Bayaan Web and the Bayaan mobile app.

## Reporting a vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

If you find a security issue, report it through one of these channels:

1. **GitHub private security advisory (preferred):** Go to the [Security tab](https://github.com/thebayaan/bayaan-web/security/advisories/new) of this repository and open a private advisory.
2. **Email:** Send details to `security@thebayaan.com`.

We will acknowledge your report within **72 hours** and aim to release a fix within **14 days** for confirmed critical issues.

## What to include in your report

- A clear description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix if you have one

## What qualifies as a security issue

Report through the private channel if the issue involves:

- Exposure of user data (bookmarks, notes, playlists, favorites stored in localStorage)
- Cross-site scripting (XSS) via unsanitized user content or API responses
- Server-side request forgery (SSRF) through API proxy routes
- Authentication or authorization bypass (if auth is reintroduced)
- Malicious audio file handling leading to code execution
- API key exposure or leakage in client bundles or server logs
- Deep link hijacking
- Storage or file path traversal vulnerabilities

## What does not need a private report

Open a regular GitHub issue for:

- App crashes or unexpected behaviour
- Playback bugs
- UI/UX issues
- Performance problems

## Scope

This policy covers:

- **Bayaan Web** — this repository (`bayaan-web`), deployed at [app.thebayaan.com](https://app.thebayaan.com)
- **Bayaan mobile app** — `com.bayaan.app`

The backend API (`api.thebayaan.com`) is hosted infrastructure and may have a separate responsible disclosure process.

## Out of scope

- Rate limiting on the community API key (this is by design)
- The community API key itself being revoked or changed
- Third-party dependencies with known vulnerabilities that are not exploitable in this app's context
- Loss of localStorage data due to browser clearing or private browsing (expected browser behaviour)

## Acknowledgements

We genuinely appreciate responsible disclosure. If your report leads to a fix, we will credit you in the release notes (unless you prefer to remain anonymous).
