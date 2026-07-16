#!/usr/bin/env bash
# Enumerate external links in built dist/ and HTTP-check each unique URL.
# Output: TSV "code<TAB>url" (code 000 = connection failure/timeout).
set -u
DIST="/tmp/claude-1000/-mnt-d-drive-repos-mybcat-new/52455bc8-b213-494d-b2c7-5fb9817801c6/scratchpad/seo-ahrefs-fixes-r1/dist"
OUT="/tmp/claude-1000/-mnt-d-drive-repos-mybcat-new/52455bc8-b213-494d-b2c7-5fb9817801c6/scratchpad/ringer-seo-loop/external-links-check.tsv"
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"

grep -rhoE 'href="https?://[^"]+"' "$DIST" --include='*.html' \
  | sed 's/^href="//; s/"$//' \
  | grep -vE '^https?://(www\.)?mybcat\.com' \
  | sort -u > /tmp/claude-1000/ext-urls.txt

total=$(wc -l < /tmp/claude-1000/ext-urls.txt)
echo "checking $total unique external URLs" >&2
: > "$OUT"
n=0
while IFS= read -r url; do
  n=$((n+1))
  code=$(curl -s -o /dev/null -w '%{http_code}' -A "$UA" -I -L --max-time 15 "$url" 2>/dev/null)
  if [ "$code" = "405" ] || [ "$code" = "403" ] || [ "$code" = "000" ] || [ "$code" = "501" ]; then
    code=$(curl -s -o /dev/null -w '%{http_code}' -A "$UA" -L --max-time 20 -r 0-2048 "$url" 2>/dev/null)
  fi
  printf '%s\t%s\n' "$code" "$url" >> "$OUT"
  [ $((n % 25)) -eq 0 ] && echo "progress $n/$total" >&2
done < /tmp/claude-1000/ext-urls.txt

echo "DONE. Summary:" >&2
cut -f1 "$OUT" | sort | uniq -c | sort -rn >&2
awk -F'\t' '$1 ~ /^(4|5|000)/' "$OUT" | wc -l | xargs echo "broken-ish count:" >&2
