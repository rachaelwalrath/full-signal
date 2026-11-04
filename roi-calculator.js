// ROI calculator, shared by the homepage and /gmac.
// Mount: <div class="roi-calc" data-book="URL" data-qa="URL" data-btn-class="btn btn-primary"></div>
// Nothing typed here is stored or sent anywhere: no form element, no storage, no tracking calls.
(function () {
  var TASKS = [
    { id: 'leads', name: 'Responding to new leads', hours: 2,
      cite: 'Companies that responded to a new lead within an hour were about seven times more likely to qualify it than those that waited longer. Harvard Business Review, 2011.' },
    { id: 'cold', name: 'Re-engaging cold leads', hours: 1.5 },
    { id: 'followup', name: 'Follow-up emails', hours: 2 },
    { id: 'proposals', name: 'Writing proposals', hours: 2 },
    { id: 'reports', name: 'Client reports and updates', hours: 2 },
    { id: 'onboarding', name: 'Onboarding new clients', hours: 1 },
    { id: 'questions', name: 'Answering the same questions over and over', hours: 1.5 },
    { id: 'notes', name: 'Meeting notes and recaps', hours: 1.5 },
    { id: 'scheduling', name: 'Scheduling and calendar back-and-forth', hours: 1 },
    { id: 'invoicing', name: 'Invoicing and payment chasing', hours: 1 }
  ];
  var PRICE = 999, WEEKS_PER_YEAR = 48, DEFAULT_RATE = 150;
  var arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function num(v) { var n = parseFloat(v); return isFinite(n) && n > 0 ? n : 0; }
  function fmt(n, dp) { return n.toLocaleString('en-US', { maximumFractionDigits: dp || 0 }); }

  function mount(root, idx) {
    var p = 'roi' + idx + '-';
    var btnClass = root.getAttribute('data-btn-class') || 'btn';
    var book = root.getAttribute('data-book');
    var qa = root.getAttribute('data-qa');

    var chips = TASKS.map(function (t) {
      return '<label class="roi-chip"><input type="checkbox" value="' + t.id + '"><span>' + esc(t.name) + '</span></label>';
    }).join('');

    var rows = TASKS.map(function (t) {
      return '<div class="roi-row" data-task="' + t.id + '" hidden>' +
        '<label for="' + p + t.id + '">' + esc(t.name) + '</label>' +
        '<span class="roi-hrs"><input id="' + p + t.id + '" type="number" inputmode="decimal" min="0" max="80" step="0.5" value="' + t.hours + '"><span>hrs/week</span></span>' +
        (t.cite ? '<p class="roi-cite">' + esc(t.cite) + '</p>' : '') +
        '</div>';
    }).join('');

    root.innerHTML =
      '<div class="roi-card">' +
      '<div class="roi-step">' +
        '<p class="roi-label">Step 1</p>' +
        '<h3 id="' + p + 's1">Pick the tasks that eat your week.</h3>' +
        '<div class="roi-chips" role="group" aria-labelledby="' + p + 's1">' + chips + '</div>' +
        '<div class="roi-rows" hidden><p class="roi-note">Starting estimates. Change them to match your week.</p>' + rows + '</div>' +
      '</div>' +
      '<div class="roi-step">' +
        '<p class="roi-label">Step 2</p>' +
        '<h3><label for="' + p + 'rate">What is an hour of your time worth?</label></h3>' +
        '<span class="roi-rate"><span aria-hidden="true">$</span><input id="' + p + 'rate" type="number" inputmode="decimal" min="0" step="5" value="' + DEFAULT_RATE + '"><span>per hour</span></span>' +
      '</div>' +
      '<div class="roi-results" aria-live="polite">' +
        '<p class="roi-label">Your numbers</p>' +
        '<dl>' +
          '<div><dt>Hours back per week</dt><dd data-out="week">0</dd></div>' +
          '<div><dt>Hours back per year</dt><dd data-out="year">0</dd></div>' +
          '<div><dt>What that is worth per year</dt><dd data-out="worth">$0</dd></div>' +
          '<div><dt>Weeks until the AI Assessment pays for itself</dt><dd data-out="payback">Pick a task</dd></div>' +
        '</dl>' +
        '<p class="roi-promise">The AI Assessment is $999, and if it does not find you five hours a week, you do not pay.</p>' +
        '<p class="roi-small">Illustrative estimate based on the numbers you entered. Your results depend on your business.</p>' +
      '</div>' +
      '<p class="roi-small roi-source">Outside research, not Full Signal results.</p>' +
      '</div>' +
      '<div class="roi-cta">' +
        '<a class="' + esc(btnClass) + '" href="' + esc(book) + '" target="_blank" rel="noopener">Book your AI Assessment ' + arrow + '</a>' +
        '<a class="roi-qa" href="' + esc(qa) + '" target="_blank" rel="noopener">Or bring your questions to a free Q&amp;A call</a>' +
      '</div>';

    var rowsBox = root.querySelector('.roi-rows');
    var rate = root.querySelector('#' + p + 'rate');
    var out = {};
    ['week', 'year', 'worth', 'payback'].forEach(function (k) { out[k] = root.querySelector('[data-out="' + k + '"]'); });

    function update() {
      var weekly = 0, any = false;
      TASKS.forEach(function (t) {
        var on = root.querySelector('.roi-chip input[value="' + t.id + '"]').checked;
        var row = root.querySelector('.roi-row[data-task="' + t.id + '"]');
        row.hidden = !on;
        if (on) { any = true; weekly += num(row.querySelector('input').value); }
      });
      rowsBox.hidden = !any;
      var r = num(rate.value);
      var yearly = weekly * WEEKS_PER_YEAR;
      var perWeek = weekly * r;
      out.week.textContent = fmt(weekly, 1);
      out.year.textContent = fmt(yearly, 0);
      out.worth.textContent = '$' + fmt(yearly * r, 0);
      if (!any) out.payback.textContent = 'Pick a task';
      else if (perWeek <= 0) out.payback.textContent = 'Add your hours and rate';
      else { var w = Math.ceil(PRICE / perWeek); out.payback.textContent = w + (w === 1 ? ' week' : ' weeks'); }
    }
    root.addEventListener('input', update);
    root.addEventListener('change', update);
    update();
  }

  var roots = document.querySelectorAll('.roi-calc');
  for (var i = 0; i < roots.length; i++) mount(roots[i], i);
})();
