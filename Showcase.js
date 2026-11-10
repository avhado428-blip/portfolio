/* Showcase section (plain JS, no libraries). Each project: info card + slideshow, same height.
   - Slideshow: tilt carousel moved by a spring. Drag / swipe / trackpad with momentum, dots, arrow keys.
   - Info card: matte surface with a soft light that follows the pointer (SpotlightCard effect).
   Edit the SHOWCASE list below. */
(function () {
  'use strict';

  var CSS = `
/* full-width breakout from the 960px column; no background of its own */
#showcase{
  width:100vw;margin:3rem 0 0 calc(50% - 50vw);
  padding:clamp(2rem,4vw,3.5rem) clamp(1rem,4.5vw,4rem);
  display:grid;gap:clamp(3rem,6vw,5.5rem);
  color:var(--text,#fff);font-family:var(--font,"Times New Roman",Times,serif);
}

/* zigzag: odd projects have the text on the left, even ones on the right */
.sc-item{
  width:100%;max-width:1240px;margin:0 auto;
  display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:clamp(1.2rem,3vw,2.6rem);align-items:stretch;
}
.sc-item:nth-child(even){grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr)}
.sc-item:nth-child(even) .sc-show{order:-1}

/* info card: your theme card (same tokens as your other sections) with the pointer light */
.sc-card{
  position:relative;isolation:isolate;overflow:hidden;display:flex;flex-direction:column;
  padding:clamp(1.5rem,2.4vw,2.2rem);border-radius:14px;background:var(--card,rgba(27,33,31,.88));
  box-shadow:0 18px 40px -20px rgba(0,0,0,.65);
}
.sc-sl-light{position:absolute;inset:0;z-index:-1;opacity:0;border-radius:inherit;pointer-events:none}
.sc-sl-border,.sc-sl-edge{
  position:absolute;inset:0;z-index:1;padding:1px;border-radius:inherit;pointer-events:none;
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;
  mask:linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0);
}
.sc-sl-border{background:var(--edge,#3a4676)}
.sc-sl-edge{opacity:0}

.sc-head{display:flex;align-items:center;gap:.8rem}
.sc-mark{
  display:grid;place-items:center;width:48px;height:48px;border-radius:10px;
  background:var(--sage,#8fb8a0);color:#101514;font-weight:700;font-size:1rem;letter-spacing:.04em;
}
.sc-badge{padding:.28rem .9rem;border-radius:999px;border:1px solid var(--mint,#a9d3b9);color:var(--mint,#a9d3b9);font-size:.8rem;font-weight:700;letter-spacing:.04em}

.sc-card h3{margin-top:1.2rem;font-weight:700;font-size:clamp(1.7rem,2.5vw,2.15rem);line-height:1.15;color:#fff}
.sc-sub{margin:.45rem 0 1.1rem;color:var(--peach,#c9a79b);font-style:italic;font-size:.95rem;line-height:1.5}

.sc-tags{display:flex;flex-wrap:wrap;gap:.45rem;list-style:none;margin:0 0 1.3rem;padding:0}
.sc-tags li{padding:.2rem .75rem;border-radius:999px;background:rgba(143,184,160,.14);color:var(--mint,#a9d3b9);font-size:.8rem;font-weight:700;letter-spacing:.03em}

.sc-points{list-style:none;margin:0;padding:0}
.sc-points li{position:relative;padding-left:1.15rem;margin:0 0 .8rem;color:var(--muted,rgba(255,255,255,.78));font-size:.97rem;line-height:1.7}
.sc-points li:last-child{margin-bottom:0}
.sc-points li::before{content:"";position:absolute;left:.05rem;top:.82em;width:5px;height:5px;border-radius:50%;background:var(--mint,#a9d3b9)}

.sc-btns{display:flex;flex-wrap:wrap;gap:.6rem;margin-top:auto;padding-top:1.6rem}
.sc-btn{
  display:inline-block;padding:.55rem 1.4rem;border-radius:999px;border:1px solid rgba(255,255,255,.35);
  color:#fff;font-size:.9rem;font-weight:700;text-decoration:none;transition:border-color .2s,background .2s;
}
.sc-btn:hover{border-color:#fff;background:rgba(255,255,255,.07)}

/* slideshow: the card takes the screenshot's own ratio and the picture fits inside it, nothing is cropped */
.sc-show{position:relative;align-self:center;min-width:0;outline:none}
.sc-view{
  position:relative;width:100%;aspect-ratio:16/10;overflow:hidden;border-radius:14px;background:#070a09;border:1px solid var(--edge,#3a4676);
  box-shadow:0 18px 40px -20px rgba(0,0,0,.65);
  perspective:1000px;touch-action:pan-y;user-select:none;-webkit-user-select:none;cursor:grab;
}
.sc-view[data-dragging]{cursor:grabbing}
.sc-slide{
  position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:center;background:#070a09;display:block;
  backface-visibility:hidden;-webkit-backface-visibility:hidden;will-change:transform;touch-action:pan-y;
}

.sc-dots{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);z-index:20;display:flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;background:rgba(10,14,15,.6)}
.sc-show.is-video .sc-dots{bottom:58px}
.sc-dot{position:relative;width:7px;height:7px;padding:0;border:0;border-radius:999px;background:rgba(255,255,255,.35);cursor:pointer;transition:width .25s,background .25s}
.sc-dot::after{content:"";position:absolute;inset:-7px -3px}
.sc-dot.on{width:22px;background:var(--mint,#a9d3b9)}

.sc-dot:focus-visible,.sc-btn:focus-visible,.sc-show:focus-visible .sc-view{outline:2px solid var(--mint,#a9d3b9);outline-offset:3px}

@media (max-width:960px){
  .sc-item,.sc-item:nth-child(even){grid-template-columns:1fr}
  .sc-item .sc-show,.sc-item:nth-child(even) .sc-show{order:-1}
}
@media (prefers-reduced-motion:reduce){.sc-dot,.sc-btn{transition:none}}
`;
  var styleEl = document.createElement('style');
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);

  /* links: [{ type:'github' | 'live', url:'...' }]  (shown as buttons at the bottom of the card)
     media: { type:'video', src, poster } or { type:'image', src, alt } */
  var SHOWCASE = [
    {
      name: "Swipe2Shop", mark: "S2", badge: "Web app",
      sub: "Marketplace for artisans across India · Tinder-style shopping · AI price assistant",
      tags: ["React", "CSS", "Python", "FastAPI", "NumPy"],
      bullets: [
        "A marketplace where artisans, from rural villages to big cities, list their handmade products for customers all over India.",
        "Customers browse the way they would on Tinder: swipe right to like, swipe left to skip, tap for details, with category filters like sarees, pottery and jewelry.",
        "Artisans get an AI pricing assistant that tells them what a product should really sell for at current market value, so they do not get cheated.",
        "React and CSS on the front end, Python with FastAPI and NumPy on the backend."
      ],
      links: [{ type: "live", url: "https://swipe2shopwelcome.vercel.app" }],
      media: [
        { type: "video", src: "assets/demo.mp4", poster: "assets/1-welcome.png" },
        { type: "image", src: "assets/1-welcome.png", alt: "Swipe2Shop welcome page: choose User or Artisan" },
        { type: "image", src: "assets/2-swipe.png", alt: "Swipe interface for customers with category filters" },
        { type: "image", src: "assets/3-artisan-landing.png", alt: "Artisan landing page" },
        { type: "image", src: "assets/4-artisan-profile.png", alt: "Artisan profile with product listings" },
        { type: "image", src: "assets/5-ai-pricing.png", alt: "AI assistant suggesting market prices for handmade pottery" }
      ]
    },
    {
      name: "IGNIS", mark: "IG", badge: "Godot game",
      sub: "Illusion and fourth-wall breaking · 2D + 3D in one game · GDScript",
      tags: ["Godot", "GDScript", "2D + 3D", "Game Dev"],
      bullets: [
        "A game about illusion and breaking the fourth wall: a man living inside a simulation who has to find his way out.",
        "He switches between worlds to clear obstacles and reach the end of the story, where he wakes up.",
        "Mixes 2D platforming with 3D rooms and a boss fight, all embedded in a single game.",
        "Built in the Godot engine with GDScript."
      ],
      links: [{ type: "github", url: "https://github.com/avhado428-blip/gamejam-finalist-project-ignis" }],
      media: [
        { type: "image", src: "assets/ignis-title.jpg", alt: "IGNIS title menu" },
        { type: "image", src: "assets/2-controls.jpg", alt: "IGNIS controls screen" },
        { type: "image", src: "assets/3-waking-room.jpg", alt: "The Waking Room, the first level" },
        { type: "image", src: "assets/4-perceived-world.jpg", alt: "The Perceived world" },
        { type: "image", src: "assets/5-split-worlds.jpg", alt: "Two worlds side by side" },
        { type: "image", src: "assets/6-3d-room.jpg", alt: "3D room in the game" },
        { type: "image", src: "assets/7-boss-room.jpg", alt: "3D boss room" }
      ]
    },
    {
      name: "VEIL", mark: "VE", badge: "Godot game",
      sub: "Cyberpunk parkour battler · 7 levels and a boss · 2D",
      tags: ["Godot", "2D", "Game Dev"],
      bullets: [
        "A cyberpunk-inspired parkour battle game: clear 7 levels to reach the boss battle.",
        "Fire projectiles, dash, double jump, use blade combos and leap through walls.",
        "Each level has an objective, like clearing every enemy, shown on a custom HUD with integrity and dash meters.",
        "A 2D game made on the Godot engine."
      ],
      links: [{ type: "github", url: "https://github.com/avhado428-blip/gamejam-26-phase-1-" }],
      media: [
        { type: "image", src: "assets/veil-title.jpg", alt: "VEIL title screen with control scheme" },
        { type: "image", src: "assets/2-gameplay.jpg", alt: "VEIL gameplay: kill all enemies objective" }
      ]
    },
    {
      name: "Secret Timeline Scanner", mark: "ST", badge: "Cybersecurity",
      sub: "Full git-history secret scanner · Python and FastAPI",
      tags: ["Python", "FastAPI", "SQLite", "JavaScript", "Cybersecurity"],
      bullets: [
        "Most secret scanners only check your current code. This one walks the entire git history and finds API keys, tokens and passwords that were committed, even if they were deleted later.",
        "Works on any repo, including big company repos with thousands of commits, and shows which secrets were found, which commit introduced them, and whether each is still present or resolved.",
        "Finds secrets with pattern matching plus entropy scoring, and breaks results down by type so you can see how many times the same kind of secret was committed.",
        "Never stores the raw secret, only a SHA-256 hash. Python and FastAPI backend with SQLite, plain JavaScript frontend."
      ],
      links: [{ type: "github", url: "https://github.com/avhado428-blip/secret-timeline-" }],
      media: [
        { type: "image", src: "assets/1-dashboard.jpg", alt: "Secret Timeline Scanner dashboard with commit history" },
        { type: "image", src: "assets/2-secrets-found.jpg", alt: "List of secrets found with location, commit and live check" }
      ]
    }
  ];

  var LABELS = { github: "GitHub", live: "Live site" };

  var host = document.getElementById("showcase");
  if (!host) return;

  var REDUCE = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  }
  function slideHTML(m) {
    if (m.type === "video") {
      return '<video class="sc-slide" src="' + esc(m.src) + '"' + (m.poster ? ' poster="' + esc(m.poster) + '"' : "") +
        ' controls playsinline preload="metadata"></video>';
    }
    return '<img class="sc-slide" src="' + esc(m.src) + '" alt="' + esc(m.alt || "") + '" draggable="false" decoding="async">';
  }

  host.innerHTML = SHOWCASE.map(function (p) {
    var n = p.media.length;
    return '<article class="sc-item">' +
      '<div class="sc-card">' +
        '<div class="sc-head"><span class="sc-mark">' + esc(p.mark) + '</span><span class="sc-badge">' + esc(p.badge) + "</span></div>" +
        "<h3>" + esc(p.name) + "</h3>" +
        '<p class="sc-sub">' + esc(p.sub) + "</p>" +
        '<ul class="sc-tags">' + p.tags.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>" +
        '<ul class="sc-points">' + p.bullets.map(function (b) { return "<li>" + esc(b) + "</li>"; }).join("") + "</ul>" +
        (p.links.length
          ? '<div class="sc-btns">' + p.links.map(function (l) {
              return '<a class="sc-btn" href="' + esc(l.url) + '" target="_blank" rel="noopener">' + LABELS[l.type] + "</a>";
            }).join("") + "</div>"
          : "") +
      "</div>" +
      '<div class="sc-show" tabindex="0" aria-roledescription="carousel" aria-label="' + esc(p.name) + ' video and screenshots">' +
        '<div class="sc-view">' + p.media.map(slideHTML).join("") + "</div>" +
        (n > 1
          ? '<div class="sc-dots">' + p.media.map(function (_, k) {
              return '<button class="sc-dot" aria-label="Go to slide ' + (k + 1) + '"></button>';
            }).join("") + "</div>"
          : "") +
      "</div>" +
    "</article>";
  }).join("");

  /* =========================================================
     Tilt carousel moved by a spring. Drag, swipe or scroll sideways and let go:
     the fling carries the slides on. A slide sits at (index - p) widths and turns up to 90deg on its way out.
     ========================================================= */
  function band(value, max) {               /* soft rubber-band past the first / last slide */
    if (value < 0) return -0.3 * (1 - Math.exp(value / 0.55));
    if (value > max) return max + 0.3 * (1 - Math.exp((max - value) / 0.55));
    return value;
  }

  function carousel(show) {
    var view = show.querySelector(".sc-view");
    var slides = Array.prototype.slice.call(view.querySelectorAll(".sc-slide"));
    var dots = show.querySelectorAll(".sc-dot");
    var n = slides.length, W = view.clientWidth || 1;
    var S = { p: 0, v: 0, t: 0, shown: -1, raf: 0, last: 0, drag: null, wheeling: false, wheelTimer: 0 };

    function apply() {
      for (var i = 0; i < n; i++) {
        var off = i - S.p, d = Math.abs(off), el = slides[i];
        el.style.visibility = d < 1 ? "visible" : "hidden";
        el.style.zIndex = String(10 - Math.min(9, Math.round(d * 2)));
        el.style.transform = "translate3d(" + (off * W).toFixed(2) + "px,0,0) rotateY(" + (-clamp(off, -1, 1) * 90).toFixed(2) + "deg)";
      }
    }
    function mark() {
      var i = clamp(Math.round(S.t), 0, n - 1);
      if (i === S.shown) return;
      S.shown = i;
      dots.forEach(function (d, j) { d.classList.toggle("on", j === i); });
      slides.forEach(function (s, j) { if (j !== i && s.tagName === "VIDEO") s.pause(); });
      show.classList.toggle("is-video", slides[i].tagName === "VIDEO");
    }
    function tick(now) {
      S.raf = 0;
      var dt = S.last ? Math.min(0.05, (now - S.last) / 1000) : 1 / 60;
      S.last = now;
      var busy = false;
      if (!(S.drag && S.drag.moved) && !S.wheeling) {
        if (REDUCE) { S.p = S.t; S.v = 0; }
        else {
          var steps = Math.ceil(dt * 240), h = dt / steps;
          for (var k = 0; k < steps; k++) {
            S.v += (150 * (S.t - S.p) - 24 * S.v) * h;
            S.p += S.v * h;
          }
          if (Math.abs(S.t - S.p) < 0.0004 && Math.abs(S.v) < 0.004) { S.p = S.t; S.v = 0; }
          else busy = true;
        }
      }
      apply();
      if (busy) S.raf = requestAnimationFrame(tick); else S.last = 0;
    }
    function wake() { if (!S.raf) S.raf = requestAnimationFrame(tick); }
    function go(i) { S.t = clamp(Math.round(i), 0, n - 1); mark(); wake(); }

    S.t = 0; mark(); apply();
    if (window.ResizeObserver) {
      new ResizeObserver(function () { W = view.clientWidth || 1; apply(); }).observe(view);
    }
    if (n < 2) return;

    dots.forEach(function (d, j) { d.addEventListener("click", function () { go(j); }); });
    show.addEventListener("keydown", function (e) {
      if (e.target.tagName === "VIDEO") return;
      if (e.key === "ArrowLeft") { go(S.t - 1); e.preventDefault(); }
      else if (e.key === "ArrowRight") { go(S.t + 1); e.preventDefault(); }
      else if (e.key === "Home") { go(0); e.preventDefault(); }
      else if (e.key === "End") { go(n - 1); e.preventDefault(); }
    });

    /* drag / swipe, released with the finger's speed */
    view.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (slides[S.shown].tagName === "VIDEO" && e.clientY > view.getBoundingClientRect().bottom - 56) return; /* leave the video controls alone */
      S.drag = { id: e.pointerId, x: e.clientX, y: e.clientY, p: S.p, from: Math.round(S.t), moved: false, samples: [] };
    });
    view.addEventListener("pointermove", function (e) {
      var d = S.drag;
      if (!d || e.pointerId !== d.id) return;
      if (!d.moved) {
        var dx = e.clientX - d.x, dy = e.clientY - d.y;
        if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
        if (Math.abs(dy) > Math.abs(dx)) { S.drag = null; return; }
        d.moved = true; d.x = e.clientX; d.p = S.p;
        if (view.setPointerCapture) view.setPointerCapture(e.pointerId);
        view.setAttribute("data-dragging", "");
      }
      S.p = band(d.p - (e.clientX - d.x) / W, n - 1);
      S.v = 0;
      S.t = Math.round(clamp(S.p, 0, n - 1));
      d.samples.push([e.timeStamp, e.clientX]);
      if (d.samples.length > 8) d.samples.shift();
      mark(); apply();
    });
    function release(e) {
      var d = S.drag;
      if (!d || e.pointerId !== d.id) return;
      S.drag = null;
      view.removeAttribute("data-dragging");
      if (!d.moved) return;
      var sample = d.samples.filter(function (s) { return e.timeStamp - s[0] < 90; })[0] || [e.timeStamp, e.clientX];
      var elapsed = Math.max(16, e.timeStamp - sample[0]);
      var velocity = clamp(((sample[1] - e.clientX) / elapsed) * (1000 / W), -12, 12);
      var travelled = S.p - d.from;
      var target = Math.round(S.p + velocity * 0.2);
      if (target === d.from) {
        if (Math.abs(velocity) > 0.8) target += velocity > 0 ? 1 : -1;
        else if (Math.abs(travelled) > 0.18) target += travelled > 0 ? 1 : -1;
      }
      target = clamp(target, 0, n - 1);
      S.v = (S.p >= 0 && S.p <= n - 1) ? velocity : 0;   /* the fling carries on into the spring */
      S.t = target; mark(); wake();
    }
    view.addEventListener("pointerup", release);
    view.addEventListener("pointercancel", release);

    /* sideways trackpad / shift-wheel */
    view.addEventListener("wheel", function (e) {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      S.p = clamp(S.p + e.deltaX / W, -0.15, n - 0.85);
      S.v = 0; S.wheeling = true;
      S.t = Math.round(clamp(S.p, 0, n - 1));
      mark(); apply();
      clearTimeout(S.wheelTimer);
      S.wheelTimer = setTimeout(function () {
        S.wheeling = false;
        S.t = Math.round(clamp(S.p, 0, n - 1));
        mark(); wake();
      }, 120);
    }, { passive: false });
  }

  /* =========================================================
     Pointer light (SpotlightCard): a soft light follows the pointer across the card and
     the card edge catches it. It starts to reach the card a little before the pointer arrives,
     floats slightly behind the pointer and swells while pressed.
     ========================================================= */
  var LIGHT = { color: "#a9d3b9", size: 280, intensity: 0.13, softness: 0.7, edge: 0.75, proximity: 90, smoothing: 0.3 };

  function falloff(color, softness) {
    var soft = clamp(softness, 0, 1), core = Math.pow(1 - soft, 1.5) * 0.85;
    function stop(alpha, at) {
      return "color-mix(in srgb, " + color + " " + (alpha * 100).toFixed(2) + "%, transparent) " + (at * 100).toFixed(2) + "%";
    }
    var list = [stop(1, 0)];
    for (var i = 0; i <= 14; i++) {
      var t = core + ((1 - core) * i) / 14, g = (t - core) / (1 - core);
      var smooth = 1 - g * g * (3 - 2 * g);
      var glow = Math.exp(-4.6 * g * g) * (1 - Math.pow(g, 6));
      list.push(stop(smooth + (glow - smooth) * soft, t));
    }
    return list.join(", ");
  }
  var FILL = falloff(LIGHT.color, LIGHT.softness), RIM = falloff(LIGHT.color, 1);

  function spotlight(root) {
    var light = document.createElement("span"); light.className = "sc-sl-light"; light.setAttribute("aria-hidden", "true");
    var border = document.createElement("span"); border.className = "sc-sl-border"; border.setAttribute("aria-hidden", "true");
    var edge = document.createElement("span"); edge.className = "sc-sl-edge"; edge.setAttribute("aria-hidden", "true");
    root.insertBefore(light, root.firstChild);
    root.appendChild(border);
    root.appendChild(edge);

    var st = { x: 0, y: 0, presence: 0, flare: 0, pressed: false };
    var pointer = { x: 0, y: 0, active: false };
    var raf = 0, last = 0;

    function paint() {
      var size = LIGHT.size * (1 + 0.2 * st.flare), boost = 1 + 0.7 * st.flare;
      light.style.background = "radial-gradient(circle " + size.toFixed(1) + "px at " + st.x.toFixed(1) + "px " + st.y.toFixed(1) + "px, " + FILL + ")";
      edge.style.background = "radial-gradient(circle " + (size * 0.6).toFixed(1) + "px at " + st.x.toFixed(1) + "px " + st.y.toFixed(1) + "px, " + RIM + ")";
      light.style.opacity = String(Math.min(1, st.presence * LIGHT.intensity * boost));
      edge.style.opacity = String(Math.min(1, st.presence * LIGHT.edge * boost));
    }
    function tick(now) {
      raf = 0;
      var dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      var rect = root.getBoundingClientRect();
      var tx = st.x, ty = st.y, target = 0;
      if (pointer.active) {
        tx = pointer.x - rect.left; ty = pointer.y - rect.top;
        var gap = Math.hypot(Math.max(0, -tx, tx - rect.width), Math.max(0, -ty, ty - rect.height));
        if (gap === 0) target = 1;
        else target = Math.pow(Math.max(0, 1 - gap / LIGHT.proximity), 2);
      }
      if (st.presence < 0.02 && target > 0) { st.x = tx; st.y = ty; }
      var follow = REDUCE ? 1 : 1 - Math.exp(-dt / (0.015 + LIGHT.smoothing * 0.22));
      st.x += (tx - st.x) * follow; st.y += (ty - st.y) * follow;
      var fade = REDUCE ? 1 : 1 - Math.exp(-dt / (target > st.presence ? 0.1 : 0.32));
      st.presence += (target - st.presence) * fade;
      if (Math.abs(target - st.presence) < 0.002) st.presence = target;
      var press = st.pressed && !REDUCE ? 1 : 0;
      st.flare += (press - st.flare) * (1 - Math.exp(-dt / (press ? 0.05 : 0.28)));
      if (Math.abs(press - st.flare) < 0.002) st.flare = press;
      paint();
      var moving = Math.abs(tx - st.x) > 0.1 || Math.abs(ty - st.y) > 0.1;
      if (!(!moving && st.presence === target && st.flare === press)) raf = requestAnimationFrame(tick);
    }
    function wake() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } }

    window.addEventListener("pointermove", function (e) {
      pointer.x = e.clientX; pointer.y = e.clientY; pointer.active = true; wake();
    });
    document.addEventListener("pointerout", function (e) { if (!e.relatedTarget) { pointer.active = false; wake(); } });
    root.addEventListener("pointerdown", function (e) {
      pointer.x = e.clientX; pointer.y = e.clientY; pointer.active = true; st.pressed = true; wake();
    });
    function up(e) {
      if (e.pointerType !== "mouse") pointer.active = false;
      if (!st.pressed) return;
      st.pressed = false; wake();
    }
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    window.addEventListener("scroll", function () { if (pointer.active || st.presence > 0) wake(); }, { capture: true, passive: true });
  }

  host.querySelectorAll(".sc-item").forEach(function (item, k) {
    var view = item.querySelector(".sc-view");
    /* size the card to the first screenshot's own ratio so nothing is cropped */
    var first = SHOWCASE[k].media.filter(function (m) { return m.type === "image"; })[0];
    if (first) {
      var probe = new Image();
      probe.onload = function () {
        if (probe.naturalWidth && probe.naturalHeight) {
          view.style.aspectRatio = clamp(probe.naturalWidth / probe.naturalHeight, 1, 2.2).toFixed(4);
        }
      };
      probe.src = first.src;
    }
    carousel(item.querySelector(".sc-show"));
    spotlight(item.querySelector(".sc-card"));
  });
})();