# Branch Protection Baseline

Use these settings on the default branch (`main`) before accepting community PRs.

## Required Rules

- Require a pull request before merging
- Require approvals: minimum 1
- Dismiss stale pull request approvals when new commits are pushed
- Require conversation resolution before merging
- Require status checks to pass before merging
- Do not allow force pushes
- Do not allow deletions

## Required Status Checks

Match these check names from CI:

- checks

## Recommended Extras

- Require signed commits
- Restrict who can push to matching branches
- Require linear history
- Enable secret scanning and push protection in repository security settings
