#!/usr/bin/env python3
"""Create a privacy-safe weekly GSC funnel snapshot from exported CSV files."""

from __future__ import annotations

import argparse
import csv
import json
import logging
from pathlib import Path


LOGGER = logging.getLogger(__name__)
BRAND_TERMS = ("mybcat", "my business care team", "business care team")
SERVICE_TERMS = (
    "patient access", "missed call", "answering service", "scheduling", "recall",
    "front desk", "virtual assistant", "call center",
)
OPTOMETRY_TERMS = ("optometry", "optometric", "eye care", "eyecare")
SELLER_TERMS = ("sell", "seller", "valuation", "practice transition", "buyer")


def read_rows(csv_path: Path) -> list[dict[str, str]]:
    with csv_path.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def number(row: dict[str, str], key: str) -> float:
    try:
        return float(row.get(key, 0) or 0)
    except ValueError:
        return 0.0


def summarize(query_rows: list[dict[str, str]], date_rows: list[dict[str, str]]) -> dict[str, object]:
    total_clicks = sum(number(row, "clicks") for row in date_rows)
    total_impressions = sum(number(row, "impressions") for row in date_rows)
    nonbrand = [row for row in query_rows if not any(term in row.get("query", "").lower() for term in BRAND_TERMS)]
    qualified = []
    for row in nonbrand:
        query = row.get("query", "").lower()
        service_fit = any(term in query for term in OPTOMETRY_TERMS) and any(term in query for term in SERVICE_TERMS)
        seller_fit = any(term in query for term in OPTOMETRY_TERMS) and any(term in query for term in SELLER_TERMS)
        if service_fit or seller_fit:
            qualified.append(row)

    return {
        "schema_version": "gsc-weekly-snapshot.v1",
        "source": "Google Search Console Search Analytics API",
        "classification_note": "Qualified intent is a deterministic query cohort, not a qualified opportunity.",
        "total_clicks": round(total_clicks),
        "total_impressions": round(total_impressions),
        "nonbrand_query_clicks": round(sum(number(row, "clicks") for row in nonbrand)),
        "nonbrand_query_impressions": round(sum(number(row, "impressions") for row in nonbrand)),
        "qualified_intent_query_clicks": round(sum(number(row, "clicks") for row in qualified)),
        "qualified_intent_query_impressions": round(sum(number(row, "impressions") for row in qualified)),
        "privacy_threshold_note": "Query-level totals may be lower than site totals because GSC omits some queries.",
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--queries", required=True, type=Path)
    parser.add_argument("--dates", required=True, type=Path)
    parser.add_argument("--json-out", required=True, type=Path)
    parser.add_argument("--markdown-out", required=True, type=Path)
    args = parser.parse_args()

    result = summarize(read_rows(args.queries), read_rows(args.dates))
    args.json_out.parent.mkdir(parents=True, exist_ok=True)
    args.markdown_out.parent.mkdir(parents=True, exist_ok=True)
    args.json_out.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    args.markdown_out.write_text(
        "\n".join([
            "## Live GSC 28-Day Snapshot",
            "",
            "| Metric | Value |",
            "|---|---:|",
            f"| Total clicks | {result['total_clicks']} |",
            f"| Total impressions | {result['total_impressions']} |",
            f"| Nonbrand query clicks | {result['nonbrand_query_clicks']} |",
            f"| Nonbrand query impressions | {result['nonbrand_query_impressions']} |",
            f"| Qualified-intent query clicks | {result['qualified_intent_query_clicks']} |",
            f"| Qualified-intent query impressions | {result['qualified_intent_query_impressions']} |",
            "",
            f"_{result['classification_note']} {result['privacy_threshold_note']}_",
            "",
        ]),
        encoding="utf-8",
    )
    LOGGER.info("Wrote privacy-safe GSC snapshot to %s", args.json_out)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    main()
