// Writes the site navigation into every page: header menu, mobile menu and footer columns.
// One source for every page, so a new page or a new group is added here once, then:
//   node scripts/build-nav.mjs
// New blog posts are picked up from blog/*.html automatically (newest first).
// Markup goes between these markers in each page:
//   <!--fsn:nav--> ... <!--/fsn:nav-->    desktop menu (inside the header)
//   <!--fsn:mnav--> ... <!--/fsn:mnav-->  mobile menu list
//   <!--fsn:foot--> ... <!--/fsn:foot-->  footer columns
// Styles: /nav.css. Behaviour: /nav.js.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');

// Pages kept out of the menus on purpose. They are reached through a sign-up or an event, not browsing.
const NOT_IN_MENUS = new Set(['gmac.html', 'ai-rollout/checklist.html', 'starter-kit/kit.html']);
// Pages the script does not touch at all (no site header of their own).
const SKIP_FILES = new Set(['gmac.html', 'ai-rollout/checklist.html']);

function blogPosts() {
  const dir = path.join(root, 'blog');
  return fs.readdirSync(dir).filter(f => f.endsWith('.html')).map(f => {
    const html = fs.readFileSync(path.join(dir, f), 'utf8');
    const title = (html.match(/<title>([^<]*)<\/title>/) || [, f])[1].replace(/\s*\|\s*Full Signal.*$/, '').trim();
    const date = (html.match(/"datePublished"\s*:\s*"([^"]+)"/) || [, ''])[1];
    return { href: '/blog/' + f.replace(/\.html$/, ''), label: title, date };
  }).sort((a, b) => b.date.localeCompare(a.date) || a.label.localeCompare(b.label));
}

// The header groups, in order. Footer columns use the same labels.
const GROUPS = [
  { id: 'advisory', label: 'Advisory', items: [
    { href: '/advisory', label: 'Advisory packages' },
    { href: '/ai-rollout', label: 'Team Claude Rollout' },
  ], footExtra: [
    { href: '/advisory#check', label: 'AI Assessment' },
    { href: '/advisory#audit', label: 'Signal Audit' },
    { href: '/advisory#sprint', label: 'Signal Sprint' },
    { href: '/advisory#brain', label: 'Signal Brain' },
  ] },
  { id: 'training', label: 'Training', items: [
    { href: '/training', label: 'Claude training' },
    { href: '/lab', label: 'AI Workshop for Small and Medium Businesses' },
    { href: '/webinar', label: 'Free webinar' },
    { href: '/starter-kit', label: 'AI Employee Starter Kit' },
    { href: '/events', label: 'Events' },
  ] },
  { id: 'crm', label: 'CRM', items: [
    { href: '/crm-scalability-assessment', label: 'HubSpot or Salesforce?' },
    { href: '/salesforce', label: 'Salesforce for Small and Medium Businesses' },
    { href: '/iris', label: 'Iris' },
  ] },
  { id: 'blog', label: 'Blog', items: [{ href: '/blog', label: 'All posts' }, ...blogPosts()] },
];
const TOP = [
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];
const COMPANY = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: 'https://meetings-na2.hubspot.com/rwalrath/bring-your-questions', label: 'Free Q&amp;A call', external: true },
];

const CHEVRON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

const urlOf = file => {
  const p = '/' + file.replace(/\\/g, '/').replace(/\.html$/, '');
  return p === '/index' ? '/' : p;
};
const cur = (href, here) => (href === here ? ' aria-current="page"' : '');
const link = (it, here) => it.external
  ? `<a href="${it.href}" target="_blank" rel="noopener">${it.label}</a>`
  : `<a href="${it.href}"${cur(it.href, here)}>${it.label}</a>`;

function desktop(here) {
  const groups = GROUPS.map(g => {
    const isCur = g.items.some(i => i.href === here);
    return `<li class="fsn-group${isCur ? ' is-current' : ''}"><button type="button" class="fsn-parent" aria-expanded="false" aria-controls="fsn-g-${g.id}">${g.label}${CHEVRON}</button>` +
      `<ul class="fsn-sub" id="fsn-g-${g.id}" hidden>${g.items.map(i => `<li>${link(i, here)}</li>`).join('')}</ul></li>`;
  }).join('');
  const top = TOP.map(i => `<li>${link(i, here)}</li>`).join('');
  return `<nav class="fsn" aria-label="Primary"><ul class="fsn-list">${groups}${top}</ul></nav>`;
}

function mobile(here) {
  const home = `<li>${link({ href: '/', label: 'Home' }, here)}</li>`;
  const groups = GROUPS.map(g =>
    `<li><button type="button" class="fsn-m-parent" aria-expanded="false" aria-controls="fsn-m-${g.id}">${g.label}${CHEVRON}</button>` +
    `<ul class="fsn-m-sub" id="fsn-m-${g.id}" hidden>${g.items.map(i => `<li>${link(i, here)}</li>`).join('')}</ul></li>`).join('');
  const top = TOP.map(i => `<li>${link(i, here)}</li>`).join('');
  return `<ul class="fsn-m">${home}${groups}${top}</ul>`;
}

function footer(here) {
  const cols = GROUPS.map(g => {
    const items = [...(g.footExtra || []), ...g.items];
    return `<div><h2>${g.label}</h2><ul>${items.map(i => `<li>${link(i, here)}</li>`).join('')}</ul></div>`;
  });
  cols.push(`<div><h2>Company</h2><ul>${COMPANY.map(i => `<li>${link(i, here)}</li>`).join('')}</ul></div>`);
  return cols.join('\n      ');
}

function fill(html, name, content) {
  const re = new RegExp(`<!--fsn:${name}-->[\\s\\S]*?<!--/fsn:${name}-->`);
  if (!re.test(html)) return null;
  return html.replace(re, `<!--fsn:${name}-->${content}<!--/fsn:${name}-->`);
}

// First run on a styles.css page: swap the old hand-written lists for markers.
function addMarkers(html) {
  html = html.replace(/<nav aria-label="Primary"><ul class="nav-links">[\s\S]*?<\/ul><\/nav>/, '<!--fsn:nav--><!--/fsn:nav-->');
  html = html.replace(/(<nav class="mobile-nav" id="mnav" aria-label="Mobile"><div class="wrap">)<ul>[\s\S]*?<\/ul>/, '$1<!--fsn:mnav--><!--/fsn:mnav-->');
  html = html.replace(/<div><h2>Advisory<\/h2><ul>[\s\S]*?Free Q&amp;A call<\/a><\/li><\/ul><\/div>/, '<!--fsn:foot--><!--/fsn:foot-->');
  return html;
}

function walk(dir, out = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    if (f.name.startsWith('.') || f.name === 'node_modules' || f.name === 'scripts') continue;
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p, out);
    else if (f.name.endsWith('.html')) out.push(path.relative(root, p).replace(/\\/g, '/'));
  }
  return out;
}

const report = [];
for (const file of walk(root)) {
  if (SKIP_FILES.has(file)) { report.push([file, 'skipped']); continue; }
  const full = path.join(root, file);
  let html = fs.readFileSync(full, 'utf8');
  if (!html.includes('<!--fsn:nav-->')) html = addMarkers(html);
  const here = urlOf(file);
  let ok = true;
  for (const [name, fn] of [['nav', desktop], ['mnav', mobile], ['foot', footer]]) {
    const next = fill(html, name, fn(here));
    if (next === null) { ok = false; report.push([file, `no ${name} marker`]); continue; }
    html = next;
  }
  if (!html.includes('/nav.css')) html = html.replace('</head>', '<link rel="stylesheet" href="/nav.css" />\n</head>');
  if (!html.includes('/nav.js')) html = html.replace('</body>', '<script src="/nav.js" defer></script>\n</body>');
  fs.writeFileSync(full, html);
  if (ok) report.push([file, 'ok']);
}

const listed = new Set([...GROUPS.flatMap(g => g.items.map(i => i.href)), ...TOP.map(i => i.href), '/']);
console.log('page'.padEnd(60), 'status'.padEnd(10), 'in menus');
for (const [file, status] of report) {
  console.log(file.padEnd(60), status.padEnd(10), NOT_IN_MENUS.has(file) ? 'no (kept out on purpose)' : listed.has(urlOf(file)) ? 'yes' : 'NO');
}
