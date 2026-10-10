#!/bin/bash
set -eu

cd "$(dirname "$0")"

# Prevent committing during another Git operation.
if [ -e .git/index.lock ]; then
    echo "Git is busy; skipping this run."
    exit 0
fi

BRANCH="$(git branch --show-current)"
if [ -z "$BRANCH" ]; then
    echo "No active branch. Aborting."
    exit 1
fi

# Stage changes, excluding common secret files.
git add -A
git reset -q -- .env .env.local .env.production 2>/dev/null || true

# Basic secret-pattern check. This is not a complete secret scanner.
if git diff --cached --no-ext-diff |
  grep -E 'BEGIN .*PRIVATE KEY|gh[pousr]_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16}' |
  grep -v 'grep -E' >/dev/null; then
    echo "Possible secret detected. Review staged changes."
    exit 1
fi

if git diff --cached --quiet; then
    echo "No changes to commit."
    exit 0
fi

git commit -m "chore: automated progress checkpoint $(date '+%Y-%m-%d %H:%M')"
git push origin "$BRANCH"
