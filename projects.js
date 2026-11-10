/* Projects section (plain JS). Spotlight cards: a soft glow follows the cursor.
   Edit the PROJECTS list below. Leave github / live as "" to hide that button. */
(function () {
  'use strict';

  /* ================= YOUR PROJECTS (edit here) ================= */
  var PROJECTS = [
    {
      name: 'TrustLayer',
      tagline: 'AI forged document detector',
      desc: 'Upload a document and a forensics pipeline looks for signs of tampering and flags what looks suspicious. Built at Bit N Build \u201926 and reached the final round.',
      tags: ['FastAPI', 'Python', 'AI'],
      github: '',
      live: ''
    },
    {
      name: 'Artisan Fair-Price Platform',
      tagline: 'Fair prices for people who make things',
      desc: 'A multilingual website with a swipe-left, swipe-right interface so artisans in rural areas can use it with no learning curve. Built at the GDG Hackathon, NMIMS.',
      tags: ['Web', 'Multilingual', 'UX'],
      github: '',
      live: ''
    },
    {
      name: 'Lunar Shadow Water Detector',
      tagline: 'ISRO hackathon, with SSRP',
      desc: 'A model that maps a rover path into the Moon\u2019s permanently shadowed regions and uses DFSAR radar data to decide whether water ice is there.',
      tags: ['Python', 'DFSAR', 'ML'],
      github: '',
      live: ''
    },
    {
      name: 'Illusion',
      tagline: 'SIES GameJam, 3rd place',
      desc: 'A 2D and 3D mixed game about breaking the fourth wall. Your character is simulated into a fake world and has to find a way back to the real one.',
      tags: ['Godot', 'Game Dev'],
      github: '',
      live: ''
    }
  ];
  /* ============================================================== */

  var host = document.getElementById('projectCards');
  if (!host) return;

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  }

  function link(url, label) {
    return url
      ? '<a class="pj-link" href="' + esc(url) + '" target="_blank" rel="noopener">' + label + '</a>'
      : '';
  }

  host.innerHTML = PROJECTS.map(function (p, i) {
    var links = link(p.github, 'GitHub') + link(p.live, 'Live demo');
    return '<article class="pj-card">' +
      '<span class="pj-num">' + (i < 9 ? '0' : '') + (i + 1) + '</span>' +
      '<h3>' + esc(p.name) + '</h3>' +
      '<p class="pj-tagline">' + esc(p.tagline) + '</p>' +
      '<p class="pj-desc">' + esc(p.desc) + '</p>' +
      '<ul class="pj-tags">' + p.tags.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
      (links ? '<div class="pj-links">' + links + '</div>' : '') +
      '</article>';
  }).join('');

  /* the spotlight: one listener for the whole grid, no animation loop */
  host.addEventListener('pointermove', function (e) {
    var card = e.target.closest ? e.target.closest('.pj-card') : null;
    if (!card) return;
    var r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });
})();