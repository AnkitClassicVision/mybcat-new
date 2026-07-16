#!/bin/bash
# Bootstrap for the SEO cleanup loop timer. Lives OUTSIDE the working repo
# (installed copy: ~/.mybcat/bin/seo-cleanup-loop-bootstrap.sh) so the loop
# never depends on which branch the main checkout happens to be on.
# Maintains a dedicated clone pinned to origin/main and runs the loop there.
set -u
CHECKOUT="$HOME/.mybcat/seo-cleanup-loop-checkout"
REMOTE_URL="https://github.com/AnkitClassicVision/mybcat-new.git"

if [ ! -d "$CHECKOUT/.git" ]; then
  git clone --depth 1 --branch main "$REMOTE_URL" "$CHECKOUT" || exit 1
else
  git -C "$CHECKOUT" fetch --depth 1 origin main || exit 1
  git -C "$CHECKOUT" reset --hard origin/main || exit 1
  git -C "$CHECKOUT" clean -fd || exit 1
fi

RUNNER="$CHECKOUT/scripts/seo-cleanup-loop/run-weekly.sh"
if [ ! -f "$RUNNER" ]; then
  echo "seo-cleanup-loop: runner not on origin/main yet (PR unmerged?) — failing safe"
  exit 1
fi
exec /bin/bash "$RUNNER" "$CHECKOUT"
