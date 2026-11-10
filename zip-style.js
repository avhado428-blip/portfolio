/* White-and-gold zipper skin.
   - White fabric with black droplet pattern behind the zipper
   - White tape, gold teeth, gold slider with a ring
   - The opening follows YOUR existing zipper's own opening shape (read from its lines),
     so it opens exactly like it did before. Only the look changes. */
(function () {
  'use strict';

  // <build>
  function tooth(x, y, w, h) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="1.6" fill="url(#zzGold)" stroke="#8a6420" stroke-width=".6"/>';
  }

  /* densify a polyline into points about every 2px */
  function dense(pts) {
    var out = [], i, a, b, L, n, k;
    for (i = 0; i < pts.length - 1; i++) {
      a = pts[i]; b = pts[i + 1];
      L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      n = Math.max(1, Math.round(L / 2));
      for (k = 0; k < n; k++) out.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]);
    }
    if (pts.length) out.push(pts[pts.length - 1]);
    return out;
  }

  /* tape + teeth along a line; side -1 = tape sits above it, +1 = below it */
  function tapeAlong(raw, side, stitch) {
    var p = dense(raw), i, tx, ty, l, best = 0, s = 1, nn = [], o = '';
    if (p.length < 3) return '';
    for (i = 0; i < p.length; i++) {
      var a = p[Math.max(0, i - 2)], b = p[Math.min(p.length - 1, i + 2)];
      tx = b[0] - a[0]; ty = b[1] - a[1]; l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
      nn.push([tx, ty]);
      if (Math.abs(tx) > best) { best = Math.abs(tx); s = (ty * side > 0 ? 1 : -1) * (tx > 0 ? 1 : -1) * 0 + 0; }
    }
    /* choose the normal orientation from the flattest part of the line */
    var flat = 0, fi = 0;
    for (i = 0; i < nn.length; i++) if (Math.abs(nn[i][0]) > flat) { flat = Math.abs(nn[i][0]); fi = i; }
    var cand = [nn[fi][1], -nn[fi][0]];           /* (ty, -tx) */
    s = (cand[1] * side > 0) ? 1 : -1;
    var band = '', k, n, d = '', acc = 0, next = 0;
    for (i = 0; i < p.length; i++) {
      n = nn[i];
      var bx = p[i][0] + s * n[1] * 11, by = p[i][1] - s * n[0] * 11;
      band += (i ? 'L' : 'M') + bx.toFixed(1) + ' ' + by.toFixed(1);
    }
    o += '<path d="' + band + '" fill="none" stroke="url(#zzWhite)" stroke-width="14" stroke-linejoin="round"/>';
    o += '<path d="' + band + '" ' + stitch + '/>';
    for (i = 0; i < p.length; i++) {
      if (i) acc += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
      if (acc >= next) {
        next += 8;
        n = nn[i];
        var ang = Math.atan2(n[1], n[0]) * 180 / Math.PI;
        o += '<rect x="-2.75" y="-4" width="5.5" height="8" rx="1.6" fill="url(#zzGold)" stroke="#8a6420" stroke-width=".6" ' +
             'transform="translate(' + p[i][0].toFixed(1) + ' ' + p[i][1].toFixed(1) + ') rotate(' + ang.toFixed(1) + ')"/>';
      }
    }
    return o;
  }

  function quad(P0, P1, P2) {
    var out = [], k, t, a, b;
    for (k = 0; k <= 40; k++) {
      t = k / 40; a = (1 - t) * (1 - t); b = 2 * (1 - t) * t;
      out.push([a * P0[0] + b * P1[0] + t * t * P2[0], a * P0[1] + b * P1[1] + t * t * P2[1]]);
    }
    return out;
  }

  function build(px, y0, W, H, top, bot) {
    var o = '', x;
    var stitch = 'fill="none" stroke="#cdb98a" stroke-width="1" stroke-dasharray="4 4"';

    /* closed part: right of the slider */
    if (W - px > 0) {
      o += '<rect x="' + px + '" y="' + (y0 - 18) + '" width="' + (W - px) + '" height="14" fill="url(#zzWhite)"/>';
      o += '<rect x="' + px + '" y="' + (y0 + 4) + '" width="' + (W - px) + '" height="14" fill="url(#zzWhite)"/>';
      o += '<line x1="' + px + '" x2="' + W + '" y1="' + (y0 - 11) + '" y2="' + (y0 - 11) + '" ' + stitch + '/>';
      o += '<line x1="' + px + '" x2="' + W + '" y1="' + (y0 + 11) + '" y2="' + (y0 + 11) + '" ' + stitch + '/>';
      for (x = px + 4; x < W; x += 7) {
        o += tooth(x, y0 - 4.5, 6, 6.5) + tooth(x + 3.5, y0 - 2, 6, 6.5);
      }
    }

    /* open part: follows the old zipper's lines, or a default curve */
    if (px > 6) {
      if (!top || top.length < 2 || !bot || bot.length < 2) {
        var d = Math.min(H * 0.42, px * 0.6);
        top = quad([px, y0 - 4], [px * 0.4, y0 - 4], [0, y0 - 4 - d]);
        bot = quad([px, y0 + 4], [px * 0.4, y0 + 4], [0, y0 + 4 + d]);
      }
      o += tapeAlong(top, -1, stitch) + tapeAlong(bot, 1, stitch);
    }

    /* slider with the ring tab */
    o += '<g transform="translate(' + px + ' ' + y0 + ')">' +
      '<rect x="8" y="-8" width="30" height="16" rx="8" fill="url(#zzGold)" stroke="#8a6420" stroke-width="1"/>' +
      '<circle cx="36" cy="0" r="9" fill="url(#zzGold)" stroke="#8a6420" stroke-width="1"/>' +
      '<circle cx="36" cy="0" r="3.6" fill="#1b1608" stroke="#f3dc9a" stroke-width="1"/>' +
      '<path d="M-17,-17 L7,-12 L7,12 L-17,17 Z" fill="url(#zzGold)" stroke="#8a6420" stroke-width="1.2" stroke-linejoin="round"/>' +
      '<rect x="-11" y="-5" width="13" height="10" rx="2" fill="#1b1608" opacity=".55"/>' +
      '<path d="M-15,-14 L5,-10" stroke="#fff3c4" stroke-width="1.4" opacity=".8" stroke-linecap="round"/>' +
      '</g>';
    return o;
  }
  // </build>

  var wrap = document.getElementById('zipWrap');
  var pull = document.getElementById('zipPull');
  if (!wrap || !pull) return;
  var zTop = document.getElementById('zTop');
  var zBot = document.getElementById('zBot');

  /* white fabric with black droplets */
  var drop = function (cx, cy) {
    return '<path d="M' + cx + ',' + (cy + 15) + ' C' + (cx - 2) + ',' + (cy + 7) + ' ' + (cx - 7) + ',' + (cy + 5) + ' ' + (cx - 7) + ',' + cy +
           ' A7 7 0 1 1 ' + (cx + 7) + ',' + cy + ' C' + (cx + 7) + ',' + (cy + 5) + ' ' + (cx + 2) + ',' + (cy + 7) + ' ' + cx + ',' + (cy + 15) + 'Z" fill="#262626"/>';
  };
  var tile = '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="104" viewBox="0 0 50 104">' +
    '<rect width="50" height="104" fill="#fff"/>' + drop(12.5, 14) + drop(37.5, 66) + '</svg>';
  var bg = 'url("data:image/svg+xml,' + encodeURIComponent(tile) + '")';

  var NS = 'http://www.w3.org/2000/svg';
  var style = document.createElement('style');
  style.textContent =
    '#zipWrap{background:#fff ' + bg + ' !important;border:1px solid #d6d6d6 !important}' +
    '#zipWrap.open{background:none !important;border-color:transparent !important}' +
    '#zipWrap .zip-content{background:#03040b}' +
    '#zipWrap.open .zip-content{background:none}' +
    '#zipWrap .zip-svg,#zipWrap .zip-pull{opacity:0!important}' +
    '.zz{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:3;' +
    'overflow:hidden;filter:drop-shadow(0 3px 5px rgba(0,0,0,.45));transition:opacity .3s}' +
    '.zip-wrap.open .zz{opacity:0}';
  document.head.appendChild(style);

  var svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'zz');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML =
    '<defs>' +
    '<linearGradient id="zzGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9a6"/><stop offset=".45" stop-color="#e0aa3e"/><stop offset="1" stop-color="#a87820"/></linearGradient>' +
    '<linearGradient id="zzWhite" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d9d6cc"/></linearGradient>' +
    '</defs><g id="zzArt"></g>';
  wrap.appendChild(svg);
  var art = svg.querySelector('#zzArt');

  /* read the old zipper's own opening lines (viewBox 0-100, stretched to the box) */
  function readLine(el, W, H) {
    if (!el) return null;
    var raw = el.getAttribute('points');
    if (!raw) return null;
    var nums = raw.trim().split(/[\s,]+/).map(Number), pts = [], i, big = false;
    for (i = 0; i + 1 < nums.length; i += 2) {
      if (isNaN(nums[i]) || isNaN(nums[i + 1])) return null;
      if (nums[i] > 105 || nums[i + 1] > 105) big = true;
      pts.push([nums[i], nums[i + 1]]);
    }
    if (pts.length < 2) return null;
    if (!big) pts = pts.map(function (p) { return [p[0] * W / 100, p[1] * H / 100]; });
    return pts;
  }

  var last = '';
  function frame() {
    if (wrap.classList.contains('open')) { return; }
    var wr = wrap.getBoundingClientRect(), pr = pull.getBoundingClientRect();
    var W = wrap.clientWidth, H = wrap.clientHeight;
    if (W > 0 && H > 0) {
      var px = pr.left + pr.width / 2 - wr.left - wrap.clientLeft;
      var y0 = pr.top + pr.height / 2 - wr.top - wrap.clientTop;
      var key = [W, H, Math.round(px * 2), Math.round(y0),
                 zTop && zTop.getAttribute('points'), zBot && zBot.getAttribute('points')].join('|');
      if (key !== last) {
        last = key;
        svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
        art.innerHTML = build(px, y0, W, H, readLine(zTop, W, H), readLine(zBot, W, H));
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();