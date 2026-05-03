#!/usr/bin/env python3
"""Route a blog post to the right author based on its cluster.

Reads `src/data/authors.json` and resolves cluster -> author slug -> full
author dict. Used by the blog_writer pipeline at stage_15 (Technical SEO
metadata) to set the correct byline before commit.

Usage:

    # CLI form: print author info for a cluster
    python3 tools/route_author.py --cluster optometry
    python3 tools/route_author.py --cluster optometry --json

    # Library form (called from blog_writer):
    from route_author import resolve_author
    author = resolve_author("optometry", authors_path="src/data/authors.json")
    print(author["name"])  # "Dr. Mital Patel, OD"

Behavior:
- Cluster present in `_routing.by_cluster` -> route to that author
- Cluster missing OR cluster present but author slug unknown -> default
- Empty/None cluster -> default

Default is `_routing.default_author_slug` (currently `ankit-patel`).

The pipeline should set `author: <author.name>` in the blog post frontmatter.
The author page at /author/<slug>/ renders the full Person/Organization schema.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Optional


DEFAULT_AUTHORS_PATH = Path(__file__).resolve().parent.parent / "src" / "data" / "authors.json"


class AuthorRoutingError(Exception):
    pass


def _load_authors(authors_path: Path) -> dict:
    if not authors_path.exists():
        raise AuthorRoutingError(f"authors.json not found at {authors_path}")
    try:
        return json.loads(authors_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        raise AuthorRoutingError(f"authors.json is not valid JSON: {e}") from e


def resolve_author(
    cluster: Optional[str],
    *,
    authors_path: Path = DEFAULT_AUTHORS_PATH,
) -> dict:
    """Return the full author dict for the given cluster.

    Falls back to the default author when:
      - cluster is None or empty
      - cluster not in routing map
      - mapped author slug not present in authors.json

    Returns the author dict (with all fields). Adds `_routing_reason` to
    indicate why this author was picked.
    """
    data = _load_authors(authors_path)
    routing = data.get("_routing", {})
    default_slug = routing.get("default_author_slug")
    by_cluster = routing.get("by_cluster", {})

    cluster_norm = (cluster or "").strip().lower()
    reason: str
    slug: Optional[str]

    if not cluster_norm:
        slug = default_slug
        reason = "default (no cluster provided)"
    elif cluster_norm in by_cluster:
        slug = by_cluster[cluster_norm]
        reason = f"cluster='{cluster_norm}' mapped to '{slug}'"
    else:
        slug = default_slug
        reason = f"cluster='{cluster_norm}' not in routing map → default '{slug}'"

    if not slug:
        raise AuthorRoutingError("No default_author_slug configured in authors.json _routing")

    author = data.get(slug)
    if not author or not isinstance(author, dict):
        # Final fallback: any author entry in the file
        for k, v in data.items():
            if not k.startswith("_") and isinstance(v, dict):
                slug = k
                author = v
                reason = f"slug missing → fallback to first available author '{slug}'"
                break
        if not author:
            raise AuthorRoutingError("No usable author entry found in authors.json")

    # Return a copy with routing metadata appended
    result = dict(author)
    result["_routing_reason"] = reason
    result["_routing_cluster"] = cluster_norm or None
    return result


def list_routing(authors_path: Path = DEFAULT_AUTHORS_PATH) -> dict:
    """Return the full cluster -> author-name mapping for inspection."""
    data = _load_authors(authors_path)
    routing = data.get("_routing", {})
    by_cluster = routing.get("by_cluster", {})
    out = {}
    for cluster, slug in by_cluster.items():
        author = data.get(slug, {})
        out[cluster] = {
            "slug": slug,
            "name": author.get("name", slug),
            "role": author.get("role", ""),
        }
    out["_default"] = {
        "slug": routing.get("default_author_slug"),
        "name": data.get(routing.get("default_author_slug", ""), {}).get("name", ""),
    }
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description="Route a blog post to the correct author")
    ap.add_argument("--cluster", help="Blog post cluster (e.g. 'enterprise', 'optometry')")
    ap.add_argument("--authors", default=str(DEFAULT_AUTHORS_PATH), help="Path to authors.json")
    ap.add_argument("--list", action="store_true", help="Print the full cluster->author routing")
    ap.add_argument("--json", action="store_true", help="Emit JSON")
    args = ap.parse_args()

    authors_path = Path(args.authors)
    try:
        if args.list:
            payload = list_routing(authors_path)
            print(json.dumps(payload, indent=2))
            return 0

        if not args.cluster:
            print("ERROR: --cluster is required (or pass --list)", file=sys.stderr)
            return 2

        author = resolve_author(args.cluster, authors_path=authors_path)
        if args.json:
            print(json.dumps(author, indent=2))
        else:
            print(f"name: {author['name']}")
            print(f"slug: {author['slug']}")
            print(f"role: {author['role']}")
            print(f"reason: {author['_routing_reason']}")
        return 0
    except AuthorRoutingError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
