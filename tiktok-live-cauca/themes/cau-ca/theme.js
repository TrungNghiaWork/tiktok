// Ao làng câu cá: giao diện riêng (thay Kit.hud), thẻ cá, cần câu + phao, cá nhảy, đàn cá.
// Cảnh, luật, bảng cá nằm trong theme.json + scene.json; file này lo phần nhìn.
//
// Bố cục theo vùng an toàn TikTok (Kit.safe, mở /overlay?safe để xem):
//   trái trên: biển tên ao + số liệu · phải trên: cần thủ hôm nay + bảng quà
//   giữa trên: dòng "Gõ CÂU" cố định, băng cảm ơn quà · giữa: thẻ cá (một thẻ mỗi lúc)
//   phải dưới (trên dải tim bay): cá vừa câu · nửa trái dưới là khung bình luận nên để trống.
// Ảnh cá: điền "image" cho từng món trong theme.json draws.ca.items (vd "assets/fish/ca-chep.png"), để trống thì dùng emoji.

(function () {
  const K = window.Kit;
  const Z = K.safe || { top: 240, side: 100, chatTop: 1250 };
  const $ = (sel, root) => (root || document).querySelector(sel);
  // Ngôn ngữ (kit: theme.json "langs" + "i18n"): chữ trên màn hình ở hud.text, bản dịch ở i18n.<lang>.hud.text
  const LOCALE = { vi: 'vi-VN', en: 'en-US', zh: 'zh-CN' };
  let words = {}, locale = 'vi-VN';
  const t = (key, vars = {}, fallback = key) => String(words[key] ?? fallback).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
  const fmt = (n) => Number(n || 0).toLocaleString(locale);
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const hash = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };

  const RANK = {
    thuong: { label: 'THƯỜNG', color: '#aab4bf' },
    kha: { label: 'KHÁ', color: '#4fb0ff' },
    hiem: { label: 'HIẾM', color: '#b77cff' },
    huyenthoai: { label: 'HUYỀN THOẠI', color: '#ffc93c' },
  };

  let theme = {}, cfg = {}, root = null;
  const L = Z.side, R = 1080 - Z.side, COL = 320; // cột trái / phải nằm trong vùng an toàn

  const STYLE = `
  .ao { position:absolute; inset:0; pointer-events:none; font-family:'Be Vietnam Pro', 'Noto Sans SC', system-ui, sans-serif; color:#fff8ea; --wood:#6d4424; --wood2:#3f2412; --cream:#fff5df; --cream2:#f1dcb2; --ink:#3a2412; --gold:#ffd27a; }
  .ao .wood { position:absolute; background:linear-gradient(180deg, #8a5a32, var(--wood) 55%, var(--wood2)); border:3px solid #c99a5c; border-radius:18px; box-shadow:0 8px 22px rgba(0,0,0,.45), inset 0 2px 0 rgba(255,230,180,.25); }
  .ao .glass { position:absolute; background:rgba(28,22,40,.55); border:2px solid rgba(255,214,140,.45); border-radius:18px; text-shadow:0 2px 3px rgba(0,0,0,.8); }
  .ao h1, .ao h3, .ao .rk, .ao .nm-ca { font-family:'Baloo 2', 'Be Vietnam Pro', 'Noto Sans SC', sans-serif; }

  .ao-sign { padding:12px 18px 14px; text-align:center; }
  .ao-sign h1 { margin:0; font-size:46px; line-height:1; font-weight:800; letter-spacing:3px; color:var(--gold); text-shadow:0 3px 0 var(--wood2), 0 0 18px rgba(255,190,90,.35); }
  .ao-sign p { margin:4px 0 0; font-size:22px; font-weight:600; color:#f7e2bd; }
  .ao-stats { padding:10px 16px; display:grid; gap:8px; font-size:24px; font-weight:700; }
  .ao-stats .row { display:flex; justify-content:space-between; }
  .ao-stats .bar { height:12px; border-radius:99px; background:rgba(0,0,0,.45); overflow:hidden; }
  .ao-stats .fill { height:100%; width:0; background:linear-gradient(90deg, #ffb347, #fff1b8); transition:width .6s; }
  .ao-stats .gl { font-size:20px; font-weight:600; opacity:.9; }

  .ao-board { padding:12px 16px 14px; }
  .ao-board h3, .ao-tiers h3 { margin:0 0 8px; text-align:center; font-size:26px; font-weight:800; color:var(--gold); letter-spacing:1px; }
  .ao-board ol { list-style:none; margin:0; padding:0; display:grid; gap:6px; }
  .ao-board li { display:flex; align-items:center; gap:10px; font-size:24px; font-weight:700; }
  .ao-board li .md { width:34px; text-align:center; font-size:26px; }
  .ao-board li .nm { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .ao-board li .c { color:var(--gold); font-size:22px; }
  .ao-board li.empty { opacity:.5; font-weight:600; }
  .ao-tiers { padding:10px 16px 12px; }
  .ao-tiers h3 { font-size:22px; }
  .ao-tier { display:flex; align-items:center; gap:10px; font-size:22px; font-weight:600; padding:3px 0; white-space:nowrap; }
  .ao-tier .i { font-size:28px; width:34px; text-align:center; }
  .ao-tier .p { margin-left:auto; color:var(--gold); font-weight:800; }
  .ao-tier.hit { animation: aoHit 1s ease-out; }
  @keyframes aoHit { 0% { transform:scale(1.08); text-shadow:0 0 16px #ffd27a; } }

  .ao-call { position:absolute; left:50%; transform:translateX(-50%); padding:10px 30px; border-radius:99px; white-space:nowrap; font:800 34px 'Baloo 2', 'Noto Sans SC', sans-serif; color:var(--ink); background:linear-gradient(180deg, #fff3cf, #ffd27a); border:3px solid #fff; box-shadow:0 6px 20px rgba(0,0,0,.35); animation: aoBreathe 3.2s ease-in-out infinite; }
  .ao-call b { color:#c2410c; }
  @keyframes aoBreathe { 50% { transform:translateX(-50%) scale(1.04); } }

  .ao-thanks { position:absolute; left:${L}px; right:${L}px; padding:12px 22px; text-align:center; border-radius:16px; background:rgba(20,14,30,.72); border:2px solid rgba(255,214,140,.6); font-size:28px; font-weight:700; opacity:0; transform:translateY(-10px); transition:opacity .3s, transform .3s; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .ao-thanks.show { opacity:1; transform:none; }
  .ao-thanks .who { color:var(--gold); }
  .ao-thanks.big { border-color:#ffc93c; box-shadow:0 0 34px rgba(255,201,60,.6); }

  .ao-card { position:absolute; left:50%; width:620px; margin-left:-310px; box-sizing:border-box; padding:26px 30px 24px; text-align:center; color:var(--ink); background:linear-gradient(180deg, var(--cream), var(--cream2)); border:6px solid var(--wood); border-radius:30px; box-shadow:0 0 0 3px #c99a5c, 0 18px 40px rgba(0,0,0,.5); opacity:0; transform:translateY(30px) scale(.9); transition:opacity .35s, transform .45s cubic-bezier(.2,1.4,.4,1); }
  .ao-card.show { opacity:1; transform:none; }
  .ao-card .rank { display:inline-block; padding:4px 20px; border-radius:99px; font:800 24px 'Baloo 2', 'Noto Sans SC', sans-serif; letter-spacing:2px; color:#fff; background:var(--rk); text-shadow:0 1px 2px rgba(0,0,0,.35); }
  .ao-card .pic { height:140px; margin:12px 0 4px; display:grid; place-items:center; font-size:112px; line-height:1; filter:drop-shadow(0 8px 10px rgba(0,0,0,.25)); }
  .ao-card .pic img { max-height:140px; max-width:420px; }
  .ao-card .nm-ca { font-size:50px; font-weight:800; line-height:1.05; text-transform:capitalize; }
  .ao-card .ky { margin-top:4px; font-size:32px; font-weight:800; color:#8a4b14; }
  .ao-card .loi { margin-top:10px; font-size:26px; font-style:italic; font-weight:600; color:#5a3a1e; }
  .ao-card .by { margin-top:14px; padding-top:12px; border-top:2px dashed rgba(109,68,36,.35); font-size:28px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .ao-card .by .via { display:block; font-size:22px; font-weight:600; opacity:.75; }
  .ao-card.r-hiem { box-shadow:0 0 0 3px #c99a5c, 0 0 46px rgba(183,124,255,.7); }
  .ao-card.r-huyenthoai { box-shadow:0 0 0 3px #ffc93c, 0 0 70px rgba(255,201,60,.9); animation: aoGlow 1.4s ease-in-out infinite; }
  @keyframes aoGlow { 50% { box-shadow:0 0 0 3px #fff2b0, 0 0 100px rgba(255,201,60,1); } }

  .ao-log { position:absolute; left:${L}px; width:${COL}px; display:grid; gap:6px; justify-items:start; }
  .ao-log div { max-width:100%; padding:6px 16px; border-radius:99px; background:rgba(20,14,30,.6); font-size:22px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; text-shadow:0 1px 2px #000; animation: aoIn .5s ease-out; }
  .ao-log div:nth-child(2) { opacity:.75 } .ao-log div:nth-child(3) { opacity:.5 }
  .ao-log b { color:var(--rk); }
  @keyframes aoIn { from { opacity:0; transform:translateX(-30px); } }

  .ao-toast { position:absolute; left:${L}px; right:${L}px; text-align:center; font:800 40px 'Baloo 2', 'Noto Sans SC', sans-serif; color:#fff3cf; text-shadow:0 0 16px rgba(255,170,60,.9), 0 3px 4px #000; opacity:0; transition:opacity .4s; }
  .ao-toast.show { opacity:1; }
  .ao-note { position:absolute; left:${L + 40}px; right:${L + 40}px; padding:18px 26px; text-align:center; opacity:0; transform:translateY(10px); transition:opacity .5s, transform .5s; }
  .ao-note.show { opacity:1; transform:none; }
  .ao-note h4 { margin:0 0 6px; font:800 26px 'Baloo 2', 'Noto Sans SC', sans-serif; letter-spacing:2px; color:var(--gold); }
  .ao-note p { margin:0; font-size:28px; line-height:1.4; font-weight:600; }
  .ao-unmute { position:absolute; left:50%; top:900px; transform:translateX(-50%); padding:14px 34px; font:800 28px 'Baloo 2', 'Noto Sans SC', sans-serif; color:var(--gold); pointer-events:auto; cursor:pointer; display:none; white-space:nowrap; }
  `;

  // ---------- Dựng ----------
  function init(o) {
    theme = o.theme; cfg = theme.hud || {};
    words = cfg.text || {}; locale = LOCALE[theme.lang] || 'vi-VN'; document.documentElement.lang = theme.lang || 'vi';
    root = el('div', 'ao');
    o.stage.appendChild(root);
    const st = el('style'); st.textContent = STYLE; document.head.appendChild(st);
    const top = Z.top + 6;

    const sign = el('div', 'wood ao-sign');
    sign.style.cssText = `left:${L}px;top:${top}px;width:${COL}px;box-sizing:border-box`;
    sign.append(el('h1', '', cfg.title?.text || theme.name), el('p', '', cfg.title?.sub || ''));
    const stats = el('div', 'glass ao-stats');
    stats.style.cssText = `left:${L}px;top:${top + 112}px;width:${COL}px;box-sizing:border-box`;
    stats.innerHTML = `<div class="row"><span data-c="people">👥 0</span><span data-c="likes">❤️ 0</span></div><div class="gl"></div><div class="bar"><div class="fill"></div></div>`;

    const board = el('div', 'wood ao-board');
    board.style.cssText = `right:${L}px;top:${top}px;width:${COL}px;box-sizing:border-box`;
    board.append(el('h3', '', t('board', {}, 'CẦN THỦ HÔM NAY')), el('ol'));
    const tiers = el('div', 'glass ao-tiers');
    tiers.style.cssText = `right:${L}px;top:${top + 220}px;width:${COL}px;box-sizing:border-box`;
    tiers.append(el('h3', '', t('gifts', {}, 'TẶNG QUÀ')));
    for (const a of (theme.actions || []).filter((x) => x.card)) {
      const row = el('div', 'ao-tier'); row.dataset.action = a.id;
      row.append(el('span', 'i', a.icon || '🎁'), el('span', '', a.label), el('span', 'p', a.card.replace(/\s*XU/i, ' ' + t('coin', {}, 'xu'))));
      tiers.append(row);
    }

    const call = el('div', 'ao-call'); call.style.top = `${top + 330}px`;
    call.textContent = '🎣 ';
    t('call', {}, 'Gõ **CÂU** để thả cần').split('**').forEach((part, i) => part && call.append(i % 2 ? el('b', '', part) : document.createTextNode(part)));

    const thanks = el('div', 'ao-thanks'); thanks.style.top = `${top + 410}px`;
    const card = el('div', 'ao-card'); card.style.top = `${cfg.cardTop ?? 700}px`;
    card.innerHTML = `<div class="rank"></div><div class="pic"></div><div class="nm-ca"></div><div class="ky"></div><div class="loi"></div><div class="by"></div>`;
    const log = el('div', 'ao-log');
    const toastEl = el('div', 'ao-toast'); toastEl.style.top = `${top + 480}px`;
    const note = el('div', 'glass ao-note'); note.style.top = `${cfg.noteTop ?? 1040}px`; note.append(el('h4'), el('p'));
    const un = el('div', 'wood ao-unmute', t('unmute', {}, '🔔 Chạm để bật tiếng nước'));
    root.append(sign, stats, board, tiers, call, thanks, card, log, toastEl, note, un);

    un.onclick = () => { Live.audio()?.resume(); un.style.display = 'none'; K.audio.init(); };
    setTimeout(() => { const a = Live.audio(); if (a && a.state === 'suspended') un.style.display = 'block'; }, 1500);
    // xếp bảng quà ngay dưới bảng cần thủ, số liệu dưới biển tên (chữ dài ngắn thế nào cũng không đè)
    const stack = () => {
      stats.style.top = `${sign.offsetTop + sign.offsetHeight + 12}px`;
      tiers.style.top = `${board.offsetTop + board.offsetHeight + 12}px`;
      log.style.top = `${stats.offsetTop + stats.offsetHeight + 10}px`;      // 3 dòng cá vừa câu, chừa sẵn chỗ
      const y = Math.max(stats.offsetTop + stats.offsetHeight + 130, tiers.offsetTop + tiers.offsetHeight) + 22;
      call.style.top = `${y}px`; thanks.style.top = `${y + 78}px`; toastEl.style.top = `${y + 150}px`;
      if (cfg.cardTop == null) card.style.top = `${Math.min(780, y + 150)}px`;
    };
    stack(); document.fonts?.ready.then(stack); init.stack = stack;
  }

  // ---------- Số liệu, cần thủ hôm nay ----------
  function state(s, peopleCount) {
    if (!root) return;
    $('[data-c="people"]', root).textContent = `👥 ${fmt(peopleCount)}`;
    $('[data-c="likes"]', root).textContent = `❤️ ${fmt(s.totals?.likes)}`;
    const ol = $('.ao-board ol', root);
    ol.replaceChildren(...Array.from({ length: cfg.board?.size || 3 }, (_, i) => {
      const d = (s.top || [])[i], li = el('li', d ? '' : 'empty');
      li.append(el('span', 'md', ['🥇', '🥈', '🥉'][i] || i + 1), el('span', 'nm', d ? d.name : t('empty', {}, 'Còn trống')));
      if (d) li.append(el('span', 'c', `${fmt(d.coins)} ${t('coin', {}, 'xu')}`));
      return li;
    }));
    const g = (s.goals || [])[0];
    if (g) { $('.ao-stats .gl', root).textContent = `${g.label}: ${fmt(g.value)} / ${fmt(g.target)}`; $('.ao-stats .fill', root).style.width = `${Math.round(Math.min(1, g.progress) * 100)}%`; }
    init.stack?.();
  }

  function guide() {} // bảng quà dựng sẵn từ actions; lệnh chat đã có dòng "Gõ CÂU"

  // ---------- Băng cảm ơn quà ----------
  const thanksQ = [];
  function giftCard(ev) {
    thanksQ.push(ev); if (thanksQ.length > 8) thanksQ.splice(0, thanksQ.length - 8);
    if (!giftCard.busy) nextThanks();
    const row = root && root.querySelector(`.ao-tier[data-action="${CSS.escape(ev.action || '')}"]`);
    if (row) { row.classList.remove('hit'); void row.offsetWidth; row.classList.add('hit'); }
  }
  function nextThanks() {
    const box = $('.ao-thanks', root), ev = thanksQ.shift();
    if (!ev) { giftCard.busy = false; box.classList.remove('show'); return; }
    giftCard.busy = true;
    box.replaceChildren(el('span', 'who', ev.user?.name || t('guest', {}, 'Khách')), document.createTextNode(' ' + t('thanks', { skill: (ev.label || '').toLowerCase(), gift: ev.gift?.name || '' }, 'vừa {skill} · 🎁 {gift}') + (ev.count > 1 ? ` ×${ev.count}` : '')));
    box.classList.toggle('big', Boolean(ev.big));
    box.classList.remove('show'); void box.offsetWidth; box.classList.add('show');
    setTimeout(() => { box.classList.remove('show'); setTimeout(nextThanks, 300); }, thanksQ.length > 3 ? 1500 : 3200);
  }
  function ticker() {} // cá vừa câu đã có danh sách riêng

  // ---------- Thẻ cá ----------
  const cardQ = [];
  function showFish(user, fish, via) {
    if (!root || !fish) return;
    cardQ.push({ user, fish, via }); if (cardQ.length > 5) cardQ.splice(0, cardQ.length - 5);
    if (!showFish.busy) nextCard();
  }
  function nextCard() {
    const c = $('.ao-card', root), it = cardQ.shift();
    if (!it) { showFish.busy = false; c.classList.remove('show'); return; }
    showFish.busy = true;
    const f = it.fish, rk = RANK[f.rank] || RANK.thuong;
    c.className = `ao-card r-${f.rank}`; c.style.setProperty('--rk', rk.color);
    $('.rank', c).textContent = t(`rank_${f.rank}`, {}, rk.label);
    const pic = $('.pic', c);
    const src = f.image || imageOf(f); // bản dịch chưa điền ảnh thì dùng ảnh của món cùng vị trí ở bảng gốc
    if (src) { const img = el('img'); img.src = src; img.onerror = () => pic.replaceChildren(f.emoji || '🐟'); pic.replaceChildren(img); } else pic.replaceChildren(f.emoji || '🐟');
    $('.nm-ca', c).textContent = f.ca;
    $('.ky', c).textContent = f.ky ? `${f.ky} kg` : '';
    $('.loi', c).textContent = f.loi || '';
    const by = $('.by', c); by.replaceChildren(document.createTextNode(`🎣 ${it.user?.name || t('guest', {}, 'Khách')}`));
    if (it.via) by.append(el('span', 'via', it.via));
    void c.offsetWidth; c.classList.add('show');
    addLog(it.user, f, rk);
    const ms = cardQ.length > 2 ? 2400 : f.rank === 'huyenthoai' ? 5500 : 4200;
    setTimeout(() => { c.classList.remove('show'); setTimeout(nextCard, 400); }, ms);
  }
  function addLog(user, f, rk) {
    const log = $('.ao-log', root), row = el('div');
    row.style.setProperty('--rk', rk.color);
    row.append(document.createTextNode(`${user?.name || t('guest', {}, 'Khách')} · `), el('b', '', f.ca));
    log.prepend(row);
    while (log.children.length > 3) log.lastChild.remove();
  }
  // lá thăm server vừa bốc cho lệnh "câu": hiện sau lúc giật cần, khớp với giọng đọc (voice.delay.draw)
  function draw(ev) { setTimeout(() => showFish(ev.user, ev.draw), 1300); }

  function toast(text, ms = 3500) {
    const t = root && $('.ao-toast', root); if (!t) return;
    t.textContent = text; t.classList.add('show');
    clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), ms);
  }
  function periodic(ev) {
    const n = root && $('.ao-note', root); if (!n || !ev.text) return;
    $('h4', n).textContent = ev.title || ''; $('p', n).textContent = ev.text;
    n.classList.add('show'); clearTimeout(periodic.t); periodic.t = setTimeout(() => n.classList.remove('show'), 11000);
  }
  function remember() {}
  function reset() { cardQ.length = 0; thanksQ.length = 0; const log = root && $('.ao-log', root); if (log) log.replaceChildren(); }

  K.hud = { init, giftCard, ticker, state, guide, toast, periodic, draw, remember, reset };

  // ---------- Bảng cá (theme.json draws.ca) ----------
  // server không gửi "draws" xuống overlay, nên đọc thẳng theme.json (cá câu bằng quà do overlay tự chọn)
  let fishJson = null;
  fetch('theme.json').then((r) => r.json()).then((j) => { fishJson = j; }).catch((e) => console.error('[cau-ca] không đọc được bảng cá', e));
  const fishList = () => fishJson?.i18n?.[theme.lang]?.draws?.ca?.items || fishJson?.draws?.ca?.items || [];
  // cá do server bốc mang số thứ tự n (1, 2...); cá câu bằng quà tìm theo vị trí trong bảng đang dùng
  const imageOf = (f) => { const base = fishJson?.draws?.ca?.items || [], i = f.n ? f.n - 1 : fishList().indexOf(f); return base[i]?.image || ''; };
  const pickFish = (ranks) => { const l = fishList().filter((f) => ranks.includes(f.rank)); return l[Math.floor(Math.random() * l.length)]; };

  // ---------- Cần câu, phao, cá nhảy, đàn cá: vẽ trong lớp hiệu ứng của cảnh để đi theo camera ----------
  const WATER_TOP = 820, WATER_BOTTOM = 1170;           // bố cục v1: dải mặt ao có phao (khớp background / scene.json)
  const SIDES = () => cfg.layout === 'sides';           // bố cục v2 (theme.json hud.layout): ao giữa, người ngồi hai bờ
  const MAX_RODS = 40;                                  // live đông: chỉ vẽ cần cho người gần ao nhất
  const jumps = [], schools = [];
  const nearPoint = (p, name, r = 40) => { const q = K.scene.point(name); return q && Math.hypot(p.x - q.x, p.y - q.y) < r; };

  function bobberOf(p) {
    if (nearPoint(p, 'cau-tre')) return K.scene.point('mat-ao');
    const h = hash(p.id);
    if (SIDES()) {
      // ao giữa, người hai bờ: phao thả ra phía ao, ngang tầm người ngồi (mép ao = lối giữa "aisle" của scene.json)
      const side = p.x < 540 ? 1 : -1, half = K.geometry.aisleHalf(K.scene.scene, p.y);
      const x = 540 - side * half + side * (30 + (h % 90));
      return { x: Math.max(540 - half + 16, Math.min(540 + half - 16, x)), y: p.y - K.scene.height(p) * 0.15 + ((h >> 10) % 40) - 20 };
    }
    const y = WATER_TOP + 60 + (h % 1000) / 1000 * (WATER_BOTTOM - WATER_TOP - 60);
    const x = 540 + (p.x - 540) * 0.75 + ((h >> 10) % 80) - 40;
    return { x: Math.max(130, Math.min(950, x)), y };
  }

  function drawRods(ctx, t) {
    const list = K.scene.people().filter((p) => !p.walking).sort((a, b) => a.y - b.y).slice(0, MAX_RODS);
    ctx.save();
    ctx.lineCap = 'round';
    for (const p of list) {
      const h = K.scene.height(p), b = bobberOf(p);
      const pull = p.anim ? 1 : 0;                      // đang giật cần: phao chìm, cần cong lên
      const side = b.x >= p.x ? 1 : -1;
      const hx = p.x + side * h * 0.18, hy = p.y - h * 0.5;
      const dx = b.x - hx, dy = b.y - hy, len = Math.hypot(dx, dy) || 1;
      const rl = Math.min(len * 0.55, h * 1.7);
      const tx = hx + dx / len * rl, ty = hy + dy / len * rl - h * (0.35 + pull * 0.35);
      ctx.strokeStyle = '#3b2412'; ctx.lineWidth = Math.max(2, h * 0.035);
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo((hx + tx) / 2, (hy + ty) / 2 - h * 0.12, tx, ty); ctx.stroke();
      const bob = Math.sin(t / 600 + (hash(p.id) % 50)) * 2 + pull * 6;
      ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo((tx + b.x) / 2, Math.max(ty, b.y) - 20 + pull * 30, b.x, b.y + bob); ctx.stroke();
      const s = Math.max(3, h * 0.05);
      ctx.fillStyle = '#ff5a3c'; ctx.beginPath(); ctx.arc(b.x, b.y + bob - s * 0.4, s, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(b.x, b.y + bob - s * 0.4, s, 0, Math.PI); ctx.fill();
    }
    ctx.restore();
  }

  // cá vẽ tay (giữ chỗ khi chưa có ảnh): thân bầu, đuôi chẻ, vây lưng
  function fishShape(ctx, x, y, s, dir, color, rot = 0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(dir * s, s);
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.ellipse(0, 0, 30, 13, 0, 0, 6.283); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-24, 0); ctx.lineTo(-46, -15); ctx.lineTo(-40, 0); ctx.lineTo(-46, 15); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-6, -11); ctx.quadraticCurveTo(4, -24, 14, -10); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.ellipse(4, -4, 16, 4, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#1b1208'; ctx.beginPath(); ctx.arc(18, -3, 2.6, 0, 6.283); ctx.fill();
    ctx.restore();
  }

  function drawJumps(ctx, t) {
    for (let i = jumps.length - 1; i >= 0; i--) {
      const j = jumps[i], k = (t - j.t0) / j.ms;
      if (k >= 1) { jumps.splice(i, 1); continue; }
      if (k < 0) continue;
      const x = j.x + (k - 0.5) * j.span, y = j.y - Math.sin(k * Math.PI) * j.height;
      const rot = (k - 0.5) * 2.2 * j.dir;
      ctx.save(); ctx.shadowColor = 'rgba(255,210,80,.9)'; ctx.shadowBlur = 30;
      fishShape(ctx, x, y, j.size, j.dir, j.color, rot); ctx.restore();
      if (Math.random() < 0.5) K.fx.emit('spark', { x, y, count: 2, spread: 20 });
    }
  }

  function drawSchools(ctx, t) {
    for (let i = schools.length - 1; i >= 0; i--) {
      const s = schools[i], k = (t - s.t0) / s.ms;
      if (k >= 1) { schools.splice(i, 1); continue; }
      ctx.save(); ctx.globalAlpha = Math.min(1, Math.min(k, 1 - k) * 6) * 0.85;
      for (const f of s.fish) {
        const wob = Math.sin(t / 200 + f.off * 7) * 0.08;
        if (SIDES()) { // bơi ngược lên dọc ao
          const y = 1800 - 1400 * ((k + f.off) % 1), x = 540 + (f.y - 970) * 0.9 + Math.sin(t / 300 + f.off * 9) * 6;
          fishShape(ctx, x, y, f.size, 1, '#ffbf3c', -Math.PI / 2 + wob);
        } else {
          const x = -80 + (1160 * ((k + f.off) % 1)), y = f.y + Math.sin(t / 300 + f.off * 9) * 6;
          fishShape(ctx, x, y, f.size, 1, '#ffbf3c', wob);
        }
      }
      ctx.restore();
    }
  }

  // shortcut: chen vào Kit.fx.draw (lớp "back" = sau người, "front" = trước người) để vẽ theo camera; đổi khi kit có móc vẽ riêng cho theme
  const fxDraw = K.fx.draw;
  K.fx.draw = (ctx, layer, t) => {
    fxDraw(ctx, layer, t);
    try {
      if (layer === 'back') drawSchools(ctx, t);
      if (layer === 'front') { drawRods(ctx, t); drawJumps(ctx, t); }
    } catch (e) { console.error('[cau-ca] vẽ', e); }
  };

  // ---------- Hành động (theme.json { "js": "..." }) ----------
  function splash(x, y, big = false) {
    K.fx.halo(x, y, { radius: big ? 140 : 70, color: '255,255,255', duration: 1300 });
    K.fx.emit('bubble', { x, y, count: big ? 26 : 10, spread: big ? 50 : 20 });
    K.audio.sfx('ca');
  }

  K.action('giatCan', (p) => {
    if (!p) return;
    const b = bobberOf(p);
    setTimeout(() => splash(b.x, b.y), 700);
  });

  K.action('raiThinh', (p) => {
    const b = p ? bobberOf(p) : K.scene.point('mat-ao');
    for (let i = 0; i < 3; i++) {
      const x = b.x + (i - 1) * 46, y = b.y + (i % 2) * 14;
      setTimeout(() => {
        K.fx.emit('spark', { x, y: y - 60, count: 10, spread: 26, color: '255,226,150', vy: [30, 70] });
        K.fx.halo(x, y, { radius: 46, color: '255,255,255', duration: 1100 });
      }, i * 220);
    }
  });

  K.action('moiThom', (p, ev) => {
    const b = K.scene.point('mat-ao');
    setTimeout(() => splash(b.x, b.y, true), 1600);
    setTimeout(() => showFish(ev?.user || p, pickFish(['hiem', 'huyenthoai']), t('via', { skill: ev?.label || '' }, 'nhờ {skill}') + ' 🪱'), 2400);
  });

  K.action('rongLen', (p, ev) => {
    const b = K.scene.point('mat-ao');
    splash(b.x, b.y, true);
    jumps.push({ t0: performance.now() + 500, ms: 2600, x: b.x, y: b.y, span: 260, height: 380, size: 3.2, dir: 1, color: '#ffc93c' });
    setTimeout(() => { K.fx.halo(b.x, b.y - 300, { radius: 240, color: '255,214,120', duration: 2600 }); K.fx.fireworks({ bursts: 3, fountains: 0 }); }, 1700);
    setTimeout(() => splash(b.x + 130, b.y, true), 3100);
    const gold = fishList().find((f) => f.rank === 'huyenthoai');
    setTimeout(() => showFish(ev?.user || p, gold, t('via', { skill: ev?.label || '' }, 'nhờ {skill}') + ' 🐉'), 3300);
  });

  K.action('danCa', () => {
    schools.length = 0;
    schools.push({ t0: performance.now(), ms: 7000, fish: Array.from({ length: 7 }, (_, i) => ({ off: i * 0.045, y: 900 + (i % 3) * 70 + Math.random() * 30, size: 0.9 + Math.random() * 0.5 })) });
  });

  // ---------- Vầng sáng theo danh hiệu (theme.json titles[].aura) ----------
  // Bố cục v2: kit xếp lại chỗ có thể cho người đi thẳng sang bờ bên kia (lội qua ao) → đổi đường: dọc bờ, qua cầu tre, sang bờ kia
  function viaBridge(p) {
    const t = p.task;
    if (!t || t.type !== 'walk' || t.viaBridge || !Array.isArray(t.pts) || !t.pts.length) return;
    t.viaBridge = true;
    const end = t.pts[t.pts.length - 1], from = Math.sign(p.x - 540), to = Math.sign(end.x - 540);
    if (!from || !to || from === to) return;
    const lane = K.scene.scene.aisle?.lane ?? 300, by = K.scene.point('cau-tre')?.y ?? 1150;
    const a = 540 + from * lane, b = 540 + to * lane;
    t.pts = [{ x: a, y: p.y }, { x: a, y: by }, { x: b, y: by }, { x: b, y: end.y }, end];
  }

  K.on('frame', () => {
    const titles = theme.titles || [], sides = SIDES();
    for (const p of K.scene.people()) {
      const lv = titles.find((x) => x.label === p.title)?.aura; if (lv) p.aura = Math.max(p.aura, lv);
      if (!sides) continue;
      viaBridge(p);
      if (!p.walking) p.flip = p.x > 540; // bờ trái nhìn sang phải, bờ phải lật lại (tờ nhân vật vẽ quay sang phải)
    }
  });
})();
