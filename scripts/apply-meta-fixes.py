#!/usr/bin/env python3
"""Apply approved meta tag fixes from a JSON manifest.
Handles YAML folded scalars (>-, >) by removing continuation lines."""
import json, re, sys


def remove_field_and_continuations(lines, field_name):
    """Remove a YAML field line and any indented continuation lines that follow it."""
    result = []
    skip_continuations = False
    for line in lines:
        if skip_continuations:
            # Continuation lines are indented (start with spaces) and not a new field
            if line.startswith('  ') and not re.match(r'  \S+:', line):
                continue  # Skip this continuation line
            else:
                skip_continuations = False
        if re.match(rf'^{field_name}:\s', line) or line.strip() == f'{field_name}:':
            skip_continuations = True
            continue  # Skip the field line itself
        result.append(line)
    return result


def apply_fixes(manifest_path):
    with open(manifest_path) as f:
        fixes = json.load(f)

    blog_dir = "src/content/blog"
    applied = 0
    errors = 0

    for fix in fixes:
        fname = fix["file"]
        path = f"{blog_dir}/{fname}"
        try:
            with open(path, "r", encoding="utf-8") as fh:
                text = fh.read()

            # Split into frontmatter and body
            fm_match = re.match(r"(---\s*\n)(.*?)(\n---)", text, re.DOTALL)
            if not fm_match:
                print(f"SKIP {fname}: no frontmatter")
                errors += 1
                continue

            fm_raw = fm_match.group(2)
            body = text[fm_match.end():]
            fm_lines = fm_raw.split('\n')

            pt = fix.get("proposed_title", "")
            pd = fix.get("proposed_desc", "")

            # Fix title: replace both title and seoTitle
            if pt:
                quoted_title = f'"{pt}"'
                # Remove old title + continuations, then add new
                has_title = any(re.match(r'^title:\s', l) or l.strip() == 'title:' for l in fm_lines)
                has_seoTitle = any(re.match(r'^seoTitle:\s', l) or l.strip() == 'seoTitle:' for l in fm_lines)

                if has_title:
                    new_lines = []
                    skip = False
                    for line in fm_lines:
                        if skip:
                            if line.startswith('  ') and not re.match(r'  \S+:', line):
                                continue
                            else:
                                skip = False
                        if re.match(r'^title:\s', line) or line.strip() == 'title:':
                            new_lines.append(f'title: {quoted_title}')
                            skip = True
                            continue
                        new_lines.append(line)
                    fm_lines = new_lines

                if has_seoTitle:
                    new_lines = []
                    skip = False
                    for line in fm_lines:
                        if skip:
                            if line.startswith('  ') and not re.match(r'  \S+:', line):
                                continue
                            else:
                                skip = False
                        if re.match(r'^seoTitle:\s', line) or line.strip() == 'seoTitle:':
                            new_lines.append(f'seoTitle: {quoted_title}')
                            skip = True
                            continue
                        new_lines.append(line)
                    fm_lines = new_lines

            # Fix description: replace both description and seoDescription
            if pd:
                # Escape any double quotes in the description
                escaped_desc = pd.replace('"', '\\"')
                quoted_desc = f'"{escaped_desc}"'

                has_desc = any(re.match(r'^description:\s', l) or l.strip() == 'description:' for l in fm_lines)
                has_seoDesc = any(re.match(r'^seoDescription:\s', l) or l.strip() == 'seoDescription:' for l in fm_lines)

                if has_desc:
                    new_lines = []
                    skip = False
                    for line in fm_lines:
                        if skip:
                            if line.startswith('  ') and not re.match(r'  \S+:', line):
                                continue
                            else:
                                skip = False
                        if re.match(r'^description:\s', line) or line.strip() == 'description:':
                            new_lines.append(f'description: {quoted_desc}')
                            skip = True
                            continue
                        new_lines.append(line)
                    fm_lines = new_lines

                if has_seoDesc:
                    new_lines = []
                    skip = False
                    for line in fm_lines:
                        if skip:
                            if line.startswith('  ') and not re.match(r'  \S+:', line):
                                continue
                            else:
                                skip = False
                        if re.match(r'^seoDescription:\s', line) or line.strip() == 'seoDescription:':
                            new_lines.append(f'seoDescription: {quoted_desc}')
                            skip = True
                            continue
                        new_lines.append(line)
                    fm_lines = new_lines

            new_fm = '\n'.join(fm_lines)
            new_text = f"---\n{new_fm}\n---{body}"

            with open(path, "w", encoding="utf-8") as fh:
                fh.write(new_text)

            applied += 1
            print(f"OK {fname}")
        except Exception as e:
            print(f"ERR {fname}: {e}")
            errors += 1

    print(f"\nApplied: {applied}, Errors: {errors}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 apply-meta-fixes.py <fixes.json>")
        sys.exit(1)
    apply_fixes(sys.argv[1])
