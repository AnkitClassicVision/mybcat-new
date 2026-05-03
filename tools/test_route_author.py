"""Tests for tools/route_author.py — author routing across clusters."""
from __future__ import annotations

import json
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from route_author import resolve_author, list_routing, AuthorRoutingError


AUTHORS_PATH = Path(__file__).resolve().parent.parent / "src" / "data" / "authors.json"


def test_optometry_routes_to_dr_mital():
    a = resolve_author("optometry", authors_path=AUTHORS_PATH)
    assert a["slug"] == "dr-mital-patel", a
    assert a["schema_type"] == "Physician"
    print(f"T1 PASS: optometry → {a['name']}")


def test_ai_technology_routes_to_editorial():
    a = resolve_author("ai-technology", authors_path=AUTHORS_PATH)
    assert a["slug"] == "mybcat-editorial", a
    assert a["schema_type"] == "Organization"
    print(f"T2 PASS: ai-technology → {a['name']}")


def test_compliance_routes_to_editorial():
    a = resolve_author("compliance", authors_path=AUTHORS_PATH)
    assert a["slug"] == "mybcat-editorial", a
    print(f"T3 PASS: compliance → {a['name']}")


def test_enterprise_routes_to_ankit():
    a = resolve_author("enterprise", authors_path=AUTHORS_PATH)
    assert a["slug"] == "ankit-patel", a
    assert a["schema_type"] == "Person"
    print(f"T4 PASS: enterprise → {a['name']}")


def test_unknown_cluster_falls_back_to_default():
    a = resolve_author("not-a-real-cluster", authors_path=AUTHORS_PATH)
    assert a["slug"] == "ankit-patel", a
    assert "not in routing map" in a["_routing_reason"]
    print(f"T5 PASS: unknown cluster → fallback {a['name']}")


def test_empty_cluster_uses_default():
    a = resolve_author("", authors_path=AUTHORS_PATH)
    assert a["slug"] == "ankit-patel"
    a2 = resolve_author(None, authors_path=AUTHORS_PATH)
    assert a2["slug"] == "ankit-patel"
    print("T6 PASS: empty/None cluster → default")


def test_drift_cluster_falls_back_gracefully():
    """`enterprise-operations` is in published posts but not in approved taxonomy.
    Should fall back, not crash.
    """
    a = resolve_author("enterprise-operations", authors_path=AUTHORS_PATH)
    assert a["slug"] == "ankit-patel"
    print(f"T7 PASS: drift cluster → fallback {a['name']}")


def test_case_insensitive():
    a = resolve_author("OPTOMETRY", authors_path=AUTHORS_PATH)
    assert a["slug"] == "dr-mital-patel"
    print("T8 PASS: case-insensitive match")


def test_list_routing_covers_all_known_clusters():
    routing = list_routing(authors_path=AUTHORS_PATH)
    # Every approved cluster from 03_pillar_cluster_taxonomy.md should appear
    expected = [
        "enterprise", "starting-practice", "private-practice", "bpo-outsourcing",
        "patient-recall", "no-show-recovery", "patient-communications", "retention",
        "veterinary", "dental", "practice-valuation",
        "optometry", "ai-technology", "compliance",
    ]
    for c in expected:
        assert c in routing, f"missing cluster in routing: {c}"
    print(f"T9 PASS: all {len(expected)} approved clusters routed")


def test_missing_authors_json_errors_clearly():
    try:
        resolve_author("enterprise", authors_path=Path("/tmp/does-not-exist-xyz.json"))
        assert False, "expected AuthorRoutingError"
    except AuthorRoutingError as e:
        assert "not found" in str(e)
    print("T10 PASS: missing file raises AuthorRoutingError")


def test_malformed_authors_json_errors_clearly():
    with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
        f.write("{ not valid json")
        tmp_path = Path(f.name)
    try:
        resolve_author("enterprise", authors_path=tmp_path)
        assert False, "expected AuthorRoutingError"
    except AuthorRoutingError as e:
        assert "valid JSON" in str(e) or "JSON" in str(e)
    finally:
        tmp_path.unlink(missing_ok=True)
    print("T11 PASS: malformed JSON raises AuthorRoutingError")


if __name__ == "__main__":
    test_optometry_routes_to_dr_mital()
    test_ai_technology_routes_to_editorial()
    test_compliance_routes_to_editorial()
    test_enterprise_routes_to_ankit()
    test_unknown_cluster_falls_back_to_default()
    test_empty_cluster_uses_default()
    test_drift_cluster_falls_back_gracefully()
    test_case_insensitive()
    test_list_routing_covers_all_known_clusters()
    test_missing_authors_json_errors_clearly()
    test_malformed_authors_json_errors_clearly()
    print("\nALL AUTHOR ROUTING TESTS PASS")
