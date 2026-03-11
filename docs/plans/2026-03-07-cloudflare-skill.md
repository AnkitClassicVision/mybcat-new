---
title: "Cloudflare Skill Expansion — Implementation Plan"
description: "Cloudflare Skill Expansion — Implementation Plan"
---

# Cloudflare Skill Expansion — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expand the existing Cloudflare skill from DNS-only to full coverage: DNS, zone settings, cache, SSL/TLS, WAF/firewall, analytics (GraphQL), Page Shield, and performance optimization.

**Architecture:** Single `SKILL.md` with a Python CLI tool (`cf.py`) and modular reference docs. All API calls go through `cf.py` which handles auth, JSON parsing, and formatted output. Follows the same pattern as `bing-web-tools/bwt.py`.

**Tech Stack:** Python 3 (stdlib only — `urllib`, `json`), Cloudflare API v4, GraphQL Analytics API.

**Existing state:**
- Skill at `~/.claude/skills/cloudflare/cloudflare/` (double-nested, needs fixing)
- Token in `~/.cloudflare_env` — `source` doesn't work (shell issue), use `export` inline
- Token permissions: DNS, Zone Settings, SSL, Cache Purge, WAF, Analytics, Load Balancers, Page Shield
- Token does NOT have: Workers, Rulesets — skip these for now
- Zone ID: `8cfbbf075e3cabe3d972b55fe2f04adf`
- Plan: Pro

---

### Task 1: Fix directory structure

Move files from double-nested `cloudflare/cloudflare/` to `cloudflare/` and clean up the `.skill` archive.

**Step 1: Restructure directories**

```bash
cd ~/.claude/skills/cloudflare
# Move contents up from nested dir
cp -r cloudflare/SKILL.md .
cp -r cloudflare/references/ .
mkdir -p scripts
cp cloudflare/scripts/cf_dns.py scripts/cf_dns.py.bak
# Remove old nested dir and archive
rm -rf cloudflare/
rm -f cloudflare.skill
```

**Step 2: Verify structure**

```bash
ls -la ~/.claude/skills/cloudflare/
# Expected: SKILL.md, scripts/, references/
```

---

### Task 2: Build comprehensive `cf.py` CLI tool

Create `~/.claude/skills/cloudflare/scripts/cf.py` — replaces `cf_dns.py` with full API coverage.

**File:** Create `~/.claude/skills/cloudflare/scripts/cf.py`

The tool should support these subcommands:

```
cf.py dns list|add|update|delete|audit
cf.py settings list|set <key> <value>
cf.py cache purge [--urls url1,url2]
cf.py waf list|add|delete
cf.py analytics [--days N]
cf.py ssl status
cf.py pageshield list
cf.py health                          # Quick audit of all key settings
```

**Step 1: Write the CLI tool**

Key implementation details:
- Auth: Read token from `CF_API_TOKEN` env var. If not set, try reading `~/.cloudflare_env` file directly (parse the export line).
- Zone ID: Hardcode `8cfbbf075e3cabe3d972b55fe2f04adf`
- Base URL: `https://api.cloudflare.com/client/v4`
- GraphQL endpoint for analytics: `https://api.cloudflare.com/client/v4/graphql`
- All API helper uses `urllib.request` (no external deps)
- Output: Formatted tables for human readability
- `health` command checks: always_use_https, min_tls_version, http3, early_hints, minify, brotli, security_level, WAF rule count, SSL mode

```python
#!/usr/bin/env python3
"""Cloudflare management CLI for mybcat.com.

Usage:
  cf.py dns list                              # List all DNS records
  cf.py dns add <name> <value> [--type TYPE] [--proxied]
  cf.py dns update <record_id> <value>        # Update record
  cf.py dns delete <record_id>                # Delete record
  cf.py dns audit                             # Audit DNS vs infrastructure
  cf.py dns find <name>                       # Find record by name
  cf.py settings list                         # List key zone settings
  cf.py settings set <key> <value>            # Update a setting
  cf.py cache purge [--urls url1,url2]        # Purge cache
  cf.py waf list                              # List firewall rules
  cf.py waf add <expression> <action> [--desc TEXT]
  cf.py waf delete <rule_id>                  # Delete firewall rule
  cf.py analytics [--days N]                  # Traffic analytics (GraphQL)
  cf.py ssl status                            # SSL certificate & TLS info
  cf.py pageshield list                       # List Page Shield scripts
  cf.py health                                # Quick health check & recommendations
"""
```

**Step 2: Test each subcommand against live API**

Run each command and verify output:
```bash
export CF_API_TOKEN="<token>"
python3 ~/.claude/skills/cloudflare/scripts/cf.py dns list
python3 ~/.claude/skills/cloudflare/scripts/cf.py settings list
python3 ~/.claude/skills/cloudflare/scripts/cf.py ssl status
python3 ~/.claude/skills/cloudflare/scripts/cf.py health
python3 ~/.claude/skills/cloudflare/scripts/cf.py analytics --days 7
```

---

### Task 3: Write main SKILL.md

**File:** Overwrite `~/.claude/skills/cloudflare/SKILL.md`

Structure:
```markdown
---
name: cloudflare
description: Manage Cloudflare for mybcat.com — DNS, cache, WAF, SSL, analytics, zone settings, and performance. Use when user asks about DNS, domains, firewall rules, cache purging, site security, Cloudflare analytics, or any Cloudflare-related operations.
allowed-tools: Bash, Read, Write, Edit
---

# Cloudflare Management — mybcat.com

## CLI Tool
All commands: `python3 ~/.claude/skills/cloudflare/scripts/cf.py <command>`

## Authentication
- Token: `CF_API_TOKEN` env var
- Load: read from `~/.cloudflare_env` (fallback built into cf.py)
- Zone ID: 8cfbbf075e3cabe3d972b55fe2f04adf
- Plan: Pro

## Quick Reference
[Concise table of all cf.py subcommands with one-liner examples]

## Common Workflows
- Debug "site not loading"
- Add a new subdomain
- Harden security (run `cf.py health`, fix recommendations)
- Purge cache after deploy
- Check traffic analytics
- Migrate service to new IP

## Reference Docs
- `references/dns.md` — DNS management details
- `references/security.md` — WAF, TLS, Page Shield
- `references/performance.md` — Cache, minify, HTTP/3, Brotli
- `references/analytics.md` — GraphQL analytics queries
- `references/infrastructure_map.md` — DNS ↔ infrastructure mapping
```

---

### Task 4: Write DNS reference doc

**File:** Create `~/.claude/skills/cloudflare/references/dns.md`

Contents:
- Record types and when to use each (A, CNAME, MX, TXT, NS)
- Proxy decisions (when proxied vs DNS-only)
- DNS audit workflow (cross-reference with AWS/Lightsail)
- Common DNS operations with curl examples (for when cf.py isn't available)
- Troubleshooting: stale records, propagation delays

---

### Task 5: Write security reference doc

**File:** Create `~/.claude/skills/cloudflare/references/security.md`

Contents:
- WAF/Firewall rules: how to create expressions, common patterns
  - Block countries, rate limit, challenge bots, allow-list IPs
- TLS settings: min version, SSL mode (strict vs full)
- Page Shield: monitoring third-party scripts
- Security level settings (off, low, medium, high, under_attack)
- Recommended security baseline for mybcat.com

---

### Task 6: Write performance reference doc

**File:** Create `~/.claude/skills/cloudflare/references/performance.md`

Contents:
- Cache: browser TTL, edge cache TTL, purging strategies
- Minification: CSS, HTML, JS toggle
- HTTP/3 and QUIC
- Early Hints (103 responses)
- Brotli compression
- Rocket Loader (JS optimization)
- Recommended performance baseline for mybcat.com

---

### Task 7: Write analytics reference doc

**File:** Create `~/.claude/skills/cloudflare/references/analytics.md`

Contents:
- GraphQL API endpoint and auth
- Common queries: requests, bandwidth, threats, page views, uniques
- Time range filtering
- Country/status code breakdowns
- Example queries ready to copy-paste

---

### Task 8: Update infrastructure map

**File:** Update `~/.claude/skills/cloudflare/references/infrastructure_map.md`

- Add `wiki.mybcat.com` (34.215.1.12) — found in DNS but missing from map
- Update last-updated date
- Cross-check all IPs against current DNS records

---

### Task 9: Apply quick security/performance wins

After the skill is built, run `cf.py health` and offer to fix:
- `always_use_https` → on
- `min_tls_version` → 1.2
- `http3` → on
- `early_hints` → on
- `automatic_https_rewrites` → on

**These changes require user confirmation before applying.**

---

### Task 10: Final verification

```bash
# Verify skill structure
ls -R ~/.claude/skills/cloudflare/

# Verify cf.py works
python3 ~/.claude/skills/cloudflare/scripts/cf.py health
python3 ~/.claude/skills/cloudflare/scripts/cf.py dns list
python3 ~/.claude/skills/cloudflare/scripts/cf.py analytics --days 1
```

---

### Task 11: Commit

```bash
cd ~/.claude/skills
git add cloudflare/
git commit -m "feat(skill): expand cloudflare skill — DNS, WAF, analytics, SSL, performance"
```

Note: `~/.claude/skills` may not be a git repo. If not, skip this step — the skill files are local config.
