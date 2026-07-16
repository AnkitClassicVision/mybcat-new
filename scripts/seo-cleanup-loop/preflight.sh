#!/bin/bash
# SEO cleanup loop — Phase 0 preflight (docs/runbooks/seo-technical-cleanup.md).
# Exit 0 = clear to run. Any nonzero = abort the run and report.
# Deliberately does NOT gate on load average: D-state pileups fake it
# (2026-07-16: load 92 with ~90% idle CPU). Gates on real capacity instead.
set -u
REPO="${1:-$(cd "$(dirname "$0")/../.." && pwd)}"
fail=0
say() { echo "preflight: $*"; }

# 1. CPU idle >= 40% (vmstat last sample, 'id' column)
idle=$(vmstat 1 2 | tail -1 | awk '{print $15}')
if [ "${idle:-0}" -lt 40 ]; then say "FAIL cpu idle ${idle}% < 40%"; fail=1; else say "ok cpu idle ${idle}%"; fi

# 2. Repo mount writable and fast
if timeout 5 touch "$REPO/.iotest" 2>/dev/null && rm -f "$REPO/.iotest"; then say "ok repo mount writable"; else say "FAIL repo mount write test"; fail=1; fi

# 3. /tmp writable
if timeout 5 touch /tmp/.seo-loop-iotest 2>/dev/null && rm -f /tmp/.seo-loop-iotest; then say "ok /tmp writable"; else say "FAIL /tmp write test"; fail=1; fi

# 4. git fetch works
if timeout 60 git -C "$REPO" fetch origin --quiet 2>/dev/null; then say "ok git fetch"; else say "FAIL git fetch origin"; fail=1; fi

# 5. ringer present
if [ -x "$HOME/repos/ringer/ringer.py" ]; then say "ok ringer present"; else say "FAIL ringer.py missing"; fail=1; fi

# 6. previous loop PR must not be open (rule 6: never stack fix PRs)
if command -v gh >/dev/null 2>&1; then
  open_prs=$(cd "$REPO" && gh pr list --state open --label seo-cleanup-loop --json number -q 'length' 2>/dev/null || echo "?")
  if [ "$open_prs" = "?" ]; then say "warn: could not query PRs (gh failed) — treat as detection-only"; fail=2
  elif [ "$open_prs" != "0" ]; then say "PREVIOUS LOOP PR STILL OPEN ($open_prs) — detection + report only"; fail=2
  else say "ok no open loop PR"; fi
else say "warn: gh not installed — treat as detection-only"; fail=2; fi

# exit 0 clear | 1 abort | 2 detection-only
exit $fail
