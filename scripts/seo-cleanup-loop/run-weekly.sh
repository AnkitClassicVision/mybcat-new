#!/bin/bash
# Weekly SEO technical-cleanup loop launcher (installed in ankit114's crontab).
# Starts a headless Claude Code orchestrator session that executes
# docs/runbooks/seo-technical-cleanup.md (Ringer does the typing; every fix is
# check-verified; output is a PR — never a merge).
#
# Disable: crontab -e and remove the seo-cleanup-loop line, or
#          touch ~/.mybcat/seo-cleanup-loop.DISABLED
set -u
REPO="${1:-/mnt/d_drive/repos/mybcat-new}"
LOGDIR="$HOME/.mybcat/logs/seo-cleanup-loop"
STAMP="$(date +%Y-%m-%d-%H%M)"
mkdir -p "$LOGDIR"
LOG="$LOGDIR/run-$STAMP.log"

if [ -f "$HOME/.mybcat/seo-cleanup-loop.DISABLED" ]; then
  echo "$STAMP disabled via kill file, skipping" >> "$LOG"; exit 0
fi

# Cheap deterministic gate before spending any tokens.
if ! bash "$REPO/scripts/seo-cleanup-loop/preflight.sh" "$REPO" >> "$LOG" 2>&1; then
  rc=$?
  if [ "$rc" -eq 1 ]; then echo "$STAMP preflight ABORT (rc=1) — no session started" >> "$LOG"; exit 1; fi
  echo "$STAMP preflight rc=$rc (detection-only mode) — session will honor it" >> "$LOG"
fi

PROMPT="Run the MyBCAT SEO technical cleanup loop. Read docs/runbooks/seo-technical-cleanup.md and execute it phase by phase, exactly as written. Hard rules that override everything else: open a PR only — NEVER merge, NEVER push to main, NEVER enable auto-merge; honor the preflight exit code (1=abort with report, 2=detection+report only, no fix PR); respect every budget cap, the fix-class registry, and the abort conditions; Ringer executes all fixes with checks — you orchestrate and review; finish with exactly one notification to Ankit summarizing found/fixed/needs-merge/report-only, and append LOOP STATE to today's snapshot."

cd "$REPO" || exit 1
# env -u ANTHROPIC_API_KEY: force subscription auth, never API-key billing
# (matches the box-wide claude alias).
timeout 7200 env -u ANTHROPIC_API_KEY "$HOME/.local/bin/claude" -p "$PROMPT" --dangerously-skip-permissions >> "$LOG" 2>&1
rc=$?
echo "$STAMP session exit rc=$rc" >> "$LOG"
# Keep the last 12 logs
ls -t "$LOGDIR"/run-*.log 2>/dev/null | tail -n +13 | xargs -r rm -f
exit $rc
