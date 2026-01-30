-- Weekly SEO Audit Concept Map Update
-- Adds SEO audit concepts to the Weekly Loop section

PRAGMA foreign_keys = ON;

BEGIN;

-- =============================================================================
-- NEW CONCEPT NODES: Weekly SEO Audit
-- =============================================================================

-- Main audit concept (child of Weekly Loop)
INSERT INTO node (
    id, map_id, label, short_def, why_important, deep_dive, example, eli5, tags
) VALUES (
    'node_weekly_seo_audit_000300',
    'default',
    'Weekly SEO Site Audit',
    'Run comprehensive technical + on-page SEO audit to detect issues proactively.',
    'Proactive issue detection prevents ranking drops before they happen; complements reactive signal-based approach.',
    'Weekly audit covers: crawlability, indexation, Core Web Vitals, meta tags, headings, internal links, schema markup, and content quality. Findings are compared against baseline to identify new, persistent, and resolved issues.',
    'Audit detects missing meta description on /pricing/ page - creates work order to fix before it affects rankings.',
    'Like a weekly health checkup for your website - find problems before they get serious.',
    'audit,weekly,proactive'
);

-- Technical SEO audit child
INSERT INTO node (
    id, map_id, label, short_def, why_important, deep_dive, example, eli5, tags
) VALUES (
    'node_audit_technical_seo_000301',
    'default',
    'Audit Technical SEO',
    'Check crawlability, indexation, site speed, mobile-friendliness, and security.',
    'Technical issues can completely block rankings regardless of content quality.',
    'Checks: robots.txt blocks, sitemap completeness, Core Web Vitals (LCP, INP, CLS), render-blocking resources, HTTPS, canonical tags, and structured data validity.',
    'Finds sitemap missing lastmod dates - crawl efficiency reduced - creates tech fix work order.',
    'Making sure Google can actually find and read your pages.',
    'technical,crawl,speed'
);

-- On-Page SEO audit child
INSERT INTO node (
    id, map_id, label, short_def, why_important, deep_dive, example, eli5, tags
) VALUES (
    'node_audit_onpage_seo_000302',
    'default',
    'Audit On-Page SEO',
    'Check titles, meta descriptions, headings, internal links, and keyword targeting.',
    'On-page elements directly signal relevance to search engines and affect CTR.',
    'Checks: title length and keyword placement, meta description completeness, H1 uniqueness and alignment, heading hierarchy, internal link distribution, and anchor text quality.',
    'Finds H1 "Every Missed Call Is a Lost Patient" missing primary keyword "medical answering service" - creates content fix work order.',
    'Making sure each page clearly tells Google what it is about.',
    'onpage,titles,headings'
);

-- Content Quality audit child
INSERT INTO node (
    id, map_id, label, short_def, why_important, deep_dive, example, eli5, tags
) VALUES (
    'node_audit_content_quality_000303',
    'default',
    'Audit Content Quality',
    'Assess E-E-A-T signals, content depth, freshness, and competitive positioning.',
    'Google rewards content that demonstrates expertise, experience, and trustworthiness.',
    'Checks: author attribution, credentials visibility, content depth vs competitors, recency of information, citation quality, and user engagement signals.',
    'Finds pricing page content outdated (references 2024 data) - creates refresh work order.',
    'Making sure your content deserves to rank higher than competitors.',
    'content,eeat,quality'
);

-- Baseline comparison child
INSERT INTO node (
    id, map_id, label, short_def, why_important, deep_dive, example, eli5, tags
) VALUES (
    'node_audit_baseline_diff_000304',
    'default',
    'Compare to Audit Baseline',
    'Diff current findings against previous audit to identify changes.',
    'Tracking issue persistence helps prioritize fixes and measure improvement over time.',
    'Maintains history of findings. New issues get immediate attention. Persistent issues (>2 weeks) escalate in priority. Resolved issues are logged for success tracking.',
    'Same missing meta on /pricing/ flagged 3 weeks in a row - priority elevated from Medium to High.',
    'Comparing this week checkup to last week to see what is new, fixed, or still broken.',
    'baseline,diff,tracking'
);

-- =============================================================================
-- EDGES: Connect audit concepts
-- =============================================================================

-- Operating Cadence → Weekly SEO Site Audit (sibling of Weekly Loop)
INSERT INTO edge (
    id, map_id, from_node_id, to_node_id, rel_type_id, is_trunk, branch_order, depth_hint, why, how, notes
) VALUES (
    'edge_cadence__seo_audit_000300',
    'default',
    'node_operating_cadence_000003',
    'node_weekly_seo_audit_000300',
    'rel_part_of',
    0,
    3,
    2,
    'Proactive auditing complements reactive signal monitoring by finding issues before they impact rankings.',
    'Audit runs every Sunday as part of operating cadence, alongside weekly loop.',
    'Weekly SEO audit runs as part of operating cadence (sibling of weekly loop).'
);

-- Weekly SEO Site Audit → Audit Technical SEO
INSERT INTO edge (
    id, map_id, from_node_id, to_node_id, rel_type_id, is_trunk, branch_order, depth_hint, why, how, notes
) VALUES (
    'edge_audit__technical_000301',
    'default',
    'node_weekly_seo_audit_000300',
    'node_audit_technical_seo_000301',
    'rel_part_of',
    0,
    1,
    NULL,
    'Technical issues can completely block rankings regardless of content quality.',
    'Checks crawlability, indexation, speed, mobile-friendliness, and security first.',
    'Technical SEO is the foundation - must be fixed before on-page/content work matters.'
);

-- Weekly SEO Site Audit → Audit On-Page SEO
INSERT INTO edge (
    id, map_id, from_node_id, to_node_id, rel_type_id, is_trunk, branch_order, depth_hint, why, how, notes
) VALUES (
    'edge_audit__onpage_000302',
    'default',
    'node_weekly_seo_audit_000300',
    'node_audit_onpage_seo_000302',
    'rel_part_of',
    0,
    2,
    NULL,
    'On-page elements directly signal relevance to search engines and affect CTR.',
    'Validates titles, meta descriptions, headings, and internal links on each page.',
    'On-page optimization signals relevance after technical foundation is solid.'
);

-- Weekly SEO Site Audit → Audit Content Quality
INSERT INTO edge (
    id, map_id, from_node_id, to_node_id, rel_type_id, is_trunk, branch_order, depth_hint, why, how, notes
) VALUES (
    'edge_audit__content_000303',
    'default',
    'node_weekly_seo_audit_000300',
    'node_audit_content_quality_000303',
    'rel_part_of',
    0,
    3,
    NULL,
    'Google rewards content demonstrating expertise, experience, and trustworthiness.',
    'Assesses E-E-A-T signals, content depth, freshness, and competitive positioning.',
    'Content quality determines long-term ranking potential.'
);

-- Weekly SEO Site Audit → Compare to Audit Baseline (trunk edge - sequential flow)
INSERT INTO edge (
    id, map_id, from_node_id, to_node_id, rel_type_id, is_trunk, branch_order, depth_hint, why, how, notes
) VALUES (
    'edge_audit__baseline_000304',
    'default',
    'node_weekly_seo_audit_000300',
    'node_audit_baseline_diff_000304',
    'rel_precedes',
    1,
    NULL,
    NULL,
    'Tracking issue persistence helps prioritize fixes and measure improvement over time.',
    'Diffs current findings against stored baseline to identify new, persistent, and resolved issues.',
    'After collecting findings, compare to baseline to identify what changed.'
);

-- Compare to Audit Baseline → Work Order Queue
INSERT INTO edge (
    id, map_id, from_node_id, to_node_id, rel_type_id, is_trunk, branch_order, depth_hint, why, how, notes
) VALUES (
    'edge_baseline__workorders_000305',
    'default',
    'node_audit_baseline_diff_000304',
    'node_queue_and_scheduling_000081',
    'rel_causes',
    0,
    1,
    NULL,
    'Audit findings must be actionable - converting to work orders enables systematic execution.',
    'Creates work orders based on severity thresholds: critical=immediate, high=2+ weeks persistent, medium=4+ weeks.',
    'Actionable findings from audit diff create work orders for execution.'
);

-- Compare to Audit Baseline → Feedback & Recalibration (baseline informs future priorities)
INSERT INTO edge (
    id, map_id, from_node_id, to_node_id, rel_type_id, is_trunk, branch_order, depth_hint, why, how, notes
) VALUES (
    'edge_baseline__feedback_000306',
    'default',
    'node_audit_baseline_diff_000304',
    'node_feedback_and_recalibration_000016',
    'rel_enables',
    0,
    2,
    NULL,
    'Historical audit data enables learning and strategy refinement.',
    'Persistent vs resolved issues inform which types of optimizations work best.',
    'Baseline comparison feeds back into overall system learning.'
);

COMMIT;
