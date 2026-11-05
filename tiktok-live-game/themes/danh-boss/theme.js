// Đánh boss cả phòng: mọi tương tác thành sát thương, cả phòng cùng hạ boss, boss sau mạnh hơn.
// Số liệu (máu từng boss, sát thương mỗi loại, thời gian hồi sinh) ở theme.json → "hud" → "game".
//
// Bố cục (khung 1080 × 1920, trong vùng an toàn Kit.safe):
//   trái trên: tên game, số liệu, bảng chiêu theo quà · phải trên: sát thương hôm nay (top 3)
//   dưới hai cột: thanh máu boss (to, rõ) · giữa: boss (y ~800) · dưới: đám đông (từ y ~1170)
// Ảnh boss: điền "image" cho từng boss trong hud.game.bosses (PNG nền trong, cao ~600px), để trống thì vẽ tạm bằng code.

(function () {
  const K = window.Kit, G = window.Game;
  const Z = K.safe || { top: 240, side: 100 };
  const L = Z.side, COL = 320;
  const $ = (s, r) => (r || document).querySelector(s);
  let theme = {}, cfg = {}, GC = {}, root = null;

  const STYLE = `
  .bx-sign { padding:12px 18px; text-align:center; }
  .bx-sign h1 { margin:0; font-size:46px; line-height:1; font-weight:800; letter-spacing:2px; color:var(--gold); text-shadow:0 3px 0 #5a1a1a, 0 0 18px rgba(255,120,60,.45); }
  .bx-sign p { margin:4px 0 0; font-size:21px; font-weight:600; opacity:.9; }
  .bx-stats { padding:8px 16px; display:flex; justify-content:space-between; font-size:23px; font-weight:700; }
  .bx-tiers { padding:8px 14px; }
  .bx-tier { display:flex; align-items:center; gap:8px; font-size:21px; font-weight:600; white-space:nowrap; padding:2px 0; }
  .bx-tier .i { width:30px; text-align:center; font-size:24px; } .bx-tier .p { margin-left:auto; color:var(--gold); font-weight:800; }
  .bx-tier.hit { animation: bxHit 1s ease-out; }
  @keyframes bxHit { 0% { transform:scale(1.08); text-shadow:0 0 16px #ffd25e; } }
  .bx-board { padding:12px 16px; }
  .bx-board h3 { margin:0 0 6px; text-align:center; font-size:24px; color:var(--gold); }
  .bx-board li { display:flex; gap:8px; align-items:center; font-size:23px; font-weight:700; padding:2px 0; }
  .bx-board ol { list-style:none; margin:0; padding:0; }
  .bx-board .md { width:32px; text-align:center; } .bx-board .nm { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .bx-board .c { color:#ff9b6a; font-size:21px; } .bx-board li.empty { opacity:.5; font-weight:600; }
  .bx-hp { left:${L}px; right:${L}px; padding:10px 18px; text-align:center; }
  @keyframes bxLow { to { filter:brightness(1.5); } }
  .bx-hp .call { font-size:24px; font-weight:700; }
  .bx-hp .call b { color:var(--gold); font-size:28px; }
  .bx-hp .boost { display:none; margin-left:10px; padding:2px 12px; border-radius:99px; background:#ffd25e; color:#3a1200; font:800 22px 'Baloo 2','Noto Sans SC',sans-serif; }
  .bx-hp.boosting .boost { display:inline-block; animation: bxLow .5s ease-in-out infinite alternate; }
  .bx-thanks { position:absolute; left:${L}px; right:${L}px; padding:10px 20px; text-align:center; border-radius:14px; background:rgba(20,10,36,.78); border:2px solid rgba(255,210,94,.6); font-size:26px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; opacity:0; transition:opacity .3s; }
  .bx-thanks.show { opacity:1; } .bx-thanks .who { color:var(--gold); }
  .gm-banner h2 { margin:0; font-size:46px; line-height:1.05; color:var(--gold); }
  .gm-banner .sub { margin-top:6px; font-size:26px; font-weight:700; }
  .gm-banner ol { list-style:none; margin:14px 0 0; padding:0; display:grid; gap:6px; font-size:26px; font-weight:700; }
  .gm-banner ol li { display:flex; gap:10px; justify-content:center; } .gm-banner ol .c { color:#ff9b6a; }
  .gm-banner .next { margin-top:14px; font-size:22px; opacity:.85; }
  .bx-note { position:absolute; left:${L + 30}px; right:${L + 30}px; padding:16px 24px; text-align:center; opacity:0; transition:opacity .5s; }
  .bx-note.show { opacity:1; } .bx-note h4 { margin:0 0 4px; color:var(--gold); font:800 24px 'Baloo 2','Noto Sans SC',sans-serif; } .bx-note p { margin:0; font-size:26px; line-height:1.4; font-weight:600; }
  `;

  // ---------- Trạng thái game (lưu trong trình duyệt, xem game.js) ----------
  const fresh = () => ({ level: 0, hp: 0, max: 0, phase: 'fight', deadAt: 0, boostUntil: 0, kills: 0, top: {}, bossTop: {}, lastHit: '' });
  const S = G.store('danh-boss:v1', fresh);
  const bossAt = (lv) => {
    const list = GC.bosses?.length ? GC.bosses : [{ name: 'Boss', hp: 1000, color: '#c0504d' }];
    if (lv < list.length) return list[lv];
    const last = list[list.length - 1], extra = lv - list.length + 1;
    return { ...last, name: `${last.name} +${extra}`, hp: Math.round(last.hp * Math.pow(GC.grow || 1.45, extra)) };
  };
  const D = () => ({ chat: 15, like: 2, coin: 25, ...(GC.damage || {}) });
  // cỡ boss theo cấp: boss sau to hơn (bosses[].size ghi đè), tối đa sizeMax
  const sizeOf = (lv) => bossAt(lv).size ?? Math.min(GC.sizeMax || 1.3, (GC.sizeStart || 0.8) + lv * (GC.sizeStep || 0.13));

  function spawn(lv) {
    const b = bossAt(lv), d = S.data;
    Object.assign(d, { level: lv, hp: b.hp, max: b.hp, phase: 'fight', bossTop: {}, lastHit: '' });
    S.save(); look.spawnAt = performance.now(); look.lagHp = b.hp; renderHp();
    if (lv > 0) {
      G.toast(G.t('appear', { boss: b.name, hp: G.fmt(b.hp) }, '⚔️ {boss} xuất hiện! · {hp} máu'), 3500, 1000);
      setTimeout(() => { K.fx.shake({ intensity: 14, duration: 600 }); const p = bossPos(); K.fx.emit('ember', { x: p.x, y: p.y + 120, count: 30, spread: 120 }); K.audio.sfx('boom'); }, 500);
    }
  }

  // ---------- Giao diện ----------
  function init(o) {
    theme = o.theme; cfg = theme.hud || {}; GC = cfg.game || {};
    G.setText(theme);
    root = G.mount(o.stage, STYLE);
    const top = Z.top + 6, el = G.el;

    const sign = el('div', 'panel bx-sign'); sign.style.cssText = `left:${L}px;top:${top}px;width:${COL}px`;
    sign.append(el('h1', '', cfg.title?.text || theme.name), el('p', '', cfg.title?.sub || ''));
    const stats = el('div', 'panel bx-stats'); stats.style.cssText = `left:${L}px;width:${COL}px`;
    stats.append(el('span', '', '👥 0'), el('span', '', '❤️ 0'), el('span', '', '💀 0'));
    const tiers = el('div', 'panel bx-tiers'); tiers.style.cssText = `left:${L}px;width:${COL}px`;
    for (const a of (theme.actions || []).filter((x) => x.card)) {
      const r = el('div', 'bx-tier'); r.dataset.action = a.id;
      r.append(el('span', 'i', a.icon || '🎁'), el('span', '', a.label), el('span', 'p', a.card.replace(/\s*XU/i, ' ' + G.t('coin', {}, 'xu'))));
      tiers.append(r);
    }
    const board = el('div', 'panel bx-board'); board.style.cssText = `right:${L}px;top:${top}px;width:${COL}px`;
    board.append(el('h3', '', G.t('board', {}, 'SÁT THƯƠNG HÔM NAY')), el('ol'));

    const hp = el('div', 'panel bx-hp');
    hp.innerHTML = `<div class="call"></div>`; // thanh máu vẽ ngay trên đầu boss (xem drawHpBar)
    G.rich($('.call', hp), G.t('call', {}, 'Gõ **ĐÁNH** để ra đòn · ❤️ tiếp sức · 🎁 tung chiêu')).append(el('span', 'boost', '×2'));
    const thanks = el('div', 'bx-thanks');
    const note = el('div', 'panel bx-note'); note.style.top = '1040px'; note.append(el('h4'), el('p'));
    root.append(sign, stats, tiers, board, hp, thanks, note);

    const stack = () => {
      stats.style.top = `${sign.offsetTop + sign.offsetHeight + 10}px`;
      tiers.style.top = `${stats.offsetTop + stats.offsetHeight + 10}px`;
      const y = Math.max(tiers.offsetTop + tiers.offsetHeight, board.offsetTop + board.offsetHeight) + 14;
      hp.style.top = `${y}px`; thanks.style.top = `${cfg.thanksTop ?? 1120}px`; // dòng cảm ơn quà dưới chân boss, không che tên + thanh máu
    };
    stack(); document.fonts?.ready.then(stack); init.stack = stack;

    const d = S.data;
    if (!d.max) spawn(0);
    else if (d.phase === 'dead') { if (Date.now() - d.deadAt > (GC.respawnMs || 7000)) spawn(d.level + 1); else setTimeout(() => spawn(d.level + 1), GC.respawnMs || 7000); }
    renderHp(); renderBoard();
    setInterval(renderHp, 1000); // tắt nhãn ×2 khi hết giờ tiếp sức
  }

  function renderHp() {
    const hp = root && $('.bx-hp', root); if (!hp) return;
    hp.classList.toggle('boosting', Date.now() < S.data.boostUntil);
  }

  function renderBoard() {
    const ol = root && $('.bx-board ol', root); if (!ol) return;
    const top = G.topOf(S.data.top, 3), el = G.el;
    ol.replaceChildren(...[0, 1, 2].map((i) => {
      const r = top[i], li = el('li', r ? '' : 'empty');
      li.append(el('span', 'md', ['🥇', '🥈', '🥉'][i]), el('span', 'nm', r ? r.name : G.t('empty', {}, 'Còn trống')));
      if (r) li.append(el('span', 'c', G.fmt(r.v)));
      return li;
    }));
    const st = root.querySelectorAll('.bx-stats span'); if (st[2]) st[2].textContent = `💀 ${G.fmt(S.data.kills)}`;
    init.stack?.();
  }

  function state(s, n) {
    const st = root && root.querySelectorAll('.bx-stats span'); if (!st) return;
    st[0].textContent = `👥 ${G.fmt(n)}`; st[1].textContent = `❤️ ${G.fmt(s.totals?.likes)}`;
  }

  const thanksQ = [];
  function giftCard(ev) {
    thanksQ.push(ev); if (thanksQ.length > 6) thanksQ.splice(0, thanksQ.length - 6);
    if (!giftCard.busy) nextThanks();
    const r = root && root.querySelector(`.bx-tier[data-action="${CSS.escape(ev.action || '')}"]`);
    if (r) { r.classList.remove('hit'); void r.offsetWidth; r.classList.add('hit'); }
  }
  function nextThanks() {
    const box = $('.bx-thanks', root), ev = thanksQ.shift();
    if (!ev) { giftCard.busy = false; box.classList.remove('show'); return; }
    giftCard.busy = true;
    box.replaceChildren(G.el('span', 'who', ev.user?.name || G.t('guest', {}, 'Khách')), document.createTextNode(' ' + G.t('used', { skill: ev.label || '', gift: ev.gift?.name || '' }, 'tung {skill} · 🎁 {gift}') + (ev.count > 1 ? ` ×${ev.count}` : '')));
    box.classList.add('show');
    setTimeout(() => { box.classList.remove('show'); setTimeout(nextThanks, 250); }, thanksQ.length > 2 ? 1300 : 2600);
  }
  function periodic(ev) {
    const n = root && $('.bx-note', root); if (!n || !ev.text) return;
    $('h4', n).textContent = ev.title || ''; $('p', n).textContent = ev.text;
    n.classList.add('show'); clearTimeout(periodic.t); periodic.t = setTimeout(() => n.classList.remove('show'), 10000);
  }
  const noop = () => {};
  K.hud = { init, giftCard, ticker: noop, state, guide: noop, toast: (t, ms) => G.toast(t, ms, 1000), periodic, draw: noop, remember: noop, reset: noop };

  // ---------- Sát thương ----------
  // Hai kiểu báo đòn: bật "Giọng đọc xướng tên" (tab Live) → đọc chiêu lớn + chữ đòn đánh;
  // tắt giọng đọc → "chỉ hiệu ứng đánh": chữ tên chiêu to hơn, rung + vòng va chạm mỗi đòn quà.
  const fxOnly = () => Live.settings?.voiceEnabled === false;
  const CALL = { danh: ['👊', '#ffffff'], phitieu: ['⚡', '#9fd8ff'], caulua: ['🔥', '#ffb347'], samset: ['⛈️', '#d6e8ff'] };

  function callout(user, action, label, dmg) {
    const c = CALL[action]; if (!c || !label) return;
    const b = body(), s = sizeOf(S.data.level), big = fxOnly();
    if (action === 'danh' && !big) return; // lệnh chat: chỉ hiện chữ ở kiểu "chỉ hiệu ứng" cho đỡ rối
    K.fx.text(b.x + (Math.random() - 0.5) * 80, b.y - 40 * s, `${c[0]} ${label.toUpperCase()}!`, { color: c[1], size: big ? 64 : 46, duration: 1300 });
    K.fx.text(b.x, b.y + 20 * s, user?.name || '', { color: '#ffe9a8', size: big ? 34 : 28, duration: 1300 });
    if (big && action !== 'danh') {
      K.fx.halo(b.x, b.y, { radius: 120 + Math.min(160, Math.sqrt(dmg) * 3), color: '255,240,200', duration: 700 });
      K.fx.shake({ intensity: Math.min(16, 4 + Math.sqrt(dmg) / 6), duration: 260 });
    }
  }

  function hit(user, base, delay = 750, info = null) {
    if (!(base > 0)) return;
    setTimeout(() => {
      const d = S.data, dmg = Math.round(base * (Date.now() < d.boostUntil ? 2 : 1));
      G.addScore(d.top, user, dmg);
      if (d.phase === 'fight') {
        G.addScore(d.bossTop, user, dmg);
        d.hp -= dmg; d.lastHit = user?.name || '';
        look.hitAt = performance.now(); look.target = user?.id;
        const b = body(), s = sizeOf(d.level);
        K.fx.text(b.x + (Math.random() - 0.5) * 220 * s, b.y - Math.random() * 120 * s, `-${G.fmt(dmg)}`, { color: dmg >= 500 ? '#ffd25e' : '#ffffff', size: Math.min(64, 30 + Math.sqrt(dmg) * 1.2) });
        if (info) callout(user, info.action, info.label, dmg);
        if (d.hp <= 0) defeat(user);
      }
      S.save(); renderHp(); renderBoard();
    }, delay);
  }

  function defeat(user) {
    const d = S.data, b = bossAt(d.level), next = bossAt(d.level + 1);
    d.phase = 'dead'; d.deadAt = Date.now(); d.kills += 1; look.deadAt = performance.now();
    const top = G.topOf(d.bossTop, 3);
    K.fx.fireworks({ bursts: 4, fountains: 2 }); K.fx.flash({ strength: 0.35 }); K.fx.rain('confetti', { count: 120 });
    K.audio.sfx('win');
    K.run([{ crowd: [{ play: 'cheer', times: 2 }] }], null, {});
    G.banner(() => {
      const el = G.el, ol = el('ol');
      top.forEach((r, i) => { const li = el('li'); li.append(el('span', '', ['🥇', '🥈', '🥉'][i]), el('span', '', r.name), el('span', 'c', G.fmt(r.v))); ol.append(li); });
      return [el('h2', '', G.t('defeated', { boss: b.name.toUpperCase() }, '💥 ĐÃ HẠ {boss}!')), el('div', 'sub', G.t('lastHit', { name: user?.name || G.t('everyone', {}, 'cả phòng') }, 'Đòn kết liễu: {name}')), ol, el('div', 'next', G.t('next', { boss: next.name, hp: G.fmt(next.hp) }, 'Boss tiếp theo to hơn: {boss} · {hp} máu'))];
    }, 6500, 800);
    setTimeout(() => spawn(d.level + 1), GC.respawnMs || 7000);
  }

  K.on('command', (ev) => { if (ev.action === 'danh') hit(ev.user, D().chat, 750, { action: 'danh', label: (theme.actions || []).find((a) => a.id === 'danh')?.label || 'Đánh' }); });
  K.on('like', (ev) => hit(ev.user, (ev.count || 1) * D().like, 300));
  // quà: mỗi xu × damage.coin, nhưng không dưới minDamage của chiêu (để chiêu lớn luôn "ra đòn", kể cả nút thử hiệu ứng 1 xu)
  K.on('gift', (ev) => hit(ev.user, Math.max((ev.total || 0) * D().coin, GC.minDamage?.[ev.action] || 0), ev.action === 'samset' ? 900 : 750, { action: ev.action, label: ev.label }));
  Live.on('reset', () => { S.reset(); spawn(0); renderBoard(); });

  // ---------- Vị trí boss: scene.json points.boss là tâm boss cỡ 1; chân boss cố định trên bục, boss to ra thì cao lên ----------
  const bossPos = () => K.scene.point('boss') || { x: 540, y: 930 };
  const feet = () => { const p = bossPos(); return { x: p.x, y: p.y + 150 }; };
  const body = () => { const f = feet(), s = sizeOf(S.data.level); return { x: f.x, y: f.y - 150 * s }; };
  const aim = () => { const b = body(), s = sizeOf(S.data.level); return { x: b.x + (Math.random() - 0.5) * 160 * s, y: b.y - Math.random() * 110 * s }; };

  // ---------- Hiệu ứng đòn đánh (theme.json { "js": "..." }) ----------

  K.action('tanCong', (p, ev) => {
    if (!p) return;
    const to = aim(), n = Math.min(6, 1 + (ev?.kind === 'gift' ? ev.count || 1 : 0));
    K.fx.fly('star', K.scene.P.head(p), to, { count: n, size: 18, duration: 700, arc: 160 });
    setTimeout(() => { K.fx.emit('spark', { x: to.x, y: to.y, count: 12, spread: 30 }); K.audio.sfx('hit'); }, 700);
  });
  K.action('cauLua', (p) => {
    if (!p) return;
    const to = aim();
    K.fx.fly('ember', K.scene.P.head(p), to, { count: 8, size: 30, duration: 800, arc: 200 });
    setTimeout(() => {
      K.fx.emit('ember', { x: to.x, y: to.y, count: 40, spread: 60 }); K.fx.halo(to.x, to.y, { radius: 170, color: '255,140,60', duration: 1200 });
      K.fx.shake({ intensity: 8, duration: 400 }); K.audio.sfx('boom');
    }, 800);
  });
  K.action('samSet', () => {
    const b = body();
    setTimeout(() => {
      K.fx.pillar(b.x, feet().y + 10, { height: 1000, width: 110, color: '190,220,255', duration: 1500 });
      K.fx.flash({ strength: 0.5, color: '220,235,255' }); K.fx.shake({ intensity: 18, duration: 700 });
      K.fx.emit('star', { x: b.x, y: b.y - 60, count: 40, spread: 90 }); K.audio.sfx('boom');
    }, 600);
  });
  K.action('tiepSuc', () => {
    S.data.boostUntil = Date.now() + (GC.boostMs || 30000); S.save(); renderHp();
    G.toast(G.t('boost', { s: Math.round((GC.boostMs || 30000) / 1000) }, '✨ TIẾP SỨC! Sát thương ×2 trong {s} giây'), 4000, 1000);
  });

  // ---------- Vẽ boss (giữ chỗ khi chưa có ảnh): thân tròn, sừng, mắt nhìn người vừa đánh ----------
  const look = { spawnAt: 0, hitAt: 0, deadAt: 0, target: null, lagHp: 0 };
  const imgs = {};
  G.onDraw('back', (ctx, t) => {
    const d = S.data; if (!d.max) return;
    const b = bossAt(d.level), f = feet(), s = sizeOf(d.level);
    let k = Math.min(1, (t - look.spawnAt) / 900), alpha = 1;
    if (d.phase === 'dead') { const q = Math.min(1, (t - look.deadAt) / 900); if (q >= 1) return; k = 1 - q * 0.4; alpha = 1 - q; }
    const ease = k < 1 ? 1 + 2.7 * Math.pow(k - 1, 3) + 1.7 * Math.pow(k - 1, 2) : 1; // trồi lên, nảy nhẹ
    const hitK = Math.max(0, 1 - (t - look.hitAt) / 220);
    const jx = hitK * Math.sin(t / 18) * 10, breathe = 1 + Math.sin(t / 500) * 0.025;
    ctx.globalAlpha = alpha;
    ctx.translate(f.x + jx, f.y); ctx.scale(s * ease * breathe, s * ease / breathe); ctx.translate(0, -150);
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(0, 150, 170, 30, 0, 0, 6.283); ctx.fill();
    const im = b.image && (imgs[b.image] ||= K.assets.get(b.image));
    if (im && im.ready) { const h = 340, w = h * im.w / im.h; im.draw(ctx, -w / 2, 150 - h, w, h); }
    else drawBlob(ctx, t, b.color || '#c0504d', d.max ? d.hp / d.max : 1);
    if (hitK > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,255,255,${hitK * 0.55})`; ctx.beginPath(); ctx.ellipse(0, 0, 170, 155, 0, 0, 6.283); ctx.fill(); }
  });

  function drawBlob(ctx, t, color, hpPct) {
    const g = ctx.createRadialGradient(-50, -60, 20, 0, 0, 190);
    g.addColorStop(0, '#ffffff55'); g.addColorStop(0.25, color); g.addColorStop(1, '#00000088');
    ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(0, 0, 170, 155, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = g; ctx.fill();
    ctx.fillStyle = '#f4e6c8'; // sừng
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 70, -130); ctx.quadraticCurveTo(s * 120, -230, s * 150, -200); ctx.quadraticCurveTo(s * 120, -150, s * 110, -110); ctx.fill(); }
    ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.beginPath(); ctx.ellipse(0, 50, 105, 80, 0, 0, 6.283); ctx.fill(); // bụng
    const tgt = look.target && K.scene.person(look.target), lx = tgt ? Math.max(-1, Math.min(1, (tgt.x - 540) / 400)) : Math.sin(t / 1400) * 0.6;
    for (const s of [-1, 1]) { // mắt
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(s * 55, -30, 34, 40, 0, 0, 6.283); ctx.fill();
      ctx.fillStyle = '#1a0d0d'; ctx.beginPath(); ctx.arc(s * 55 + lx * 12, -20, 15, 0, 6.283); ctx.fill();
      ctx.strokeStyle = '#2a0f0f'; ctx.lineWidth = 10; ctx.lineCap = 'round'; // lông mày giận, càng ít máu càng giận
      const tilt = 18 + (1 - hpPct) * 22;
      ctx.beginPath(); ctx.moveTo(s * 20, -78 + tilt * 0.2); ctx.lineTo(s * 92, -78 - tilt * 0.6); ctx.stroke();
    }
    ctx.fillStyle = '#3a0d12'; ctx.beginPath(); ctx.ellipse(0, 55, 62, 26 + Math.sin(t / 300) * 4, 0, 0, Math.PI); ctx.fill(); // miệng
    ctx.fillStyle = '#fff'; for (const x of [-34, 34]) { ctx.beginPath(); ctx.moveTo(x - 10, 55); ctx.lineTo(x, 75); ctx.lineTo(x + 10, 55); ctx.fill(); }
  }

  // ---------- Thanh máu trên đầu boss: tên + cấp, phần trắng tụt chậm theo sau mỗi đòn ----------
  function round(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); }
  G.onDraw('front', (ctx, t) => {
    const d = S.data; if (!d.max) return;
    const dead = d.phase === 'dead', q = dead ? Math.min(1, (t - look.deadAt) / 900) : 0;
    if (q >= 1) return;
    const b = bossAt(d.level), s = sizeOf(d.level), f = feet(), k = Math.min(1, (t - look.spawnAt) / 600);
    const hp = Math.max(0, d.hp), pct = hp / d.max;
    look.lagHp += (hp - look.lagHp) * 0.06; if (look.lagHp < hp) look.lagHp = hp;
    // ngay trên thân boss (sừng nằm sau thanh); tên + cấp nằm TRONG thanh nên boss to cỡ nào cũng không chạm bảng phía trên
    const w = Math.min(680, 460 + 170 * s), h = 44, x = f.x - w / 2, y = f.y - 305 * s - 40;
    ctx.globalAlpha = k * (1 - q);
    ctx.lineJoin = 'round';
    ctx.fillStyle = 'rgba(10,4,18,.8)'; round(ctx, x - 4, y - 4, w + 8, h + 8, 20); ctx.fill();
    ctx.save(); round(ctx, x, y, w, h, 16); ctx.clip();
    ctx.fillStyle = '#3a1830'; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#fff3b0'; ctx.fillRect(x, y, w * look.lagHp / d.max, h);
    const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, '#ff2e4d'); g.addColorStop(0.7, '#ff8a3c'); g.addColorStop(1, '#ffd25e');
    ctx.fillStyle = g; ctx.globalAlpha *= pct < 0.3 ? 0.75 + 0.25 * Math.sin(t / 90) : 1; ctx.fillRect(x, y, w * pct, h);
    ctx.restore();
    ctx.globalAlpha = k * (1 - q);
    ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(0,0,0,.8)'; ctx.fillStyle = '#fff';
    const line = (txt, tx, align, font) => { ctx.font = font; ctx.textAlign = align; ctx.strokeText(txt, tx, y + 31); ctx.fillText(txt, tx, y + 31); };
    line(G.t('level', { boss: b.name, n: d.level + 1 }, '{boss} · Cấp {n}'), x + 18, 'left', "800 26px 'Baloo 2', 'Noto Sans SC', sans-serif");
    line(dead ? G.t('down', {}, 'ĐÃ GỤC!') : `${G.fmt(hp)} / ${G.fmt(d.max)}`, x + w - 18, 'right', "800 22px 'Be Vietnam Pro', 'Noto Sans SC', sans-serif");
  });

  // vầng sáng theo danh hiệu (theme.json titles[].aura)
  K.on('frame', () => { for (const p of K.scene.people()) { const lv = (theme.titles || []).find((x) => x.label === p.title)?.aura; if (lv) p.aura = Math.max(p.aura, lv); } });
})();
