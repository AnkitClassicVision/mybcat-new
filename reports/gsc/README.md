---
title: "GSC Exports (mybcat.com)"
description: "GSC Exports (mybcat.com)"
---

# GSC Exports (mybcat.com)

**Generated:** 2026-02-25  
**Property:** `sc-domain:mybcat.com`

These CSVs are used by `docs/plans/2026-02-25-seo-recovery-plan.md` to quantify search performance changes.

## Files

- `gsc_dates_2024-10-01_to_2026-02-24.csv` — daily clicks/impressions/CTR/position
- `gsc_pages_*.csv` — page-level performance for specific windows
- `gsc_queries_*.csv` — query-level performance for specific windows
- `gsc_device_*.csv` — device segmentation
- `gsc_country_*.csv` — country segmentation
- `drilldowns/` — filtered exports used for deeper analysis (note: query totals may not reconcile due to anonymization)

## Notes

- **Query-level data is privacy-thresholded** in GSC. Expect query totals to differ from date/page totals.
- If you regenerate exports, keep the same date ranges so deltas remain comparable.

## Regenerate

This repo includes a helper exporter that preserves full dimension keys (URLs/queries):

```bash
# Daily totals (last 16 months used in the 2026-02-25 plan)
python3 scripts/export-gsc.py \
  --site sc-domain:mybcat.com \
  --start 2024-10-01 --end 2026-02-24 \
  --dimensions date \
  --row-limit 10000 \
  --out reports/gsc/gsc_dates_2024-10-01_to_2026-02-24.csv

# Pages (last 90d)
python3 scripts/export-gsc.py \
  --site sc-domain:mybcat.com \
  --start 2025-11-26 --end 2026-02-24 \
  --dimensions page \
  --row-limit 5000 \
  --out reports/gsc/gsc_pages_2025-11-26_to_2026-02-24.csv
```
