/**
 * Rehype plugin: improve accessibility semantics for Markdown-rendered content.
 *
 * - Adds <caption class="sr-only">…</caption> to tables that lack an accessible name.
 * - Adds aria-labels to task-list checkboxes generated from Markdown checklists.
 *
 * This is intentionally dependency-free to keep the build lightweight.
 */

function isElement(node, tagName) {
  return (
    node &&
    node.type === 'element' &&
    typeof node.tagName === 'string' &&
    (!tagName || node.tagName === tagName)
  );
}

function normalizeWhitespace(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function getNodeText(node) {
  if (!node) return '';
  if (node.type === 'text' && typeof node.value === 'string') return node.value;
  if (isElement(node, 'script') || isElement(node, 'style')) return '';

  const children = Array.isArray(node.children) ? node.children : [];
  let out = '';
  for (const child of children) {
    const childText = getNodeText(child);
    if (!childText) continue;
    out += (out ? ' ' : '') + childText;
  }
  return out;
}

function getFirstTableHeaderText(tableNode) {
  if (!isElement(tableNode, 'table')) return null;
  const children = Array.isArray(tableNode.children) ? tableNode.children : [];

  // Look for <th> text in the first row as a last-resort caption.
  const thTexts = [];
  const stack = [...children];
  while (stack.length) {
    const node = stack.shift();
    if (isElement(node, 'th')) {
      const text = normalizeWhitespace(getNodeText(node));
      if (text) thTexts.push(text);
      continue;
    }
    if (isElement(node) && Array.isArray(node.children)) stack.unshift(...node.children);
  }

  if (thTexts.length === 0) return null;
  // Keep captions short; long captions hurt UX for screen readers.
  const deduped = [...new Set(thTexts)].slice(0, 4);
  return deduped.join(' | ');
}

function getTableCaptionFromContext(parent, tableIndex) {
  if (!parent || !Array.isArray(parent.children)) return null;

  // Scan backwards for the closest heading/paragraph to name the table.
  for (let i = tableIndex - 1; i >= 0; i -= 1) {
    const sibling = parent.children[i];
    if (!isElement(sibling)) continue;

    const isHeading = /^h[1-6]$/.test(sibling.tagName);
    const isParagraph = sibling.tagName === 'p';
    if (!isHeading && !isParagraph) continue;

    const text = normalizeWhitespace(getNodeText(sibling));
    if (!text) continue;

    // Avoid using huge paragraphs as captions.
    if (text.length > 140) continue;

    // If the paragraph is just a lead-in like "Table:" or similar, skip it.
    if (/^(table|example|figure)\s*:?$/i.test(text)) continue;

    return text;
  }

  return null;
}

function normalizeCaptionKey(text) {
  return normalizeWhitespace(String(text || ''))
    .toLowerCase()
    .replace(/[:\s]+$/, '');
}

function ensureUniqueCaption(preferred, fallback, usedCaptions) {
  const preferredKey = normalizeCaptionKey(preferred);
  if (!usedCaptions.has(preferredKey)) {
    usedCaptions.set(preferredKey, 1);
    return preferred;
  }

  if (fallback) {
    const fallbackKey = normalizeCaptionKey(fallback);
    if (fallbackKey && !usedCaptions.has(fallbackKey)) {
      usedCaptions.set(fallbackKey, 1);
      return fallback;
    }
  }

  const next = (usedCaptions.get(preferredKey) || 1) + 1;
  usedCaptions.set(preferredKey, next);
  return `${preferred} (${next})`;
}

function ensureTableHasAccessibleName(tableNode, parent, index, usedCaptions) {
  if (!isElement(tableNode, 'table')) return;

  const children = Array.isArray(tableNode.children) ? tableNode.children : [];
  const hasCaption = children.some((child) => isElement(child, 'caption'));
  const properties = (tableNode.properties ||= {});

  if (hasCaption) return;
  if (properties['aria-label'] || properties['aria-labelledby']) return;

  const contextCaption = getTableCaptionFromContext(parent, index);
  const headerCaption = getFirstTableHeaderText(tableNode);
  const baseCaption = contextCaption || headerCaption || 'Data table';
  const captionText = ensureUniqueCaption(baseCaption, headerCaption, usedCaptions);

  tableNode.children = [
    {
      type: 'element',
      tagName: 'caption',
      properties: { className: ['sr-only'] },
      children: [{ type: 'text', value: captionText }],
    },
    ...children,
  ];
}

function ensureTaskCheckboxHasLabel(inputNode, ancestors) {
  if (!isElement(inputNode, 'input')) return;
  const properties = (inputNode.properties ||= {});
  if (properties.type !== 'checkbox') return;
  if (properties['aria-label'] || properties['aria-labelledby']) return;

  // Find nearest <li> ancestor to use its text as the checkbox label.
  const li = [...ancestors].reverse().find((node) => isElement(node, 'li'));
  const liText = li ? normalizeWhitespace(getNodeText(li)) : '';

  // The <li> text includes the checkbox itself; keep it short and meaningful.
  const label = liText && liText.length <= 160 ? liText : 'Checklist item';
  properties['aria-label'] = label;
}

function walk(node, parent, index, ancestors, visitor) {
  visitor(node, parent, index, ancestors);
  if (!node || !Array.isArray(node.children)) return;
  for (let i = 0; i < node.children.length; i += 1) {
    const child = node.children[i];
    walk(child, node, i, [...ancestors, node], visitor);
  }
}

export default function rehypeA11y() {
  return (tree) => {
    const usedCaptions = new Map();
    walk(tree, null, -1, [], (node, parent, index, ancestors) => {
      if (isElement(node, 'table')) ensureTableHasAccessibleName(node, parent, index, usedCaptions);
      if (isElement(node, 'input')) ensureTaskCheckboxHasLabel(node, ancestors);
    });
  };
}
