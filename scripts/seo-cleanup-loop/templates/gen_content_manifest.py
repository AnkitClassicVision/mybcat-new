#!/usr/bin/env python3
"""Generate a whole-post content-remediation Ringer manifest.

Battle-tested 2026-07-16 (backlog batch 1: 10/10 posts passed the repo
evaluator; 7/7 first-try on the requeue run). The SPEC_TEMPLATE below is the
proven worker brief — change it deliberately, not casually.

Usage:
  gen_content_manifest.py --repo <integration_worktree> --workdir <out_dir> \
      --posts-json <posts.json> [--run-name seo-content-backlog] \
      [--max-parallel 4] [--engine codex] [--engine-arg -m --engine-arg gpt-5.6-terra] \
      [--out manifest.json]

posts.json: [{"slug": "<post-slug>", "errors": "<known deficiencies, one line>"}, ...]
The repo must be an integration worktree with node_modules installed; the lane
check symlinks its node_modules via post_verify.sh.
"""
import argparse
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))

SPEC_TEMPLATE = """You are a senior content remediation writer for mybcat.com — an enterprise B2B site for MULTI-LOCATION healthcare groups (3+ locations: optometry/dental/veterinary groups, DSOs, healthcare executives). MyBCAT provides managed patient-access services: patient access center (call answering, scheduling, recall, intake), virtual assistants, and back-office support. Your current working directory IS a git worktree of the site repo — edit files in place. BOUNDARY: you own ONLY src/content/blog/{postfile}. You may READ any repo file. Never touch .git, never run git commit/branch/push, never edit any other file, do not load skills or call MCP/Apps. You have NO web access.

MISSION: bring this legacy post fully up to the site's content-quality standard while PRESERVING its URL/slug, core topic, publishDate, author, and any accurate existing substance. Known deficiencies: {errors}.

PROCESS (condensed from the house blog-writer pipeline — follow in order):
1. RESEARCH: read the current post fully. Read scripts/config/topic-taxonomy.json and choose the single best cluster for this topic; note that cluster's pillar URL. Read the pillar page source and 2 strong recent sibling posts in the same cluster (find them by grepping src/content/blog frontmatter for the cluster or related tags) to absorb the house voice, frontmatter shape, CTA usage, and Sources-section format. Also read scripts/config/content-quality-rules.json and scripts/config/cta-template.html.
2. STRUCTURE: plan the expanded article. Exactly ONE H1 comes from the title frontmatter (do NOT add a '# ' heading in the body). At least 70% of your non-structural H2 headings must be phrased as QUESTIONS the target reader actually asks (AEO). Structural H2s like 'Sources' or 'FAQ' don't count against you.
3. WRITE: expand to AT LEAST 1,600 words of body content with prose density >=60% (favor real paragraphs; use bullets only where a list genuinely beats prose). Write for an operator/executive of a multi-location group: concrete, specific, experienced, zero filler. Preserve any accurate advice from the original; cut anything generic or wrong. FORBIDDEN (hard fail): 'Georgia'/'Atlanta'/'Marietta' as business geography, 'small business', 'local practice', 'free trial', 'DIY', 'cheap', tel: links. AVOID (style bans): 'dive into', 'seamless', 'navigate', 'leverage', 'game-changer', 'unlock', 'empower', 'cutting-edge', em-dash-heavy AI cadence, rule-of-three padding. Read-aloud test: if a sentence sounds like an AI memo, rewrite it.
4. FRONTMATTER: add seoTitle (50-60 chars, targets the post's real search intent) and seoDescription (140-160 chars, plain text). Add/fix 'cluster' with the exact cluster id from topic-taxonomy.json. Keep slug, publishDate, author unchanged. Match sibling posts for any modified/updated date field convention.
5. SOURCES: add a '## Sources' section with AT LEAST 2 external citations. Choose external sources ONLY from the pre-verified live list at {pool} (readable at that absolute path) — pick ones genuinely relevant to your claims. CRITICAL HONESTY RULE: you cannot browse these sources, so do NOT attribute specific invented statistics to them; keep any sourced claims qualitative and consistent with what the source title/publisher plausibly covers, or retain statistics that the ORIGINAL post already attributed. No archive.org sources.
6. INTERNAL LINKS: weave AT LEAST 5 contextual in-body internal links (trailing slashes required), including AT LEAST 1 to the cluster pillar URL; the rest to genuinely related posts, /solutions/, /enterprise/, or /glossary/ pages that exist in src/pages or src/content (verify each target file exists before linking).
7. CTA: ensure the post carries the house CTA pattern the sibling posts use (see cta-template.html and siblings) — reuse the existing house mechanism exactly; do not invent new components.
8. COMPLIANCE: no medical diagnosis/treatment claims, no guaranteed-revenue promises, no real patient/client names. Enterprise ICP only — nothing that reads like advice for a single-location solo practice.
9. SELF-REVIEW against every numbered rule above, then finish.

VERIFY before finishing: run /bin/bash {verify} {slug} {repo} — it must end with OK (it runs the repo's independent evaluator; citation liveness is re-checked by the harness afterward, so stick to the vetted pool).

OUTPUT CONTRACT: leave your changes uncommitted. Write ./fix-summary.md with '# Fix Summary', '## Summary', '## Files Changed', '## Verification', '## Assumptions' (under 500 words; list your chosen cluster, seoTitle/seoDescription with char counts, word count, and your 2+ sources). Do not create any other new files. If blocked, make no speculative edits and explain in fix-summary.md."""


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--repo", required=True, help="integration worktree (has node_modules)")
    p.add_argument("--workdir", required=True, help="ringer run workdir (patches/summaries land here)")
    p.add_argument("--posts-json", required=True, help='JSON file: [{"slug":..., "errors":...}, ...]')
    p.add_argument("--run-name", default="seo-content-backlog")
    p.add_argument("--max-parallel", type=int, default=4)
    p.add_argument("--engine", default="codex")
    p.add_argument("--engine-arg", action="append", default=None,
                   help="repeatable; default: -m gpt-5.6-terra")
    p.add_argument("--verify", default=os.path.join(HERE, "post_verify.sh"))
    p.add_argument("--pool", default=os.path.join(HERE, "verified-source-pool.txt"))
    p.add_argument("--checker",
                   default=os.path.expanduser("~/repos/ringer/templates/fix-swarm/checks/fix-swarm.py"))
    p.add_argument("--timeout-s", type=int, default=2400)
    p.add_argument("--out", default=None, help="output manifest path (default <workdir>/manifest.json)")
    args = p.parse_args()

    repo = os.path.abspath(args.repo)
    workdir = os.path.abspath(args.workdir)
    verify = os.path.abspath(args.verify)
    pool = os.path.abspath(args.pool)
    engine_args = args.engine_arg if args.engine_arg else ["-m", "gpt-5.6-terra"]

    for path, label in [(repo, "--repo"), (verify, "--verify"), (pool, "--pool"), (args.checker, "--checker")]:
        if not os.path.exists(path):
            print(f"error: {label} path does not exist: {path}", file=sys.stderr)
            return 2
    if not os.path.isdir(os.path.join(repo, "node_modules")):
        print(f"error: --repo has no node_modules (run npm ci there first): {repo}", file=sys.stderr)
        return 2

    with open(args.posts_json) as f:
        posts = json.load(f)
    if not posts:
        print("error: posts list is empty", file=sys.stderr)
        return 2

    os.makedirs(workdir, exist_ok=True)
    tasks = []
    for entry in posts:
        slug, errors = entry["slug"], entry["errors"]
        import os as _os
        postfile = f"{slug}.mdx" if _os.path.exists(_os.path.join(repo, "src/content/blog", f"{slug}.mdx")) and not _os.path.exists(_os.path.join(repo, "src/content/blog", f"{slug}.md")) else f"{slug}.md"
        spec = SPEC_TEMPLATE.format(slug=slug, errors=errors, pool=pool, verify=verify, repo=repo, postfile=postfile)
        check = (
            f"/usr/bin/python3 '{args.checker}' "
            f"--verify-command '/bin/bash {verify} {slug} {repo}' "
            f"--patch '{workdir}/{slug[:40]}.patch' "
            f"--summary fix-summary.md "
            f"--exported-summary '{workdir}/{slug[:40]}.summary.md' "
            f"--owned-files 'src/content/blog/{postfile}'"
        )
        tasks.append({
            "key": f"post-{slug[:38]}",
            "task_type": "docs",
            "engine": args.engine,
            "engine_args": engine_args,
            "timeout_s": args.timeout_s,
            "spec": spec,
            "check": check,
            "expect_files": [],
            "verified": "repo's independent evaluate-post.js passed (word count, density, citations live, cluster, H2 questions, CTA, compliance); patch limited to the single owned post",
        })

    manifest = {
        "run_name": args.run_name,
        "workdir": workdir,
        "max_parallel": args.max_parallel,
        "worktrees": True,
        "repo": repo,
        "tasks": tasks,
    }
    out = args.out or os.path.join(workdir, "manifest.json")
    with open(out, "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"wrote {out} with {len(tasks)} tasks")
    return 0


if __name__ == "__main__":
    sys.exit(main())
