#!/bin/bash
# Generic content-lane check: run the repo's own independent post evaluator
# against the remediated post. Runs in the worker's worktree (cwd); node deps
# come from the integration worktree via symlink.
#
# Usage: post_verify.sh <slug> [integration_worktree]
#   integration_worktree may also be passed via $SEO_LOOP_INTEGRATION_WORKTREE.
set -u
slug="$1"
integration="${2:-${SEO_LOOP_INTEGRATION_WORKTREE:-}}"
if [ -z "$integration" ] || [ ! -d "$integration/node_modules" ]; then
  echo "FAIL: integration worktree with node_modules not provided (arg 2 or SEO_LOOP_INTEGRATION_WORKTREE)"
  exit 2
fi
# The symlink must not survive this script: the patch exporter treats any
# leftover node_modules entry as an out-of-scope change and fails the task.
# Only create it when node_modules is absent — ln -sfn into an EXISTING dir
# would nest a stray link inside it (node_modules/node_modules).
if [ ! -e node_modules ]; then
  trap 'if [ -L node_modules ]; then rm -f node_modules; fi' EXIT
  ln -sfn "$integration/node_modules" node_modules 2>/dev/null || true
fi
node scripts/evaluate-post.js "src/content/blog/${slug}.md"
rc=$?
if [ $rc -ne 0 ]; then
  echo "FAIL: evaluate-post.js exited $rc for ${slug} (see scenario failures above)"
  exit $rc
fi
echo "OK: ${slug} passes the full pre-publish evaluator"
