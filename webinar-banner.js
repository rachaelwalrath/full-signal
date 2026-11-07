// Site-wide banner for the free webinar on Fri 13 Nov 2026 (CCB-8).
// Loaded with a plain <script> right after <body> on every page, so the banner
// is in place before the header paints (no layout jump).
// It hides itself once the session ends, and hides anything marked
// data-webinar (the homepage callout) at the same moment.
// After the event: delete this file and its <script> tags, or point it at the next one.
(function(){
  var ENDS = Date.parse('2026-11-13T20:00:00Z'); // 12:00 PM PT, end of the live hour
  var live = Date.now() < ENDS;

  function hideMarked(){
    if (live) return;
    var els = document.querySelectorAll('[data-webinar]');
    for (var i = 0; i < els.length; i++) els[i].hidden = true;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hideMarked);
  else hideMarked();

  if (!live) return;
  var path = location.pathname.replace(/\/$/, '').replace(/\.html$/, '');
  if (path === '/webinar') return; // the page itself does not need it
  try { if (sessionStorage.getItem('fs-webinar-banner') === 'closed') return; } catch (e) {}

  var css = '.wb{background:#15151b;color:#fff;font-family:inherit;font-size:clamp(.875rem,.8rem + .35vw,1rem);line-height:1.4;position:relative;z-index:60}' +
    '.wb .wrap{max-width:1180px;margin-inline:auto;padding:.7rem 3rem .7rem clamp(1.25rem,5vw,3rem);display:flex;align-items:center;justify-content:center;gap:.4rem 1.25rem;flex-wrap:wrap;position:relative}' +
    '.wb-tag{font-family:var(--font-mono,ui-monospace,Menlo,monospace);font-size:.75rem;letter-spacing:.16em;text-transform:uppercase;color:#f63c6c;white-space:nowrap}' +
    '.wb a.wb-link{color:#fff;font-weight:600;text-decoration:underline;text-underline-offset:3px;text-decoration-color:rgba(255,255,255,.45)}' +
    '.wb a.wb-link:hover{text-decoration-color:#fff}' +
    '.wb-x{position:absolute;right:.5rem;top:50%;transform:translateY(-50%);background:none;border:0;color:rgba(255,255,255,.7);cursor:pointer;width:2rem;height:2rem;border-radius:999px;font-size:1.25rem;line-height:1}' +
    '.wb-x:hover{color:#fff;background:rgba(255,255,255,.1)}' +
    '@media(max-width:560px){.wb .wrap{justify-content:flex-start}}';
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var bar = document.createElement('div');
  bar.className = 'wb';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Upcoming free webinar');
  bar.innerHTML = '<div class="wrap">' +
    '<span class="wb-tag">Free webinar · Fri, Nov 13 · 11 AM PT</span>' +
    '<span>Bring one task you redo every week and watch it handed to Claude, live. <a class="wb-link" href="/webinar">Save your free seat</a></span>' +
    '<button class="wb-x" type="button" aria-label="Hide this banner">×</button>' +
    '</div>';
  bar.querySelector('.wb-x').addEventListener('click', function(){
    bar.remove();
    try { sessionStorage.setItem('fs-webinar-banner', 'closed'); } catch (e) {}
  });

  var me = document.currentScript;
  if (me && me.parentNode) me.parentNode.insertBefore(bar, me.nextSibling);
  else document.body.insertBefore(bar, document.body.firstChild);
})();
