// Đua vịt trên sông: gõ "đua" thả một con vịt, gõ "bơi" / thả tim / tặng quà để vịt của mình bơi nhanh hơn. Vịt về đích trước thắng.
// Mỗi vòng: chờ thả vịt (lobby) → đua → nghỉ (bục nhận giải) → vòng mới. Quà chỉ đẩy vịt của chính người tặng, không cản vịt người khác.
// Số liệu (thời gian, điểm đẩy, số vịt tối đa, màu vịt) ở theme.json → "hud" → "game". Dùng chung ../danh-boss/game.js.
//
// Bố cục (vùng an toàn TikTok): tên vòng + giờ ở giữa trên, sông 8 làn ở giữa (y 520–1120), bờ sông dưới cho khán giả;
// bảng thứ hạng ở cột phải phía dưới (trước dải tim bay), nửa trái dưới y 1250 là khung bình luận nên để trống.
// Vịt vẽ bằng code; có ảnh thì đặt "duckImage" trong hud.game (ảnh vịt nhìn ngang, quay sang phải, nền trong).

(function () {
  const K = window.Kit, G = window.Game;
  const Z = K.safe || { top: 240, side: 100, heartsLeft: 950 };
  const L = Z.side;
  const $ = (s, r) => (r || document).querySelector(s);
  let theme = {}, cfg = {}, GC = {}, root = null, duckImg = null;
  const FINISH = 1000;

  const STYLE = `
  .dv-head { left:50%; width:560px; margin-left:-280px; padding:10px 20px 12px; text-align:center; }
  .dv-head h1 { margin:0; font-size:34px; letter-spacing:2px; color:var(--gold); }
  .dv-head .t { margin-top:2px; font:800 30px 'Baloo 2','Noto Sans SC',sans-serif; font-variant-numeric:tabular-nums; }
  .dv-call { left:${L}px; right:${L}px; padding:8px 16px; text-align:center; font-size:22px; font-weight:700; }
  .dv-call b { color:var(--gold); }
  .dv-rank { width:${(Z.heartsLeft || 950) - (Z.chatRight || 720)}px; box-sizing:border-box; padding:12px 14px 14px; } /* từ mép khung bình luận (chatRight) tới dải tim bay (heartsLeft) */
  .dv-rank h3 { margin:0 0 6px; text-align:center; font-size:22px; color:var(--gold); }
  .dv-rank ol { list-style:none; margin:0; padding:0; display:grid; gap:5px; }
  .dv-rank li { display:flex; align-items:center; gap:6px; font-size:21px; font-weight:700; white-space:nowrap; }
  .dv-rank li i { flex:none; width:18px; height:18px; border-radius:50%; border:2px solid #fff; }
  .dv-rank li span { flex:1; overflow:hidden; text-overflow:ellipsis; }
  .dv-rank li b { flex:none; color:var(--gold); font-variant-numeric:tabular-nums; }
  .dv-rank li.empty { opacity:.6; font-weight:600; }
  .gm-banner h2 { margin:0; font-size:48px; line-height:1.1; color:var(--gold); }
  .gm-banner ol { list-style:none; margin:12px 0 0; padding:0; display:grid; gap:6px; font-size:28px; font-weight:700; }
  .gm-banner .sub { margin-top:10px; font-size:22px; opacity:.85; }
  `;

  // ---------- Trạng thái (giữ khi tải lại trang) ----------
  const fresh = () => ({ race: 1, phase: 'lobby', startAt: Date.now(), endAt: 0, firstAt: 0, ducks: {}, order: [], wins: {} });
  const S = G.store('dua-vit:v1', fresh);
  const LOBBY = () => GC.lobbyMs || 20000, RACE = () => GC.raceMs || 75000, REST = () => GC.restMs || 10000, AFTER = () => GC.afterFirstMs || 4000;
  const P = () => ({ chat: 15, like: 3, coin: 20, drift: [9, 15], ...(GC.points || {}) });
  const MAX = () => GC.maxDucks || 24, LANES = () => GC.lanes || 8;
  const COLORS = () => GC.colors || ['#ffd23f', '#ff6b6b', '#4dabf7', '#69db7c', '#f783ac', '#ffa94d', '#b197fc', '#ffffff'];
  const RIVER = () => GC.river || { top: 540, bottom: 1110, start: 160, finish: 930 };
  const look = {}; // id -> { shown, splashAt } chỉ để vẽ mượt, không lưu
  // màu theo số thứ tự, vịt thứ 2 trong cùng làn lệch 3 màu cho khỏi trùng màu vịt đầu
  const colorOf = (i) => { const c = COLORS(); return c[((i % LANES()) + Math.floor(i / LANES()) * 3) % c.length]; };

  function addDuck(user) {
    const d = S.data; if (!user?.id || d.phase === 'rest') return null;
    if (d.ducks[user.id]) return d.ducks[user.id];
    const n = Object.keys(d.ducks).length; if (n >= MAX()) return null;
    const duck = { name: user.name || G.t('guest', {}, 'Khách'), x: 0, i: n, at: 0 };
    d.ducks[user.id] = duck; S.save(); render();
    return duck;
  }

  function push(user, pts, join = false) {
    const d = S.data; if (!(pts > 0) || !user?.id) return;
    const duck = d.ducks[user.id] || (join ? addDuck(user) : null); if (!duck) return;
    if (d.phase !== 'race' || duck.at) return; // lobby: chỉ thả vịt; đã về đích: thôi
    duck.x = Math.min(FINISH, duck.x + pts); if (user.name) duck.name = user.name;
    (look[user.id] ||= {}).splashAt = performance.now();
    if (duck.x >= FINISH) arrive(user.id);
    S.save();
  }

  function arrive(id) {
    const d = S.data, duck = d.ducks[id]; if (!duck || duck.at) return;
    duck.at = Date.now(); d.order.push(id);
    if (!d.firstAt) {
      d.firstAt = Date.now();
      K.fx.fireworks({ bursts: 3, fountains: 1 }); K.audio.sfx('win', { force: true });
      G.toast(G.t('first', { ten: duck.name }, '🏁 {ten} về nhất!'), 2600, 1160);
      const p = K.scene.person(id); if (p) K.run([{ play: 'cheer', times: 3 }, { aura: 1 }], p, {});
    }
  }

  function startRace() {
    const d = S.data; d.phase = 'race'; d.startAt = Date.now(); S.save(); render();
    G.toast(G.t('go', { n: d.race }, '🦆 VÒNG {n} · BƠI!'), 2200, 1160); K.audio.sfx('coi', { force: true });
  }

  function finish() {
    const d = S.data; if (d.phase !== 'race') return;
    // chưa về đích thì xếp theo quãng đường đã bơi
    const rest = Object.entries(d.ducks).filter(([id, x]) => !x.at).sort((a, b) => b[1].x - a[1].x).map(([id]) => id);
    const podium = [...d.order, ...rest].slice(0, 3);
    if (podium[0]) G.addScore(d.wins, { id: podium[0], name: d.ducks[podium[0]].name }, 1);
    d.phase = 'rest'; d.endAt = Date.now(); d.podium = podium; S.save(); render();
    if (podium.length) { K.fx.rain('confetti', { count: 120 }); K.audio.sfx('win'); }
    G.banner(() => {
      const el = G.el, ol = el('ol');
      podium.forEach((id, i) => ol.append(el('li', '', `${['🥇', '🥈', '🥉'][i]} ${d.ducks[id].name}`)));
      return [el('h2', '', podium.length ? G.t('win', { ten: d.ducks[podium[0]].name }, '🏆 {ten} THẮNG!') : G.t('empty', {}, 'Vòng này chưa có vịt nào')), ol,
        el('div', 'sub', G.t('next', { n: d.race + 1, s: Math.round(REST() / 1000) }, 'Vòng {n} mở sau {s} giây · gõ ĐUA để thả vịt'))];
    }, REST() - 800, 700);
  }

  function nextRace() {
    const d = S.data;
    Object.assign(d, { race: d.race + 1, phase: 'lobby', startAt: Date.now(), endAt: 0, firstAt: 0, ducks: {}, order: [], podium: [] });
    for (const k of Object.keys(look)) delete look[k];
    S.save(); render(); G.toast(G.t('lobby', { n: d.race }, '🦆 Vòng {n}: gõ ĐUA để thả vịt!'), 3000, 1160);
  }

  function tick() {
    const d = S.data, now = Date.now();
    if (d.phase === 'lobby' && now - d.startAt >= LOBBY()) { if (Object.keys(d.ducks).length) startRace(); else d.startAt = now; }
    else if (d.phase === 'race') {
      const [a, b] = P().drift; // sông tự đẩy vịt trôi: không ai bấm vịt vẫn tới đích
      for (const [id, duck] of Object.entries(d.ducks)) if (!duck.at) { duck.x = Math.min(FINISH, duck.x + (a + Math.random() * (b - a)) / 2); if (duck.x >= FINISH) arrive(id); }
      if ((d.firstAt && now - d.firstAt >= AFTER()) || now - d.startAt >= RACE()) finish();
      S.save();
    } else if (d.phase === 'rest' && now - d.endAt >= REST()) nextRace();
    render();
  }

  // ---------- Giao diện ----------
  function init(o) {
    theme = o.theme; cfg = theme.hud || {}; GC = cfg.game || {};
    G.setText(theme);
    if (GC.duckImage) { duckImg = new Image(); duckImg.src = GC.duckImage; }
    root = G.mount(o.stage, STYLE);
    const el = G.el, top = Z.top + 8;
    const head = el('div', 'panel dv-head'); head.style.top = `${top}px`; head.append(el('h1', '', cfg.title?.text || G.t('title', {}, 'ĐUA VỊT')), el('div', 't'));
    const call = el('div', 'panel dv-call');
    G.rich(call, G.t('call', {}, 'Gõ **ĐUA** thả vịt · **BƠI** +15 · ❤️ +3 · 🎁 1 xu = +20'));
    const rank = el('div', 'panel dv-rank'); rank.style.cssText = `right:${1080 - (Z.heartsLeft || 950)}px;top:1270px`; rank.append(el('h3'), el('ol'));
    root.append(head, call, rank);
    const stack = () => { call.style.top = `${head.offsetTop + head.offsetHeight + 10}px`; };
    stack(); document.fonts?.ready.then(stack);
    const d = S.data;
    if (d.phase === 'rest' && Date.now() - d.endAt > REST()) nextRace();
    render(); setInterval(tick, 500);
  }

  const fmtTime = (ms) => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  function render() {
    if (!root) return;
    const d = S.data, now = Date.now(), n = Object.keys(d.ducks).length;
    $('.dv-head .t', root).textContent = d.phase === 'lobby' ? G.t('wait', { n: d.race, ducks: n, max: MAX(), time: fmtTime(LOBBY() - (now - d.startAt)) }, 'Vòng {n} · thả vịt {ducks}/{max} · {time}')
      : d.phase === 'race' ? G.t('racing', { n: d.race, time: fmtTime(RACE() - (now - d.startAt)) }, 'Vòng {n} · {time}') : G.t('rest', {}, 'Trao giải');
    const showWins = d.phase !== 'race' && !n;
    $('.dv-rank h3', root).textContent = showWins ? G.t('champs', {}, '👑 VÔ ĐỊCH HÔM NAY') : G.t('rank', {}, '🏁 THỨ HẠNG');
    const rows = showWins ? G.topOf(d.wins, 5).map((r) => ({ name: r.name, v: G.t('wins', { n: r.v }, '{n} lần'), c: null }))
      : Object.entries(d.ducks).sort((a, b) => (a[1].at || 9e15) - (b[1].at || 9e15) || b[1].x - a[1].x).slice(0, 5)
        .map(([, x]) => ({ name: x.name, v: x.at ? '🏁' : `${Math.round((x.x / FINISH) * 100)}%`, c: colorOf(x.i) }));
    $('.dv-rank ol', root).replaceChildren(...(rows.length ? rows.map((r, i) => {
      const li = G.el('li'); if (r.c) { const dot = G.el('i'); dot.style.background = r.c; li.append(dot); }
      li.append(G.el('span', '', `${i + 1}. ${r.name}`), G.el('b', '', r.v)); return li;
    }) : [G.el('li', 'empty', G.t('none', {}, 'Gõ ĐUA để thả vịt!'))]));
  }

  // ---------- Vẽ vịt ----------
  function drawDuck(ctx, x, y, color, t, splash) {
    const bob = Math.sin(t / 260 + x) * 3;
    ctx.save(); ctx.translate(x, y + bob);
    // gợn nước
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(-4, 14, 34 + (splash ? 10 : 0), 7, 0, 0, Math.PI); ctx.stroke();
    if (splash) { ctx.fillStyle = 'rgba(255,255,255,.8)'; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(-40 - k * 9, 6 - k * 4 + Math.sin(t / 60 + k) * 3, 4 - k * 0.6, 0, 6.283); ctx.fill(); } }
    if (duckImg?.complete && duckImg.naturalWidth) { ctx.drawImage(duckImg, -38, -44, 76, 62); ctx.restore(); return; }
    ctx.fillStyle = color; ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, 0, 30, 18, 0, 0, 6.283); ctx.fill(); ctx.stroke(); // thân
    ctx.beginPath(); ctx.moveTo(-26, -4); ctx.lineTo(-40, -16); ctx.lineTo(-24, 4); ctx.fill(); // đuôi
    ctx.beginPath(); ctx.arc(20, -20, 14, 0, 6.283); ctx.fill(); ctx.stroke(); // đầu
    ctx.fillStyle = '#ff9f1c'; ctx.beginPath(); ctx.moveTo(32, -22); ctx.lineTo(46, -17); ctx.lineTo(32, -13); ctx.fill(); // mỏ
    ctx.fillStyle = '#1b1b1b'; ctx.beginPath(); ctx.arc(24, -24, 2.6, 0, 6.283); ctx.fill(); // mắt
    ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.beginPath(); ctx.ellipse(-4, -2, 14, 8, -0.3, 0, 6.283); ctx.fill(); // cánh
    ctx.restore();
  }

  G.onDraw('back', (ctx, t) => {
    const d = S.data, R = RIVER(), lanes = LANES(), lh = (R.bottom - R.top) / lanes, now = performance.now();
    // vạch xuất phát, vạch đích ô cờ
    ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(R.start - 4, R.top, 4, R.bottom - R.top);
    for (let y = R.top, k = 0; y < R.bottom; y += 18, k++) { ctx.fillStyle = k % 2 ? '#111' : '#fff'; ctx.fillRect(R.finish + 6, y, 12, 18); ctx.fillStyle = k % 2 ? '#fff' : '#111'; ctx.fillRect(R.finish + 18, y, 12, 18); }
    const ducks = Object.entries(d.ducks), lead = [...ducks].sort((a, b) => b[1].x - a[1].x).slice(0, GC.labels || 6).map(([id]) => id);
    const labels = [];
    for (const [id, duck] of ducks) {
      const lk = (look[id] ||= {}); lk.shown = (lk.shown ?? duck.x) + (duck.x - (lk.shown ?? duck.x)) * 0.12;
      const lane = duck.i % lanes, sub = Math.floor(duck.i / lanes);
      const y = R.top + lh * (lane + 0.58) + (sub ? 16 : 0); // vịt thứ 2 trong làn bơi lệch xuống
      const x = R.start + (R.finish - R.start) * (lk.shown / FINISH) + 20;
      const splash = now - (lk.splashAt || 0) < 500;
      drawDuck(ctx, x, y, colorOf(duck.i), t, splash);
      if (lead.includes(id) || splash) labels.push({ name: duck.name, x, y }); // tên: vịt dẫn đầu và vịt vừa được đẩy (đông quá thì không đè chữ cả sông)
    }
    // tên vẽ sau tất cả vịt cho khỏi bị vịt khác che
    ctx.font = "800 21px 'Be Vietnam Pro','Noto Sans SC',sans-serif"; ctx.lineJoin = 'round';
    for (const { name: full, x, y } of labels) {
      const name = full.length > 12 ? `${full.slice(0, 11)}…` : full;
      // tên cùng hàng với vịt (không đè vịt làn trên): sau đuôi, còn gần vạch xuất phát thì trước mỏ cho khỏi lọt ra mép màn
      const behind = x - 46 - ctx.measureText(name).width > (Z.side || 100);
      ctx.textAlign = behind ? 'right' : 'left'; const tx = behind ? x - 46 : x + 50;
      ctx.strokeStyle = 'rgba(0,0,0,.75)'; ctx.lineWidth = 5; ctx.strokeText(name, tx, y + 4); ctx.fillStyle = '#fff'; ctx.fillText(name, tx, y + 4);
    }
  });

  // ---------- Sự kiện ----------
  function periodic(ev) { if (ev.text) G.toast(ev.text, 7000, 1160); }
  function giftCard(ev) { G.toast(`🎁 ${ev.user?.name || G.t('guest', {}, 'Khách')} · ${ev.label || ''}${ev.count > 1 ? ` ×${ev.count}` : ''}`, 2400, 1160); }
  const noop = () => {};
  K.hud = { init, giftCard, ticker: noop, state: noop, guide: noop, toast: (t, ms) => G.toast(t, ms, 1160), periodic, draw: noop, remember: noop, reset: noop };

  K.on('command', (ev) => {
    if (ev.action === 'tha') addDuck(ev.user);
    if (ev.action === 'boi') push(ev.user, P().chat, true);
  });
  K.on('like', (ev) => push(ev.user, (ev.count || 1) * P().like));
  K.on('gift', (ev) => { if (!S.data.ducks[ev.user?.id]) addDuck(ev.user); push(ev.user, Math.min(GC.maxGift || 400, Math.max(GC.minGift?.[ev.action] || 0, (ev.total || 0) * P().coin))); }); // một lần tặng đẩy tối đa maxGift (40% đường đua): quà lớn không thắng ngay
  Live.on('reset', () => { S.reset(); render(); });

  K.action('songDay', () => { K.fx.shake({ intensity: 5, duration: 350 }); K.audio.sfx('nuoc'); });
  K.action('tenLua', () => { K.fx.fireworks({ bursts: 2, fountains: 1 }); K.fx.flash({ strength: 0.25 }); K.audio.sfx('nuoc'); });
  K.on('frame', () => { for (const p of K.scene.people()) { const lv = (theme.titles || []).find((x) => x.label === p.title)?.aura; if (lv) p.aura = Math.max(p.aura, lv); } });
})();
