document.documentElement.classList.add("js");

/* ---------- YOUR USERNAMES ---------- */
const GITHUB = "avhado428-blip";
const LEETCODE = "OmkarAvhad";
/* ------------------------------------ */

const REDUCE = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Starry background (drifts with scroll) ---------- */
(function () {
  const cv = document.getElementById("stars");
  const ctx = cv.getContext("2d");
  let W, H, stars = [], shoot = [];

  function resize() {
    const d = Math.min(window.devicePixelRatio || 1, 1);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * d; cv.height = H * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
    const n = Math.min(140, Math.round((W * H) / 9000));
    stars = Array.from({ length: n }, function () {
      return { x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.2 + 0.4,
               d: Math.random() * 0.8 + 0.1, p: Math.random() * 6.28 };
    });
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    const sy = window.scrollY;
    for (const s of stars) {
      if (!REDUCE) { s.x += s.d * 0.06; if (s.x > W) s.x = 0; }
      const y = (((s.y - sy * s.d * 0.6) % H) + H) % H;
      const tw = 0.35 + 0.65 * Math.abs(Math.sin(s.p + t * 0.001 * (1 + s.d * 2)));
      ctx.globalAlpha = tw * (0.4 + s.d * 0.6);
      ctx.fillStyle = s.d > 0.7 ? "#cfe3ff" : "#ffffff";
      ctx.fillRect(s.x, y, s.r * 1.6, s.r * 1.6);
    }
    ctx.globalAlpha = 1;
    if (!REDUCE) {
      if (Math.random() < 0.004 && shoot.length < 2) {
        shoot.push({ x: Math.random() * W, y: Math.random() * H * 0.5,
                     vx: 7 + Math.random() * 4, vy: 3 + Math.random() * 2, l: 0 });
      }
      shoot = shoot.filter(function (m) { return m.l < 40; });
      for (const m of shoot) {
        m.x += m.vx; m.y += m.vy; m.l++;
        ctx.strokeStyle = "rgba(255,255,255," + (1 - m.l / 40) + ")";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - m.vx * 6, m.y - m.vy * 6); ctx.stroke();
      }
    }
  }

  resize();
  let rz;
  window.addEventListener("resize", function () { clearTimeout(rz); rz = setTimeout(function () { resize(); draw(0); }, 120); });
  if (REDUCE) {
    draw(0);
    window.addEventListener("scroll", function () { draw(0); }, { passive: true });
  } else {
    (function loop(t) { draw(t); requestAnimationFrame(loop); })(0);
  }
})();

/* ---------- Scroll progress bar ---------- */
(function () {
  const bar = document.getElementById("progress");
  window.addEventListener("scroll", function () {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = "scaleX(" + (h > 0 ? window.scrollY / h : 0) + ")";
  }, { passive: true });
})();

/* ---------- Reveal sections on scroll ---------- */
(function () {
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
})();

/* ---------- GitHub heatmap ---------- */
(function () {
  // drawn as a grid (same dark empty cells + orange levels as LeetCode) so the orange stands out
  const img = document.getElementById("ghHeat");
  const box = document.createElement("div");
  box.id = "ghHeat"; box.className = "grid"; box.textContent = "Loading...";
  img.replaceWith(box);
  function fallback() {
    const i = document.createElement("img");
    i.id = "ghHeat"; i.alt = "GitHub contributions";
    i.src = "https://ghchart.rshah.org/ff9a3d/" + GITHUB;
    box.replaceWith(i);
  }
  fetch("https://github-contributions-api.jogruber.de/v4/" + GITHUB + "?y=last")
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      const days = data && data.contributions;
      if (!days || !days.length) throw new Error("no data");
      box.textContent = "";
      const first = new Date(days[0].date + "T00:00:00").getDay();
      for (let k = 0; k < first; k++) { const pad = document.createElement("i"); pad.style.visibility = "hidden"; box.appendChild(pad); }
      days.forEach(function (d) {
        const c = document.createElement("i");
        c.className = d.level > 0 ? "l" + d.level : "";
        c.title = d.date + ": " + d.count + " contributions";
        box.appendChild(c);
      });
    })
    .catch(fallback);
})();

/* ---------- LeetCode heatmap ---------- */
(function () {
  const el = document.getElementById("lcHeat");

  // free community servers, tried one after another until one answers
  const SOURCES = [
    "https://alfa-leetcode-api.onrender.com/" + LEETCODE + "/calendar",
    "https://leetcode-api-faisalshohag.vercel.app/" + LEETCODE,
    "https://leetcode-stats-api.herokuapp.com/" + LEETCODE
  ];

  function getJSON(url, ms) {
    const ctl = new AbortController();
    const t = setTimeout(function () { ctl.abort(); }, ms);
    return fetch(url, { signal: ctl.signal })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .finally(function () { clearTimeout(t); });
  }

  function toCalendar(data) {
    let cal = data && data.submissionCalendar;
    if (typeof cal === "string") cal = JSON.parse(cal);
    if (!cal || typeof cal !== "object") throw new Error("no calendar");
    return cal;
  }

  function draw(cal) {
    const byDay = {};
    for (const ts in cal) {
      const d = new Date(ts * 1000).toISOString().slice(0, 10);
      byDay[d] = (byDay[d] || 0) + cal[ts];
    }
    el.style.display = "";
    el.innerHTML = "";
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 52 * 7 - today.getDay());
    for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
      const n = byDay[d.toISOString().slice(0, 10)] || 0;
      const cell = document.createElement("i");
      cell.className = n === 0 ? "" : n < 2 ? "l1" : n < 4 ? "l2" : n < 7 ? "l3" : "l4";
      cell.title = d.toDateString() + ": " + n + " submissions";
      el.appendChild(cell);
    }
  }

  function fail() {
    el.style.display = "block";
    el.innerHTML =
      "<p>The LeetCode servers did not answer. " +
      '<a href="https://leetcode.com/u/' + LEETCODE + '/" target="_blank" rel="noopener">Open my LeetCode profile</a></p>' +
      '<button class="btn" id="lcRetry" style="margin-top:.8rem">Try again</button>';
    document.getElementById("lcRetry").onclick = load;
  }

  async function load() {
    el.style.display = "block";
    el.textContent = "Loading...";
    for (let i = 0; i < SOURCES.length; i++) {
      try {
        // the first free server may be asleep, so give it more time
        const data = await getJSON(SOURCES[i], i === 0 ? 30000 : 12000);
        draw(toCalendar(data));
        return;
      } catch (e) { /* try the next server */ }
    }
    fail();
  }

  load();
})();

/* ---------- Zipper: the visitor drags it open (chain + ring with physics) ---------- */
(function () {
  const wrap = document.getElementById("zipWrap");
  const content = document.getElementById("zipContent");
  const pull = document.getElementById("zipPull");
  const ringHit = document.getElementById("zipRing");
  const chainCv = document.getElementById("zipChain");
  const cctx = chainCv.getContext("2d");
  const svg = document.getElementById("zipSvg");
  const hint = document.getElementById("zipHint");
  const $ = function (id) { return document.getElementById(id); };
  const tapeT = $("zTapeT"), tapeB = $("zTapeB"), tapeC = $("zTapeC");
  const stT = $("zStT"), stB = $("zStB"), stC1 = $("zStC1"), stC2 = $("zStC2");
  const teethT = $("zTeethT"), teethB = $("zTeethB"), teethC = $("zTeethC");
  const pat = $("teethPat");

  const OBSERVED = "Observed. The streak is alive. (Probably.)";

  const PULL_W = 30;             // must match .zip-pull width in style.css
  const S = 0.6;                 // how fast the gap widens behind the pull
  const PMAX = 100 + 50 / S;     // total travel so the right end finishes opening
  const TEETH = 6;               // half height of the teeth row (px)
  const TAPE = 12;               // tape thickness beside the teeth (px)
  const STITCH = TEETH + 6;      // distance of the stitches from the centre (px)
  let P = 0, opened = false, dragging = false, W = 0, H = 0, grabDX = 0, tug = null, VW = window.innerWidth, VH = window.innerHeight, inView = true, needInit = false;
  const cur = { x: 0, y: 0, vx: 0, vy: 0, on: false };   // hovering cursor

  /* ---------- chain physics (verlet) ---------- */
  const N = 6;            // number of points after the anchor
  const L = 10;           // link length
  const TABL = 34;        // length of the ring tab
  const GRAV = 0.65, DAMP = 0.985;
  let pts = [], dpr = 1;
  function segLen(i) { return i === N ? TABL : L; }

  function anchor() {
    const r = pull.getBoundingClientRect();             // page coordinates: the chain is free of the card
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 + 15 };
  }
  function initChain() {
    const a = anchor(); pts = [];
    for (let i = 0; i <= N; i++) {
      const y = a.y + (i === N ? (N - 1) * L + TABL : i * L);
      pts.push({ x: a.x, y: y, ox: a.x, oy: y });
    }
  }
  function simulate() {
    const a = anchor();
    pts[0].x = a.x; pts[0].y = a.y; pts[0].ox = a.x; pts[0].oy = a.y;
    for (let i = 1; i <= N; i++) {
      const p = pts[i];
      const vx = (p.x - p.ox) * DAMP, vy = (p.y - p.oy) * DAMP;
      p.ox = p.x; p.oy = p.y;
      p.x += vx; p.y += vy + GRAV;
    }
    if (tug) {                                   // ring grabbed: it follows the hand
      const e = pts[N];
      e.x += (tug.x - e.x) * 0.25; e.y += (tug.y - e.y) * 0.25;
    }
    if (cur.on && !dragging) {                   // cursor brushes the chain, no grab needed
      const R = 48;
      for (let i = 1; i <= N; i++) {
        const p = pts[i];
        const dx = p.x - cur.x, dy = p.y - cur.y;
        const d = Math.hypot(dx, dy);
        if (d < R) {
          const f = 1 - d / R;
          const nx = d > 0.01 ? dx / d : 1, ny = d > 0.01 ? dy / d : 0;
          p.x += nx * f * 2.4 + cur.vx * 0.14 * f;
          p.y += ny * f * 2.4 + cur.vy * 0.14 * f;
        }
      }
    }
    cur.vx *= 0.8; cur.vy *= 0.8;
    for (let k = 0; k < 12; k++) {
      for (let i = 1; i <= N; i++) {
        const A = pts[i - 1], B = pts[i];
        let dx = B.x - A.x, dy = B.y - A.y;
        const d = Math.hypot(dx, dy) || 0.0001;
        const diff = (d - segLen(i)) / d;
        if (i === 1) { B.x -= dx * diff; B.y -= dy * diff; }
        else {
          A.x += dx * diff * 0.5; A.y += dy * diff * 0.5;
          B.x -= dx * diff * 0.5; B.y -= dy * diff * 0.5;
        }
      }
    }
    for (let i = 1; i <= N; i++) {               // stay inside the zipper box
      const p = pts[i];
      p.x = Math.max(4, Math.min(VW - 4, p.x));
      p.y = Math.max(4, Math.min(VH - 4, p.y));
    }
  }
  function metal(c, w, col) { c.lineWidth = w; c.strokeStyle = col; }
  function render() {
    cctx.clearRect(0, 0, VW, VH);
    // chain links: alternate flat and edge-on, like a real ball/link chain
    for (let i = 1; i < N; i++) {
      const A = pts[i - 1], B = pts[i];
      const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
      const ang = Math.atan2(B.y - A.y, B.x - A.x);
      const flat = i % 2 === 1;
      cctx.save();
      cctx.translate(mx, my); cctx.rotate(ang);
      cctx.beginPath();
      cctx.ellipse(0, 0, L * 0.78, flat ? 3.8 : 2, 0, 0, Math.PI * 2);
      metal(cctx, 3.6, "#5a410d"); cctx.stroke();
      metal(cctx, 2.2, flat ? "#e6c565" : "#c29a3a"); cctx.stroke();
      cctx.restore();
    }
    // ring tab
    const A = pts[N - 1], B = pts[N];
    const ang = Math.atan2(B.y - A.y, B.x - A.x);
    const cx = (A.x + B.x) / 2, cy = (A.y + B.y) / 2;
    cctx.save();
    cctx.shadowColor = "rgba(0,0,0,.55)"; cctx.shadowBlur = 8; cctx.shadowOffsetY = 4;
    cctx.translate(cx, cy); cctx.rotate(ang - Math.PI / 2);
    const rw = 22, rh = TABL + 8;
    cctx.beginPath();
    if (cctx.roundRect) cctx.roundRect(-rw / 2, -rh / 2, rw, rh, 9);
    else cctx.rect(-rw / 2, -rh / 2, rw, rh);
    metal(cctx, 7.5, "#5a410d"); cctx.stroke();
    cctx.shadowColor = "transparent";
    metal(cctx, 5, "#d9b556"); cctx.stroke();
    metal(cctx, 1.6, "#fff3c4"); cctx.translate(-1.2, -1.2); cctx.stroke();   // highlight
    cctx.restore();
    // keep the invisible grab area on the ring
    ringHit.style.transform = "translate(" + (cx - 23).toFixed(1) + "px," + (cy - 29).toFixed(1) + "px)";
  }
  function frame() {
    if (wrap.classList.contains("open")) { chainCv.style.display = "none"; ringHit.style.display = "none"; return; }
    if (inView) {
      if (needInit) { initChain(); needInit = false; ringHit.style.display = ""; }
      simulate(); render();
    } else {
      if (!needInit) { needInit = true; cctx.clearRect(0, 0, VW, VH); ringHit.style.display = "none"; }
    }
    requestAnimationFrame(frame);
  }
  function sizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    VW = window.innerWidth; VH = window.innerHeight;
    chainCv.width = VW * dpr; chainCv.height = VH * dpr;
    cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* ---------- zipper drawing ---------- */
  function fmt(a, dy) {
    return a.map(function (q) { return q[0].toFixed(1) + "," + (q[1] + dy).toFixed(1); }).join(" ");
  }
  function hline(el, x1, x2, y) {
    el.setAttribute("x1", x1); el.setAttribute("x2", x2);
    el.setAttribute("y1", y); el.setAttribute("y2", y);
  }
  function draw(p) {
    if (!W || !H) return;
    const px = Math.min(p, 100);
    const X = (px / 100) * W, cy = H / 2, NN = 50;
    const top = [], bot = [], clipTop = [], clipBot = [];
    for (let i = 0; i <= NN; i++) {
      const xp = (px * i) / NN;
      const h = Math.min(50, Math.max(0, (p - xp) * S));
      const x = (xp / 100) * W, dy = (h / 100) * H;
      top.push([x, cy - dy]); bot.push([x, cy + dy]);
      clipTop.push(xp + "% " + (50 - h) + "%");
      clipBot.push(xp + "% " + (50 + h) + "%");
    }
    content.style.clipPath = "polygon(" + clipTop.concat(clipBot.reverse()).join(",") + ")";
    tapeT.setAttribute("points", fmt(top, 0) + " " + fmt(top.slice().reverse(), -(TEETH + TAPE)));
    tapeB.setAttribute("points", fmt(bot, 0) + " " + fmt(bot.slice().reverse(), TEETH + TAPE));
    stT.setAttribute("points", fmt(top, -STITCH));
    stB.setAttribute("points", fmt(bot, STITCH));
    teethT.setAttribute("points", fmt(top, -TEETH / 2));
    teethB.setAttribute("points", fmt(bot, TEETH / 2));
    const th = TEETH + TAPE, cw = Math.max(0, W - X);
    tapeC.setAttribute("x", X); tapeC.setAttribute("y", cy - th);
    tapeC.setAttribute("width", cw + 1); tapeC.setAttribute("height", th * 2);
    hline(stC1, X, W, cy - STITCH);
    hline(stC2, X, W, cy + STITCH);
    teethC.setAttribute("x", X); teethC.setAttribute("y", cy - TEETH);
    teethC.setAttribute("width", cw); teethC.setAttribute("height", TEETH * 2);
    pull.style.left = "calc(" + px + "% - " + (px / 100 * PULL_W) + "px)";
  }

  let started = false;
  function layout() {
    const r = wrap.getBoundingClientRect();
    W = r.width; H = r.height;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    pat.setAttribute("patternTransform", "translate(0 " + (H / 2 - TEETH) + ")");
    sizeCanvas();
    draw(P);
    if (!started) { started = true; initChain(); requestAnimationFrame(frame); }
  }

  function animateTo(target, dur, done) {
    const from = P, t0 = performance.now();
    (function step(t) {
      const k = Math.min(1, (t - t0) / dur);
      P = from + (target - from) * (1 - Math.pow(1 - k, 3));
      draw(P);
      if (k < 1) requestAnimationFrame(step); else if (done) done();
    })(t0);
  }
  function finish() {
    opened = true; tug = null;
    hint.classList.add("gone");
    /* the punchline: once the box is observed, the streak is "alive" */
    setTimeout(function () {
      hint.textContent = OBSERVED;
      hint.style.animation = "none";
      hint.classList.remove("gone");
    }, 600);
    animateTo(PMAX, 1000, function () { content.style.clipPath = "none"; wrap.classList.add("open"); });
  }

  if (REDUCE) {
    opened = true;
    hint.textContent = OBSERVED;
    wrap.classList.add("open"); content.style.clipPath = "none";
    return;
  }

  layout();
  if (window.ResizeObserver) new ResizeObserver(layout).observe(wrap);
  else window.addEventListener("resize", layout);

  /* ---------- dragging: grab the slider OR the ring ---------- */
  function startDrag(e) {
    if (opened) return;
    dragging = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    const r = wrap.getBoundingClientRect();
    const sliderCx = (P / 100) * (r.width - PULL_W) + PULL_W / 2;
    grabDX = (e.clientX - r.left) - sliderCx;
    e.preventDefault();
  }
  function moveDrag(e) {
    if (!dragging) return;
    const r = wrap.getBoundingClientRect();
    const usable = r.width - PULL_W;
    P = Math.max(0, Math.min(100, ((e.clientX - r.left - grabDX - PULL_W / 2) / usable) * 100));
    // the ring follows the hand a little, so you can fling the chain around
    tug = (e.currentTarget === ringHit)
      ? { x: e.clientX, y: Math.min(VH - 6, Math.max(6, e.clientY)) }
      : null;
    draw(P);
    if (P >= 92) { dragging = false; finish(); }
  }
  function release() {
    if (!dragging) return;
    dragging = false; tug = null;
    if (P > 45) finish(); else animateTo(0, 400);
  }
  // the chain lives on a page-wide overlay, so it can swing out of the card in every direction
  document.body.appendChild(chainCv);
  document.body.appendChild(ringHit);
  window.addEventListener("resize", sizeCanvas);
  if (window.IntersectionObserver) new IntersectionObserver(function (es) { inView = es[0].isIntersecting; }).observe(wrap);
  window.addEventListener("pointermove", function (e) {
    if (e.pointerType === "touch") return;
    const x = e.clientX, y = e.clientY;
    if (cur.on) { cur.vx = x - cur.x; cur.vy = y - cur.y; }
    cur.x = x; cur.y = y; cur.on = true;
  }, { passive: true });
  document.documentElement.addEventListener("pointerleave", function () { cur.on = false; });

  [pull, ringHit].forEach(function (el) {
    el.addEventListener("pointerdown", startDrag);
    el.addEventListener("pointermove", moveDrag);
    el.addEventListener("pointerup", release);
    el.addEventListener("pointercancel", release);
  });
  pull.addEventListener("keydown", function (e) {
    if (!opened && (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ")) { e.preventDefault(); finish(); }
  });
})();

/* ---------- Achievements slider: auto-drift + arrows + flipping pop-up, and vibrating chips ---------- */
(function () {
  const marquee = document.getElementById("marquee");
  const track = document.getElementById("track");
  const modal = document.getElementById("achModal");
  const originals = Array.from(track.children);
  const N = originals.length;

  // duplicate the cards once so the loop never ends
  originals.forEach(function (c) {
    const k = c.cloneNode(true);
    k.setAttribute("aria-hidden", "true");
    track.appendChild(k);
  });
  Array.from(track.children).forEach(function (c, i) {
    c.setAttribute("role", "button");
    c.setAttribute("tabindex", i < N ? "0" : "-1");
  });

  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SPEED = 45;                       // px per second
  let pos = 0, last = 0, hover = false, holdUntil = 0, modalOpen = false;
  let HALF = 0;
  function half() { return HALF || (HALF = track.scrollWidth / 2); }
  window.addEventListener("resize", function () { HALF = 0; });
  function hold(ms) { holdUntil = Date.now() + ms; }
  function step() { return track.children[1].offsetLeft - track.children[0].offsetLeft; }

  function tick(t) {
    const dt = Math.min(0.05, (t - last) / 1000); last = t;
    if (!reduce && !hover && !modalOpen && Date.now() > holdUntil) {
      if (Math.abs(marquee.scrollLeft - pos) > 2) pos = marquee.scrollLeft;
      pos += SPEED * dt;
      if (pos >= half()) pos -= half();
      const base = Math.floor(pos);
      marquee.scrollLeft = base;
      track.style.transform = "translate3d(" + (-(pos - base)).toFixed(2) + "px,0,0)";
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(function (t) { last = t; tick(t); });

  // user is touching / hovering: stop drifting so they can look around
  marquee.addEventListener("mouseenter", function () { hover = true; });
  marquee.addEventListener("mouseleave", function () { hover = false; pos = marquee.scrollLeft; });
  ["pointerdown", "touchstart", "wheel", "keydown"].forEach(function (ev) {
    marquee.addEventListener(ev, function () { hold(3500); }, { passive: true });
  });

  // keep the loop seamless after manual scrolling
  let wrapT;
  marquee.addEventListener("scroll", function () {
    clearTimeout(wrapT);
    wrapT = setTimeout(function () {
      const h = half();
      if (marquee.scrollLeft >= h) marquee.scrollLeft -= h;
      else if (marquee.scrollLeft <= 1) marquee.scrollLeft += h;
      pos = marquee.scrollLeft;
    }, 140);
  }, { passive: true });

  function go(dir) {
    hold(3500);
    const st = step();
    if (dir < 0 && marquee.scrollLeft < st + 2) marquee.scrollLeft += half();   // jump to the copy, then glide back
    marquee.scrollBy({ left: dir * st, behavior: "smooth" });
  }
  document.getElementById("achPrev").addEventListener("click", function () { go(-1); });
  document.getElementById("achNext").addEventListener("click", function () { go(1); });

  // ---- pop-up: card flies to the centre, flips, shows the description ----
  let opener = null, flipTimer, closeTimer;

  function openCard(card) {
    clearTimeout(closeTimer);
    const src = originals[Array.prototype.indexOf.call(track.children, card) % N];
    opener = card;
    const from = card.getBoundingClientRect();

    modal.innerHTML = "";
    const fly = document.createElement("div");  fly.className = "ach-fly";
    const flip = document.createElement("div"); flip.className = "ach-flip";

    // front = a copy of the card you clicked
    const front = document.createElement("div");
    front.className = "ach-face ach-front";
    Array.from(src.children).forEach(function (c) { front.appendChild(c.cloneNode(true)); });

    // back = title + description
    const back = document.createElement("div");
    back.className = "ach-face ach-back";
    const h = document.createElement("h3");
    h.id = "achModalTitle";
    h.textContent = src.querySelector("h3").textContent;
    const d = document.createElement("p");
    d.className = "ach-desc";
    d.textContent = src.getAttribute("data-desc") || "";
    back.append(h, d);
    const ph = src.querySelector(".phrase");
    if (ph) {
      const p2 = document.createElement("p");
      p2.className = "phrase";
      p2.textContent = ph.textContent;
      back.appendChild(p2);
    }

    const tip = document.createElement("div");
    tip.className = "ach-tip";
    tip.textContent = "Click anywhere to close";

    flip.append(front, back);
    fly.appendChild(flip);
    modal.append(fly, tip);

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    modalOpen = true;

    // start the card exactly where the clicked card sits, then fly to centre
    const to = fly.getBoundingClientRect();
    const dx = (from.left + from.width / 2) - (to.left + to.width / 2);
    const dy = (from.top + from.height / 2) - (to.top + to.height / 2);
    const sc = from.width / to.width;
    fly.style.transition = "none";
    fly.style.transform = "translate(" + dx + "px," + dy + "px) scale(" + sc + ")";
    fly.getBoundingClientRect();                       // force reflow
    requestAnimationFrame(function () {
      modal.classList.add("show");
      fly.style.transition = "";
      fly.style.transform = "none";
    });

    // once it has landed, flip it over
    clearTimeout(flipTimer);
    flipTimer = setTimeout(function () { flip.classList.add("flipped"); }, reduce ? 0 : 650);
  }

  function closeCard() {
    if (!modalOpen) return;
    clearTimeout(flipTimer);
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    modalOpen = false;
    hold(1500);
    closeTimer = setTimeout(function () { modal.classList.remove("open"); modal.innerHTML = ""; }, 450);
    if (opener && opener.focus) opener.focus({ preventScroll: true });
  }

  track.addEventListener("click", function (e) {
    const card = e.target.closest ? e.target.closest(".slide") : null;
    if (card) openCard(card);
  });
  track.addEventListener("keydown", function (e) {
    const card = e.target.closest ? e.target.closest(".slide") : null;
    if (card && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openCard(card); }
  });
  modal.addEventListener("click", closeCard);          // click anywhere closes
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeCard(); });

  document.querySelectorAll("#chips span").forEach(function (c) {
    c.style.setProperty("--d", "-" + (Math.random() * 0.4).toFixed(2) + "s");
  });
})();

/* ---------- Wordle ---------- */
const WORDS = ["logic","array","stack","queue","class","debug","build","hacks","godot","unity","token","chain","brace","mutex","slice","float","index","parse","patch","merge"];
let answer, row, col, guesses, over;
const board = document.getElementById("board");
const msg = document.getElementById("msg");
const kb = document.getElementById("kb");

function newGame() {
  answer = WORDS[Math.floor(Math.random() * WORDS.length)];
  row = 0; col = 0; over = false;
  guesses = Array.from({ length: 6 }, function () { return Array(5).fill(""); });
  msg.textContent = "";
  board.innerHTML = "";
  for (let r = 0; r < 6; r++) {
    const rowEl = document.createElement("div");
    rowEl.className = "row";
    for (let c = 0; c < 5; c++) {
      const t = document.createElement("div");
      t.className = "tile";
      rowEl.appendChild(t);
    }
    board.appendChild(rowEl);
  }
  kb.innerHTML = "";
  ["qwertyuiop", "asdfghjkl", "<zxcvbnm>"].forEach(function (line) {
    const k = document.createElement("div");
    k.className = "krow";
    line.split("").forEach(function (ch) {
      const b = document.createElement("button");
      b.className = "key";
      b.dataset.k = ch;
      b.textContent = ch === "<" ? "Enter" : ch === ">" ? "Del" : ch;
      b.onclick = function () { press(ch === "<" ? "Enter" : ch === ">" ? "Backspace" : ch); };
      k.appendChild(b);
    });
    kb.appendChild(k);
  });
}

function tile(r, c) { return board.children[r].children[c]; }

function press(key) {
  if (over) return;
  if (key === "Backspace") {
    if (col > 0) { col--; guesses[row][col] = ""; tile(row, col).textContent = ""; }
  } else if (key === "Enter") {
    if (col < 5) { msg.textContent = "Not enough letters"; return; }
    submit();
  } else if (/^[a-z]$/.test(key) && col < 5) {
    guesses[row][col] = key;
    tile(row, col).textContent = key;
    col++;
    msg.textContent = "";
  }
}

function submit() {
  const guess = guesses[row].join("");
  const left = answer.split("");
  const result = Array(5).fill("absent");
  for (let i = 0; i < 5; i++) {
    if (guess[i] === answer[i]) { result[i] = "correct"; left[i] = null; }
  }
  for (let i = 0; i < 5; i++) {
    if (result[i] === "correct") continue;
    const idx = left.indexOf(guess[i]);
    if (idx !== -1) { result[i] = "present"; left[idx] = null; }
  }
  const rank = { absent: 1, present: 2, correct: 3 };
  for (let i = 0; i < 5; i++) {
    tile(row, i).classList.add(result[i]);
    const key = kb.querySelector('[data-k="' + guess[i] + '"]');
    const cur = key.classList.contains("correct") ? "correct" : key.classList.contains("present") ? "present" : key.classList.contains("absent") ? "absent" : null;
    if (!cur || rank[result[i]] > rank[cur]) {
      key.classList.remove("absent", "present", "correct");
      key.classList.add(result[i]);
    }
  }
  if (guess === answer) { msg.textContent = "You got it!"; over = true; return; }
  row++; col = 0;
  if (row === 6) { msg.textContent = "The word was " + answer.toUpperCase(); over = true; }
}

document.addEventListener("keydown", function (e) {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.target.closest && e.target.closest("button, [role=button]") && (e.key === "Enter" || e.key === " ")) return;
  press(e.key.length === 1 ? e.key.toLowerCase() : e.key);
});
document.getElementById("restart").onclick = newGame;
newGame();

/* ---------- Music: keeps playing in the background once started ---------- */
(function () {
  const song = document.getElementById("song");
  song.volume = 0.8;
  function toggle() { if (song.paused) song.play().catch(function () {}); else song.pause(); }
  document.getElementById("playBtn").onclick = toggle;
  
  song.addEventListener("play", function () { document.body.classList.add("playing"); });
  song.addEventListener("pause", function () { document.body.classList.remove("playing"); });
  const bar = document.querySelector(".pc-bar i");
  song.addEventListener("timeupdate", function () {
    if (bar && song.duration) bar.style.width = (song.currentTime / song.duration * 100) + "%";
  });
})();


/* ---------- Name: compact TechText (dashed outline, selection frame, drag + kick) ---------- */
(function () {
  const box = document.getElementById("nameTech");
  if (!box) return;
  const cv = box.querySelector("canvas"), ctx = cv.getContext("2d");
  const TEXT = "Omkar Avhad", WEIGHT = 700, MAXSIZE = 150, SPRING = 320, ACCENT = "#ff6b57", INK = "#ffffff";
  let W = 1, H = 1, size = 100, base = 0, glyphs = [], vis = false, raf = 0, last = 0, clock = 0, pulse = 0, dragging = -1;
  const ptr = { x: 0, y: 0, inside: false }, grab = { x: 0, y: 0 }, press = { x: 0, y: 0, t: 0, i: -1 };
  const fr = { x1: 0, y1: 0, x2: 0, y2: 0, a: 0, i: -1 };
  const kicks = [];
  function setf(s) {
    ctx.font = WEIGHT + " " + s + "px " + (getComputedStyle(box).fontFamily || "serif");
    if ("letterSpacing" in ctx) ctx.letterSpacing = (-0.03 * s) + "px";
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  }
  function hash(a, b) { let h = (a * 374761393 + b * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }

  function layout() {
    W = Math.max(1, box.clientWidth); H = Math.max(1, box.clientHeight);
    const d = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
    setf(MAXSIZE);
    let m = ctx.measureText(TEXT);
    const fit = Math.min(1, (W * 0.94) / Math.max(1, m.actualBoundingBoxLeft + m.actualBoundingBoxRight),
                            (H * 0.74) / Math.max(1, m.actualBoundingBoxAscent + m.actualBoundingBoxDescent));
    size = MAXSIZE * fit; setf(size);
    m = ctx.measureText(TEXT);
    const iw = m.actualBoundingBoxLeft + m.actualBoundingBoxRight, ih = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
    const x0 = (W - iw) / 2 + m.actualBoundingBoxLeft;
    base = (H - ih) / 2 + m.actualBoundingBoxAscent;
    const old = glyphs; glyphs = []; let prefix = "";
    Array.from(TEXT).forEach(function (ch) {
      prefix += ch;
      const own = ctx.measureText(ch), gx = x0 + ctx.measureText(prefix).width - own.width;
      if (!ch.trim()) return;
      const k = old[glyphs.length];
      glyphs.push({ ch: ch, x: gx, off: k ? k.off : { x: 0, y: 0 }, vel: k ? k.vel : { x: 0, y: 0 }, o: k ? k.o : 0,
        box: { x1: gx - own.actualBoundingBoxLeft, y1: base - own.actualBoundingBoxAscent,
               x2: gx + own.actualBoundingBoxRight, y2: base + own.actualBoundingBoxDescent } });
    });
    wake();
  }
  function glyphAt(x) {
    let best = -1, bd = Infinity;
    glyphs.forEach(function (g, i) {
      const x1 = g.box.x1 + g.off.x, x2 = g.box.x2 + g.off.x, d = x < x1 ? x1 - x : x > x2 ? x - x2 : 0;
      if (d < bd) { bd = d; best = i; }
    });
    return bd < 28 ? best : -1;
  }
  function dashed(g, ox, oy, a) {
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.lineJoin = "round";
    ctx.setLineDash([4, 2]); ctx.strokeText(g.ch, g.x + ox, base + oy); ctx.restore();
  }
  function perim(d, w, h) {
    const P = 2 * (w + h); d = ((d % P) + P) % P;
    if (d < w) return [fr.x1 + d, fr.y1, 0, -1];
    d -= w; if (d < h) return [fr.x2, fr.y1 + d, 1, 0];
    d -= h; if (d < w) return [fr.x2 - d, fr.y2, 0, 1];
    d -= w; return [fr.x1, fr.y2 - d, -1, 0];
  }
  function drawFrame() {
    const g = glyphs[fr.i];
    if (!g || fr.a < 0.01) return;
    const a = fr.a, w = fr.x2 - fr.x1, h = fr.y2 - fr.y1;
    ctx.save();
    ctx.fillStyle = ACCENT; ctx.strokeStyle = ACCENT; ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5 * a; ctx.strokeRect(Math.round(fr.x1) + 0.5, Math.round(fr.y1) + 0.5, w, h);
    ctx.globalAlpha = 0.95 * a;
    [[fr.x1, fr.y1], [fr.x2, fr.y1], [fr.x2, fr.y2], [fr.x1, fr.y2]].forEach(function (c) { ctx.fillRect(Math.round(c[0]) - 2, Math.round(c[1]) - 2, 5, 5); });
    for (let k = 0; k < 14; k++) {                       // blinking specks around the frame
      const period = 0.5 + hash(k, 11) * 1.2, t = pulse / period + hash(k, 17), cyc = Math.floor(t), life = t - cyc;
      if (life > 0.7) continue;
      const p = perim(hash(k, cyc) * 2 * (w + h), w, h), out = 4 + Math.floor(hash(k, cyc + 5) * 5) * 3;
      const sz = hash(k, cyc + 9) < 0.6 ? 2 : 3;
      ctx.globalAlpha = a * (0.3 + 0.6 * hash(k, cyc + 3)) * (life < 0.06 ? 0.35 : 1);
      ctx.fillRect(Math.round(p[0] + p[2] * out - sz / 2), Math.round(p[1] + p[3] * out - sz / 2), sz, sz);
    }
    ctx.font = "10px ui-monospace, Menlo, Consolas, monospace";
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
    ctx.textBaseline = "bottom"; ctx.globalAlpha = 0.62 * a;
    const moved = Math.hypot(g.off.x, g.off.y);
    ctx.fillText(moved > 1 ? Math.round(g.off.x) + ", " + Math.round(-g.off.y) : g.ch + "  " + Math.round(g.box.x2 - g.box.x1) + " × " + Math.round(g.box.y2 - g.box.y1), Math.round(fr.x1), Math.round(fr.y1) - 7);
    ctx.restore();
  }
  function kick(i) {
    const s = size * 11;
    kicks.push({ i: i, at: pulse, v: s });
    for (let d = 1; d < glyphs.length; d++) {
      const v = s * Math.pow(0.62, d); if (v < 30) break;
      [i - d, i + d].forEach(function (j) { if (j >= 0 && j < glyphs.length) kicks.push({ i: j, at: pulse + d * 0.055, v: v }); });
    }
  }
  function tick(now) {
    raf = 0;
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000)); last = now; pulse += dt;
    const sweeping = !ptr.inside && dragging < 0;
    if (sweeping) clock += dt;
    let focus = dragging >= 0 ? dragging : ptr.inside ? glyphAt(ptr.x) : (glyphs.length ? Math.min(glyphs.length - 1, Math.floor((Math.sin(clock * 0.6) + 1) / 2 * glyphs.length)) : -1);
    for (let k = kicks.length - 1; k >= 0; k--) {
      if (kicks[k].at > pulse) continue;
      if (glyphs[kicks[k].i]) glyphs[kicks[k].i].vel.y -= kicks[k].v;
      kicks.splice(k, 1);
    }
    glyphs.forEach(function (g, i) {
      if (i === dragging) {
        g.off.x += (ptr.x - grab.x - g.off.x) * 0.35; g.off.y += (ptr.y - grab.y - g.off.y) * 0.35; g.vel.x = g.vel.y = 0;
      } else {
        const c = 2 * Math.sqrt(SPRING) * 0.6;
        g.vel.x += (-SPRING * g.off.x - c * g.vel.x) * dt; g.vel.y += (-SPRING * g.off.y - c * g.vel.y) * dt;
        g.off.x += g.vel.x * dt; g.off.y += g.vel.y * dt;
      }
      g.o += ((i === focus && i !== dragging ? 1 : 0) - g.o) * (1 - Math.exp(-dt / 0.09));
    });
    if (focus >= 0) {
      const g = glyphs[focus];
      const b = [g.box.x1 + g.off.x - 6, g.box.y1 + g.off.y - 6, g.box.x2 + g.off.x + 6, g.box.y2 + g.off.y + 6];
      if (fr.i < 0 || fr.a < 0.02) { fr.x1 = b[0]; fr.y1 = b[1]; fr.x2 = b[2]; fr.y2 = b[3]; }
      const k = 1 - Math.exp(-dt / (focus === dragging ? 0.02 : 0.08));
      fr.x1 += (b[0] - fr.x1) * k; fr.y1 += (b[1] - fr.y1) * k; fr.x2 += (b[2] - fr.x2) * k; fr.y2 += (b[3] - fr.y2) * k;
      fr.i = focus;
    }
    fr.a += ((focus >= 0 ? 1 : 0) - fr.a) * (1 - Math.exp(-dt / 0.1));
    box.style.cursor = dragging >= 0 ? "grabbing" : ptr.inside && focus >= 0 ? "grab" : "";

    ctx.clearRect(0, 0, W, H); setf(size);
    glyphs.forEach(function (g) {
      const moved = Math.hypot(g.off.x, g.off.y);
      if (moved > 1) dashed(g, 0, 0, Math.min(1, moved / 24) * 0.55);
      if (g.o < 0.999) { ctx.globalAlpha = 1 - g.o; ctx.fillStyle = INK; ctx.fillText(g.ch, g.x + g.off.x, base + g.off.y); }
      if (g.o > 0.001) dashed(g, g.off.x, g.off.y, g.o);
    });
    ctx.globalAlpha = 1;
    drawFrame();
    if (vis) raf = requestAnimationFrame(tick);
  }
  function wake() { if (!raf && vis) { last = performance.now(); raf = requestAnimationFrame(tick); } }
  function locate(e) { const r = box.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; }
  box.addEventListener("pointermove", function (e) { locate(e); ptr.inside = true; }, { passive: true });
  box.addEventListener("pointerenter", function (e) { locate(e); ptr.inside = true; }, { passive: true });
  box.addEventListener("pointerleave", function () { if (dragging < 0) ptr.inside = false; }, { passive: true });
  box.addEventListener("pointerdown", function (e) {
    locate(e); ptr.inside = true;
    const i = glyphAt(ptr.x);
    press.x = ptr.x; press.y = ptr.y; press.t = performance.now(); press.i = i;
    if (i >= 0 && (e.pointerType !== "mouse" || e.button === 0)) {
      dragging = i; grab.x = ptr.x - glyphs[i].off.x; grab.y = ptr.y - glyphs[i].off.y;
      if (box.setPointerCapture) box.setPointerCapture(e.pointerId);
    }
  }, { passive: true });
  function up(e) {
    if (dragging >= 0) {
      dragging = -1;
      if (box.releasePointerCapture) try { box.releasePointerCapture(e.pointerId); } catch (_) {}
      const r = box.getBoundingClientRect();
      ptr.inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    }
    if (e.type === "pointerup" && press.i >= 0 && performance.now() - press.t < 450 && Math.hypot(ptr.x - press.x, ptr.y - press.y) < 6) kick(press.i);
    press.i = -1;
  }
  box.addEventListener("pointerup", up, { passive: true });
  box.addEventListener("pointercancel", up, { passive: true });
  if (window.ResizeObserver) new ResizeObserver(layout).observe(box); else window.addEventListener("resize", layout);
  if (window.IntersectionObserver) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; wake(); }).observe(box); else vis = true;
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  layout();
})();

/* ---------- Glow cursor (light trail + click burst) ---------- */
(function () {
  if (REDUCE || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const cv = document.createElement("canvas");
  cv.id = "glowCursor"; document.body.appendChild(cv);
  const ctx = cv.getContext("2d");
  let W = 1, H = 1, raf = 0, last = 0, mx = 0, my = 0, fx = 0, fy = 0, ready = false;
  const pts = [], parts = [], LIFE = 1.3, COL = "95,139,255";
  function rs() {
    const d = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
  }
  rs(); window.addEventListener("resize", rs);
  function wake() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } }
  window.addEventListener("pointermove", function (e) {
    if (e.pointerType === "touch") return;
    mx = e.clientX; my = e.clientY;
    if (!ready) { fx = mx; fy = my; ready = true; }
    wake();
  }, { passive: true });
  window.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "touch") return;
    for (let k = 0; k < 18; k++) {
      const a = Math.random() * 6.283, v = 70 + Math.random() * 200;
      parts.push({ x: e.clientX, y: e.clientY, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: 0 });
    }
    wake();
  }, { passive: true });
  document.documentElement.addEventListener("pointerleave", function () { ready = false; });
  function tick(now) {
    raf = 0;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (ready) {
      const k = 1 - Math.exp(-dt / 0.03);
      fx += (mx - fx) * k; fy += (my - fy) * k;
      const p = pts[pts.length - 1];
      if (!p || Math.hypot(fx - p.x, fy - p.y) > 1.2) pts.push({ x: fx, y: fy, t: now });
    }
    while (pts.length && (now - pts[0].t) / 1000 > LIFE) pts.shift();
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter"; ctx.lineCap = "round"; ctx.lineJoin = "round";
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], k = 1 - (now - b.t) / 1000 / LIFE;
      if (k <= 0) continue;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = "rgba(" + COL + "," + (k * k * 0.16).toFixed(3) + ")"; ctx.lineWidth = 14 * k + 2; ctx.stroke();
      ctx.strokeStyle = "rgba(" + COL + "," + (k * 0.9).toFixed(3) + ")"; ctx.lineWidth = 3 * k + 0.6; ctx.stroke();
      if (k > 0.9) { ctx.strokeStyle = "rgba(255,255,255," + ((k - 0.9) * 8).toFixed(3) + ")"; ctx.lineWidth = 1.6; ctx.stroke(); }
    }
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]; p.l += dt;
      if (p.l > 0.7) { parts.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.94; p.vy *= 0.94;
      const k = 1 - p.l / 0.7;
      ctx.fillStyle = "rgba(" + COL + "," + (k * 0.9).toFixed(3) + ")";
      ctx.beginPath(); ctx.arc(p.x, p.y, 1 + 2.4 * k, 0, 6.283); ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
    if (pts.length || parts.length) raf = requestAnimationFrame(tick);
  }
})();

/* ---------- Border glow on the music card ---------- */
(function () {
  const card = document.getElementById("playerGlow");
  if (!card) return;
  const H = 12, S = 95, L = 70, INT = 1.1, colors = ["#ff6b57", "#7aa2ff", "#c58bff"];
  const ops = [100, 60, 50, 40, 30, 20, 10], keys = ["", "-60", "-50", "-40", "-30", "-20", "-10"];
  ops.forEach(function (o, i) { card.style.setProperty("--glow-color" + keys[i], "hsl(" + H + "deg " + S + "% " + L + "% / " + Math.min(o * INT, 100) + "%)"); });
  const pos = ["80% 55%", "69% 34%", "8% 6%", "41% 38%", "86% 85%", "82% 18%", "51% 4%"];
  const names = ["one", "two", "three", "four", "five", "six", "seven"], map = [0, 1, 2, 0, 1, 2, 1];
  names.forEach(function (n, i) { card.style.setProperty("--gradient-" + n, "radial-gradient(at " + pos[i] + ", " + colors[map[i]] + " 0px, transparent 50%)"); });
  card.style.setProperty("--gradient-base", "linear-gradient(" + colors[0] + " 0 100%)");
  card.style.setProperty("--card-bg", "#0b0f26");
  card.style.setProperty("--edge-sensitivity", 30);
  card.style.setProperty("--border-radius", "28px");
  card.style.setProperty("--glow-padding", "40px");
  card.style.setProperty("--cone-spread", 25);
  card.style.setProperty("--fill-opacity", 0.5);
  card.addEventListener("pointermove", function (e) {
    const r = card.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top, cx = r.width / 2, cy = r.height / 2, dx = x - cx, dy = y - cy;
    const kx = dx !== 0 ? cx / Math.abs(dx) : Infinity, ky = dy !== 0 ? cy / Math.abs(dy) : Infinity;
    const edge = Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
    let deg = Math.atan2(dy, dx) * 180 / Math.PI + 90; if (deg < 0) deg += 360;
    card.style.setProperty("--edge-proximity", (edge * 100).toFixed(3));
    card.style.setProperty("--cursor-angle", deg.toFixed(3) + "deg");
  });
})();

/* ---------- Crumple note: hold to crumple, drag to move, release to unfold ---------- */
(function () {
  const note = document.getElementById("note");
  if (!note) return;
  const disp = document.getElementById("crumpleDisp");
  const R0 = -3;
  const st = { c: 0, cv: 0, x: 0, y: 0, vx: 0, vy: 0, r: R0, held: false, gx: 0, gy: 0, x0: 0, y0: 0 };
  let raf = 0, last = 0;
  const flat = [[0,0],[33,0],[66,0],[100,0],[100,33],[100,66],[100,100],[66,100],[33,100],[0,100],[0,66],[0,33]];
  const wad = [[18,14],[40,6],[62,12],[84,10],[94,34],[88,60],[82,86],[58,92],[36,84],[14,90],[8,62],[16,36]];
  function apply() {
    const c = st.c, m = Math.max(0, c) * 0.8;
    note.style.clipPath = "polygon(" + flat.map(function (p, i) {
      return (p[0] + (wad[i][0] - p[0]) * m).toFixed(1) + "% " + (p[1] + (wad[i][1] - p[1]) * m).toFixed(1) + "%";
    }).join(",") + ")";
    note.style.setProperty("--c", Math.max(0, c).toFixed(3));
    note.style.transform = "translate(" + st.x.toFixed(1) + "px," + st.y.toFixed(1) + "px) rotate(" + (st.r + c * 6).toFixed(2) + "deg) scale(" + (1 - c * 0.42).toFixed(3) + ")";
    if (disp) disp.setAttribute("scale", (Math.max(0, c) * 38).toFixed(1));
    note.style.filter = c > 0.01 && !REDUCE ? "url(#noteCrumple)" : "none";
  }
  function tick(now) {
    raf = 0;
    const dt = Math.min(0.04, (now - last) / 1000); last = now;
    const target = st.held ? 1 : 0;
    st.cv += ((target - st.c) * 70 - st.cv * (st.held ? 12 : 7)) * dt; st.c += st.cv * dt;
    if (st.c > 1) { st.c = 1; st.cv = 0; }
    if (!st.held) {
      st.vx += (-st.x * 120 - st.vx * 10) * dt; st.vy += (-st.y * 120 - st.vy * 10) * dt;
      st.x += st.vx * dt; st.y += st.vy * dt;
      st.r += (R0 - st.r) * (1 - Math.exp(-dt / 0.18));
    }
    apply();
    const moving = st.held || Math.abs(st.c) > 0.002 || Math.abs(st.cv) > 0.01 || Math.hypot(st.x, st.y) > 0.3 || Math.hypot(st.vx, st.vy) > 1 || Math.abs(st.r - R0) > 0.05;
    if (moving) raf = requestAnimationFrame(tick);
    else { st.c = 0; st.x = st.y = 0; st.r = R0; apply(); }
  }
  function wake() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } }
  function hold() { st.held = true; wake(); }
  function release() { st.held = false; wake(); }
  note.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    st.gx = e.clientX; st.gy = e.clientY; st.x0 = st.x; st.y0 = st.y;
    if (note.setPointerCapture) note.setPointerCapture(e.pointerId);
    e.preventDefault(); hold();
  });
  note.addEventListener("pointermove", function (e) {
    if (!st.held) return;
    const nx = Math.max(-150, Math.min(150, st.x0 + e.clientX - st.gx)), ny = Math.max(-120, Math.min(120, st.y0 + e.clientY - st.gy));
    st.r = R0 + Math.max(-10, Math.min(10, (nx - st.x) * 0.8));
    st.x = nx; st.y = ny; st.vx = st.vy = 0; wake();
  });
  note.addEventListener("pointerup", release);
  note.addEventListener("pointercancel", release);
  note.addEventListener("lostpointercapture", release);
  note.addEventListener("keydown", function (e) { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); hold(); } });
  note.addEventListener("keyup", function (e) { if (e.key === " " || e.key === "Enter") release(); });
  note.addEventListener("blur", release);
})();

/* ---------- Stardle background: compact GridScan (3D room, points, click ping) ---------- */
/* the glowing scan line that swept through the room has been switched off */
(function () {
  const sec = document.getElementById("play"), cv = document.getElementById("gridScan");
  if (!sec || !cv) return;
  const ctx = cv.getContext("2d");
   const N = 8, D = 3, K = 0.8, M = 8, LINE = "150,170,160", SCAN = "169,211,185";
  let W = 1, H = 1, vis = false, raf = 0, last = 0, t = 0;
  const eye = { x: 0, y: 0, tx: 0, ty: 0 }, ptr = { x: 0, y: 0, on: false }, pings = [];
  const dots = []; let seed = 7;
  const rnd = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let i = 0; i < 90; i++) { const s = Math.floor(rnd() * 4), u = rnd() * 2 - 1, z = rnd() * D; dots.push(s === 0 ? [u, 1, z] : s === 1 ? [u, -1, z] : s === 2 ? [-1, u, z] : [1, u, z]); }
  function rs() {
    W = Math.max(1, sec.clientWidth); H = Math.max(1, sec.clientHeight);
    const d = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
    if (REDUCE) draw(); else wake();
  }
  function P(x, y, z) {
    const s = 1 / (1 + z * K);
    return [W / 2 + eye.x * (z / D) * W * 0.14 + x * W / 2 * s, H / 2 + eye.y * (z / D) * H * 0.14 + y * H / 2 * s];
  }
  const fade = function (z) { return Math.exp(-1.5 * z / D); };
  function ring(z, col, a, lw) {
    const c = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(function (p) { return P(p[0], p[1], z); });
    ctx.beginPath(); ctx.moveTo(c[0][0], c[0][1]); for (let i = 1; i < 4; i++) ctx.lineTo(c[i][0], c[i][1]); ctx.closePath();
    ctx.strokeStyle = "rgba(" + col + "," + a.toFixed(3) + ")"; ctx.lineWidth = lw; ctx.stroke();
  }
  function longs(z0, z1, col, a) {
    ctx.beginPath();
    for (let j = 0; j <= M; j++) {
      const u = -1 + 2 * j / M;
      [[u, 1], [u, -1], [-1, u], [1, u]].forEach(function (p) {
        const A = P(p[0], p[1], z0), B = P(p[0], p[1], z1); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]);
      });
    }
    ctx.strokeStyle = "rgba(" + col + "," + a.toFixed(3) + ")"; ctx.lineWidth = 1; ctx.stroke();
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    const ph = t % 4, scanning = false;
    const zs = scanning ? ph / 2.4 * D : -9, sa = scanning ? Math.min(1, ph / 0.3) * Math.min(1, (2.4 - ph) / 0.3) : 0;
    for (let i = 0; i < N; i++) {
      const z0 = i * D / N, z1 = (i + 1) * D / N, zm = (z0 + z1) / 2, b = Math.exp(-(zm - zs) * (zm - zs) / 0.06) * sa;
      longs(z0, z1, LINE, fade(zm) * 0.55);
      if (b > 0.03) longs(z0, z1, SCAN, b * 0.8);
    }
    for (let i = 0; i <= N; i++) {
      const z = i * D / N, b = Math.exp(-(z - zs) * (z - zs) / 0.06) * sa;
      ring(z, LINE, fade(z) * 0.65, 1);
      if (b > 0.03) ring(z, SCAN, b * 0.9, 1.4);
    }
    dots.forEach(function (d, i) {
      const p = P(d[0], d[1], d[2]), b = Math.exp(-(d[2] - zs) * (d[2] - zs) / 0.08) * sa;
      const tw = 0.25 + 0.2 * Math.sin(t * (2 + i % 5) + i);
      ctx.fillStyle = "rgba(" + SCAN + "," + Math.min(1, (tw + b * 1.2) * fade(d[2])).toFixed(3) + ")";
      const s = 1.4 + b * 1.6; ctx.fillRect(p[0] - s / 2, p[1] - s / 2, s, s);
    });
    if (sa > 0.02) {
      ctx.save(); ctx.shadowColor = "rgb(" + SCAN + ")"; ctx.shadowBlur = 16;
      for (let k = 0; k < 12; k++) ring(Math.max(0, zs - k * 0.05), SCAN, sa * (1 - k / 12) * (k ? 0.35 : 1), k ? 1 : 2);
      ctx.restore();
    }
    if (ptr.on) {
      const g = ctx.createRadialGradient(ptr.x, ptr.y, 0, ptr.x, ptr.y, 120);
      g.addColorStop(0, "rgba(" + SCAN + ",.16)"); g.addColorStop(1, "rgba(" + SCAN + ",0)");
      ctx.fillStyle = g; ctx.fillRect(ptr.x - 120, ptr.y - 120, 240, 240);
    }
    for (let i = pings.length - 1; i >= 0; i--) {
      const p = pings[i], k = p.age / 1.8;
      if (k >= 1) { pings.splice(i, 1); continue; }
      ctx.strokeStyle = "rgba(" + SCAN + "," + ((1 - k) * (1 - k)).toFixed(3) + ")"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.age * 260, 0, 6.283); ctx.stroke();
      ctx.globalAlpha = 0.4 * (1 - k); ctx.beginPath(); ctx.arc(p.x, p.y, p.age * 260 * 0.8, 0, 6.283); ctx.stroke(); ctx.globalAlpha = 1;
    }
  }
  function tick(now) {
    raf = 0;
    const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
    eye.x += (eye.tx - eye.x) * 0.08; eye.y += (eye.ty - eye.y) * 0.08;
    pings.forEach(function (p) { p.age += dt; });
    draw();
    if (vis) raf = requestAnimationFrame(tick);
  }
  function wake() { if (!raf && vis && !REDUCE) { last = performance.now(); raf = requestAnimationFrame(tick); } }
  sec.addEventListener("pointermove", function (e) {
    const r = sec.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; ptr.on = true;
    eye.tx = (ptr.x / W - 0.5) * 2; eye.ty = (ptr.y / H - 0.5) * 2;
  }, { passive: true });
  sec.addEventListener("pointerleave", function () { ptr.on = false; eye.tx = eye.ty = 0; }, { passive: true });
  sec.addEventListener("pointerdown", function (e) {
    if (REDUCE) return;
    const r = sec.getBoundingClientRect(); pings.unshift({ x: e.clientX - r.left, y: e.clientY - r.top, age: 0 }); if (pings.length > 4) pings.pop();
  }, { passive: true });
  if (window.ResizeObserver) new ResizeObserver(rs).observe(sec); else window.addEventListener("resize", rs);
  if (window.IntersectionObserver) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; wake(); }).observe(sec); else vis = true;
  rs();
})();