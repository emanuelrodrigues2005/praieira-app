# Issue Tracker

- **Tracker:** GitHub Issues
- **Repository:** `emanuelrodrigues2005/praieira-app`
- **CLI:** `gh` (GitHub CLI)

## Usage

All issue operations use the `gh` CLI authenticated against the repository.

```bash
# Create a new issue
gh issue create --title "Title" --body "Body" --label "ready-for-agent"

# List open issues
gh issue list

# View an issue
gh issue view <number>

# Close an issue
gh issue close <number>

# Add a label
gh issue edit <number> --add-label "label-name"
```

## Conventions

- Every issue belongs to exactly one bounded context (service-*).
- The issue title should reference the bounded context prefix, e.g. `[catalog] Add search endpoint`.
- Issues that are fully specified and ready for an AI agent must carry the `ready-for-agent` label.
- Before creating an issue, check for duplicates using `gh issue list`.
