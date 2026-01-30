#!/usr/bin/env python3
"""
Auto-fix enterprise links by adding contextual links to blog posts.
Finds relevant blog posts and adds links to enterprise pillar pages.
"""

import os
import re
import json
import yaml
from pathlib import Path

BLOG_DIR = Path('src/content/blog')
CONFIG_PATH = Path('scripts/config/enterprise-links.json')

# Keywords that indicate relevance to each enterprise page
RELEVANCE_MAP = {
    '/enterprise/': ['enterprise', 'multi-location', 'healthcare group', 'DSO', 'scaling'],
    '/enterprise/patient-access-center/': ['patient access', 'call center', 'intake', 'answering service', 'front desk'],
    '/enterprise/centralized-scheduling/': ['scheduling', 'appointment', 'centralized', 'booking', 'calendar'],
    '/enterprise/multi-location-recall/': ['recall', 'reactivation', 'dormant patient', 'patient retention', 'follow-up'],
    '/enterprise/reporting-qa/': ['reporting', 'analytics', 'QA', 'quality', 'metrics', 'KPI', 'dashboard'],
    '/enterprise/dso/': ['DSO', 'dental', 'dental group', 'dental practice']
}

# CTA templates for each page
CTA_TEMPLATES = {
    '/enterprise/': '\n\n> **Managing multiple locations?** [See how enterprise healthcare groups centralize patient access](/enterprise/)\n',
    '/enterprise/patient-access-center/': '\n\n> **Need a dedicated patient access team?** [Learn about our Patient Access Center solution](/enterprise/patient-access-center/)\n',
    '/enterprise/centralized-scheduling/': '\n\n> **Struggling with scheduling across locations?** [Explore centralized scheduling](/enterprise/centralized-scheduling/)\n',
    '/enterprise/multi-location-recall/': '\n\n> **Losing patients to poor recall?** [See our multi-location recall solution](/enterprise/multi-location-recall/)\n',
    '/enterprise/reporting-qa/': '\n\n> **Need visibility across locations?** [Check out enterprise reporting & QA](/enterprise/reporting-qa/)\n',
}

def load_config():
    with open(CONFIG_PATH) as f:
        return json.load(f)

def get_current_links(page):
    """Count current inbound links to a page."""
    count = 0
    for md_file in BLOG_DIR.glob('**/*.md'):
        content = md_file.read_text()
        if page in content:
            count += 1
    return count

def find_relevant_posts(page, keywords, exclude_files):
    """Find blog posts relevant to the enterprise page."""
    relevant = []
    for md_file in BLOG_DIR.glob('**/*.md'):
        if md_file.name in exclude_files:
            continue
        content = md_file.read_text().lower()
        # Check if page already linked
        if page in content:
            continue
        # Check relevance
        score = sum(1 for kw in keywords if kw.lower() in content)
        if score >= 2:  # At least 2 keyword matches
            relevant.append((md_file, score))
    # Sort by relevance score
    relevant.sort(key=lambda x: x[1], reverse=True)
    return [f for f, _ in relevant]

def add_link_to_post(md_file, page, cta):
    """Add enterprise link CTA to end of blog post."""
    content = md_file.read_text()
    
    # Don't add if already has this link
    if page in content:
        return False
    
    # Find end of content (before any existing CTAs or just at end)
    # Add CTA before the last paragraph or at end
    lines = content.rstrip().split('\n')
    
    # Insert CTA
    new_content = content.rstrip() + cta
    md_file.write_text(new_content)
    return True

def main():
    config = load_config()
    pillar_pages = config.get('pillarPages', {})
    
    fixed = 0
    for page, settings in pillar_pages.items():
        min_links = settings.get('minInboundLinks', 5)
        current = get_current_links(page)
        needed = min_links - current
        
        if needed <= 0:
            print(f'✓ {page}: {current}/{min_links} links (OK)')
            continue
        
        print(f'⚠ {page}: {current}/{min_links} links (needs {needed} more)')
        
        keywords = RELEVANCE_MAP.get(page, [])
        cta = CTA_TEMPLATES.get(page)
        
        if not keywords or not cta:
            print(f'  [SKIP] No keywords/CTA template for {page}')
            continue
        
        # Find relevant posts
        relevant_posts = find_relevant_posts(page, keywords, [])
        
        # Add links to top N relevant posts
        added = 0
        for post in relevant_posts[:needed]:
            if add_link_to_post(post, page, cta):
                print(f'  [ADDED] {post.name}')
                added += 1
                fixed += 1
        
        if added < needed:
            print(f'  [WARN] Only found {added} relevant posts, need {needed}')
    
    print(f'\nFixed {fixed} links total')
    return 0 if fixed > 0 else 1

if __name__ == '__main__':
    exit(main())
