/* ============================================================
   Stage 5~8
   ============================================================ */

/* Stage 5. 평양성: 불랑기포 슬링샷 공성전 — 제한시간 30초 */
function gPyongyang() {
  const CAN = { x: 92, y: 352 }, GROUND = 366;
  const towers = [{ x: 480, y: 300, alive: true, fall: 0 }, { x: 590, y: 260, alive: true, fall: 0 }, { x: 690, y: 300, alive: true, fall: 0 }];
  const g = { dur: 30, t: 0, shots: 3, used: 0, state: 'aim', st: 0, aim: null, recoil: 0, fx: [], done: false, controls: { kind: 'drag', hint: '포를 드래그해 각도와 세기를 맞춘 뒤 손을 떼세요' } };
  g.update = function (dt) {
    FX.step(g.fx, dt); if (g.state !== 'end') g.t = Math.min(g.dur, g.t + dt); g.st += dt; g.recoil = Math.max(0, g.recoil - dt);
    if (g.state === 'fly') {
      const b = g.ball; b.vy += 600 * dt; b.x += b.vx * dt; b.y += b.vy * dt;
      for (const tw of towers) if (tw.alive && dist(b.x, b.y, tw.x, tw.y) < 30) { tw.alive = false; g.state = 'end'; g.st = 0; FX.add(g.fx, { k: 'burst', x: tw.x, y: tw.y, r: 40, life: 0.6 }); FX.add(g.fx, { k: 'txt', s: '명중!', x: tw.x, y: tw.y - 40, size: 24, life: 0.8 }); }
      if (g.state === 'fly' && (b.y > 398 || b.x > GW + 20 || b.x < -20)) { g.state = 'end'; g.st = 0; }
    } else if (g.state === 'end' && g.st > 0.6) { g.state = 'aim'; g.st = 0; g.aim = null; }
    towers.forEach(t => { if (!t.alive) t.fall += dt; });
    if (g.t >= g.dur && g.state === 'aim') { g.aim = null; g.state = 'end'; g.st = 0; FX.add(g.fx, { k: 'txt', s: '시간 종료!', x: GW / 2, y: 150, size: 30, life: 1.4 }); }
    const finished = towers.every(t => !t.alive) || g.used >= g.shots || g.t >= g.dur;
    if (finished && g.state !== 'fly' && g.st > 1.2) g.done = true;
  };
  g.onDown = (x, y) => { if (g.state === 'aim' && g.used < g.shots && dist(x, y, CAN.x, CAN.y) < 70) g.aim = { sx: x, sy: y, x, y }; };
  g.onMove = (x, y, down) => { if (down && g.aim) { g.aim.x = x; g.aim.y = y; } };
  g.onUp = () => {
    if (!g.aim || g.state !== 'aim') return;
    const dx = g.aim.sx - g.aim.x, dy = g.aim.sy - g.aim.y, L = Math.hypot(dx, dy);
    if (L < 12) { g.aim = null; return; }
    const k = 6.4; g.ball = { x: CAN.x + 18, y: CAN.y - 10, vx: dx * k, vy: dy * k }; g.used++; g.state = 'fly'; g.st = 0; g.recoil = 0.3;
  };
  g.ui = () => ({});
  g.result = () => { const d = towers.filter(t => !t.alive).length; return { score: Math.min(1000, d * 300 + Math.max(0, g.shots - g.used) * 30), note: `격파한 포루 ${d}곳 · 사용한 포탄 ${g.used}발 · 남은 시간 ${Math.max(0, Math.ceil(g.dur - g.t))}초` }; };
  g.draw = function (c) {
    vgrad(c, 0, 0, GW, GH, '#4A5A78', '#8FA0AE'); vgrad(c, 0, GROUND, GW, GH - GROUND, '#4E5A3E', '#37402A');
    c.fillStyle = '#6B6558'; c.fillRect(430, GROUND - 66, 300, 66); c.fillStyle = '#585246'; for (let x = 430; x < 730; x += 30) c.fillRect(x, GROUND - 76, 20, 12);
    txt(c, '평양성', 580, GROUND - 78, { size: 18, align: 'center', serif: true, w: 900, color: '#EDE7D8' });
    towers.forEach((tw, i) => {
      if (tw.alive) { c.fillStyle = '#7A6A50'; c.fillRect(tw.x - 16, tw.y, 32, GROUND - tw.y); drawSoldier(c, 'jp', 'shoot', tw.x, tw.y, 0.8, g.t, { flip: true, shadow: 0.5 }); }
      else { const f = Math.min(1, tw.fall); c.save(); c.globalAlpha = 1 - f * 0.6; c.translate(tw.x, tw.y + f * 30); c.rotate(f * 0.7); c.fillStyle = '#5A4E3C'; c.fillRect(-16, 0, 32, 40); c.restore(); }
    });
    drawSoldier(c, 'js', 'right', 120, GROUND - 2, 0.9, g.t, { shadow: 0.6 }); drawSoldier(c, 'js', 'right', 176, GROUND + 6, 0.9, g.t + 1, { shadow: 0.6 });
    c.save(); c.translate(CAN.x, CAN.y - g.recoil * 20);
    c.fillStyle = '#2E2A22'; c.beginPath(); c.moveTo(-20, 10); c.lineTo(20, 10); c.lineTo(10, -22); c.lineTo(-10, -22); c.closePath(); c.fill();
    c.restore();
    if (g.aim) { c.strokeStyle = 'rgba(233,237,230,.7)'; c.lineWidth = 3; c.setLineDash([6, 6]); c.beginPath(); c.moveTo(g.aim.sx, g.aim.sy); c.lineTo(g.aim.x, g.aim.y); c.stroke(); c.setLineDash([]); c.fillStyle = C.gold2; c.beginPath(); c.arc(g.aim.x, g.aim.y, 8, 0, 7); c.fill(); }
    if (g.state === 'fly' && g.ball) { c.fillStyle = '#20242B'; c.beginPath(); c.arc(g.ball.x, g.ball.y, 8, 0, 7); c.fill(); }
    FX.draw(c, g.fx); topShade(c, 60, 0.4);
    for (let i = 0; i < g.shots; i++) { c.fillStyle = i < g.shots - g.used ? '#2E2A22' : 'rgba(46,42,34,.25)'; c.beginPath(); c.arc(24 + i * 24, 20, 8, 0, 7); c.fill(); }
    txt(c, `포루 ${towers.filter(t => !t.alive).length} / 3`, GW - 14, 28, { size: 20, align: 'right', stroke: C.ink });
    txt(c, `남은 시간 ${Math.max(0, Math.ceil(g.dur - g.t))}초`, GW / 2, 28, { size: 20, align: 'center', stroke: C.ink, color: g.dur - g.t < 8 ? '#FF9A88' : C.gold2 });
    bar(c, GW / 2 - 90, 38, 180, 8, 1 - g.t / g.dur, C.gold);
    if (towers.every(t => !t.alive)) txt(c, '평양성 탈환!', GW / 2, 150, { size: 34, align: 'center', serif: true, w: 900, stroke: C.ink, sw: 7 });
  };
  return g;
}

/* Stage 6. 행주산성: 신기전/돌던지기 — 방패부대(신기전 면역, 2배속) 10명당 2명 */
function gHaengju() {
  const FY = 336, ZONE = 232, RCD = 1.6, SCD = 0.45;
  const g = { dur: 25, t: 0, hp: 100, kills: 0, enemies: [], fx: [], spawnT: 0.4, rc: 0, sc: 0, gauge: 0, last: '', frenzy: 0, supplyT: 0, supplies: 0, done: false, over: false, overT: 0, shake: 0, controls: { kind: 'dual' } };
  const women = [];
  g.update = function (dt) {
    FX.step(g.fx, dt); g.shake = Math.max(0, g.shake - dt);
    for (const e of g.enemies) if (e.dead) e.dieT += dt;
    g.enemies = g.enemies.filter(e => !e.dead || e.dieT < 0.4);
    if (g.over) { g.overT += dt; if (g.overT > 2.0) g.done = true; return; }
    g.t += dt; const p = Math.min(1, g.t / g.dur);
    g.rc = Math.max(0, g.rc - dt); g.sc = Math.max(0, g.sc - dt); g.frenzy = Math.max(0, g.frenzy - dt); g.supplyT = Math.max(0, g.supplyT - dt);
    g.spawnT -= dt;
    if (g.spawnT <= 0) {
      g.spawnT = Math.max(0.42, 0.78 - 0.3 * p);
      const n = Math.random() < 0.3 + 0.35 * p ? 2 : 1;
      for (let i = 0; i < n; i++) { const shield = Math.random() < 0.2, baseVy = rand(40, 58) * (1 + 0.25 * p); g.enemies.push({ x: rand(50, GW - 50), y: -30 - i * 24, vy: shield ? baseVy * 2 : baseVy, shield, ph: rand(0, 6), atk: 0, reached: false, dead: false, dieT: 0 }); }
    }
    for (const e of g.enemies) {
      if (e.dead) continue; e.ph += dt * 8;
      if (e.reached) { e.atk += dt; if (e.atk >= 1.0) { e.atk = 0; g.hp -= 3; g.shake = 0.2; FX.add(g.fx, { k: 'burst', x: e.x, y: FY, r: 20, c: '#C4432F', life: 0.35 }); } }
      else { e.y += e.vy * dt; if (e.y >= FY - 6) { e.y = FY - 6; e.reached = true; } }
    }
    if (g.hp <= 0) { g.hp = 0; g.over = true; } else if (g.t >= g.dur) { g.over = true; g.t = g.dur; }
    for (const w of women) w.x += w.v * dt;
  };
  function gain(w) {
    g.gauge += (g.last && g.last !== w) ? 15 : 4; g.last = w;
    if (g.gauge >= 100) { g.gauge = 0; g.rc = 0; g.sc = 0; g.frenzy = 3.5; g.supplyT = 2.2; g.supplies++; women.length = 0; for (let i = 0; i < 6; i++) women.push({ x: -40 - i * 46, v: 230 + rand(-20, 20) }); FX.add(g.fx, { k: 'txt', s: '행주치마 보급대 출동!', x: GW / 2, y: 190, size: 26, life: 1.4 }); }
  }
  g.action = function (name, down) {
    if (g.over || down === false) return;
    const f = g.frenzy > 0 ? 0.35 : 1;
    if (name === 'rocket' && g.rc <= 0) {
      g.rc = RCD * f; gain('rocket');
      const targets = g.enemies.filter(e => !e.dead && !e.shield && e.y < ZONE && e.y > -10);
      for (let i = 0; i < 9; i++) FX.add(g.fx, { k: 'line', x0: 120 + i * 62, y0: FY + 4, x1: 80 + i * 70 + rand(-20, 20), y1: rand(40, ZONE), life: 0.5, c: '#FFD27A', w: 3 });
      targets.forEach(e => { e.dead = true; e.dieT = 0; g.kills++; FX.add(g.fx, { k: 'burst', x: e.x, y: e.y - 20, r: 26, life: 0.45 }); });
      if (targets.length) FX.add(g.fx, { k: 'txt', s: `신기전 +${targets.length}`, x: GW / 2, y: 120, size: 20, life: 0.8 });
      const shielded = g.enemies.some(e => !e.dead && e.shield && e.y < ZONE + 40);
      if (shielded) FX.add(g.fx, { k: 'txt', s: '방패부대는 신기전이 안 통해요!', x: GW / 2, y: 150, size: 16, c: '#9FD1FF', life: 0.9 });
    } else if (name === 'stone' && g.sc <= 0) {
      g.sc = SCD * f; gain('stone');
      const near = g.enemies.filter(e => !e.dead && e.y >= ZONE - 30).sort((a, b) => b.y - a.y).slice(0, g.frenzy > 0 ? 3 : 2);
      near.forEach(e => { e.dead = true; e.dieT = 0; g.kills++; FX.add(g.fx, { k: 'line', x0: e.x + rand(-60, 60), y0: FY + 10, x1: e.x, y1: e.y - 16, life: 0.25, c: '#D8D2C2', w: 5 }); FX.add(g.fx, { k: 'burst', x: e.x, y: e.y - 18, r: 20, life: 0.3 }); });
    }
  };
  g.onDown = (x) => g.action(x < GW / 2 ? 'rocket' : 'stone');
  g.ui = () => ({ rocket: g.rc / (RCD * (g.frenzy > 0 ? 0.35 : 1)), stone: g.sc / (SCD * (g.frenzy > 0 ? 0.35 : 1)), frenzy: g.frenzy > 0 });
  g.result = () => ({ score: Math.min(1000, Math.round(g.kills * 16 + g.hp * 2.5 + g.supplies * 30)), note: `격퇴 ${g.kills}명 · 산성 체력 ${Math.round(g.hp)} · 보급대 ${g.supplies}회` });
  g.draw = function (c) {
    c.save(); if (g.shake > 0) c.translate(rand(-3, 3), rand(-3, 3));
    vgrad(c, 0, 0, GW, GH, '#39483A', '#5E6B48');
    c.save(); c.setLineDash([6, 10]); c.strokeStyle = 'rgba(226,194,115,.4)'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, ZONE); c.lineTo(GW, ZONE); c.stroke(); c.restore();
    txt(c, '▲ 위쪽 전체: 신기전', GW - 12, ZONE - 8, { size: 14, align: 'right', color: 'rgba(226,194,115,.95)', stroke: C.ink, sw: 3 });
    txt(c, '▼ 아래쪽 가까운 적: 돌 던지기', GW - 12, ZONE + 20, { size: 14, align: 'right', color: 'rgba(233,237,230,.95)', stroke: C.ink, sw: 3 });
    txt(c, '방패 부대(파란 표시)는 신기전이 통하지 않아요! 돌 던지기로만 처치', 14, ZONE + 20, { size: 13, color: 'rgba(159,209,255,.95)', stroke: C.ink, sw: 3 });
    for (const e of g.enemies.slice().sort((a, b) => a.y - b.y)) {
      const sc = 0.95 + 0.3 * clamp(e.y / FY, 0, 1);
      if (e.shield && !e.dead) { c.strokeStyle = 'rgba(120,180,226,.9)'; c.lineWidth = 3; c.beginPath(); c.ellipse(e.x, e.y - 2, 24 * sc, 8 * sc, 0, 0, 7); c.stroke(); }
      if (e.dead) drawSoldier(c, 'jp', 'fall', e.x, e.y, sc, g.t, { alpha: 1 - e.dieT / 0.4 });
      else drawSoldier(c, 'jp', e.reached ? 'shoot' : 'front', e.x, e.y, sc, e.ph / 7, {});
      if (e.shield && !e.dead) txt(c, '방패', e.x, e.y - 108 * sc / 0.95, { size: 12, align: 'center', color: '#9FD1FF', stroke: C.ink, sw: 3 });
    }
    c.fillStyle = '#2A2B24'; c.fillRect(0, FY + 6, GW, GH - FY);
    for (let x = 0; x < GW; x += 22) { c.fillStyle = '#7A5A3A'; c.beginPath(); c.moveTo(x + 2, FY + 16); c.lineTo(x + 11, FY - 10); c.lineTo(x + 20, FY + 16); c.closePath(); c.fill(); }
    for (let i = 0; i < 7; i++) drawSoldier(c, 'js', 'back', 60 + i * 101, FY + 64, 0.95, 0, { shadow: 0 });
    c.fillStyle = '#2E6E86'; c.fillRect(GW / 2 + 1, FY - 34, 40, 22); txt(c, '권', GW / 2 + 21, FY - 17, { size: 16, align: 'center', serif: true, w: 900, color: '#F1E9D6' });
    if (g.supplyT > 0) women.forEach(w => { if (w.x > -30 && w.x < GW + 30) { const yy = FY + 60; c.fillStyle = '#B5352A'; c.beginPath(); c.moveTo(w.x - 9, yy - 12); c.lineTo(w.x + 9, yy - 12); c.lineTo(w.x + 13, yy + 12); c.lineTo(w.x - 13, yy + 12); c.closePath(); c.fill(); c.fillStyle = '#E0B48F'; c.beginPath(); c.arc(w.x, yy - 32, 7, 0, 7); c.fill(); } });
    FX.draw(c, g.fx); c.restore();
    bar(c, 14, 12, 190, 18, g.hp / 100, g.hp > 40 ? '#7FB7A4' : '#C4432F'); txt(c, `산성 ${Math.round(g.hp)}`, 22, 26, { size: 12, color: C.por, stroke: C.ink, sw: 3 });
    bar(c, GW / 2 - 130, 12, 260, 18, g.gauge / 100, g.frenzy > 0 ? '#E2C273' : '#B5352A'); txt(c, g.frenzy > 0 ? '행주치마 보급 중!' : '행주치마 게이지: 번갈아 누르기', GW / 2, 26, { size: 12, align: 'center', color: C.por, stroke: C.ink, sw: 3 });
    txt(c, `격퇴 ${g.kills}`, GW - 14, 28, { size: 20, align: 'right', stroke: C.ink });
    bar(c, 14, 36, 190, 8, 1 - g.t / g.dur, C.gold);
    if (g.over) { c.fillStyle = 'rgba(15,26,40,.65)'; c.fillRect(0, 0, GW, GH); txt(c, g.hp <= 0 ? '산성이 위태롭습니다!' : '행주산성을 지켜 냈습니다', GW / 2, 220, { size: 32, serif: true, w: 900, align: 'center' }); }
  };
  return g;
}

/* Stage 7. 명량: 울돌목 조류 서바이벌 — 물살 1.2배, 왜선 절반만 화살 사격 */
function gMyeongnyang() {
  const LM = 96, RM = GW - 96, FY = 372, ACC = 1.2, BASE = 62 * ACC, SURGE = 105 * ACC, PEN = 25;
  const g = { dur: 30, t: 0, fleet: 13, sunk: 0, hits: 0, enemies: [], arrows: [], fx: [], spawnT: 0.9, done: false, over: false, overT: 0, curV: 0, curDir: 1, surge: 0, warn: false, flips: [6, 12.5, 19, 25.5], fi: 0, left: false, right: false, flag: { x: GW / 2, vx: 0, inv: 0, cool: 0.4, hurt: 0 }, controls: { kind: 'steer' } };
  const marks = []; for (let i = 0; i < 40; i++) marks.push({ x: rand(LM, RM), y: rand(0, GH), l: rand(14, 30) });
  const shoreL = [], shoreR = []; for (let y = 0; y <= GH + 20; y += 20) { shoreL.push(LM - rand(0, 24)); shoreR.push(RM + rand(0, 24)); }
  function sink(e) { if (e.sink) return; e.sink = 0.001; g.sunk++; }
  g.update = function (dt) {
    FX.step(g.fx, dt);
    if (g.over) { g.overT += dt; if (g.overT > 1.8) g.done = true; return; }
    g.t += dt; const p = g.t / g.dur, f = g.flag;
    if (g.fi < g.flips.length) {
      const ft = g.flips[g.fi]; g.warn = g.t > ft - 1.4 && g.t < ft;
      if (g.t >= ft) { g.curDir *= -1; g.surge = 2.4; g.fi++; g.warn = false; FX.add(g.fx, { k: 'txt', s: '물살이 바뀌었다!', x: GW / 2, y: 170, size: 26, life: 1.3 }); }
    } else g.warn = false;
    g.surge = Math.max(0, g.surge - dt);
    g.curV += (g.curDir * (g.surge > 0 ? SURGE : BASE) - g.curV) * Math.min(1, dt * 2.5);
    marks.forEach(m => { m.x += g.curV * dt * 1.2; m.y += 20 * dt; if (m.x < LM - 10) m.x = RM; if (m.x > RM + 10) m.x = LM; if (m.y > GH) m.y = 0; });
    g.spawnT -= dt;
    if (g.spawnT <= 0) { g.spawnT = rand(0.7, 1.0) * (1 - 0.15 * p); g.enemies.push({ x: rand(LM + 34, RM - 34), y: -40, vy: rand(62, 96), k: rand(0.45, 1.7), f: rand(0.8, 1.8), ph: rand(0, 6), sink: 0, canShoot: Math.random() < 0.5, shootT: rand(2.0, 4.0), aim: 0, flash: 0 }); }
    const mult = g.surge > 0 ? 2.2 : 1;
    for (const e of g.enemies) {
      if (e.sink) { e.sink += dt; continue; }
      e.x += (g.curV * mult * e.k + Math.sin(g.t * e.f + e.ph) * 14) * dt; e.y += e.vy * dt;
      if (e.x < LM + 8 || e.x > RM - 8) sink(e);
      e.flash = Math.max(0, e.flash - dt);
      if (e.canShoot) {
        if (e.aim > 0) { e.aim -= dt; if (e.aim <= 0) { const tx = f.x + f.vx * 0.35, ty = FY, d = dist(e.x, e.y, tx, ty) || 1; g.arrows.push({ x: e.x, y: e.y + 10, vx: (tx - e.x) / d * 215, vy: (ty - e.y) / d * 215 }); e.flash = 0.25; } }
        else { e.shootT -= dt; if (e.shootT <= 0 && e.y > 30 && e.y < FY - 110) { e.aim = 0.45; e.shootT = rand(3.4, 5.2); } }
      }
    }
    const alive = g.enemies.filter(e => !e.sink);
    for (let i = 0; i < alive.length; i++) for (let j = i + 1; j < alive.length; j++) { const a = alive[i], b = alive[j]; if (dist(a.x, a.y, b.x, b.y) < 34) { sink(a); sink(b); FX.add(g.fx, { k: 'burst', x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, r: 36, life: 0.5 }); } }
    g.enemies = g.enemies.filter(e => e.sink < 0.7 && e.y < GH + 50);
    const dir = (g.right ? 1 : 0) - (g.left ? 1 : 0);
    f.vx += (dir * 190 - f.vx) * Math.min(1, dt * 6); f.x = clamp(f.x + (f.vx + g.curV * 0.5) * dt, LM + 20, RM - 20); f.inv = Math.max(0, f.inv - dt); f.hurt = Math.max(0, f.hurt - dt); f.cool -= dt;
    for (const a of g.arrows) {
      a.x += a.vx * dt; a.y += a.vy * dt;
      if (f.hurt <= 0 && Math.abs(a.x - f.x) < 16 && Math.abs(a.y - FY) < 30) { a.gone = true; g.hits++; f.hurt = 0.6; FX.add(g.fx, { k: 'txt', s: `화살 명중! -${PEN}점`, x: f.x, y: FY - 56, size: 20, c: '#FF8E7A', life: 1.0 }); }
    }
    g.arrows = g.arrows.filter(a => !a.gone && a.y < GH + 30 && a.x > -30 && a.x < GW + 30);
    for (const e of g.enemies) { if (e.sink) continue; if (dist(e.x, e.y, f.x, FY) < 36) { sink(e); if (f.inv <= 0) { g.fleet--; f.inv = 1.2; FX.add(g.fx, { k: 'txt', s: '전선 -1', x: f.x, y: FY - 44, size: 20, c: '#E8A29A', life: 0.9 }); } } }
    if (f.cool <= 0) { let best = null; for (const e of g.enemies) { if (e.sink) continue; if (e.y < FY - 24 && e.y > FY - 285 && Math.abs(e.x - f.x) < 58 && (!best || e.y > best.y)) best = e; } if (best) { f.cool = 0.6; sink(best); FX.add(g.fx, { k: 'line', x0: f.x, y0: FY - 26, x1: best.x, y1: best.y, life: 0.25, c: '#FFE7A8', w: 4 }); } }
    if (g.fleet <= 0) { g.fleet = 0; g.over = true; } else if (g.t >= g.dur) { g.over = true; g.t = g.dur; }
  };
  g.action = (n, d) => { if (n === 'left') g.left = d !== false; if (n === 'right') g.right = d !== false; };
  const setSide = (x) => { g.left = x < GW / 2; g.right = x >= GW / 2; };
  g.onDown = (x) => setSide(x); g.onMove = (x, y, down) => { if (down) setSide(x); }; g.onUp = () => { g.left = false; g.right = false; };
  g.ui = () => ({});
  g.result = () => ({ score: clamp(g.sunk * 34 + g.fleet * 10 - g.hits * PEN, 0, 1000), note: `격침 ${g.sunk}척 · 남은 전선 ${g.fleet}척` + (g.hits ? ` · 화살 ${g.hits}회 맞음(-${g.hits * PEN})` : '') });
  g.draw = function (c) {
    if (!Spr.bg(c, 'bgSea', { px: 0.5, py: 0.5 })) vgrad(c, 0, 0, GW, GH, '#12475A', '#0C3242');
    c.fillStyle = 'rgba(6,42,66,.42)'; c.fillRect(0, 0, GW, GH);
    c.strokeStyle = 'rgba(235,250,255,.4)'; c.lineWidth = 2; c.lineCap = 'round';
    marks.forEach(m => { const s = Math.sign(g.curV) || 1; c.beginPath(); c.moveTo(m.x, m.y); c.lineTo(m.x + s * m.l, m.y); c.stroke(); });
    c.fillStyle = '#2A3138'; c.beginPath(); c.moveTo(0, 0); shoreL.forEach((x, i) => c.lineTo(x, i * 20)); c.lineTo(0, GH + 20); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(GW, 0); shoreR.forEach((x, i) => c.lineTo(x, i * 20)); c.lineTo(GW, GH + 20); c.closePath(); c.fill();
    const f = g.flag;
    for (const e of g.enemies) {
      if (e.sink) { if (!Spr.draw(c, 'shjp', 3, 4, e.x, e.y + 22, 0.66, { alpha: Math.max(0, 1 - e.sink / 0.7) })) shipVec(c, e.x, e.y, 0.5, 1, { alpha: Math.max(0, 1 - e.sink / 0.7) }); }
      else {
        if (e.aim > 0) { c.fillStyle = 'rgba(232,70,50,.35)'; c.beginPath(); c.arc(e.x, e.y, 34, 0, 7); c.fill(); txt(c, '!', e.x, e.y - 34, { size: 24, align: 'center', color: '#FF6A55', stroke: C.ink, sw: 4 }); }
        const fr = e.flash > 0 ? 0 : 1, row = e.flash > 0 ? 2 : 1;
        if (!Spr.draw(c, 'shjp', row, fr, e.x, e.y, 0.78, { anchor: 'c' })) shipVec(c, e.x, e.y, 0.6, 1, {});
        if (e.canShoot) txt(c, '활', e.x, e.y + 24, { size: 11, align: 'center', color: '#FFD7CE', stroke: C.ink, sw: 3 });
      }
    }
    for (const a of g.arrows) { const ang = Math.atan2(a.vy, a.vx); c.save(); c.translate(a.x, a.y); c.rotate(ang); c.strokeStyle = '#4A3324'; c.lineWidth = 3; c.beginPath(); c.moveTo(-16, 0); c.lineTo(8, 0); c.stroke(); c.restore(); }
    if (!Spr.draw(c, 'shpo', 0, 0, f.x, FY, 0.72, { anchor: 'c', alpha: (f.inv > 0 || f.hurt > 0) && Math.floor(g.t * 12) % 2 === 0 ? 0.4 : 1 })) shipVec(c, f.x, FY, 0.7, 1, {});
    FX.draw(c, g.fx);
    txt(c, `격침 ${g.sunk}`, 14, 28, { size: 20, stroke: C.ink });
    if (g.hits) txt(c, `화살 ${g.hits}회 맞음 -${g.hits * PEN}`, 14, 60, { size: 15, color: '#FF9A88', stroke: C.ink, sw: 4 });
    const s = Math.sign(g.curV) || 1, cx = GW / 2; c.fillStyle = g.warn ? '#FFB3A3' : 'rgba(255,255,255,.95)';
    c.beginPath(); c.moveTo(cx + s * 30, 20); c.lineTo(cx + s * 10, 8); c.lineTo(cx + s * 10, 32); c.closePath(); c.fill();
    for (let i = 0; i < 13; i++) { const ok = i < g.fleet; c.globalAlpha = ok ? 1 : 0.22; if (!Spr.draw(c, 'shpo', 0, 1, GW - 22 - i * 24, 24, 0.2, {})) shipVec(c, GW - 22 - i * 24, 24, 0.2, 1, {}); c.globalAlpha = 1; }
    bar(c, 14, 40 + (g.hits ? 26 : 0), 190, 8, 1 - g.t / g.dur, C.gold);
    if (g.warn) { c.fillStyle = 'rgba(196,67,47,.12)'; c.fillRect(0, 0, GW, GH); txt(c, '곧 물살이 바뀝니다!', GW / 2, 130, { size: 28, align: 'center', serif: true, w: 900, stroke: C.ink, sw: 6, color: '#FFD7CE' }); }
    if (g.over) { c.fillStyle = 'rgba(15,26,40,.65)'; c.fillRect(0, 0, GW, GH); txt(c, g.fleet > 0 ? '울돌목을 지켜 냈습니다' : '함대가 흩어졌습니다', GW / 2, 220, { size: 32, serif: true, w: 900, align: 'center' }); }
  };
  return g;
}

/* Stage 8. 노량: 퇴각선 포위 꼬리잡기 */
function gNoryang() {
  const SP = 34, WIN = 15, SPEED = 140, TURN = 3.6;
  const g = { dur: 60, t: 0, kills: 0, tail: 0, won: false, inv: 0, fx: [], done: false, over: false, overT: 0, key: 0, controls: { kind: 'hint', hint: '누른 채 움직이면 대장선이 그쪽으로 향해요' } };
  const head = { x: 130, y: GH * 0.55, ang: 0 }, tgt = { x: GW * 0.6, y: GH * 0.5 }, trail = [{ x: head.x, y: head.y }];
  const rocks = []; let guard = 0;
  while (rocks.length < 7 && guard++ < 400) { const r = { x: rand(70, GW - 70), y: rand(60, GH - 60), r: rand(16, 25) }; if (dist(r.x, r.y, head.x, head.y) > 150 && rocks.every(o => dist(o.x, o.y, r.x, r.y) > 80)) rocks.push(r); }
  const enemies = [];
  function spawnEnemy() { for (let k = 0; k < 30; k++) { const x = rand(60, GW - 60), y = rand(50, GH - 50); if (dist(x, y, head.x, head.y) > 220 && rocks.every(r => dist(r.x, r.y, x, y) > r.r + 26)) { enemies.push({ x, y, ang: rand(0, 6.28), ph: rand(0, 6), dead: false, sink: 0, respawn: 0, f: pick([0, 1, 2]) }); return; } } enemies.push({ x: GW - 80, y: 80, ang: 3, ph: 0, dead: false, sink: 0, respawn: 0, f: 0 }); }
  for (let i = 0; i < 5; i++) spawnEnemy();
  function segPos(d) { let acc = 0, px = head.x, py = head.y; for (const q of trail) { const s = dist(px, py, q.x, q.y); if (s > 0 && acc + s >= d) { const k = (d - acc) / s; return { x: px + (q.x - px) * k, y: py + (q.y - py) * k }; } acc += s; px = q.x; py = q.y; } return { x: px, y: py }; }
  const norm = (a) => ((a + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
  g.update = function (dt) {
    FX.step(g.fx, dt);
    if (g.over) { g.overT += dt; if (g.overT > 1.9) g.done = true; return; }
    g.t += dt; g.inv = Math.max(0, g.inv - dt);
    if (g.key) head.ang += g.key * TURN * dt;
    else if (dist(head.x, head.y, tgt.x, tgt.y) > 12) head.ang += clamp(norm(Math.atan2(tgt.y - head.y, tgt.x - head.x) - head.ang), -TURN * dt, TURN * dt);
    head.x += Math.cos(head.ang) * SPEED * dt; head.y += Math.sin(head.ang) * SPEED * dt;
    if (head.x < 16) { head.x = 16; head.ang = Math.PI - head.ang; } if (head.x > GW - 16) { head.x = GW - 16; head.ang = Math.PI - head.ang; }
    if (head.y < 16) { head.y = 16; head.ang = -head.ang; } if (head.y > GH - 16) { head.y = GH - 16; head.ang = -head.ang; }
    if (dist(head.x, head.y, trail[0].x, trail[0].y) >= 3) { trail.unshift({ x: head.x, y: head.y }); if (trail.length > 320) trail.length = 320; }
    for (const r of rocks) if (g.inv <= 0 && dist(head.x, head.y, r.x, r.y) < r.r + 13) { g.inv = 1.3; const lost = Math.min(2, g.tail); g.tail -= lost; const a = Math.atan2(head.y - r.y, head.x - r.x); head.x += Math.cos(a) * 22; head.y += Math.sin(a) * 22; head.ang = a; FX.add(g.fx, { k: 'txt', s: lost ? '암초! 전선 -' + lost : '암초!', x: head.x, y: head.y - 30, size: 18, c: '#FF9A88', life: 0.9 }); }
    if (g.inv <= 0) for (let i = 3; i < g.tail; i++) { const s = segPos((i + 1) * SP); if (dist(head.x, head.y, s.x, s.y) < 16) { const lost = Math.min(2, g.tail); g.tail -= lost; g.inv = 1.3; FX.add(g.fx, { k: 'txt', s: '꼬리 충돌! 전선 -' + lost, x: head.x, y: head.y - 30, size: 18, c: '#FF9A88', life: 0.9 }); break; } }
    for (const e of enemies) {
      if (e.dead) { e.sink += dt; if (e.sink > 1.2 && !e.respawn) e.respawn = 1; continue; }
      e.ph += dt; const dh = dist(head.x, head.y, e.x, e.y); let want = e.ang, sp = 62;
      if (dh < 160) { want = Math.atan2(e.y - head.y, e.x - head.x) + Math.sin(e.ph * 3) * 0.3; sp = 92; } else want = e.ang + Math.sin(e.ph * 0.9) * 0.9 * dt * 4;
      if (e.x < 46 || e.x > GW - 46 || e.y < 46 || e.y > GH - 46) want = Math.atan2(GH / 2 - e.y, GW / 2 - e.x);
      for (const r of rocks) if (dist(r.x, r.y, e.x, e.y) < r.r + 26) want = Math.atan2(e.y - r.y, e.x - r.x);
      e.ang += clamp(norm(want - e.ang), -3 * dt, 3 * dt); e.x += Math.cos(e.ang) * sp * dt; e.y += Math.sin(e.ang) * sp * dt;
      e.x = clamp(e.x, 14, GW - 14); e.y = clamp(e.y, 14, GH - 14);
      if (dh < 36) { e.dead = true; e.sink = 0.001; g.kills++; if (g.tail < WIN) g.tail++; FX.add(g.fx, { k: 'burst', x: e.x, y: e.y, r: 34, life: 0.5 }); if (g.tail >= WIN && !g.won) { g.won = true; g.over = true; FX.add(g.fx, { k: 'txt', s: '퇴로 봉쇄 완료!', x: GW / 2, y: 190, size: 30, life: 1.6 }); } }
    }
    for (let i = enemies.length - 1; i >= 0; i--) if (enemies[i].respawn) { enemies.splice(i, 1); spawnEnemy(); }
    if (!g.over && g.t >= g.dur) { g.over = true; g.t = g.dur; }
  };
  g.onDown = (x, y) => { tgt.x = x; tgt.y = y; };
  g.onMove = (x, y) => { tgt.x = x; tgt.y = y; };
  g.action = (n, d) => { g.key = n === 'left' ? (d === false ? 0 : -1) : (n === 'right' ? (d === false ? 0 : 1) : g.key); };
  g.ui = () => ({});
  g.result = () => { const rem = Math.max(0, g.dur - g.t); const sc = g.kills * 40 + (g.won ? 300 + Math.min(100, Math.floor(rem) * 4) : g.tail * 10); return { score: Math.min(1000, Math.round(sc)), note: `격침 ${g.kills}척 · 아군 함대 ${g.tail}척 ${g.won ? '· 퇴로 봉쇄 성공' : ''}` }; };
  function side(c, key, rowR, colR, rowL, colL, x, y, ang, s, o = {}) { const right = Math.cos(ang) >= 0, tilt = clamp(Math.sin(ang) * 0.45, -0.45, 0.45) * (right ? 1 : -1); return Spr.draw(c, key, right ? rowR : rowL, right ? colR : colL, x, y, s, Object.assign({ anchor: 'c', rot: tilt }, o)); }
  g.draw = function (c) {
    if (!Spr.bg(c, 'bgSea', { px: 0.5, py: 0.5 })) vgrad(c, 0, 0, GW, GH, '#08131F', '#12283A');
    c.fillStyle = 'rgba(5,14,36,.56)'; c.fillRect(0, 0, GW, GH);
    for (const r of rocks) { c.fillStyle = '#2E353C'; c.beginPath(); c.arc(r.x, r.y, r.r, 0, 7); c.fill(); }
    for (const e of enemies) {
      if (e.dead) { const k = e.sink, sf = k < 0.3 ? 3 : (k < 0.65 ? 4 : (k < 0.95 ? 5 : 6)); Spr.draw(c, 'shjp', 3, sf, e.x, e.y + 8, 0.66, { anchor: 'c', flip: Math.cos(e.ang) < 0, alpha: k > 1.0 ? Math.max(0, 1 - (k - 1.0) / 0.2) : 1 }) || shipVec(c, e.x, e.y, 0.5, 1, { alpha: 0.5 }); }
      else { if (!side(c, 'shjp', 3, e.f, 3, e.f, e.x, e.y, e.ang, 0.66, { flip: Math.cos(e.ang) < 0 })) shipVec(c, e.x, e.y, 0.5, 1, {}); }
    }
    for (let i = g.tail - 1; i >= 0; i--) { const p = segPos((i + 1) * SP), q = i === 0 ? { x: head.x, y: head.y } : segPos(i * SP), a = Math.atan2(q.y - p.y, q.x - p.x); if (!side(c, 'shpo', 0, 1, 0, 3, p.x, p.y, a, 0.5)) shipVec(c, p.x, p.y, 0.5, 1, {}); }
    if (!side(c, 'shgb', 0, 6, 0, 7, head.x, head.y, head.ang, 0.66)) shipVec(c, head.x, head.y, 0.6, 1, {});
    FX.draw(c, g.fx);
    txt(c, `함대 ${g.tail} / ${WIN}척`, 14, 28, { size: 20, stroke: C.ink }); txt(c, `격침 ${g.kills}`, GW - 14, 28, { size: 20, align: 'right', stroke: C.ink });
    bar(c, 14, 40, 190, 8, 1 - g.t / g.dur, C.gold);
    if (g.over) { c.fillStyle = 'rgba(8,19,31,.7)'; c.fillRect(0, 0, GW, GH); txt(c, g.won ? '왜군의 퇴로를 완전히 막았습니다' : '날이 밝아 옵니다', GW / 2, 220, { size: 32, serif: true, w: 900, align: 'center' }); }
  };
  return g;
}

const GAMES = {
  DEFENSE_TAP: gDefense, TIMING_SHOOT: gOkpo, HAKIKJIN_TIMING: gHansan, AMBUSH_WHACK: gUibyeong,
  SLINGSHOT_CANNON: gPyongyang, DUAL_TAP_DEFENSE: gHaengju, CURRENT_SURVIVAL: gMyeongnyang, SNAKE_PURSUIT: gNoryang
};
