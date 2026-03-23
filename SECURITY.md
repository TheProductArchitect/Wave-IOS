# Security Policy

## Supported Versions

Wave is currently pre-1.0 for open-source collaboration. Security fixes are applied to the default branch only.

## Reporting a Vulnerability

Please do not open public issues for security vulnerabilities.

Use one of these channels:

1. GitHub Security Advisories: open a private draft advisory in this repository.
2. If advisories are unavailable, open a private maintainer contact request in Discussions and include only a minimal, non-exploit description.

When reporting, include:

- Affected file(s) and function(s)
- Reproduction steps
- Impact assessment
- Suggested remediation (if available)

## Response Expectations

- Initial triage acknowledgement target: 72 hours
- Patch or mitigation target: 14 days for high-severity issues
- Public disclosure after fix is available and validated

## Scope

In scope:

- URL validation and safety guard bypasses
- NFC write-path abuse or unsafe payload handling
- Secrets exposure in repository, CI, or release artifacts

Out of scope:

- Issues requiring rooted/jailbroken device assumptions only
- Low-impact cosmetic defects with no security consequence
