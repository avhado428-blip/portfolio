/* Education graph (plain JS). A smooth animated line with one dot per stage.
   Click a dot to open that stage's details. Edit the EDU list below. */
(function () {
  'use strict';

  /* ================= YOUR EDUCATION (edit here) =================
     y = how high the dot sits on the graph (0 = bottom, 1 = top) */
  var EDU = [
    { label: '10th', y: 0.22, name: 'All Saints High School', sub: 'Class 10th',
      headline: '10th Standard', stat: '', statLabel: '',
      lines: ['Completed Class 10 at All Saints High School.'] },
    { label: '12th', y: 0.55, name: 'Achievers College', sub: 'Class 12th',
      headline: '12th Standard', stat: '', statLabel: '',
      lines: ['Completed Class 12 at Achievers College.'] },
    { label: 'B.Tech', y: 0.9, name: 'KJ Somaiya College of Engineering', sub: 'Vidyavihar, Mumbai \u00B7 Ongoing',
      headline: 'B.Tech, Computer Science', stat: '8.46', statLabel: '1st yr CGPA',
      lines: ['Pursuing a Bachelor of Technology in Computer Science.'] }
  ];
  /* ============================================================== */

  // <build>
  var VW = 900, VH = 390, GL = 70, GR = 830, T = 50, B = 300;

  function points(data) {
    var n = data.length;
    return data.map(function (d, i) {
      return { x: n === 1 ? (GL + GR) / 2 : 150 + i * (600 / (n - 1)), y: B - (B - T) * d.y };
    });
  }
  function pathD(p) {
    var d = 'M' + p[0].x + ' ' + p[0].y, i, a, b, mx;
    for (i = 1; i < p.length; i++) {
      a = p[i - 1]; b = p[i]; mx = (a.x + b.x) / 2;
      d += ' C' + mx + ' ' + a.y + ' ' + mx + ' ' + b.y + ' ' + b.x + ' ' + b.y;
    }
    return d;
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  function svgMarkup(data) {
    var p = points(data), o = '', k, y;
    o += '<svg class="eg-svg" viewBox="0 0 ' + VW + ' ' + VH + '" role="group" aria-label="Education timeline">';
    for (k = 0; k < 5; k++) {
      y = T + k * (B - T) / 4;
      o += '<line class="eg-grid" x1="' + GL + '" x2="' + GR + '" y1="' + y + '" y2="' + y + '"/>';
    }
    o += '<path class="eg-line" pathLength="1" d="' + pathD(p) + '"/>';
    p.forEach(function (pt, i) {
      var delay = (0.2 + (data.length > 1 ? i / (data.length - 1) : 0) * 1.5).toFixed(2);
      o += '<g transform="translate(' + pt.x + ' ' + pt.y + ')">' +
           '<g class="eg-dot" tabindex="0" role="button" data-i="' + i + '" style="--d:' + delay + 's" aria-label="' + esc(data[i].label + ': ' + data[i].name) + '">' +
           '<circle class="eg-hit" r="26"/><circle class="eg-ring" r="15"/><circle class="eg-pt" r="9"/></g></g>';
      o += '<text class="eg-lab" data-i="' + i + '" x="' + pt.x + '" y="' + (B + 62) + '" text-anchor="middle">' + esc(data[i].label) + '</text>';
    });
    return o + '</svg>';
  }
  function cardMarkup(d) {
    return '<article class="eg-card"><span class="eg-tag">EDUCATION</span>' +
      '<h3>' + esc(d.name) + '</h3><p class="eg-sub">' + esc(d.sub) + '</p>' +
      '<div class="eg-row"><p class="eg-head">' + esc(d.headline) + '</p>' +
      (d.stat ? '<p class="eg-stat">' + esc(d.stat) + '<small>' + esc(d.statLabel) + '</small></p>' : '') + '</div>' +
      '<ul>' + d.lines.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul></article>';
  }
  // </build>

  var host = document.getElementById('eduGraph');
  if (!host) return;

  var css = document.createElement('style');
  css.textContent =
    '#eduGraph{width:100%;max-width:900px;margin:0 auto;padding:.5rem 0 1rem;font-family:"Times New Roman",Times,serif}' +
    '.eg-svg{display:block;width:100%;height:auto;overflow:visible}' +
    '.eg-grid{stroke:rgba(255,255,255,.1);stroke-width:1;stroke-dasharray:3 6}' +
    '.eg-line{fill:none;stroke:#2dd4bf;stroke-width:2.6;stroke-linecap:butt;stroke-dasharray:1;stroke-dashoffset:1;' +
    'transition:stroke-dashoffset 1.8s cubic-bezier(.4,0,.2,1);filter:drop-shadow(0 0 6px rgba(45,212,191,.35))}' +
    '.eg-in .eg-line{stroke-dashoffset:0}' +
    '.eg-dot{cursor:pointer;outline:none}' +
    '.eg-hit{fill:transparent}' +
    '.eg-pt,.eg-ring{transform-box:fill-box;transform-origin:center;transform:scale(0);' +
    'transition:transform .5s cubic-bezier(.3,1.6,.5,1) var(--d,0s)}' +
    '.eg-pt{fill:#2dd4bf;stroke:#fff;stroke-width:2}' +
    '.eg-ring{fill:none;stroke:#5eead4;stroke-width:2;opacity:0}' +
    '.eg-in .eg-pt{transform:scale(1)}' +
    '.eg-in .eg-dot:hover .eg-pt{transform:scale(1.2);transition-delay:0s;transition-duration:.2s}' +
    '.eg-in .eg-dot.eg-active .eg-pt{transform:scale(1.15);transition-delay:0s;transition-duration:.25s}' +
    '.eg-in .eg-dot.eg-active .eg-ring,.eg-dot:focus-visible .eg-ring{opacity:.9;transform:scale(1.35);transition-delay:0s}' +
    '.eg-lab{fill:#8f98b4;font-size:27px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;transition:fill .25s}' +
    '.eg-lab.eg-active{fill:#fff}' +
    '.eg-hint{text-align:center;color:#8f98b4;font-style:italic;margin:.2rem 0 0;transition:opacity .3s}' +
    '.eg-hint.gone{opacity:0}' +
    '.eg-panel{display:grid;grid-template-rows:0fr;opacity:0;transition:grid-template-rows .5s ease,opacity .4s ease,margin .4s ease}' +
    '.eg-panel.open{grid-template-rows:1fr;opacity:1;margin-top:1.4rem}' +
    '.eg-inner{overflow:hidden;min-height:0}' +
    '.eg-card{background:#1f2523;border:1px solid rgba(255,255,255,.18);border-radius:14px;padding:1.4rem 1.6rem 1.3rem;color:#e8efed;' +
    'box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 4px 0 #111514,0 18px 30px rgba(0,0,0,.55)}' +
    '.eg-pop{animation:egpop .4s ease}' +
    '@keyframes egpop{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}' +
    '.eg-tag{display:inline-block;background:rgba(255,255,255,.12);color:#cfe9e4;font-style:italic;font-weight:700;' +
    'font-size:.8rem;padding:.12rem .6rem;border-radius:5px;margin-bottom:.7rem}' +
    '.eg-card h3{font-size:clamp(1.3rem,3.6vw,1.8rem);line-height:1.2}' +
    '.eg-sub{color:#9fb3ae;font-style:italic;margin:.25rem 0 1rem}' +
    '.eg-row{display:flex;justify-content:space-between;align-items:flex-end;gap:1rem;margin-bottom:.7rem}' +
    '.eg-head{color:#5eead4;font-weight:700;font-size:1.3rem}' +
    '.eg-stat{font-weight:700;font-size:2.2rem;line-height:1;text-align:right}' +
    '.eg-stat small{display:block;color:#9fb3ae;font-size:.8rem;font-style:italic;font-weight:400;margin-top:.2rem}' +
    '.eg-card ul{list-style:none}' +
    '.eg-card li{position:relative;padding-left:1.3rem;color:#e8efed;font-size:1.1rem}' +
    '.eg-card li::before{content:"";position:absolute;left:.1rem;top:.6em;width:6px;height:6px;background:#5eead4}' +
    '@media (prefers-reduced-motion:reduce){.eg-line,.eg-pt,.eg-ring,.eg-panel{transition:none}.eg-pop{animation:none}}';
  document.head.appendChild(css);

  host.innerHTML = svgMarkup(EDU) +
    '<p class="eg-hint" id="egHint">Tap a dot to see the details</p>' +
    '<div class="eg-panel" id="egPanel"><div class="eg-inner" id="egInner"></div></div>';

  var svg = host.querySelector('.eg-svg');
  var hint = document.getElementById('egHint');
  var panel = document.getElementById('egPanel');
  var inner = document.getElementById('egInner');
  var current = -1;

  function select(i) {
    var dots = svg.querySelectorAll('.eg-dot'), labs = svg.querySelectorAll('.eg-lab');
    hint.classList.add('gone');
    if (i === current) {                       /* click the same dot again: close */
      current = -1;
      panel.classList.remove('open');
      dots.forEach(function (d) { d.classList.remove('eg-active'); });
      labs.forEach(function (l) { l.classList.remove('eg-active'); });
      return;
    }
    current = i;
    dots.forEach(function (d, k) { d.classList.toggle('eg-active', k === i); });
    labs.forEach(function (l, k) { l.classList.toggle('eg-active', k === i); });
    inner.innerHTML = cardMarkup(EDU[i]);
    inner.firstChild.classList.add('eg-pop');
    panel.classList.add('open');
    setTimeout(function () { panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 350);
  }

  svg.addEventListener('click', function (e) {
    var d = e.target.closest ? e.target.closest('.eg-dot') : null;
    if (d) select(+d.getAttribute('data-i'));
  });
  svg.addEventListener('keydown', function (e) {
    var d = e.target.closest ? e.target.closest('.eg-dot') : null;
    if (d && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); select(+d.getAttribute('data-i')); }
  });

  /* draw the line when it scrolls into view */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) { svg.classList.add('eg-in'); }
  else {
    var io = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { svg.classList.add('eg-in'); io.disconnect(); }
    }, { threshold: 0.4 });
    io.observe(host);
  }
})();