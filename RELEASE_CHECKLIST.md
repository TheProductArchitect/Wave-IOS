# Release Checklist & Hardening Guide

Complete these steps before and after your first open-source release to ensure security, compliance, and smooth community contributions.

## Pre-Release (Before First Public Release)

### Code & Quality Checks ✓
- [x] All tests passing: `npm test -- --runInBand`
- [x] Linting clean: `npm run lint`
- [x] Type checking: `npm run typecheck`
- [x] Expo health: `npx expo-doctor` (17/17 checks)
- [x] Production dependencies audit: 0 vulnerabilities
- [x] URL safety tests: 5/5 passing

### Documentation ✓
- [x] README.md with setup, safety guard logic, tech stack
- [x] CONTRIBUTING.md with dev setup and conventions
- [x] CODE_OF_CONDUCT.md with enforcement procedures
- [x] SECURITY.md with vulnerability reporting policy
- [x] LICENSE (MIT)
- [x] CHANGELOG.md with version history and features
- [x] Issue templates (bug report, feature request)

### Governance ✓
- [x] Branch protection guidance in BRANCH_PROTECTION.md
- [x] GitHub Actions CI workflow (.github/workflows/ci.yml)
- [x] Pre-commit hooks (Husky)
- [x] ESLint + Jest configured
- [x] Code of Conduct enforcement channel configured

### GitHub Configuration (Manual Steps Required)

#### Step 1: Enable Branch Protection on main

1. Go to **Settings** > **Branches**
2. Under "Branch protection rules," click **Add rule**
3. Branch name pattern: `main`
4. Enable:
   - ✓ Require a pull request before merging
   - ✓ Require approvals: 1
   - ✓ Dismiss stale pull request approvals
   - ✓ Require conversation resolution before merging
   - ✓ Require status checks to pass before merging
     - Add status check: `checks`
   - ✓ Do not allow force pushes
   - ✓ Do not allow deletions
   - ✓ Restrict who can push to matching branches (optional: maintainers only)
5. Click **Create**

#### Step 2: Enable Security Advisories

1. Go to **Settings** > **Code security and analysis**
2. Under "Private vulnerability reporting," ensure **enabled**
3. Under "Security advisories," ensure **enabled**
4. Confirm notifications are set up for advisory events

#### Step 3: Enable Secret Scanning & Push Protection

1. Go to **Settings** > **Code security and analysis**
2. Under "Secret scanning," click **Enable** if not already active
3. Under "Push protection," click **Enable** to reject pushes with secrets detected
4. Configure optional notification rules for your team

#### Step 4: Configure GitHub Actions Permissions (Optional)

1. Go to **Settings** > **Actions** > **General**
2. Under "Workflow permissions," set to **Read and write permissions** if CI needs to auto-publish
3. Ensure "Allow GitHub Actions to create and approve pull requests" is unchecked unless needed

### Release Validation Checklist

Before announcing the release:

- [ ] All GitHub security settings enabled (branch protection, secret scanning, advisories)
- [ ] CI is green on the main branch
- [ ] Tag version 1.0.0: `git tag -a v1.0.0 -m "Release version 1.0.0"`
- [ ] Push tags: `git push origin v1.0.0`
- [ ] GitHub releases page: Create release from v1.0.0 tag with CHANGELOG.md summary
- [ ] Test: Clone the repo fresh and run `npm install && npm run ios` in a clean environment
- [ ] Community: Post announcement in appropriate channels (GitHub Discussions, dev.to, etc.)

## Post-Release (Ongoing Maintenance)

### Community Engagement

- Monitor Issues and Discussions for community questions
- Triage bug reports and feature requests weekly
- Respond to security advisories within SLA (see SECURITY.md)
- Review PRs and provide constructive feedback within 5 business days

### Dependency Management

- Run `npm audit` monthly to check for new vulnerabilities
- Update Expo SDK when minor/patch versions release (quarterly)
- Keep React Native and TypeScript aligned with Expo SDK LTS
- Review `npm outdated` quarterly and prioritize security patches

### Versioning Strategy

- Follow Semantic Versioning (MAJOR.MINOR.PATCH)
- Increment MAJOR for breaking API changes
- Increment MINOR for new features (backward-compatible)
- Increment PATCH for bug fixes
- Update CHANGELOG.md and tag releases consistently

### Documentation Maintenance

- Keep README.md in sync with current features and tech stack
- Update CONTRIBUTING.md if workflow changes
- Update SECURITY.md response expectations if team changes
- Review and refresh BRANCH_PROTECTION.md annually

## Release Notes Template (for future releases)

Use this template in GitHub Releases:

```markdown
## Wave [VERSION] - [DATE]

### What's Changed
- Feature/fix description
- Security patch applied (CVE-XXXX)

### Breaking Changes
- List any API or behavior changes that require contributor updates

### Dependency Updates
- Expo SDK X.X.X
- React Native X.X.X

### Contributors
@handle1 @handle2

**Full Changelog**: https://github.com/TheProductArchitect/Wave-IOS/compare/vX.Y.Z...vA.B.C
```

## Troubleshooting Release Issues

**Q: CI failed on a PR that looks correct locally?**
- Run `npm ci` (not `npm install`) to match lockfile exactly
- Check Node.js version matches CI (20.x)
- Run all checks locally before pushing: `npm run lint && npm run typecheck && npm test`

**Q: Should I accept a PR that doesn't pass all checks?**
- No. Branch protection enforces checks; maintainers cannot merge without passing CI.
- Ask contributor to fix and re-push; no force merges without discussion.

**Q: Community reports a security issue. What's my SLA?**
- Initial response: 72 hours
- Patch/workaround available: 14 days (high-severity)
- Public disclosure: after patch is released and validated

---

**Status**: Release checklist complete. GitHub configuration steps are manual and require owner/admin access. See Step 1–4 above for implementation.
