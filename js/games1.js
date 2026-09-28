/* ============================================================
   미니게임 공통 도구 + Stage 1~4
   각 게임 객체: { dur, t, done, update(dt), draw(g), onDown/onMove/onUp(x,y),
                  action(name,down), ui(), result(), controls }
   ============================================================ */
const GW = 728, GH = 440;
const C = { ink: '#0F1A28', por: '#E9EDE6', gold: '#C9A24B', gold2: '#E2C273', cin: '#C4432F', cel: '#7FB7A4' };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function txt(g, s, x, y, o = {}) {
  g.save();
  g.font = `${o.w || 700} ${o.size || 18}px ${o.serif ? "'Noto Serif KR',serif" : "'Noto Sans KR',sans-serif"}`;
  g.textAlign = o.align || 'left'; g.textBaseline = o.base || 'alphabetic';
  if (o.alpha != null) g.globalAlpha = o.alpha;
  if (o.stroke) { g.lineWidth = o.sw || 4; g.strokeStyle = o.stroke; g.lineJoin = 'round'; g.strokeText(s, x, y); }
  g.fillStyle = o.color || C.por; g.fillText(s, x, y);
  g.restore();
}
function rrect(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
function vgrad(g, x, y, w, h, c1, c2) { const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, c1); gr.addColorStop(1, c2); g.fillStyle = gr; g.fillRect(x, y, w, h); }
function bar(g, x, y, w, h, frac, fill, back = 'rgba(15,26,40,.65)') {
  g.fillStyle = back; rrect(g, x, y, w, h, 4); g.fill();
  g.fillStyle = fill; rrect(g, x + 2, y + 2, Math.max(0, (w - 4) * clamp(frac, 0, 1)), h - 4, 3); g.fill();
  g.strokeStyle = 'rgba(233,237,230,.35)'; g.lineWidth = 1; rrect(g, x, y, w, h, 4); g.stroke();
}
function topShade(g, h = 70, a = 0.5) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, `rgba(11,20,31,${a})`); gr.addColorStop(1, 'rgba(11,20,31,0)'); g.fillStyle = gr; g.fillRect(0, 0, GW, h); }
const FX = {
  add(list, o) { o.t = 0; o.life = o.life || 0.6; list.push(o); },
  step(list, dt) { for (const f of list) f.t += dt; for (let i = list.length - 1; i >= 0; i--) if (list[i].t >= list[i].life) list.splice(i, 1); },
  draw(g, list) {
    for (const f of list) {
      const k = f.t / f.life; g.save();
      if (f.k === 'txt') { g.globalAlpha = 1 - k * k; txt(g, f.s, f.x, f.y - 34 * k, { size: f.size || 20, align: 'center', color: f.c || C.gold2, stroke: C.ink, sw: 5 }); }
      else if (f.k === 'burst') {
        g.globalAlpha = (1 - k) * 0.9; g.fillStyle = f.c || '#F6A54A'; g.beginPath(); g.arc(f.x, f.y, (f.r || 30) * (0.35 + k * 0.8), 0, 7); g.fill();
        g.globalAlpha = (1 - k) * 0.7; g.strokeStyle = '#FFF3D0'; g.lineWidth = 3; g.beginPath(); g.arc(f.x, f.y, (f.r || 30) * (0.5 + 1.1 * k), 0, 7); g.stroke();
      } else if (f.k === 'line') {
        const p = Math.min(1, k * 1.6), q = Math.max(0, p - 0.35);
        g.strokeStyle = f.c || '#F3E7C0'; g.lineWidth = f.w || 3; g.lineCap = 'round'; g.globalAlpha = 1 - k * 0.6;
        g.beginPath(); g.moveTo(f.x0 + (f.x1 - f.x0) * q, f.y0 + (f.y1 - f.y0) * q); g.lineTo(f.x0 + (f.x1 - f.x0) * p, f.y0 + (f.y1 - f.y0) * p); g.stroke();
      } else if (f.k === 'x') {
        g.globalAlpha = 1 - k; g.strokeStyle = '#E9EDE6'; g.lineWidth = 3; g.beginPath(); g.moveTo(f.x - 8, f.y - 8); g.lineTo(f.x + 8, f.y + 8); g.moveTo(f.x + 8, f.y - 8); g.lineTo(f.x - 8, f.y + 8); g.stroke();
      }
      g.restore();
    }
  }
};

/* ---- 이미지가 없을 때의 대체(벡터) 그림 ---- */
function soldierVec(g, x, y, s, ph, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  if (o.alpha != null) g.globalAlpha = o.alpha; if (o.rot) g.rotate(o.rot);
  g.fillStyle = o.jp ? '#2B3140' : '#243B57'; g.fillRect(-9, -32, 18, 21);
  g.fillStyle = '#E0B48F'; g.beginPath(); g.arc(0, -38, 6.5, 0, 7); g.fill();
  g.fillStyle = o.jp ? '#5F4630' : '#1F3550'; g.beginPath(); g.moveTo(-13, -38); g.lineTo(13, -38); g.lineTo(0, -54); g.closePath(); g.fill();
  g.restore();
}
function shipVec(g, x, y, s, dir = 1, o = {}) {
  g.save(); g.translate(x, y); if (o.rot) g.rotate(o.rot); g.scale(s * dir, s);
  if (o.alpha != null) g.globalAlpha = o.alpha;
  g.lineWidth = 2; g.strokeStyle = C.ink; g.lineJoin = 'round';
  g.fillStyle = o.hull || '#4A3324'; g.beginPath(); g.moveTo(-66, -4); g.lineTo(68, -4); g.lineTo(54, 20); g.lineTo(-52, 20); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = o.deck || '#8B6242'; g.fillRect(-42, -28, 84, 24); g.strokeRect(-42, -28, 84, 24);
  g.restore();
}
function drawShip(g, kind, x, y, s, o = {}) {
  const map = { po: ['shpo', 0, 1], jp: ['shjp', 1, 0], gb: ['shgb', 0, 1] };
  const [key, r, c] = o.frame ? o.frame : map[kind];
  if (Spr.draw(g, key, r, c, x, y, s, o)) return;
  shipVec(g, x, y, s * 0.9, o.flip ? -1 : 1, o);
}

/* ============================================================
   Stage 1. 동래성: 성벽 활쏘기 — 왜군 2배, 필연적 패배, 생존 시간 채점
   ============================================================ */
function gDefense() {
  const WALL_Y = 330;
  const g = { dur: 30, t: 0, hp: 100, kills: 0, enemies: [], fx: [], spawnT: 0.2, over: false, overT: 0, done: false, shake: 0, anim: 0, shoot: [0, 0, 0, 0, 0, 0], controls: { kind: 'hint', hint: '왜군이 두 배로 몰려옵니다. 함락 전까지 최대한 오래 버티세요' } };
  g.update = function (dt) {
    FX.step(g.fx, dt); g.shake = Math.max(0, g.shake - dt); g.anim += dt;
    for (let i = 0; i < g.shoot.length; i++) g.shoot[i] = Math.max(0, g.shoot[i] - dt);
    for (const e of g.enemies) if (e.dead) e.dieT += dt;
    g.enemies = g.enemies.filter(e => !e.dead || e.dieT < 0.5);
    if (g.over) { g.overT += dt; if (g.overT > 2.0) g.done = true; return; }
    g.t += dt; const p = Math.min(1, g.t / g.dur);
    g.spawnT -= dt;
    if (g.spawnT <= 0) {
      g.spawnT = Math.max(0.16, 0.5 - 0.34 * p) * rand(0.75, 1.25);
      const tough = g.t > 6 && Math.random() < 0.2;
      g.enemies.push({ x: rand(40, GW - 40), y: -50, vy: (38 + 30 * p) * rand(0.85, 1.2), hp: tough ? 2 : 1, tough, ph: rand(0, 6), atk: 0, reached: false, dead: false, dieT: 0 });
    }
    for (const e of g.enemies) {
      if (e.dead) continue; e.ph += dt;
      if (e.reached) { e.atk += dt; if (e.atk >= 0.9) { e.atk = 0; g.hp -= e.tough ? 5 : 3; g.shake = 0.22; FX.add(g.fx, { k: 'burst', x: e.x, y: WALL_Y - 4, r: 22, c: '#C4432F', life: 0.4 }); } }
      else { e.y += e.vy * dt; if (e.y >= WALL_Y - 6) { e.y = WALL_Y - 6; e.reached = true; } }
    }
    if (g.hp <= 0) { g.hp = 0; g.over = true; } else if (g.t >= g.dur) { g.over = true; g.t = g.dur; }
  };
  g.onDown = function (x, y) {
    if (g.over) return;
    let best = null, bd = 1e9;
    for (const e of g.enemies) { if (e.dead) continue; const d = dist(x, y, e.x, e.y - 34 * (e.tough ? 1.25 : 1)); if (d < 50 && d < bd) { best = e; bd = d; } }
    const ai = Math.floor(clamp(x, 0, GW - 1) / (GW / 6)); g.shoot[ai] = 0.25;
    FX.add(g.fx, { k: 'line', x0: 60 + ai * 118, y0: WALL_Y + 8, x1: x, y1: y, life: 0.2, c: '#F3E7C0' });
    if (best) {
      best.hp--; FX.add(g.fx, { k: 'burst', x: best.x, y: best.y - 36, r: 18, life: 0.3 });
      if (best.hp <= 0) { best.dead = true; best.dieT = 0; g.kills++; FX.add(g.fx, { k: 'txt', s: '+1', x: best.x, y: best.y - 80, life: 0.5 }); }
    } else FX.add(g.fx, { k: 'x', x, y, life: 0.3 });
  };
  g.ui = () => ({});
  g.result = () => ({ score: Math.min(1000, Math.floor(g.t) * 15 + g.kills * 8), note: `버틴 시간 ${Math.floor(g.t)}초 · 격퇴 ${g.kills}명` });
  g.draw = function (c) {
    c.save(); if (g.shake > 0) c.translate(rand(-3, 3), rand(-3, 3));
    vgrad(c, 0, 0, GW, 150, '#2A3A57', '#B0785C');
    c.fillStyle = '#3A4646'; c.beginPath(); c.moveTo(0, 150); for (let x = 0; x <= GW; x += 40) c.lineTo(x, 118 + Math.sin(x * 0.02) * 22); c.lineTo(GW, 150); c.closePath(); c.fill();
    vgrad(c, 0, 148, GW, WALL_Y - 148, '#59663F', '#3D472D');
    const list = g.enemies.slice().sort((a, b) => a.y - b.y);
    for (const e of list) {
      const sc = (e.tough ? 1.3 : 1) * (0.85 + 0.35 * clamp(e.y / WALL_Y, 0, 1));
      if (e.dead) drawSoldier(c, 'jp', 'fall', e.x, e.y, sc, g.anim, { alpha: 1 - e.dieT / 0.5 });
      else drawSoldier(c, 'jp', e.reached ? 'shoot' : 'front', e.x, e.y, sc, e.ph * 1.2, {});
      if (e.tough && !e.dead) { c.fillStyle = e.hp > 1 ? C.gold2 : C.cin; c.fillRect(e.x - 14, e.y - 108 * sc / 1.3 - 4, 28, 4); }
    }
    vgrad(c, 0, WALL_Y, GW, GH - WALL_Y, '#7D7A70', '#55534C');
    c.fillStyle = '#8D8A7F'; for (let x = 0; x < GW; x += 46) c.fillRect(x + 4, WALL_Y - 14, 30, 16);
    for (let i = 0; i < 6; i++) { const shot = g.shoot[i] > 0; drawSoldier(c, 'js', shot ? 'aim' : 'back', 60 + i * 118, WALL_Y + 44, 0.95, shot ? g.anim : 0, { shadow: 0 }); }
    c.fillStyle = '#8C2F2A'; c.fillRect(GW / 2 - 60, WALL_Y + 66, 120, 30); txt(c, '동래성', GW / 2, WALL_Y + 88, { size: 20, align: 'center', serif: true, w: 900, color: '#F1E9D6' });
    FX.draw(c, g.fx); c.restore();
    topShade(c, 60, 0.55);
    bar(c, 14, 12, 210, 20, g.hp / 100, g.hp > 40 ? '#7FB7A4' : '#C4432F'); txt(c, `성벽 ${Math.round(g.hp)}`, 22, 27, { size: 13, w: 700, color: C.ink });
    txt(c, `버틴 시간 ${Math.floor(g.t)}초`, GW / 2, 30, { size: 22, align: 'center', stroke: C.ink, color: C.gold2 });
    txt(c, `격퇴 ${g.kills}`, GW - 14, 28, { size: 20, align: 'right', stroke: C.ink });
    if (g.over) {
      const a = clamp(g.overT / 0.7, 0, 1); c.fillStyle = `rgba(15,26,40,${0.72 * a})`; c.fillRect(0, 0, GW, GH);
      txt(c, '동래성 함락', GW / 2, 186, { size: 46, align: 'center', serif: true, w: 900, color: '#E9EDE6', alpha: a });
      txt(c, `${Math.floor(g.t)}초를 버텼습니다`, GW / 2, 226, { size: 24, align: 'center', color: C.gold2, alpha: a });
    }
  };
  return g;
}

/* ============================================================
   Stage 2. 옥포: 판옥선 함포 사격 — 조준선 속도 1.3배
   ============================================================ */
function gOkpo() {
  const RY = 236, CD = 0.75, OMEGA = 1.5 * 1.3;
  const g = { dur: 30, t: 0, sunk: 0, shots: 0, ships: [], flying: [], fx: [], cool: 0, done: false, over: false, overT: 0, rx: GW / 2, flash: 0, controls: { kind: 'fire', fire: '발포', hint: '조준선이 왜선과 겹칠 때 발포!' } };
  function spawn(anywhere) {
    const fromLeft = Math.random() < 0.5, lane = Math.random() < 0.5 ? 0 : 1;
    const s = { x: anywhere ? rand(60, GW - 60) : (fromLeft ? -100 : GW + 100), y: lane ? 284 : 218, s: lane ? 1.3 : 1.05, vx: (fromLeft ? 1 : -1) * rand(14, 34) * (lane ? 1.1 : 0.8), sink: 0, f: pick([0, 1, 2]) };
    if (anywhere && Math.random() < 0.5) s.vx *= -1; g.ships.push(s);
  }
  for (let i = 0; i < 4; i++) spawn(true);
  g.update = function (dt) {
    FX.step(g.fx, dt); g.flash = Math.max(0, g.flash - dt);
    if (g.over) { g.overT += dt; if (g.overT > 1.4) g.done = true; return; }
    g.t += dt; g.cool = Math.max(0, g.cool - dt);
    g.rx = GW / 2 + (GW / 2 - 46) * Math.sin(g.t * OMEGA);
    for (const s of g.ships) { if (s.sink) s.sink += dt; else s.x += s.vx * dt; }
    g.ships = g.ships.filter(s => s.sink < 1.3 && s.x > -160 && s.x < GW + 160);
    while (g.ships.filter(s => !s.sink).length < 4) spawn(false);
    for (const f of g.flying) f.t += dt;
    const land = g.flying.filter(f => f.t >= f.life); g.flying = g.flying.filter(f => f.t < f.life);
    for (const f of land) {
      let best = null, bd = 1e9; for (const s of g.ships) { if (s.sink) continue; const d = Math.abs(s.x - f.tx); if (d < 60 && d < bd) { best = s; bd = d; } }
      if (best) { best.sink = 0.001; g.sunk++; FX.add(g.fx, { k: 'burst', x: best.x, y: best.y - 30, r: 46, life: 0.55 }); FX.add(g.fx, { k: 'txt', s: '격침!', x: best.x, y: best.y - 90, size: 24, life: 0.8 }); }
      else { FX.add(g.fx, { k: 'txt', s: '빗나감', x: f.tx, y: RY - 24, size: 15, c: '#FFFFFF', life: 0.6 }); }
    }
    if (g.t >= g.dur) { g.over = true; g.t = g.dur; }
  };
  g.action = function (name, down) {
    if (name !== 'fire' || down === false || g.over || g.cool > 0) return;
    g.cool = CD; g.shots++; g.flash = 0.15;
    g.flying.push({ t: 0, life: 0.28, tx: g.rx, sx: GW / 2 + 60, sy: 372 });
  };
  g.onDown = function () { g.action('fire'); };
  g.ui = () => ({ fire: g.cool / CD });
  g.result = () => ({ score: Math.min(1000, g.sunk * 100), note: `격침 ${g.sunk}척 · 발포 ${g.shots}회` });
  g.draw = function (c) {
    if (!Spr.bg(c, 'bgSea', { px: 0.3, py: 0.5 })) vgrad(c, 0, 0, GW, GH, '#2E6E86', '#0F3145');
    topShade(c, 80, 0.5);
    for (const s of g.ships.slice().sort((a, b) => a.y - b.y)) {
      const flip = s.vx < 0;
      if (s.sink) {
        const k = s.sink, sf = k < 0.28 ? 3 : (k < 0.62 ? 4 : (k < 0.95 ? 5 : 6));
        drawShip(c, 'jp', s.x, s.y + Math.max(0, k - 0.95) * 30, s.s, { frame: ['shjp', 3, sf], flip, alpha: k > 1.0 ? Math.max(0, 1 - (k - 1.0) / 0.3) : 1 });
      } else drawShip(c, 'jp', s.x, s.y + Math.sin(g.t * 2 + s.x * 0.03) * 2, s.s, { frame: ['shjp', 3, s.f], flip });
    }
    c.save(); c.strokeStyle = 'rgba(15,26,40,.7)'; c.lineWidth = 8; c.beginPath(); c.arc(g.rx, RY, 30, 0, 7); c.stroke(); c.restore();
    c.strokeStyle = '#FFD86B'; c.lineWidth = 4; c.beginPath(); c.arc(g.rx, RY, 30, 0, 7); c.stroke();
    c.beginPath(); c.moveTo(g.rx - 42, RY); c.lineTo(g.rx - 14, RY); c.moveTo(g.rx + 14, RY); c.lineTo(g.rx + 42, RY); c.moveTo(g.rx, RY - 42); c.lineTo(g.rx, RY - 14); c.moveTo(g.rx, RY + 14); c.lineTo(g.rx, RY + 42); c.stroke();
    for (const f of g.flying) { const k = f.t / f.life, x = f.sx + (f.tx - f.sx) * k, y = f.sy + (RY + 6 - f.sy) * k - Math.sin(k * Math.PI) * 26; c.fillStyle = '#20242B'; c.beginPath(); c.arc(x, y, 6, 0, 7); c.fill(); }
    drawShip(c, 'po', GW / 2, 428 + Math.sin(g.t * 2) * 2, 1.35, { frame: ['shpo', 0, 1] });
    FX.draw(c, g.fx);
    txt(c, `격침 ${g.sunk}`, 14, 28, { size: 20, stroke: C.ink });
    if (g.over) { c.fillStyle = 'rgba(15,26,40,.65)'; c.fillRect(0, 0, GW, GH); txt(c, `옥포 앞바다의 왜선 ${g.sunk}척 격침`, GW / 2, 220, { size: 30, serif: true, w: 900, align: 'center' }); }
  };
  return g;
}

/* ============================================================
   Stage 3. 한산도: 학익진 완성 타이밍
   ============================================================ */
function gHansan() {
  const CX = GW / 2, CY = 160, RX = 250, RY = 124, BX = 104, BW = 520, BY = 394;
  const ANG = [90, 48, 132, 14, 166];
  const g = { dur: 0, t: 0, step: 0, u: 0, dir: 1, zc: 0.5, zh: 0.12, sp: 0.9, placed: [], pts: [], state: 'aim', st: 0, done: false, fx: [], over: false, controls: { kind: 'fire', fire: '학익진 전개!', hint: '초록색 구역에서 누르세요' } };
  const enemy = []; for (let i = 0; i < 7; i++) enemy.push({ x: CX + rand(-64, 64), y: CY + rand(-30, 30), sink: 0, f: pick([0, 1, 2]), flip: Math.random() < 0.5 });
  function newZone() { g.zc = rand(0.25, 0.75); g.zh = 0.125 - g.step * 0.014; g.sp = 0.85 + g.step * 0.22; }
  newZone();
  function slot(i, off = 0) { const a = (ANG[i] + off) * Math.PI / 180; return { x: CX + RX * Math.cos(a), y: CY + RY * Math.sin(a), right: Math.cos(a) > 0.15 }; }
  g.update = function (dt) {
    FX.step(g.fx, dt); g.st += dt; g.t += dt;
    for (const p of g.placed) p.k = Math.min(1, p.k + dt / 0.7);
    if (g.state === 'aim') { g.u += g.dir * g.sp * dt; if (g.u >= 1) { g.u = 1; g.dir = -1; } if (g.u <= 0) { g.u = 0; g.dir = 1; } }
    else if (g.state === 'place') { if (g.st > 0.75) { if (g.step >= 5) { g.state = 'volley'; g.st = 0; } else { g.state = 'aim'; g.st = 0; newZone(); } } }
    else if (g.state === 'volley') {
      if (g.st > 0.3) enemy.forEach((e, i) => { if (g.st > 0.5 + i * 0.22 && !e.sink) { e.sink = 0.001; FX.add(g.fx, { k: 'burst', x: e.x, y: e.y, r: 34, life: 0.6 }); } });
      enemy.forEach(e => { if (e.sink) e.sink += dt; });
      if (g.st > 3.0) { g.over = true; g.done = true; }
    }
  };
  function tap() {
    if (g.state !== 'aim') return;
    const err = Math.abs(g.u - g.zc) / g.zh;
    const pts = err <= 1 ? Math.round(200 - 60 * err) : Math.max(40, Math.round(140 - 40 * err));
    const off = (err <= 1 ? err * 3 : Math.min(28, 3 + (err - 1) * 9)) * (g.u > g.zc ? 1 : -1);
    g.pts.push(pts);
    g.placed.push({ i: g.step, off, k: 0, ok: err <= 1, x: 0, y: 0 });
    FX.add(g.fx, { k: 'txt', s: err <= 0.35 ? '완벽!' : err <= 1 ? '성공' : '어긋남', x: BX + BW * g.u, y: BY - 26, size: 22, c: err <= 1 ? C.gold2 : '#E8A29A', life: 0.8 });
    g.step++; g.state = 'place'; g.st = 0;
  }
  g.action = (n, d) => { if (n === 'fire' && d !== false) tap(); };
  g.onDown = () => tap();
  g.ui = () => ({});
  g.result = () => { const s = g.pts.reduce((a, b) => a + b, 0); return { score: Math.min(1000, s), note: `학익진 완성도 ${Math.round(Math.min(1000, s) / 10)}%` }; };
  g.draw = function (c) {
    if (!Spr.bg(c, 'bgSea', { px: 0.5, py: 0.35 })) vgrad(c, 0, 0, GW, GH, '#2E6E86', '#0F3145');
    c.save(); c.setLineDash([4, 8]); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 2.5; c.beginPath(); c.ellipse(CX, CY, RX, RY, 0, 0.05 * Math.PI, 0.95 * Math.PI); c.stroke(); c.restore();
    for (let i = g.step; i < 5; i++) { const s = slot(i); c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 2; c.beginPath(); c.arc(s.x, s.y - 10, 16, 0, 7); c.stroke(); txt(c, String(i + 1), s.x, s.y - 4, { size: 14, align: 'center', color: '#fff', stroke: 'rgba(15,26,40,.7)', sw: 3 }); }
    for (const e of enemy) {
      const bob = Math.sin(g.t * 1.6) * 2;
      if (e.sink) { const k = e.sink, sf = k < 0.3 ? 3 : (k < 0.65 ? 4 : (k < 0.95 ? 5 : 6)); drawShip(c, 'jp', e.x, e.y + 26, 0.72, { frame: ['shjp', 3, sf], flip: e.flip, alpha: k > 1.0 ? Math.max(0, 1 - (k - 1.0) / 0.3) : 1 }); }
      else drawShip(c, 'jp', e.x, e.y + 26 + bob, 0.72, { frame: ['shjp', 3, e.f], flip: e.flip });
    }
    for (const p of g.placed) {
      const tgt = slot(p.i, p.off); const k = 1 - Math.pow(1 - p.k, 3);
      const sy = GH + 70 + (tgt.y + 22 - GH - 70) * k; p.x = tgt.x; p.y = sy;
      if (p.i === 0) { if (!Spr.draw(c, 'shgb', 0, 1, tgt.x, sy, 1.1)) shipVec(c, tgt.x, sy, 0.8); }
      else if (!Spr.draw(c, 'shpo', 0, tgt.right ? 3 : 1, tgt.x, sy, 0.9)) shipVec(c, tgt.x, sy, 0.7, tgt.right ? -1 : 1);
    }
    FX.draw(c, g.fx);
    if (g.state !== 'volley') {
      c.fillStyle = 'rgba(15,26,40,.85)'; rrect(c, BX - 12, BY - 22, BW + 24, 58, 8); c.fill();
      c.fillStyle = '#2A3B4A'; rrect(c, BX, BY - 10, BW, 30, 5); c.fill();
      c.fillStyle = '#5FAF8E'; c.fillRect(BX + BW * (g.zc - g.zh), BY - 10, BW * g.zh * 2, 30);
      const ix = BX + BW * g.u; c.fillStyle = C.por; c.fillRect(ix - 3, BY - 16, 6, 42);
    }
    topShade(c, 50, 0.5);
    txt(c, `배치 ${Math.min(g.step, 5)} / 5`, 14, 28, { size: 20, stroke: C.ink });
    if (g.state === 'volley') txt(c, '학익진 완성! 일제 사격!', GW / 2, 320, { size: 34, align: 'center', serif: true, w: 900, stroke: C.ink, sw: 7 });
  };
  return g;
}

/* ============================================================
   Stage 4. 의병 매복(아군 오인 주의) + 진주성 방어전
   진주성: 5명 중 1명꼴 덩치 큰 적장 등장, 화살 3대를 맞아야 처치
   ============================================================ */
function gUibyeong() {
  const A_END = 14, B_START = 15.5, DUR = 27.5, PENALTY = 40;
  const COLS = [100, 275, 450, 625], ROWS = [200, 295, 390];
  const WALLPTS = [{ x: 336, y: 196 }, { x: 268, y: 258 }, { x: 222, y: 326 }, { x: 150, y: 384 }];
  const ARCH = [{ x: 296, y: 176 }, { x: 236, y: 244 }, { x: 188, y: 316 }, { x: 118, y: 372 }, { x: 350, y: 132 }];
  const g = { dur: DUR, t: 0, phase: 'A', hitsA: 0, hitsB: 0, friendly: 0, wallHp: 100, pops: [], foes: [], fx: [], spawnT: 0.4, done: false, over: false, overT: 0, anim: 0, shoot: [0, 0, 0, 0, 0], controls: { kind: 'hint', hint: '붉은 표시 = 왜군(+점수) · 초록 표시 = 아군(누르면 감점)' } };
  const reeds = []; COLS.forEach((cx, ci) => ROWS.forEach((cy, ri) => { const arr = []; for (let i = 0; i < 24; i++) arr.push({ dx: rand(-58, 58), h: rand(30, 52), lean: rand(-0.35, 0.35), w: rand(1.5, 3) }); reeds.push({ x: cx, y: cy, arr, idx: ci + ri * 4 }); }));
  g.update = function (dt) {
    FX.step(g.fx, dt); g.anim += dt;
    for (let i = 0; i < g.shoot.length; i++) g.shoot[i] = Math.max(0, g.shoot[i] - dt);
    if (g.over) { g.overT += dt; if (g.overT > 1.4) g.done = true; return; }
    g.t += dt;
    g.phase = g.t < A_END ? 'A' : (g.t < B_START ? 'T' : 'B');
    if (g.phase === 'A') {
      g.spawnT -= dt;
      const p = g.t / A_END;
      const active = g.pops.filter(q => !q.done).length;
      if (g.spawnT <= 0 && active < (p > 0.55 ? 3 : 2)) {
        g.spawnT = 0.62 - 0.14 * p;
        const free = reeds.filter(r => !g.pops.some(q => !q.done && q.r === r));
        if (free.length) g.pops.push({ r: pick(free), t: 0, life: rand(1.0, 1.45) * (1 - 0.25 * p), hit: false, done: false, ally: g.t > 1.2 && Math.random() < 0.38 });
      }
    } else if (g.phase === 'T') { g.pops.forEach(q => q.done = true); }
    for (const q of g.pops) { q.t += dt; if (!q.hit && q.t >= q.life) q.done = true; if (q.hit && q.t > q.hitT + 0.4) q.done = true; }
    g.pops = g.pops.filter(q => !q.done);
    if (g.phase === 'B') {
      g.spawnT -= dt;
      if (g.spawnT <= 0) {
        g.spawnT = rand(0.7, 1.05);
        const wp = pick(WALLPTS), tough = Math.random() < 0.2;
        g.foes.push({ x: GW + 30, y: clamp(wp.y + rand(-70, 60), 40, GH - 30), tx: wp.x + rand(8, 22), ty: wp.y + rand(-8, 8), v: rand(60, 85), ph: rand(0, 6), dead: false, dieT: 0, atk: 0, reached: false, tough, hp: tough ? 3 : 1 });
      }
      for (const f of g.foes) {
        if (f.dead) { f.dieT += dt; continue; } f.ph += dt;
        if (f.reached) { f.atk += dt; if (f.atk >= 1.0) { f.atk = 0; g.wallHp = Math.max(0, g.wallHp - 3); FX.add(g.fx, { k: 'burst', x: f.x - 20, y: f.y - 30, r: 20, c: '#C4432F', life: 0.35 }); } }
        else { const d = dist(f.x, f.y, f.tx, f.ty); if (d < 8) f.reached = true; else { f.x += (f.tx - f.x) / d * f.v * dt; f.y += (f.ty - f.y) / d * f.v * dt; } }
      }
      g.foes = g.foes.filter(f => !f.dead || f.dieT < 0.5);
    }
    if (g.t >= DUR) { g.over = true; g.t = DUR; }
  };
  g.onDown = function (x, y) {
    if (g.over) return;
    if (g.phase === 'A') {
      let best = null, bd = 1e9;
      for (const q of g.pops) { if (q.hit || q.done) continue; const k = q.t < 0.15 ? q.t / 0.15 : (q.life - q.t < 0.15 ? Math.max(0, (q.life - q.t) / 0.15) : 1); if (k < 0.5) continue; const d = dist(x, y, q.r.x, q.r.y - 46); if (d < 54 && d < bd) { best = q; bd = d; } }
      if (best) {
        best.hit = true; best.hitT = best.t;
        if (best.ally) { g.friendly++; FX.add(g.fx, { k: 'txt', s: `아군이다! -${PENALTY}`, x: best.r.x, y: best.r.y - 100, c: '#FF8E7A', size: 22, life: 0.9 }); }
        else { g.hitsA++; FX.add(g.fx, { k: 'burst', x: best.r.x, y: best.r.y - 50, r: 26, life: 0.35 }); FX.add(g.fx, { k: 'txt', s: '+25', x: best.r.x, y: best.r.y - 100, life: 0.6 }); }
      } else FX.add(g.fx, { k: 'x', x, y, life: 0.3 });
    } else if (g.phase === 'B') {
      let best = null, bd = 1e9;
      for (const f of g.foes) { if (f.dead) continue; const d = dist(x, y, f.x, f.y - 34); if (d < 52 && d < bd) { best = f; bd = d; } }
      let ai = 0, ad = 1e9; ARCH.forEach((a, i) => { const d = dist(a.x, a.y, x, y); if (d < ad) { ad = d; ai = i; } }); g.shoot[ai] = 0.25;
      if (best) {
        best.hp--; FX.add(g.fx, { k: 'burst', x: best.x, y: best.y - 34, r: 22, life: 0.3 });
        if (best.hp <= 0) { best.dead = true; best.dieT = 0; g.hitsB++; FX.add(g.fx, { k: 'txt', s: '+40', x: best.x, y: best.y - 80, life: 0.6 }); }
        else FX.add(g.fx, { k: 'txt', s: `화살 ${3 - best.hp}/3`, x: best.x, y: best.y - 80, size: 15, c: C.gold2, life: 0.5 });
      } else FX.add(g.fx, { k: 'x', x, y, life: 0.3 });
    }
  };
  g.ui = () => ({});
  g.result = () => { const pen = g.friendly * PENALTY; return { score: clamp(Math.min(1000, g.hitsA * 25 + g.hitsB * 40) - pen, 0, 1000), note: `갈대밭 격퇴 ${g.hitsA}명 · 성 방어 ${g.hitsB}명` + (g.friendly ? ` · 아군 오인 ${g.friendly}회(-${pen})` : '') }; };
  g.draw = function (c) {
    if (g.phase === 'A') {
      vgrad(c, 0, 0, GW, GH, '#33463A', '#24352B'); topShade(c, 90, 0.45);
      for (const r of reeds) {
        const pop = g.pops.find(q => q.r === r);
        if (pop) {
          const k = pop.hit ? Math.max(0, 1 - (pop.t - pop.hitT) / 0.35) : (pop.t < 0.15 ? pop.t / 0.15 : (pop.life - pop.t < 0.15 ? Math.max(0, (pop.life - pop.t) / 0.15) : 1));
          const rise = 26 + 40 * k;
          c.save(); c.beginPath(); c.rect(r.x - 70, r.y - 140, 140, 146); c.clip();
          const col = pop.ally ? 'rgba(90,210,130,1)' : 'rgba(224,80,60,1)';
          c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); c.ellipse(r.x, r.y - 8, 30, 9, 0, 0, 7); c.stroke();
          if (pop.hit) drawSoldier(c, pop.ally ? 'js' : 'jp', 'fall', r.x, r.y + 44 - 44 * (1 - k), 1.25, g.anim, { alpha: k });
          else drawSoldier(c, pop.ally ? 'js' : 'jp', 'front', r.x, r.y + 96 - rise, 1.3, pop.t * 1.5, { shadow: 0 });
          c.restore();
          if (pop.ally && !pop.hit && k > 0.6) txt(c, '아군', r.x, r.y - 118 + (1 - k) * 30, { size: 14, align: 'center', color: '#8CF0AE', stroke: C.ink, sw: 4 });
        }
        for (const s of r.arr) { c.strokeStyle = 'rgba(160,180,110,1)'; c.lineWidth = s.w; c.beginPath(); c.moveTo(r.x + s.dx, r.y + 8); c.quadraticCurveTo(r.x + s.dx + s.lean * 20, r.y - s.h * 0.6, r.x + s.dx + s.lean * 46, r.y - s.h * 0.75); c.stroke(); }
      }
      txt(c, `격퇴 ${g.hitsA}` + (g.friendly ? `   아군 오인 ${g.friendly}` : ''), GW - 14, 28, { size: 20, align: 'right', stroke: C.ink });
      txt(c, '왜군 보급 수송대를 습격하라', 14, 28, { size: 17, stroke: C.ink });
      bar(c, 14, 40, 200, 10, 1 - g.t / A_END, C.gold);
    } else {
      if (!Spr.bg(c, 'bgCastle', { px: 0, py: 0.5 })) vgrad(c, 0, 0, GW, GH, '#8a7a55', '#5b5a40');
      ARCH.forEach((a, i) => { const shot = g.shoot[i] > 0; drawSoldier(c, 'js', shot ? 'shoot' : 'aim', a.x, a.y, 0.78, shot ? g.anim + i : 0, { shadow: 0.6 }); });
      const list = g.foes.slice().sort((a, b) => a.y - b.y);
      for (const f of list) {
        const sc = f.tough ? 1.28 : 0.95;
        if (f.tough && !f.dead) { c.strokeStyle = 'rgba(226,194,115,.9)'; c.lineWidth = 3; c.beginPath(); c.ellipse(f.x, f.y - 2, 28, 9, 0, 0, 7); c.stroke(); }
        if (f.dead) drawSoldier(c, 'jp', 'fall', f.x, f.y, sc, g.anim, { alpha: 1 - f.dieT / 0.5 });
        else drawSoldier(c, 'jp', f.reached ? 'shoot' : 'left', f.x, f.y, sc, f.ph * 1.4, { flip: f.reached });
        if (f.tough && !f.dead) for (let k = 0; k < 3; k++) { c.fillStyle = k < f.hp ? '#E2C273' : 'rgba(233,237,230,.3)'; c.beginPath(); c.arc(f.x - 12 + k * 12, f.y - 108 * sc / 1.28, 3.5, 0, 7); c.fill(); }
      }
      FX.draw(c, g.fx); topShade(c, 70, 0.5);
      txt(c, '진주성 사수! 덩치 큰 적장은 화살 3번을 맞아야 쓰러집니다', 14, 28, { size: 16, stroke: C.ink });
      txt(c, `격퇴 ${g.hitsB}`, GW - 14, 28, { size: 20, align: 'right', stroke: C.ink });
      bar(c, 14, 40, 200, 10, 1 - (g.t - B_START) / (DUR - B_START), C.gold);
      bar(c, GW - 214, 40, 200, 12, g.wallHp / 100, g.wallHp > 40 ? '#7FB7A4' : '#C4432F'); txt(c, `성벽 ${Math.round(g.wallHp)}`, GW - 208, 50, { size: 11, color: C.ink });
      if (g.phase === 'T') c.fillStyle = 'rgba(15,26,40,.5)', c.fillRect(0, 0, GW, GH);
    }
    if (g.phase === 'A' || g.phase === 'T') FX.draw(c, g.fx);
    if (g.phase === 'T') txt(c, '진주목사 김시민과 함께 진주성을 지켜라!', GW / 2, 220, { size: 28, align: 'center', serif: true, w: 900, stroke: C.ink, sw: 6 });
    if (g.over) { c.fillStyle = 'rgba(15,26,40,.65)'; c.fillRect(0, 0, GW, GH); txt(c, '진주성을 지켜 냈습니다', GW / 2, 220, { size: 32, serif: true, w: 900, align: 'center' }); }
  };
  return g;
}
