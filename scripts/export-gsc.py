#!/usr/bin/env python3
"""
Export Google Search Console Search Analytics data to CSV with full dimension keys.

Why this exists:
- The helper CLI in ~/.claude/skills/google-search-console/gsc.py truncates dimension keys to 40 chars.
- For SEO analysis, we need full URLs/queries to bucket and diff reliably.

Auth:
- Uses ~/.config/google-search-console/token.json (same as the skill), OR
- GSC_TOKEN_JSON env var (JSON string) for CI/local automation.

Examples:
  # Daily totals
  python3 scripts/export-gsc.py --site sc-domain:mybcat.com --start 2024-10-01 --end 2026-02-24 --dimensions date \\
    --out reports/gsc/gsc_dates_2024-10-01_to_2026-02-24.csv --row-limit 10000

  # Page performance (last 90d)
  python3 scripts/export-gsc.py --site sc-domain:mybcat.com --start 2025-11-26 --end 2026-02-24 --dimensions page \\
    --out reports/gsc/gsc_pages_2025-11-26_to_2026-02-24.csv --row-limit 5000

  # Query breakdown for a single page (note: query totals may be privacy-thresholded)
  python3 scripts/export-gsc.py --site sc-domain:mybcat.com --start 2025-11-26 --end 2026-02-24 --dimensions page,query \\
    --filter "page:equals:https://mybcat.com/pricing/" \\
    --out reports/gsc/drilldowns/gsc_query_page_for_pricing_2025-11-26_to_2026-02-24.csv --row-limit 25000
"""

import argparse
import csv
import json
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

CONFIG_DIR = Path(os.path.expanduser("~/.config/google-search-console"))
TOKEN_FILE = CONFIG_DIR / "token.json"


def _parse_expiry(expiry_raw: object):
    if not isinstance(expiry_raw, str):
        return None
    try:
        expiry_dt = datetime.fromisoformat(expiry_raw.replace("Z", "+00:00"))
        if expiry_dt.tzinfo is not None:
            expiry_dt = expiry_dt.astimezone(timezone.utc).replace(tzinfo=None)
        return expiry_dt
    except ValueError:
        return None


def get_credentials() -> Credentials:
    token_json = os.environ.get("GSC_TOKEN_JSON")
    credential_source = "environment"
    if token_json:
        try:
            token_data = json.loads(token_json)
        except json.JSONDecodeError as e:
            raise SystemExit(f"Invalid GSC_TOKEN_JSON: {e}") from e
    elif os.environ.get("GSC_TOKEN_PATH"):
        credential_source = "configured_path"
        configured_path = Path(os.path.expanduser(os.environ["GSC_TOKEN_PATH"]))
        if not configured_path.is_file():
            raise SystemExit("GSC_TOKEN_PATH does not point to a readable credential file")
        token_data = json.loads(configured_path.read_text(encoding="utf-8"))
    elif TOKEN_FILE.exists():
        credential_source = "default_file"
        token_data = json.loads(TOKEN_FILE.read_text(encoding="utf-8"))
    else:
        raise SystemExit(
            "No GSC credentials found. Provide GSC_TOKEN_JSON, GSC_TOKEN_PATH, or the local token file"
        )

    creds = Credentials(
        token=token_data["token"],
        refresh_token=token_data.get("refresh_token"),
        token_uri=token_data["token_uri"],
        client_id=token_data["client_id"],
        client_secret=token_data["client_secret"],
        scopes=token_data["scopes"],
        expiry=_parse_expiry(token_data.get("expiry")),
    )

    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
        # Only the explicit local default file is mutable. Environment and
        # configured-path credentials refresh in memory and are never copied.
        if credential_source == "default_file":
            token_data["token"] = creds.token
            TOKEN_FILE.parent.mkdir(parents=True, exist_ok=True)
            TOKEN_FILE.write_text(json.dumps(token_data, indent=2), encoding="utf-8")

    return creds


def parse_filter(value: str) -> dict:
    # Format: dimension:operator:expression
    parts = value.split(":", 2)
    if len(parts) != 3:
        raise argparse.ArgumentTypeError('Filter must be "dimension:operator:expression"')
    dimension, operator, expression = parts
    if not dimension or not operator or not expression:
        raise argparse.ArgumentTypeError('Filter must be "dimension:operator:expression"')
    return {"dimension": dimension, "operator": operator, "expression": expression}


def export_csv(
    *,
    site_url: str,
    start: str,
    end: str,
    dimensions: list[str] | None,
    filters: list[dict],
    row_limit: int,
    out_path: Path,
):
    service = build("searchconsole", "v1", credentials=get_credentials())

    body: dict = {
        "startDate": start,
        "endDate": end,
        "rowLimit": row_limit,
    }
    if dimensions:
        body["dimensions"] = dimensions
    if filters:
        body["dimensionFilterGroups"] = [{"filters": filters}]

    resp = service.searchanalytics().query(siteUrl=site_url, body=body).execute()
    rows = resp.get("rows", [])

    headers: list[str] = []
    if dimensions:
        headers.extend(dimensions)
    headers.extend(["clicks", "impressions", "ctr_percent", "position"])

    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        for r in rows:
            keys = r.get("keys", []) or []
            if dimensions and len(keys) != len(dimensions):
                continue

            writer.writerow(
                [
                    *keys,
                    int(round(r.get("clicks", 0))),
                    int(round(r.get("impressions", 0))),
                    float(r.get("ctr", 0)) * 100.0,
                    float(r.get("position", 0)),
                ]
            )

    print(f"Wrote {out_path} ({len(rows)} rows)")


def main():
    p = argparse.ArgumentParser(description="Export Google Search Console Search Analytics to CSV.")
    p.add_argument("--site", required=True, help="GSC property (e.g., sc-domain:example.com)")
    p.add_argument("--start", required=True, help="Start date (YYYY-MM-DD)")
    p.add_argument("--end", required=True, help="End date (YYYY-MM-DD)")
    p.add_argument(
        "--dimensions",
        default="",
        help="Comma-separated dimensions (query,page,country,device,date). Empty for totals.",
    )
    p.add_argument(
        "--filter",
        action="append",
        default=[],
        type=parse_filter,
        help='Optional filter(s): "dimension:operator:expression" (repeatable).',
    )
    p.add_argument("--row-limit", type=int, default=5000, help="Row limit (max 25000)")
    p.add_argument("--out", required=True, help="Output CSV path")

    args = p.parse_args()

    dims = [d.strip() for d in args.dimensions.split(",") if d.strip()] or None
    export_csv(
        site_url=args.site,
        start=args.start,
        end=args.end,
        dimensions=dims,
        filters=args.filter,
        row_limit=args.row_limit,
        out_path=Path(args.out),
    )


if __name__ == "__main__":
    main()
