---
name: git-add-account
description: Adds a new SSH Git account, enabling automatic switching between multiple accounts based on the workspace. Use when setting up Git accounts, configuring SSH keys for different Git providers, or managing separate credentials for multiple projects.
---

# Git Add Account

This skill adds a new SSH Git account tied to a specific workspace directory. Configures per-workspace Git and SSH settings so Git automatically uses the right identity based on where you run commands.

## Usage

> [!IMPORTANT]
> Before proceeding, ensure npm, pnpm, yarn, bun or another Node.js compatible package manager is installed.
> All file paths should be absolute, relative paths should be converted to absolute paths before proceeding.

1. Using an available package manager, execute `@savaryna/git-add-account --help` to see all available options (e.g., `npx @savaryna/git-add-account --help`)
2. Ask the user if they would like to run a dry run first
3. Run `@savaryna/git-add-account` with the required parameters in non-interactive mode. For example:

```bash
npx @savaryna/git-add-account \
  --non-interactive \
  --name "Joe Doe" \
  --email "joe@example.com" \
  --host "github.com" \
  --workspace "/Users/joe/code/personal" \
  --signYourWork \
  --dry-run
```
