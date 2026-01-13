#!/bin/bash

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  exit 0
fi

# Fetch latest changes from remote without modifying local branches
git fetch origin > /dev/null 2>&1

# Check if local branch is behind remote
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u} 2>/dev/null)
BASE=$(git merge-base @ @{u} 2>/dev/null)

# If we can't determine remote tracking, exit silently
if [ -z "$REMOTE" ]; then
  exit 0
fi

# Check if local is behind
if [ "$LOCAL" != "$REMOTE" ] && [ "$LOCAL" = "$BASE" ]; then
  BRANCH=$(git rev-parse --abbrev-ref HEAD)
  COMMITS_BEHIND=$(git rev-list --count @..@{u})
  echo ""
  echo "================================================"
  echo "  Your local repo is behind the remote!"
  echo "================================================"
  echo "Branch: $BRANCH"
  echo "Behind by: $COMMITS_BEHIND commit(s)"
  echo ""
  echo "Run 'git pull' to sync your local repo"
  echo "================================================"
  echo ""
fi

exit 0
