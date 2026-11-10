/* HoloCard (ported from React Bits to plain JS) + portfolio cards */
(function () {
  'use strict';

  /* ================= YOUR CARD CONTENT (edit here) ================= */
  const CARDS = {
    education: [
      {
        tag: 'EDUCATION', name: 'KJ Somaiya College of Engineering', big: 'B.Tech',
        info: 'Vidyavihar, Mumbai \u00B7 Ongoing',
        headline: 'B.Tech, Computer Science', value: '8.46', valueLabel: '1st yr CGPA',
        lines: ['Pursuing a Bachelor of Technology in Computer Science.'],
        foot: [['degree', 'B.Tech'], ['status', 'Ongoing']]
      },
      {
        tag: 'EDUCATION', name: 'Achievers College', big: '12th',
        info: 'Class 12th',
        headline: '12th Standard', value: '', valueLabel: '',
        lines: ['Completed Class 12 at Achievers College.'],
        foot: []
      },
      {
        tag: 'EDUCATION', name: 'All Saints High School', big: '10th',
        info: 'Class 10th',
        headline: '10th Standard', value: '', valueLabel: '',
        lines: ['Completed Class 10 at All Saints High School.'],
        foot: []
      }
    ],
    experience: [
      {
        tag: 'EXPERIENCE', name: 'ACM Student Chapter', big: 'ACM',
        info: 'KJ Somaiya, Mumbai \u00B7 Aug 2026 \u2013 Present',
        headline: 'Media and Operations Member', value: '', valueLabel: '',
        lines: [
          'Plan events and coordinate the team on the ground so everything runs smoothly.',
          'Capture the moments from events like BTC (Beyond the Classroom) and Artemis.'
        ],
        foot: [['since', 'Aug 2026'], ['status', 'Ongoing']]
      },
      {
        tag: 'EXPERIENCE', name: 'SSRP', big: 'SSRP',
        info: 'KJ Somaiya, Mumbai \u00B7 May 2026 \u2013 Oct 2026',
        headline: 'Web Dev Member', value: '', valueLabel: '',
        lines: [
          'Built and maintained websites for the team.',
          'Contributed to our ISRO hackathon entry, a model that checks the Moon\u2019s shadowed surface for water.'
        ],
        foot: [['from', 'May 2026'], ['to', 'Oct 2026']]
      }
    ]
  };

  const CARD_OPTIONS = {
    preset: 'bursts',     // bursts | stars | shards | cosmos | rainbow | swirl | glitter | gold
    width: 340,
    tiltMax: 14,
    intensity: 0,         // foil OFF: panel stays pitch black and readable (try 0.1 for a hint)
    edgeSparkle: 0.4,     // glitter on the silver frame only (0 to 1)
    glare: 0.15           // glossy highlight (0 to 1)
  };

  /* ================= CARD COLOURS (edit here) ================= */
  const COL = {
    panel:     '#1f2523',   // card background
    tagBg:     '#34403c',   // "EDUCATION" / "EXPERIENCE" pill
    tagText:   '#cfe9e4',
    title:     '#e8efed',   // card name
    artBg:     '#2a3330',   // box behind the big word
    artWord:   '#e8efed',   // the big word (ACM, SSRP ...)
    artBorder: '#5eead4',   // border around the box
    infoLine:  'rgba(232,239,237,.35)',
    infoText:  '#9fb3ae',
    headline:  '#5eead4',   // role / degree heading
    value:     '#e8efed',   // big number (CGPA)
    muted:     '#9fb3ae',   // small labels
    body:      '#e8efed',   // description text
    bullet:    '#5eead4',
    footLine:  'rgba(232,239,237,.3)'
  };
  /* ================================================================ */

  /* ---------- Card artwork (drawn with canvas, becomes the texture) ---------- */
  const AW = 630, AH = 880;
  const SERIF = '"Times New Roman", Times, serif';

  function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { let s = seed >>> 0; return function () { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
  function rrect(g, x, y, w, h, r) {
    g.beginPath(); g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }
  function wrap(g, text, maxW) {
    const words = text.split(' '), lines = []; let line = '';
    words.forEach(function (w) {
      const t = line ? line + ' ' + w : w;
      if (g.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
    });
    if (line) lines.push(line);
    return lines;
  }

  function drawCard(d, idx, total) {
    const c = document.createElement('canvas'); c.width = AW; c.height = AH;
    const g = c.getContext('2d');
    const F = 26, L = 48, RW = AW - 96;

    /* silver frame (the shader sparkles this border) */
    let gr = g.createLinearGradient(0, 0, AW, AH);
    [[0, '#f6f8fc'], [.2, '#aab3c3'], [.4, '#eef1f7'], [.6, '#8f98aa'], [.8, '#e8ecf4'], [1, '#a3acbc']]
      .forEach(function (s) { gr.addColorStop(s[0], s[1]); });
    g.fillStyle = gr; g.fillRect(0, 0, AW, AH);

    /* card panel */
    g.save(); rrect(g, F, F, AW - 2 * F, AH - 2 * F, 10); g.clip();
    g.fillStyle = COL.panel; g.fillRect(F, F, AW - 2 * F, AH - 2 * F);
    g.restore();

    /* tag pill */
    g.font = 'italic 700 17px ' + SERIF; g.textBaseline = 'middle';
    const tw = g.measureText(d.tag).width;
    rrect(g, L, 50, tw + 26, 28, 6); g.fillStyle = COL.tagBg; g.fill();
    g.fillStyle = COL.tagText; g.fillText(d.tag, L + 13, 65);

    /* name */
    let fs = 52; g.font = '700 ' + fs + 'px ' + SERIF;
    while (g.measureText(d.name).width > RW && fs > 24) { fs -= 2; g.font = '700 ' + fs + 'px ' + SERIF; }
    g.textBaseline = 'alphabetic'; g.fillStyle = COL.title;
    g.fillText(d.name, L, 128);

    /* art window with the big word */
    const ax = L, ay = 148, aw = RW, ah = 290;
    g.save(); rrect(g, ax, ay, aw, ah, 6); g.clip();
    g.fillStyle = COL.artBg; g.fillRect(ax, ay, aw, ah);
    g.globalAlpha = 1;
    let bf = 150; g.font = '700 ' + bf + 'px ' + SERIF;
    while (g.measureText(d.big).width > aw - 50 && bf > 40) { bf -= 6; g.font = '700 ' + bf + 'px ' + SERIF; }
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = COL.artWord; g.fillText(d.big, ax + aw / 2, ay + ah / 2 + 6);
    g.textAlign = 'left';
    g.restore();
    rrect(g, ax, ay, aw, ah, 6); g.lineWidth = 5; g.strokeStyle = COL.artBorder; g.stroke();

    /* info strip */
    rrect(g, L, 452, RW, 32, 4); g.lineWidth = 1.5; g.strokeStyle = COL.infoLine; g.stroke();
    g.font = 'italic 400 21px ' + SERIF; g.fillStyle = COL.infoText; g.textBaseline = 'middle';
    g.fillText(d.info, L + 12, 468);
    g.textBaseline = 'alphabetic';

    /* headline (+ big number on the right) */
    const hw = RW - (d.value ? 160 : 0);
    let hs = 38; g.font = '700 ' + hs + 'px ' + SERIF;
    while (g.measureText(d.headline).width > hw && hs > 22) { hs -= 2; g.font = '700 ' + hs + 'px ' + SERIF; }
    g.fillStyle = COL.headline; g.fillText(d.headline, L, 542);
    if (d.value) {
      g.textAlign = 'right';
      g.font = '700 58px ' + SERIF; g.fillStyle = COL.value; g.fillText(d.value, L + RW, 550);
      g.font = 'italic 400 17px ' + SERIF; g.fillStyle = COL.muted; g.fillText(d.valueLabel || '', L + RW, 573);
      g.textAlign = 'left';
    }

    /* description lines */
    g.font = '400 27px ' + SERIF;
    let y = 608;
    d.lines.forEach(function (t) {
      wrap(g, t, RW - 28).forEach(function (ln, i) {
        if (i === 0) { g.fillStyle = COL.bullet; g.fillRect(L, y - 16, 7, 7); }
        g.fillStyle = COL.body; g.fillText(ln, L + 28, y); y += 33;
      });
      y += 8;
    });

    /* bottom strip */
    if (d.foot && d.foot.length) {
      g.strokeStyle = COL.footLine; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(L, 782); g.lineTo(L + RW, 782); g.stroke();
      const cw = RW / d.foot.length;
      d.foot.forEach(function (f, i) {
        g.font = 'italic 400 16px ' + SERIF; g.fillStyle = COL.muted; g.fillText(f[0], L + i * cw, 803);
        g.font = '700 22px ' + SERIF; g.fillStyle = COL.body; g.fillText(f[1], L + i * cw, 827);
      });
    }

    /* credits row */
    g.font = 'italic 400 15px ' + SERIF; g.fillStyle = COL.muted;
    g.fillText('\u00A9 Omkar Avhad', L, 847);
    g.textAlign = 'right';
    g.fillText('0' + (idx + 1) + '/0' + total, L + RW, 847);
    g.textAlign = 'left';
    return c;
  }

  /* ================= HoloCard: same shader as React Bits ================= */
  const PRESETS = ['bursts', 'stars', 'shards', 'cosmos', 'rainbow', 'swirl', 'glitter', 'gold'];
  const PERSPECTIVE = 1100;

  const VERTEX = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

  /* CHANGE vs the original: the foil is hidden over bright pixels (the writing),
     so text stays readable and the foil only shows on the black background. */
  const FRAGMENT = `#version 300 es
precision highp float;

uniform sampler2D uArt;
uniform vec2 uSize;
uniform float uAspect;
uniform vec2 uTilt;
uniform vec2 uLight;
uniform float uDistance;
uniform int uPreset;
uniform float uIntensity;
uniform float uScale;
uniform float uEdge;
uniform float uFrame;
uniform float uRadius;
uniform float uGlare;
uniform vec3 uFoil;
uniform float uReady;

out vec4 outColor;

const float TAU = 6.28318530718;

struct Foil {
  float mask;
  float angle;
  float jitter;
  vec2 facet;
};

float hash(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

vec2 hash2(vec2 p) {
  return vec2(hash(p), hash(p + 17.31));
}

vec3 hue(float t) {
  t = abs(fract(t * 0.5) * 2.0 - 1.0);
  vec3 c = mix(vec3(0.1, 0.25, 1.0), vec3(0.0, 0.85, 1.0), smoothstep(0.0, 0.25, t));
  c = mix(c, vec3(0.25, 1.0, 0.2), smoothstep(0.25, 0.45, t));
  c = mix(c, vec3(1.0, 0.92, 0.05), smoothstep(0.45, 0.65, t));
  c = mix(c, vec3(1.0, 0.45, 0.05), smoothstep(0.65, 0.85, t));
  return mix(c, vec3(0.95, 0.12, 0.3), smoothstep(0.85, 1.0, t));
}

Foil bursts(vec2 p) {
  vec2 q = mat2(0.7071068, 0.7071068, -0.7071068, 0.7071068) * (p - vec2(0.5, 0.5 * uAspect)) / (0.283 / uScale);
  vec2 d = fract(q) - 0.5;
  float u = length(d) / 0.49;
  float angle = atan(d.y, d.x);
  if (u < 0.12) {
    float ring = min(floor(u / 0.045 + 0.5), 2.0);
    float count = max(1.0, ring * 6.0);
    float spot = (floor(angle / TAU * count) + 0.5) / count * TAU;
    vec2 dot = vec2(cos(spot), sin(spot)) * ring * 0.045;
    float m = smoothstep(0.024, 0.012, length(d / 0.49 - dot));
    return Foil(m, angle, 0.5, vec2(0.0));
  }
  bool inner = u < 0.66;
  float slot = angle / TAU * (inner ? 56.0 : 72.0);
  bool shifted = mod(floor(slot), 2.0) > 0.5;
  vec2 band = inner ? (shifted ? vec2(0.45, 0.61) : vec2(0.33, 0.49)) : (shifted ? vec2(0.84, 0.99) : vec2(0.7, 0.85));
  float across = abs(u - (band.x + band.y) * 0.5) / ((band.y - band.x) * 0.5);
  float along = abs(fract(slot) - 0.5) * 2.0;
  float width = inner ? 0.72 : 0.6;
  float m = smoothstep(1.0, 0.78, across) * smoothstep(width, width - 0.2, along);
  return Foil(m, angle, 0.5, vec2(0.0));
}

Foil stars(vec2 p) {
  Foil best = Foil(0.0, 0.0, 0.0, vec2(0.0));
  vec2 g = p / (0.08 / uScale);
  vec2 base = floor(g);
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 id = base + vec2(float(i), float(j));
      float pick = hash(id + 1.3);
      vec2 d = g - (id + 0.5 + (hash2(id) - 0.5) * 0.55);
      float m = smoothstep(0.07, 0.035, length(d));
      if (pick < 0.62) {
        float size = mix(0.16, 0.5, pow(hash(id + 9.0), 1.8));
        float sector = TAU / (pick < 0.3 ? 4.0 : 5.0);
        float k = abs(fract((atan(d.y, d.x) + hash(id + 4.0) * TAU) / sector) - 0.5) * 2.0;
        float edge = size * mix(1.0, 0.36, pow(k, 0.6));
        m = smoothstep(edge, edge * 0.8, length(d));
      }
      if (m > best.mask) best = Foil(m, hash(id + 6.0) * TAU, hash(id + 8.0), (hash2(id + 2.0) - 0.5) * 0.6);
    }
  }
  return best;
}

Foil shards(vec2 p) {
  vec2 g = p * 19.0 * uScale;
  vec2 base = floor(g);
  float best = 9.0;
  float second = 9.0;
  vec2 id = base;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 cell = base + vec2(float(i), float(j));
      float d = length(cell + 0.08 + hash2(cell) * 0.84 - g);
      if (d < best) {
        second = best;
        best = d;
        id = cell;
      } else if (d < second) {
        second = d;
      }
    }
  }
  float crack = smoothstep(0.015, 0.07, second - best);
  float shine = 0.25 + 0.75 * pow(hash(id + 7.7), 2.0);
  return Foil((0.2 + 0.8 * crack) * shine, hash(id + 3.17) * TAU, hash(id + 11.73), (hash2(id + 5.0) - 0.5) * 0.5);
}

Foil cosmos(vec2 p) {
  Foil best = Foil(0.0, 0.0, 0.0, vec2(0.0));
  vec2 g = p / (0.16 / uScale);
  vec2 base = floor(g);
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 id = base + vec2(float(i), float(j));
      vec2 d = g - (id + 0.5 + (hash2(id) - 0.5) * 0.7);
      float size = mix(0.16, 0.52, hash(id + 2.0));
      float r = length(d);
      float m = max(smoothstep(0.05, 0.0, abs(r - size)), smoothstep(size, size - 0.04, r) * 0.22);
      if (m > best.mask) best = Foil(m, hash(id + 6.0) * TAU + atan(d.y, d.x) * 0.5, hash(id + 1.0), (hash2(id + 4.0) - 0.5) * 0.5);
    }
  }
  vec2 fine = p / (0.035 / uScale);
  vec2 cell = floor(fine);
  float dots = smoothstep(0.2, 0.1, length(fine - cell - 0.5 - (hash2(cell + 9.0) - 0.5) * 0.6)) * step(0.55, hash(cell + 2.0));
  if (dots > best.mask) best = Foil(dots, hash(cell) * TAU, hash(cell + 3.0), (hash2(cell + 7.0) - 0.5) * 0.6);
  return best;
}

Foil rainbow(vec2 p) {
  return Foil(0.86 + 0.14 * hash(floor(p * 700.0 * uScale)), 0.2, 0.5, vec2(0.0));
}

Foil swirl(vec2 p) {
  vec2 d = p - vec2(0.5, 0.42 * uAspect);
  float angle = atan(d.y, d.x);
  float rays = 0.55 + 0.45 * smoothstep(0.3, 0.7, abs(fract(angle / TAU * 60.0 * uScale) - 0.5) * 2.0);
  return Foil(rays, angle, length(d), vec2(0.0));
}

Foil glitter(vec2 p) {
  vec2 g = p * 72.0 * uScale;
  vec2 cell = floor(g);
  float size = mix(0.18, 0.4, hash(cell + 3.0));
  float m = smoothstep(size, size * 0.55, length(fract(g) - 0.5 - (hash2(cell) - 0.5) * 0.5)) * step(0.25, hash(cell + 5.0));
  return Foil(m, hash(cell + 7.0) * TAU, hash(cell + 9.0), (hash2(cell + 11.0) - 0.5) * 0.9);
}

Foil gold(vec2 p) {
  Foil flake = glitter(p * 0.8);
  if (flake.mask > 0.5) return flake;
  float etch = 0.55 + 0.45 * smoothstep(0.2, 0.8, abs(fract((p.x * 0.6 + p.y) * 140.0 * uScale) - 0.5) * 2.0);
  return Foil(etch, 0.9, 0.4, vec2(0.0));
}

vec3 sparkles(vec2 p, vec3 halfway, vec2 sweep, float awake) {
  vec2 g = p * 62.0;
  vec2 cell = floor(g);
  vec2 d = fract(g) - 0.5 - (hash2(cell) - 0.5) * 0.36;
  float spin = hash(cell + 3.0) * TAU;
  d = mat2(cos(spin), -sin(spin), sin(spin), cos(spin)) * d;
  vec2 a = abs(d);
  float hexagon = max(a.x * 0.866 + a.y * 0.5, a.y);
  float size = mix(0.22, 0.38, hash(cell + 2.0));
  float piece = smoothstep(size, size - 0.07, hexagon) * step(0.42, hash(cell + 4.0));
  vec3 facet = normalize(vec3((hash2(cell + 6.0) - 0.5) * 0.9, 1.0));
  float flash = pow(max(dot(facet, halfway), 0.0), 6.0);
  vec3 tint = hue(dot(sweep, vec2(cos(spin), sin(spin))) * 1.2 + dot(sweep, vec2(0.8, 0.6)) * 0.8 + hash(cell + 8.0) * 0.5);
  vec3 color = piece * tint * (0.3 + 1.6 * flash) * awake;
  vec2 fine = p * 210.0;
  vec2 speckCell = floor(fine);
  float speck = smoothstep(0.24, 0.0, length(fract(fine) - 0.5 - (hash2(speckCell) - 0.5) * 0.5)) * step(0.72, hash(speckCell + 1.0));
  float speckFlash = pow(max(dot(normalize(vec3((hash2(speckCell + 2.0) - 0.5) * 0.9, 1.0)), halfway), 0.0), 10.0);
  return color + vec3(1.2) * speck * speckFlash * (1.0 - piece);
}

void main() {
  vec2 uv = vec2(gl_FragCoord.x / uSize.x, 1.0 - gl_FragCoord.y / uSize.y);
  vec2 p = vec2(uv.x, uv.y * uAspect);
  vec2 center = vec2(0.5, 0.5 * uAspect);
  vec2 q = abs(p - center) - center + uRadius;
  float outside = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uRadius;
  float pixel = 1.0 / uSize.x;
  float alpha = clamp(0.5 - outside / pixel, 0.0, 1.0);
  vec4 sampled = texture(uArt, uv);
  if (uReady > 0.5) alpha *= sampled.a;
  if (alpha <= 0.0) {
    outColor = vec4(0.0);
    return;
  }
  vec3 art = uReady > 0.5 ? pow(sampled.rgb, vec3(2.2)) : vec3(0.12);
  float ink = uReady > 0.5 ? smoothstep(0.10, 0.40, dot(art, vec3(0.3333))) : 0.0;

  mat3 rx = mat3(1.0, 0.0, 0.0, 0.0, cos(uTilt.x), sin(uTilt.x), 0.0, -sin(uTilt.x), cos(uTilt.x));
  mat3 ry = mat3(cos(uTilt.y), 0.0, -sin(uTilt.y), 0.0, 1.0, 0.0, sin(uTilt.y), 0.0, cos(uTilt.y));
  mat3 turn = rx * ry;
  vec3 world = turn * vec3(p - center, 0.0);
  vec3 view = normalize(transpose(turn) * (vec3(0.0, 0.0, uDistance) - world));
  vec3 lamp = vec3((uLight - 0.5) * vec2(1.1, 1.1 * uAspect), 0.9);
  vec3 light = normalize(transpose(turn) * (lamp - world));
  vec3 halfway = normalize(light + view);
  vec2 sweep = light.xy + view.xy;
  float sheen = pow(max(halfway.z, 0.0), 10.0);
  float shine = pow(max(halfway.z, 0.0), 80.0);
  float frame = 1.0 - smoothstep(uFrame - pixel, uFrame + pixel, -outside);

  Foil f;
  if (uPreset == 0) f = bursts(p);
  else if (uPreset == 1) f = stars(p);
  else if (uPreset == 2) f = shards(p);
  else if (uPreset == 3) f = cosmos(p);
  else if (uPreset == 4) f = rainbow(p);
  else if (uPreset == 5) f = swirl(p);
  else if (uPreset == 6) f = glitter(p);
  else f = gold(p);

  vec3 metal = uPreset == 7 ? vec3(1.0, 0.74, 0.38) * dot(uFoil, vec3(0.3333)) * 1.15 : uFoil;
  vec4 look = uPreset == 0 ? vec4(0.25, 1.9, 0.12, 1.0)
    : uPreset == 1 ? vec4(0.6, 1.4, 0.3, 1.0)
    : uPreset == 2 ? vec4(0.9, 0.9, 0.6, 0.5)
    : uPreset == 3 ? vec4(0.7, 1.2, 0.35, 0.85)
    : uPreset == 4 ? vec4(0.0, 2.2, 0.0, 0.45)
    : uPreset == 5 ? vec4(1.6, 0.3, 0.0, 0.4)
    : uPreset == 6 ? vec4(0.9, 1.0, 0.6, 1.0)
    : vec4(0.3, 1.0, 0.2, 0.95);
  vec2 dir = vec2(cos(f.angle), sin(f.angle));
  float phase = dot(sweep, dir) * look.x + dot(sweep, vec2(0.8, 0.6)) * look.y + f.jitter * look.z;
  float spoke = 1.0;
  if (uPreset == 5) {
    float facing = dot(normalize(sweep + 0.0001), dir);
    phase = f.jitter * 2.4 + facing * 0.6 + length(sweep) * 0.8;
    spoke = 0.3 + 0.7 * smoothstep(0.25, 0.95, abs(facing));
  }
  vec3 tint = hue(phase);
  if (uPreset == 7) tint = mix(tint, metal, 0.65);
  float glint = pow(max(dot(normalize(vec3(f.facet, 1.0)), halfway), 0.0), 24.0) * step(0.001, length(f.facet));
  bool layered = uPreset == 2 || uPreset == 4 || uPreset == 5 || uPreset == 7;
  vec3 foil = (layered ? tint : mix(tint, vec3(1.0), 0.12)) * (1.15 + 0.3 * sheen) + metal * glint * 1.2;
  float tilted = smoothstep(0.02, 0.21, length(sin(uTilt)));
  float awake = mix(0.2, 1.0, tilted);
  float strength = uIntensity * f.mask * (1.0 - frame) * awake * (1.0 - ink);
  float band = uPreset == 5 ? spoke : layered ? 0.25 + 0.75 * smoothstep(0.3, 0.95, 0.5 + 0.5 * cos(phase * TAU * 0.5 + 1.3)) : 1.0;
  vec3 color = layered
    ? 1.0 - (1.0 - art) * (1.0 - clamp(foil * look.w * band * strength, 0.0, 1.0))
    : mix(art, foil, clamp(strength * look.w, 0.0, 1.0));
  color += sparkles(p, halfway, sweep, mix(0.55, 1.0, tilted)) * uEdge * frame;
  color += uFoil * sheen * 0.12 * frame;
  color += vec3(sheen * 0.07 + shine * 0.3) * uGlare;
  color = pow(clamp(color, 0.0, 1.0), vec3(1.0 / 2.2));
  outColor = vec4(color * alpha, alpha);
}
`;

  const clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  function parseColor(value) {
    const fallback = [0.78, 0.8, 0.84];
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) return fallback;
    ctx.fillStyle = '#000000';
    ctx.fillStyle = value;
    const r = ctx.fillStyle;
    if (r.charAt(0) !== '#' || r.length !== 7) return fallback;
    return [1, 3, 5].map(function (i) { return Math.pow(parseInt(r.slice(i, i + 2), 16) / 255, 2.2); });
  }

  function compile(gl, type, source) {
    const sh = gl.createShader(type);
    if (!sh) return null;
    gl.shaderSource(sh, source);
    gl.compileShader(sh);
    if (gl.getShaderParameter(sh, gl.COMPILE_STATUS)) return sh;
    console.error('HoloCard shader error:', gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }

  function createHoloCard(container, art, opt) {
    const o = Object.assign({
      preset: 'bursts', intensity: 0.85, scale: 1, edgeSparkle: 0.8, frame: 4, glare: 0.5,
      foilColor: '#e2e6ec', width: 340, radius: 14, tiltMax: 14, hoverScale: 1.04,
      idle: true, shadow: true, alt: ''
    }, opt || {});
    const S = {
      preset: Math.max(0, PRESETS.indexOf(o.preset)),
      intensity: clamp(o.intensity, 0, 1), scale: clamp(o.scale, 0.25, 4),
      edge: clamp(o.edgeSparkle, 0, 1), frame: clamp(o.frame, 0, 20) / 100,
      glare: clamp(o.glare, 0, 1), foil: parseColor(o.foilColor),
      radius: Math.max(0, o.radius), tiltMax: clamp(o.tiltMax, 0, 45),
      hoverScale: clamp(o.hoverScale, 0.8, 1.3), idle: o.idle
    };

    const root = document.createElement('div');
    root.className = 'holo-card';
    root.setAttribute('role', 'img');
    if (o.alt) root.setAttribute('aria-label', o.alt);
    root.style.setProperty('--hc-w', o.width + 'px');
    root.style.setProperty('--hc-ratio', art.width / art.height);
    root.style.setProperty('--hc-radius', o.radius + 'px');

    let shadowEl = null;
    if (o.shadow) {
      shadowEl = document.createElement('span');
      shadowEl.className = 'holo-card__shadow';
      shadowEl.setAttribute('aria-hidden', 'true');
      root.appendChild(shadowEl);
    }
    const rotor = document.createElement('div'); rotor.className = 'holo-card__rotor';
    const face = document.createElement('div'); face.className = 'holo-card__face';
    art.className = 'holo-card__art';
    const canvas = document.createElement('canvas'); canvas.className = 'holo-card__gl';
    face.appendChild(art); face.appendChild(canvas);
    rotor.appendChild(face); root.appendChild(rotor);
    container.appendChild(root);

    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) return root;   // no WebGL2: the plain card art stays visible

    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    if (!vertex || !fragment) return root;
    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.bindAttribLocation(program, 0, 'position');
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('HoloCard link error:', gl.getProgramInfoLog(program));
      return root;
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, art);
    gl.generateMipmap(gl.TEXTURE_2D);

    const U = {};
    ['uArt', 'uSize', 'uAspect', 'uTilt', 'uLight', 'uDistance', 'uPreset', 'uIntensity', 'uScale',
     'uEdge', 'uFrame', 'uRadius', 'uGlare', 'uFoil', 'uReady'].forEach(function (n) {
      U[n] = gl.getUniformLocation(program, n);
    });

    const st = { tiltX: 0, tiltY: 0, tiltVX: 0, tiltVY: 0, lightX: 0.36, lightY: 0.26,
                 lightVX: 0, lightVY: 0, lift: 1, liftV: 0, clock: Math.random() * 40 };
    const ptr = { x: 0.5, y: 0.5, inside: false };
    let raf = 0, last = 0, visible = true, calm = 0;

    function draw() {
      const w = canvas.width, h = canvas.height;
      if (!w || !h) return;
      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(U.uArt, 0);
      gl.uniform2f(U.uSize, w, h);
      gl.uniform1f(U.uAspect, h / w);
      gl.uniform2f(U.uTilt, st.tiltX * Math.PI / 180, st.tiltY * Math.PI / 180);
      gl.uniform2f(U.uLight, st.lightX, st.lightY);
      gl.uniform1f(U.uDistance, PERSPECTIVE / Math.max(1, canvas.clientWidth));
      gl.uniform1i(U.uPreset, S.preset);
      gl.uniform1f(U.uIntensity, S.intensity);
      gl.uniform1f(U.uScale, S.scale);
      gl.uniform1f(U.uEdge, S.edge);
      gl.uniform1f(U.uFrame, S.frame);
      gl.uniform1f(U.uRadius, S.radius / Math.max(1, canvas.clientWidth));
      gl.uniform1f(U.uGlare, S.glare);
      gl.uniform3f(U.uFoil, S.foil[0], S.foil[1], S.foil[2]);
      gl.uniform1f(U.uReady, 1);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function spring(value, velocity, target, stiffness, damping, dt) {
      const next = velocity + ((target - value) * stiffness - velocity * damping) * dt;
      return [value + next * dt, next];
    }

    function tick(now) {
      raf = 0;
      const dt = Math.min(1 / 30, Math.max(1 / 240, (now - last) / 1000));
      last = now;
      let targetX = 0, targetY = 0, lightX = 0.36, lightY = 0.26, lift = 1;
      const drifting = S.idle && !reduce && !ptr.inside;
      if (ptr.inside && !reduce) {
        targetX = (0.5 - ptr.y) * 2 * S.tiltMax;
        targetY = (ptr.x - 0.5) * 2 * S.tiltMax;
        lightX = ptr.x; lightY = ptr.y; lift = S.hoverScale;
      } else if (drifting) {
        st.clock += dt;
        const t = st.clock;
        targetX = Math.sin(t * 0.7) * S.tiltMax * 0.28;
        targetY = Math.sin(t * 0.53 + 1.2) * S.tiltMax * 0.4;
        lightX = 0.5 + Math.sin(t * 0.41) * 0.42;
        lightY = 0.38 + Math.sin(t * 0.33 + 0.6) * 0.3;
      }
      const steps = Math.ceil(dt / (1 / 240));
      const h = dt / steps;
      for (let i = 0; i < steps; i++) {
        let r;
        r = spring(st.tiltX, st.tiltVX, targetX, 150, 16, h); st.tiltX = r[0]; st.tiltVX = r[1];
        r = spring(st.tiltY, st.tiltVY, targetY, 150, 16, h); st.tiltY = r[0]; st.tiltVY = r[1];
        r = spring(st.lightX, st.lightVX, lightX, 220, 30, h); st.lightX = r[0]; st.lightVX = r[1];
        r = spring(st.lightY, st.lightVY, lightY, 220, 30, h); st.lightY = r[0]; st.lightVY = r[1];
        r = spring(st.lift, st.liftV, lift, 320, 30, h); st.lift = r[0]; st.liftV = r[1];
      }
      rotor.style.transform = 'perspective(' + PERSPECTIVE + 'px) scale(' + st.lift +
        ') rotateX(' + st.tiltX + 'deg) rotateY(' + st.tiltY + 'deg)';
      if (shadowEl) {
        shadowEl.style.transform = 'translate(' + (-st.tiltY * 0.7) + 'px,' + (st.tiltX * 0.7) +
          'px) scale(' + (0.9 + (st.lift - 1) * 1.5) + ')';
      }
      draw();
      const motion = Math.abs(st.tiltVX) + Math.abs(st.tiltVY) + Math.abs(st.liftV) * 40 +
        (Math.abs(st.lightVX) + Math.abs(st.lightVY)) * 60 +
        Math.abs(st.tiltX - targetX) + Math.abs(st.tiltY - targetY);
      calm = motion > 0.02 ? 0 : calm + dt;
      if (!visible || (!drifting && !ptr.inside && calm > 0.3)) return;
      raf = requestAnimationFrame(tick);
    }

    function wake() {
      if (raf) return;
      calm = 0;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      draw(); wake();
    }

    function track(e) {
      if (e.pointerType === 'touch' && e.type === 'pointermove' && !e.buttons) return;
      const r = root.getBoundingClientRect();
      ptr.x = clamp((e.clientX - r.left) / r.width, 0, 1);
      ptr.y = clamp((e.clientY - r.top) / r.height, 0, 1);
      ptr.inside = true;
      wake();
    }
    function leave() { ptr.inside = false; wake(); }
    root.addEventListener('pointerenter', track);
    root.addEventListener('pointermove', track);
    root.addEventListener('pointerdown', track);
    root.addEventListener('pointerleave', leave);
    root.addEventListener('pointercancel', leave);

    new ResizeObserver(resize).observe(canvas);
    new IntersectionObserver(function (entries) {
      visible = entries.some(function (en) { return en.isIntersecting; });
      if (visible) wake();
    }).observe(root);

    root.setAttribute('data-ready', '');
    resize();
    return root;
  }

  /* ---------- mount the portfolio cards ---------- */
  const total = CARDS.education.length + CARDS.experience.length;
  let n = 0;
  function mount(id, list) {
    const el = document.getElementById(id);
    if (!el) return;
    list.forEach(function (d) {
      const art = drawCard(d, n++, total);
      createHoloCard(el, art, Object.assign({}, CARD_OPTIONS, { alt: d.name + ' - ' + d.headline }));
    });
  }
  mount('eduCards', CARDS.education);
  mount('expCards', CARDS.experience);
})();