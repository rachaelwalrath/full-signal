// Blog post sidebar: "More like this" + "Upcoming events".
// To add a post: add an entry to POSTS. To add an event: add an entry to EVENTS.
// Events disappear automatically the day after `ends`.
(function(){
  const POSTS = [
    { slug: 'how-small-agencies-choose-ai-workflow-consulting', title: 'How Small Agencies Choose AI Workflow Consulting', cat: 'AI strategy', date: '2026-10-08', tags: ['strategy','buying','workflows','consulting','agencies'] },
    { slug: 'best-ai-workflow-consulting-services-for-firms', title: 'Best AI Workflow Consulting Services for Firms', cat: 'AI strategy', date: '2026-10-06', tags: ['strategy','buying','workflows','consulting'] },
    { slug: 'the-hidden-cost-of-choosing-ai-tools-yourself', title: 'Why Choosing AI Tools Yourself Costs More Than You Think', cat: 'AI strategy', date: '2026-10-03', tags: ['strategy','buying','tools'] },
    { slug: 'why-claude-gives-generic-answers', title: 'Why Claude Gives You Generic Answers, and the Setup That Fixes It', cat: 'Claude training', date: '2026-10-01', tags: ['claude','setup','workflows'] }
  ];
  const EVENTS = [
    { title: 'How I Set Up Claude: A Free Preview', when: 'Thu, Oct 15 · 10–11 AM PT', ends: '2026-10-15', label: 'Free · Live on Zoom', img: '/cover-webinar.png', href: '/events#webinar-event', cta: 'Save my free seat', ctaHref: 'https://luma.com/f5r458v5' },
    { title: 'Signal Setup Lab', when: 'Starts Thu, Oct 22 · 4 weeks', ends: '2026-10-22', label: 'Cohort 1 · $397 founding price', img: '/cover-lab.png', href: '/events#lab-event', cta: 'Join Cohort 1', ctaHref: 'https://luma.com/4a5a1kgq' }
  ];

  const aside = document.querySelector('[data-sidebar]');
  if (!aside) return;
  const current = location.pathname.replace(/\/$/, '').split('/').pop().replace(/\.html$/, '');
  const me = POSTS.find(p => p.slug === current) || { cat: '', tags: [] };
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' })[c]);
  const fmt = d => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  const mark = '<span class="mk" aria-hidden="true"><i style="height:45%"></i><i style="height:70%"></i><i style="height:100%"></i><i style="height:62%"></i><i style="height:40%"></i></span>';

  // Rank other posts: same category counts most, then shared tags, then newest first.
  const related = POSTS
    .filter(p => p.slug !== current)
    .map(p => ({ p, score: (p.cat === me.cat ? 3 : 0) + p.tags.filter(t => me.tags.includes(t)).length }))
    .sort((a, b) => b.score - a.score || b.p.date.localeCompare(a.p.date))
    .slice(0, 4)
    .map(x => x.p);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = EVENTS.filter(e => e.ends >= today).slice(0, 3);

  let html = '';
  if (related.length) {
    html += '<section class="aside-block"><h2 class="aside-title">More like this</h2><ul class="aside-posts">' +
      related.map((p, i) => `<li><a href="/blog/${p.slug}"><span class="aside-thumb${i % 2 ? '' : ' alt'}">${mark}</span><span class="aside-txt"><span class="aside-meta">${esc(p.cat)} · ${fmt(p.date)}</span><span class="aside-h">${esc(p.title)}</span></span></a></li>`).join('') +
      `</ul><a class="aside-more" href="/blog">All posts ${arrow}</a></section>`;
  }
  if (upcoming.length) {
    html += '<section class="aside-block"><h2 class="aside-title">Upcoming events</h2><ul class="aside-events">' +
      upcoming.map(e => `<li><a class="aside-ev" href="${e.href}"><img src="${e.img}" alt="" width="72" height="72" loading="lazy" /><span class="aside-txt"><span class="aside-meta">${esc(e.when)}</span><span class="aside-h">${esc(e.title)}</span><span class="aside-sub">${esc(e.label)}</span></span></a><a class="aside-cta" href="${e.ctaHref}" target="_blank" rel="noopener">${esc(e.cta)} ${arrow}</a></li>`).join('') +
      `</ul><a class="aside-more" href="/events">All events ${arrow}</a></section>`;
  }
  aside.innerHTML = html;
  if (!html) aside.hidden = true;
})();
