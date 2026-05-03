# Author Routing — MyBCAT Blog

**Source of truth:** `src/data/authors.json`
**Routing tool:** `tools/route_author.py`
**Spec:** Phase 5b of `/specs/seo-drift-prevention/PLAN.md`

## Why this exists

Pre-2026-05-03 audit: 172 of 180 published mybcat.com blog posts were authored
by Ankit Patel. Three were authored by "MyBCAT Team" (a generic byline that
hurts E-A-T). Zero used Dr. Mital Patel's byline even though she has a fully
configured author page at `/author/dr-mital-patel/` with Physician schema.

Single-voiced authority weakens E-A-T signals for content where Ankit's
operations background isn't the strongest expert position — specifically:

- **Clinical/optometry content** lands stronger from a practicing OD
- **AI / data-driven research** lands stronger from a methodology-disclosed
  Editorial Team byline than from any single founder

This routing system fixes that without inventing fake personas.

## The three personas

| Persona | Schema type | Use for | Why this fit |
|---|---|---|---|
| **Ankit Patel** (Founder & CEO) | `Person` | Operations, finance, strategy, M&A, BPO, multi-location DSO/PE | His real lane. Dell + Cleveland Clinic + Lean Six Sigma + book + podcast + co-founder of CVC. |
| **Dr. Mital Patel, OD** (Clinical Advisor) | `Physician` | Optometry-specific content where the chair-side perspective matters | Real OD with 25+ years practice, IPL/RF/BlephEx certified, fits scleral lenses. Already authoring CVC clinical content. |
| **MyBCAT Editorial Team** (entity byline) | `Organization` | Industry benchmarks, KPI roundups, methodology-disclosed research, AI/technology trend pieces | E-A-T-acceptable when methodology is disclosed AND content is reviewed by Ankit + Dr. Mital before publish. |

## Routing rules (cluster → author)

The 14 approved clusters from `seo_source_of_truth/03_pillar_cluster_taxonomy.md`:

| Cluster | Author | Rationale |
|---|---|---|
| `enterprise` | Ankit Patel | Multi-location ops is his lane |
| `starting-practice` | Ankit Patel | Founder/operator framing |
| `private-practice` | Ankit Patel | Same |
| `bpo-outsourcing` | Ankit Patel | MyBCAT founder = direct authority |
| `patient-recall` | Ankit Patel | Operations playbooks |
| `no-show-recovery` | Ankit Patel | Operations playbooks |
| `patient-communications` | Ankit Patel | Communications strategy |
| `retention` | Ankit Patel | LTV / churn = operations lens |
| `veterinary` | Ankit Patel | Industry-vertical operations |
| `dental` | Ankit Patel | Industry-vertical operations (DSO/PE) |
| `practice-valuation` | Ankit Patel | M&A / EBITDA expertise |
| **`optometry`** | **Dr. Mital Patel, OD** | Clinical authority for the only clinical cluster |
| **`ai-technology`** | **MyBCAT Editorial Team** | Methodology-disclosed; reviewed by Ankit |
| **`compliance`** | **MyBCAT Editorial Team** | HIPAA/SOC2 — entity byline is E-A-T-safer than a non-credentialed individual |

**Fallback:** any cluster not in this map (or empty cluster) → Ankit Patel
(via `_routing.default_author_slug`).

## Wiring into the blog writer pipeline

The blog writer should call this at stage_15 (Technical SEO metadata) before
writing the front-matter:

```python
import sys
sys.path.insert(0, "/path/to/mybcat-new/tools")
from route_author import resolve_author

author = resolve_author(post_cluster, authors_path=Path(".../src/data/authors.json"))
frontmatter["author"] = author["name"]
# Schema rendering happens at the page level via /src/pages/author/<slug>.astro
```

Until the pipeline is updated, manually-authored posts can use this CLI:

    python3 tools/route_author.py --cluster optometry
    # → Dr. Mital Patel, OD

    python3 tools/route_author.py --list
    # full cluster → author table for inspection

## Drift handling

The taxonomy approves 14 clusters, but published content has 16 distinct
cluster values — `enterprise-operations` and `virtual-assistant` are drifts.
The router falls back to the default author rather than failing, so drift
in cluster naming doesn't break the byline. Drift correction is tracked
separately in PLAN.md Phase 2.3 (cluster cannibalization audit).

## Why an Editorial Team byline is E-A-T-safe

Google's published guidance (E-E-A-T raters' criteria) treats organizational
bylines as legitimate when:

1. The organization has a publicly verifiable identity (mybcat.com itself + LinkedIn page).
2. The content discloses methodology and review process.
3. Individual experts who reviewed the content are named (we do — "Reviewed by Ankit Patel and Dr. Mital Patel").

We meet all three. Using `MyBCAT Editorial Team` is preferable to publishing
AI/compliance content under a non-credentialed individual byline.

## Maintenance

- When a cluster is added to `seo_source_of_truth/03_pillar_cluster_taxonomy.md`,
  add a corresponding entry in `_routing.by_cluster` of `authors.json`.
- When a real engineer joins the team and starts authoring AI/technology content,
  update the persona for `ai-technology` from `mybcat-editorial` to that
  individual's slug. The Person schema requires real credentials.
- The author bios in `authors.json` are the single source of truth. The
  `/src/pages/author/*.astro` files should read from this JSON (follow-up PR).

## Tests

`python3 tools/test_route_author.py` — 11/11 pass.
