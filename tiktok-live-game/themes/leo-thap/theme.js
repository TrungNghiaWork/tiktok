// Cả phòng leo tháp: thả tim, gõ "leo", tặng quà để đẩy người leo lên cao. Mỗi 100 m là một tầng (mây, núi, trời đêm, vũ trụ…).
// Cả phòng ngừng tay thì gió thổi tụt dần, nhưng không tụt quá tầng đã lên (mốc an toàn). Kỷ lục cao nhất giữ cả buổi.
// Quà giúp cả phòng cùng leo (không ai bị đẩy xuống). Số liệu (điểm, tầng, gió) ở theme.json → "hud" → "game". Dùng chung ../danh-boss/game.js.
//
// Bố cục (vùng an toàn TikTok): độ cao + thanh tới tầng sau ở giữa trên; tháp giữa màn (y 470–1150) cuộn theo người leo;
// cột phải phía dưới: người góp sức nhiều nhất; nửa trái dưới y 1250 là khung bình luận nên để trống, khán giả đứng ở chân tháp.

(function () {
  const K = window.Kit, G = window.Game;
  const Z = K.safe || { top: 240, side: 100, heartsLeft: 950 };
  const L = Z.side;
  const $ = (s, r) => (r || document).querySelector(s);
  let theme = {}, cfg = {}, GC = {}, root = null;

  const STYLE = `
  .lt-head { left:50%; width:600px; margin-left:-300px; padding:10px 22px 14px; text-align:center; }
  .lt-head .h { font:800 64px/1 'Baloo 2','Noto Sans SC',sans-serif; color:#fff; font-variant-numeric:tabular-nums; }
  .lt-head .z { margin-top:2px; font-size:25px; font-weight:800; color:var(--gold); }
  .lt-head .bar { margin-top:8px; height:14px; border-radius:99px; background:rgba(255,255,255,.15); overflow:hidden; }
  .lt-head .bar div { height:100%; width:0; border-radius:99px; background:linear-gradient(90deg,#69db7c,#ffd25e); transition:width .5s; }
  .lt-head .nx { margin-top:6px; font-size:21px; font-weight:700; opacity:.9; }
  .lt-head.wind { border-color:#7fd7ff; box-shadow:0 0 0 3px rgba(127,215,255,.45); }
  .lt-call { left:${L}px; right:${L}px; padding:8px 16px; text-align:center; font-size:22px; font-weight:700; }
  .lt-call b { color:var(--gold); }
  .lt-side { width:${(Z.heartsLeft || 950) - (Z.chatRight || 720)}px; box-sizing:border-box; padding:12px 14px 14px; } /* từ mép khung bình luận (chatRight) tới dải tim bay (heartsLeft) */
  .lt-side h3 { margin:0 0 6px; text-align:center; font-size:22px; color:var(--gold); }
  .lt-side ol { list-style:none; margin:0; padding:0; display:grid; gap:5px; }
  .lt-side li { display:flex; justify-content:space-between; gap:6px; font-size:21px; font-weight:700; white-space:nowrap; }
  .lt-side li span { overflow:hidden; text-overflow:ellipsis; }
  .lt-side li b { flex:none; color:var(--gold); font-variant-numeric:tabular-nums; }
  .lt-side li.empty { opacity:.6; font-weight:600; }
  .lt-side .rec { margin-top:8px; padding-top:8px; border-top:1px solid rgba(255,210,94,.4); text-align:center; font-size:21px; font-weight:800; }
  .gm-banner h2 { margin:0; font-size:46px; line-height:1.1; color:var(--gold); }
  .gm-banner .sub { margin-top:8px; font-size:24px; font-weight:700; }
  `;

  // ---------- Trạng thái (giữ khi tải lại trang) ----------
  const fresh = () => ({ h: 0, best: 0, floor: 0, lastAt: 0, help: {} });
  const S = G.store('leo-thap:v1', fresh);
  const P = () => ({ chat: 2, like: 0.5, coin: 3, ...(GC.points || {}) });
  const FLOOR = () => GC.floorM || 100, PX = () => GC.pxPerM || 6, IDLE = () => GC.idleMs || 8000, FALL = () => GC.fallPerSec ?? 1.2;
  const ZONES = () => GC.zones || [{ at: 0, name: 'Chân tháp', sky: '#7ec8ff' }];
  const zoneAt = (h) => [...ZONES()].reverse().find((z) => h >= z.at) || ZONES()[0];
  const look = { shown: 0, pushAt: 0 };

  function climb(user, m, delay = 200) {
    if (!(m > 0)) return;
    setTimeout(() => {
      const d = S.data; d.h += m; d.lastAt = Date.now(); look.pushAt = performance.now();
      if (user?.id) G.addScore(d.help, user, m);
      if (d.h > d.best) d.best = d.h;
      const f = Math.floor(d.h / FLOOR());
      if (f > d.floor) { d.floor = f; reachFloor(f, user); }
      S.save(); render();
    }, delay);
  }

  function reachFloor(f, user) {
    const h = f * FLOOR(), z = zoneAt(h), top = G.topOf(S.data.help, 1)[0];
    K.fx.fireworks({ bursts: 3, fountains: 1 }); K.audio.sfx('tang', { force: true });
    for (const p of K.scene.people()) if (!p.task && Math.random() < 0.6) K.run([{ play: 'cheer', times: 2 }], p, {});
    G.banner(() => [G.el('h2', '', G.t('floor', { h: G.fmt(h) }, '🎉 {h} M!')), G.el('div', 'sub', z.name),
      G.el('div', 'sub', top ? G.t('thanks', { ten: top.name }, '⭐ Góp sức nhiều nhất: {ten}') : '')], 3200, 700);
  }

  function tick() {
    const d = S.data, safe = d.floor * FLOOR();
    // gió: cả phòng ngừng tay quá IDLE thì tụt dần, không tụt quá tầng đã lên
    const windy = d.h > safe && Date.now() - (d.lastAt || 0) > IDLE();
    if (windy) { d.h = Math.max(safe, d.h - FALL() / 2); S.save(); }
    $('.lt-head', root)?.classList.toggle('wind', windy);
    render(windy);
  }

  // ---------- Giao diện ----------
  function init(o) {
    theme = o.theme; cfg = theme.hud || {}; GC = cfg.game || {};
    G.setText(theme);
    root = G.mount(o.stage, STYLE);
    const el = G.el, top = Z.top + 8;
    const head = el('div', 'panel lt-head'); head.style.top = `${top}px`;
    const bar = el('div', 'bar'); bar.append(el('div'));
    head.append(el('div', 'h'), el('div', 'z'), bar, el('div', 'nx'));
    const call = el('div', 'panel lt-call');
    G.rich(call, G.t('call', {}, '❤️ tim +0,5 m · gõ **LEO** +2 m · 🎁 1 xu = +3 m'));
    const side = el('div', 'panel lt-side'); side.style.cssText = `right:${1080 - (Z.heartsLeft || 950)}px;top:1270px`;
    side.append(el('h3', '', G.t('board', {}, '💪 GÓP SỨC')), el('ol'), el('div', 'rec'));
    root.append(head, call, side);
    const stack = () => { call.style.top = `${head.offsetTop + head.offsetHeight + 10}px`; };
    stack(); document.fonts?.ready.then(stack);
    look.shown = S.data.h;
    render(); setInterval(tick, 500);
  }

  function render(windy) {
    if (!root) return;
    const d = S.data, f = FLOOR(), next = (Math.floor(d.h / f) + 1) * f, z = zoneAt(d.h);
    $('.lt-head .h', root).textContent = `${G.fmt(Math.floor(d.h))} m`;
    $('.lt-head .z', root).textContent = windy ? G.t('wind', {}, '🌬️ Gió thổi! Leo tiếp kẻo tụt') : `${G.t('zone', {}, 'Đang ở')}: ${z.name}`;
    $('.lt-head .bar div', root).style.width = `${Math.round(((d.h % f) / f) * 100)}%`;
    $('.lt-head .nx', root).textContent = G.t('next', { m: G.fmt(Math.ceil(next - d.h)), h: G.fmt(next) }, 'Còn {m} m tới mốc {h} m');
    const top = G.topOf(d.help, 5);
    $('.lt-side ol', root).replaceChildren(...(top.length ? top.map((r, i) => { const li = G.el('li'); li.append(G.el('span', '', `${i + 1}. ${r.name}`), G.el('b', '', `${G.fmt(Math.round(r.v))} m`)); return li; })
      : [G.el('li', 'empty', G.t('none', {}, 'Thả tim để leo nào!'))]));
    $('.lt-side .rec', root).textContent = G.t('record', { h: G.fmt(Math.floor(d.best)) }, '🏆 Kỷ lục: {h} m');
  }

  // ---------- Vẽ tháp + người leo ----------
  const TOWER = () => GC.tower || { x: 540, width: 200, climberY: 860, top: 470, bottom: 1150 };
  G.onDraw('back', (ctx, t) => {
    const d = S.data, T = TOWER(), px = PX();
    look.shown += (d.h - look.shown) * 0.1;
    const h = look.shown, z = zoneAt(h);
    // bầu trời đổi màu theo tầng (phủ mờ lên nền)
    ctx.globalAlpha = 0.55; ctx.fillStyle = z.sky; ctx.fillRect(0, 0, 1080, T.bottom); ctx.globalAlpha = 1;
    if (h >= (GC.starsFrom ?? 600)) { ctx.fillStyle = '#fff'; for (let i = 0; i < 40; i++) { const sx = (i * 263) % 1080, sy = ((i * 397 + h * px * 0.2) % T.bottom); ctx.globalAlpha = 0.4 + 0.4 * Math.sin(t / 400 + i); ctx.fillRect(sx, sy, 3, 3); } ctx.globalAlpha = 1; }
    // tháp gạch cuộn theo độ cao: người leo đứng ở climberY, gạch trượt xuống khi leo
    const yOf = (m) => T.climberY - (m - h) * px;
    const x0 = T.x - T.width / 2, rowM = 2, from = Math.max(0, Math.floor((h - (T.bottom - T.climberY) / px) / rowM) * rowM);
    ctx.save(); ctx.beginPath(); ctx.rect(0, T.top, 1080, T.bottom - T.top); ctx.clip(); // tháp + nhãn mốc chỉ vẽ trong khung, không lên đè bảng độ cao
    for (let m = from; yOf(m) > T.top - rowM * px; m += rowM) {
      const y = yOf(m), off = (m / rowM) % 2 ? T.width / 8 : 0;
      ctx.fillStyle = (m / rowM) % 2 ? '#b06a3b' : '#a55f33'; ctx.fillRect(x0, y - rowM * px, T.width, rowM * px);
      ctx.strokeStyle = 'rgba(60,30,10,.45)'; ctx.lineWidth = 2; ctx.beginPath();
      for (let bx = x0 + off; bx < x0 + T.width; bx += T.width / 4) { ctx.moveTo(bx, y - rowM * px); ctx.lineTo(bx, y); }
      ctx.moveTo(x0, y); ctx.lineTo(x0 + T.width, y); ctx.stroke();
      if (m % FLOOR() === 0) { // mốc tầng: tấm ván + tên tầng
        ctx.fillStyle = '#ffd25e'; ctx.fillRect(x0 - 40, y - 8, T.width + 80, 12);
        ctx.font = "800 24px 'Baloo 2','Noto Sans SC',sans-serif"; ctx.textAlign = 'left'; ctx.lineJoin = 'round';
        const label = `${G.fmt(m)} m · ${zoneAt(m).name}`;
        ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.lineWidth = 5; ctx.strokeText(label, x0 + T.width + 50, y + 2); ctx.fillStyle = '#fff'; ctx.fillText(label, x0 + T.width + 50, y + 2);
      }
    }
    ctx.restore();
    if (h < (T.bottom - T.climberY) / px + 2) { ctx.fillStyle = '#6b4a2a'; ctx.fillRect(x0 - 60, yOf(0), T.width + 120, 20); } // chân tháp
    // người leo: tay chân đổi nhịp theo độ cao, bám bên phải tháp
    const cx = x0 + T.width + 6, cy = T.climberY, ph = Math.sin(h * 2.2), busy = performance.now() - look.pushAt < 800;
    ctx.save(); ctx.translate(cx, cy); ctx.lineCap = 'round';
    ctx.strokeStyle = '#2d3a8c'; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(4, 34 + ph * 8); ctx.moveTo(10, 0); ctx.lineTo(18, 34 - ph * 8); ctx.stroke(); // chân
    ctx.fillStyle = '#e8544e'; ctx.beginPath(); ctx.roundRect(0, -46, 26, 50, 10); ctx.fill(); // áo
    ctx.strokeStyle = '#f2c79b'; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(4, -38); ctx.lineTo(-6, -64 - ph * 10); ctx.moveTo(4, -30); ctx.lineTo(-6, -40 + ph * 10); ctx.stroke(); // tay bám tháp
    ctx.fillStyle = '#f2c79b'; ctx.beginPath(); ctx.arc(14, -60, 15, 0, 6.283); ctx.fill(); // đầu
    ctx.fillStyle = '#ffd25e'; ctx.beginPath(); ctx.arc(14, -66, 15, Math.PI, 0); ctx.fill(); // mũ bảo hiểm
    if (busy) { ctx.fillStyle = 'rgba(255,255,255,.85)'; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(30 + k * 10, 20 + k * 12, 4 - k, 0, 6.283); ctx.fill(); } }
    ctx.restore();
  });

  // ---------- Sự kiện ----------
  function periodic(ev) { if (ev.text) G.toast(ev.text, 7000, 1160); }
  function giftCard(ev) { G.toast(`🎁 ${ev.user?.name || G.t('guest', {}, 'Khách')} · ${ev.label || ''}${ev.count > 1 ? ` ×${ev.count}` : ''}`, 2400, 1160); }
  const noop = () => {};
  K.hud = { init, giftCard, ticker: noop, state: noop, guide: noop, toast: (t, ms) => G.toast(t, ms, 1160), periodic, draw: noop, remember: noop, reset: noop };

  K.on('command', (ev) => { if (ev.action === 'leo') climb(ev.user, P().chat); });
  K.on('like', (ev) => climb(ev.user, (ev.count || 1) * P().like, 100));
  // một lần tặng đẩy tối đa maxGift mét: quà lớn giúp nhiều nhưng không nhảy vọt hết các tầng
  K.on('gift', (ev) => climb(ev.user, Math.min(GC.maxGift || 250, Math.max(GC.minGift?.[ev.action] || 0, (ev.total || 0) * P().coin)), 500));
  Live.on('reset', () => { S.reset(); look.shown = 0; render(); });

  K.action('dayThung', () => { K.fx.shake({ intensity: 4, duration: 300 }); K.audio.sfx('leo'); });
  K.action('khinhKhiCau', () => { K.fx.fireworks({ bursts: 2, fountains: 1 }); K.fx.flash({ strength: 0.25 }); K.audio.sfx('tang'); });
  K.on('frame', () => { for (const p of K.scene.people()) { const lv = (theme.titles || []).find((x) => x.label === p.title)?.aura; if (lv) p.aura = Math.max(p.aura, lv); } });
})();
