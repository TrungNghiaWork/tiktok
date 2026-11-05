// Lớp học đoán chữ: bảng đen ra gợi ý + các chữ cái bị xáo trộn, người xem gõ đáp án vào bình luận, ai đúng nhanh được điểm.
// Người xem là học sinh ngồi theo lưới bàn (scene.json "slots"); lớp đầy thì bạn lâu không tương tác nhất nhường chỗ.
// Mỗi "tiết" N câu, hết tiết vinh danh học sinh giỏi nhất tiết rồi giải lao, sang tiết mới.
// Quà giúp CẢ LỚP (không mua điểm): 1 xu mở một chữ, 10 xu thêm giây, 100 xu câu vàng (điểm ×3).
//
// Thời gian (giây mỗi câu, sau người đúng đầu, hiện đáp án, số câu mỗi tiết, giải lao) chỉnh ở bảng điều khiển → tab Live
// (theme.json "settings"), đổi là áp dụng ngay. Bộ từ ở theme.json → "hud" → "game" → "words".
//
// Bố cục (vùng an toàn TikTok): dải tên lớp + bảng đen giữa trên; dưới bảng: trái top tiết, phải "vừa đúng", giữa cô giáo;
// lưới bàn học sinh ở dưới (nửa trái dưới y 1250 bị khung bình luận che: tên trên bàn ở đó có thể khuất).

(function () {
  const K = window.Kit, G = window.Game;
  const Z = K.safe || { top: 240, side: 100 };
  const L = Z.side, COL = 290;
  const $ = (s, r) => (r || document).querySelector(s);
  let theme = {}, cfg = {}, GC = {}, root = null, teacherImg = null;

  const STYLE = `
  .ld-top { left:${L}px; right:${L}px; padding:8px 18px; display:flex; justify-content:space-between; align-items:center; gap:12px; }
  .ld-top h1 { margin:0; font-size:30px; color:var(--gold); letter-spacing:1px; white-space:nowrap; }
  .ld-top .meta { font-size:23px; font-weight:800; white-space:nowrap; }
  .ld-board { position:absolute; left:${L}px; right:${L}px; box-sizing:border-box; padding:16px 24px 16px; border-radius:14px; text-align:center;
    background:radial-gradient(ellipse at 30% 20%, rgba(255,255,255,.08), transparent 60%), linear-gradient(180deg,#2f5d46,#1f4433);
    border:12px solid #8a5a2b; box-shadow:inset 0 0 0 3px #5e3a17, 0 10px 24px rgba(0,0,0,.45); color:#f4f1e6; text-shadow:0 1px 2px rgba(0,0,0,.5); }
  .ld-board.gold { border-color:#d9a635; box-shadow:inset 0 0 0 3px #8a5a2b, 0 0 36px rgba(255,200,80,.7); }
  .ld-board .hd { display:flex; justify-content:space-between; align-items:center; font:800 24px 'Baloo 2','Noto Sans SC',sans-serif; color:#ffe9a8; }
  .ld-board .hd .tag { display:none; margin-left:8px; padding:1px 10px; border-radius:99px; background:#ffd25e; color:#3a2410; font-size:20px; text-shadow:none; }
  .ld-board.gold .hd .tag { display:inline-block; }
  .ld-board .tm { width:58px; height:58px; border-radius:50%; display:grid; place-items:center; border:4px solid #ffe9a8; font:800 28px 'Baloo 2',sans-serif; color:#fff; font-variant-numeric:tabular-nums; }
  .ld-board .tm.low { border-color:#ff6b6b; color:#ff8f8f; }
  .ld-board .hint { margin:4px 0 12px; font:700 36px/1.3 'Be Vietnam Pro','Noto Sans SC',sans-serif; min-height:94px; display:flex; align-items:center; justify-content:center; }
  .ld-board .tiles, .ld-board .slots { display:flex; flex-wrap:wrap; justify-content:center; gap:8px; }
  .ld-board .tiles i { font-style:normal; width:52px; height:58px; display:grid; place-items:center; border-radius:8px; background:linear-gradient(180deg,#f6e3b8,#d9b97a); color:#4a2a0e; font:800 34px 'Baloo 2','Noto Sans SC',sans-serif; text-shadow:none; box-shadow:0 4px 0 #9c7840, 0 6px 10px rgba(0,0,0,.35); transform:rotate(var(--r)); }
  .ld-board .slots { margin-top:16px; }
  .ld-board .slots i { font-style:normal; width:40px; height:50px; display:grid; place-items:end center; border-bottom:4px solid #f4f1e6; font:800 32px 'Baloo 2','Noto Sans SC',sans-serif; color:#fff; }
  .ld-board .slots i.sp { width:18px; border:none; }
  .ld-board .slots i.open { color:#ffe9a8; }
  .ld-board .st { margin-top:12px; display:flex; justify-content:space-between; gap:12px; font-size:22px; font-weight:700; color:#e5f0e9; }
  .ld-board .st span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .ld-board .bar { margin-top:10px; height:10px; border-radius:99px; background:rgba(255,255,255,.15); overflow:hidden; }
  .ld-board .bar div { height:100%; width:100%; background:#ffe9a8; transition:width 1s linear; }
  .ld-call { left:${L}px; right:${L}px; padding:8px 16px; text-align:center; font-size:22px; font-weight:700; }
  .ld-call b { color:var(--gold); }
  .ld-side { width:${COL}px; padding:10px 16px 12px; }
  .ld-side h3 { margin:0 0 6px; text-align:center; font-size:23px; color:var(--gold); }
  .ld-side ol, .ld-side ul { list-style:none; margin:0; padding:0; display:grid; gap:5px; }
  .ld-side li { display:flex; justify-content:space-between; gap:8px; font-size:22px; font-weight:700; white-space:nowrap; }
  .ld-side li span { overflow:hidden; text-overflow:ellipsis; }
  .ld-side li b { flex:none; color:var(--gold); font-variant-numeric:tabular-nums; }
  .ld-side li.empty { opacity:.6; font-weight:600; }
  .gm-banner h2 { margin:0; font-size:30px; color:var(--gold); letter-spacing:2px; }
  .gm-banner .ans { margin:6px 0 4px; font:800 56px/1.1 'Baloo 2','Be Vietnam Pro','Noto Sans SC',sans-serif; color:#fff; }
  .gm-banner ol { list-style:none; margin:10px 0 0; padding:0; display:grid; gap:4px; font-size:26px; font-weight:700; }
  .gm-banner .sub { margin-top:8px; font-size:22px; opacity:.85; }
  `;

  // ---------- Thời gian: bảng điều khiển (theme.json "settings") > hud.game > mặc định ----------
  const SET = () => Live.settings || {};
  const sec = (id, game, def) => 1000 * Number(SET()[id] ?? GC[game] ?? def);
  const ASK = () => sec('askSeconds', 'askSeconds', 25), AFTER = () => sec('afterFirstSeconds', 'afterFirstSeconds', 6);
  const REVEAL = () => sec('revealSeconds', 'revealSeconds', 6), BREAK = () => sec('breakSeconds', 'breakSeconds', 12);
  const PER = () => Math.max(1, Number(SET().perPeriod ?? GC.perPeriod ?? 20));
  const PTS = () => GC.points || [10, 7, 5], LATE = () => GC.latePoints ?? 2, MAXRIGHT = () => GC.maxRight || 40;

  // ---------- Chữ ----------
  const plain = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'd').toLowerCase()
    .replace(/[.,!?;:'"“”‘’()\[\]{}…~`@#$%^&*+=_\\/|<>，。！？、；：（）【】《》「」]/g, ' ').replace(/\s+/g, ' ').trim();
  const cjk = (s) => /[㐀-鿿]/.test(s);
  function isRight(text, answers) {
    const m = plain(text); if (!m) return false;
    return answers.some((a) => {
      const k = plain(a); if (!k) return false;
      if (m === k || m.replace(/\s/g, '') === k.replace(/\s/g, '')) return true; // "conkhi" = "con khỉ"
      if (cjk(k)) return m.replace(/\s/g, '').length <= k.length + 6 && m.replace(/\s/g, '').includes(k.replace(/\s/g, ''));
      return m.split(' ').length <= 5 && ` ${m} `.includes(` ${k} `);
    });
  }
  // chữ hiện trên ô: bỏ dấu, viết hoa ("con khỉ" → C O N _ K H I); tiếng Trung giữ nguyên chữ Hán
  const letters = (w) => [...(cjk(w) ? String(w) : plain(w).toUpperCase())];
  function seeded(n) { let s = (n * 2654435761) >>> 0; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 10000) / 10000; }; }
  function scramble(w, n) {
    const a = letters(w).filter((c) => c !== ' '), rnd = seeded(n + 7);
    for (let tries = 0; tries < 8; tries++) {
      for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
      if (a.length < 2 || a.join('') !== letters(w).filter((c) => c !== ' ').join('')) break; // xáo xong vẫn y nguyên thì xáo lại
    }
    return a;
  }

  // ---------- Trạng thái (giữ khi tải lại trang) ----------
  const fresh = () => ({ period: 1, q: 0, n: 0, order: [], pos: -1, phase: 'ask', startAt: Date.now(), endAt: 0, extra: 0, gold: false, goldNext: false, open: [0], firstAt: 0, right: [], tiles: [], score: {}, periodScore: {} });
  const S = G.store('lop-doan-chu:v1', fresh);
  const bank = () => (Array.isArray(GC.words) ? GC.words : []).filter((w) => w && w.hint && Array.isArray(w.a) && w.a.length);
  const cur = () => { const b = bank(), d = S.data; return b[d.order[d.pos] ?? 0] || b[0]; };
  const word = (q) => String(q?.show || q?.a?.[0] || '');
  const timeLeft = () => { const d = S.data; if (d.phase !== 'ask') return 0; const end = d.startAt + ASK() + d.extra; const soon = d.firstAt && AFTER() ? d.firstAt + AFTER() : Infinity; return Math.max(0, Math.min(end, soon) - Date.now()); };
  function shuffle(n) { const a = Array.from({ length: n }, (_, i) => i); for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  function nextQuestion() {
    const d = S.data, b = bank(); if (!b.length) return;
    if (d.order.length !== b.length || d.pos + 1 >= d.order.length) { d.order = shuffle(b.length); d.pos = 0; } else d.pos += 1;
    const n = d.n + 1;
    Object.assign(d, { n, q: d.q + 1, phase: 'ask', startAt: Date.now(), extra: 0, gold: d.goldNext, goldNext: false, open: [0], firstAt: 0, right: [] });
    d.tiles = scramble(word(cur()), n);
    S.save(); render(true);
  }

  function reveal() {
    const d = S.data; if (d.phase !== 'ask') return;
    d.phase = 'reveal'; d.endAt = Date.now(); S.save(); render();
    const q = cur(), top = d.right.slice(0, 3);
    if (top.length) { K.fx.rain('confetti', { count: 50 }); K.audio.sfx('win'); }
    teacher.cheerAt = performance.now();
    G.banner(() => {
      const el = G.el, ol = el('ol');
      top.forEach((r, i) => ol.append(el('li', '', `${['🥇', '🥈', '🥉'][i]} ${r.name} · +${G.fmt(r.p)}`)));
      return [el('h2', '', G.t('answer', {}, 'ĐÁP ÁN')), el('div', 'ans', word(q).toUpperCase()),
        top.length ? ol : el('div', 'sub', G.t('nobody', {}, 'Chưa bạn nào đoán ra, câu sau nhé!')),
        el('div', 'sub', G.t('more', { n: d.right.length }, '{n} bạn trả lời đúng'))];
    }, Math.max(1500, REVEAL() - 600), 760);
  }

  // hết tiết: vinh danh top 3 của tiết, giải lao, sang tiết mới
  function endPeriod() {
    const d = S.data; d.phase = 'break'; d.endAt = Date.now(); S.save(); render();
    const top = G.topOf(d.periodScore, 3);
    K.fx.fireworks({ bursts: 4, fountains: 2 }); K.audio.sfx('trong', { force: true });
    G.banner(() => {
      const el = G.el, ol = el('ol');
      top.forEach((r, i) => ol.append(el('li', '', `${['🥇', '🥈', '🥉'][i]} ${r.name} · ${G.t('pts', { v: G.fmt(r.v) }, '{v} điểm')}`)));
      return [el('h2', '', G.t('periodEnd', { n: d.period }, '🔔 HẾT TIẾT {n}')), el('div', 'ans', G.t('best', {}, 'HỌC SINH GIỎI')),
        top.length ? ol : el('div', 'sub', G.t('noBest', {}, 'Tiết này chưa ai ghi điểm')),
        el('div', 'sub', G.t('nextPeriod', { n: d.period + 1, s: Math.round(BREAK() / 1000) }, 'Tiết {n} vào học sau {s} giây'))];
    }, Math.max(2000, BREAK() - 800), 760);
  }
  function nextPeriod() { const d = S.data; Object.assign(d, { period: d.period + 1, q: 0, periodScore: {} }); nextQuestion(); G.toast(G.t('periodGo', { n: S.data.period }, '📚 TIẾT {n} BẮT ĐẦU!'), 2500, 1110); }

  function answer(ev) {
    const d = S.data, u = ev.user; if (d.phase !== 'ask' || !u?.id || !timeLeft()) return;
    if (d.right.some((r) => r.id === u.id) || d.right.length >= MAXRIGHT()) return;
    const q = cur(); if (!q || !isRight(ev.text, q.a)) return;
    const i = d.right.length, p = (PTS()[i] ?? LATE()) * (d.gold ? 3 : 1);
    d.right.push({ id: u.id, name: u.name || G.t('guest', {}, 'Bạn'), p });
    if (!d.firstAt) d.firstAt = Date.now();
    G.addScore(d.score, u, p); G.addScore(d.periodScore, u, p); S.save(); render();
    const person = K.scene.person(u.id);
    if (person) K.run([{ play: 'cheer', times: 2 }, { fx: 'emit', preset: 'star', at: 'head', count: i < 3 ? 14 : 6 }, { fx: 'text', at: 'head', text: `+${p}` }], person, ev);
    K.audio.sfx(i === 0 ? 'dung1' : 'dung', { force: i === 0 });
    if (i === 0) { teacher.cheerAt = performance.now(); G.toast(G.t('first', { ten: u.name || '', p }, '⚡ {ten} đúng đầu tiên! +{p}'), 2600, 1110); }
  }

  // ---------- Quà: giúp cả lớp ----------
  function openLetter() {
    const d = S.data, w = letters(word(cur())); if (d.phase !== 'ask') return;
    const closed = w.map((c, i) => i).filter((i) => w[i] !== ' ' && !d.open.includes(i));
    if (closed.length <= 1) return; // luôn chừa một chữ: quà không đưa thẳng đáp án
    d.open.push(closed[Math.floor(Math.random() * closed.length)]); S.save(); render();
  }
  K.action('goiY', (p, ev) => { for (let i = 0; i < Math.min(3, ev?.count || 1); i++) openLetter(); K.audio.sfx('phan'); });
  K.action('themGio', () => { const d = S.data; if (d.phase !== 'ask') return; d.extra += (GC.giftSeconds || 10) * 1000; if (d.firstAt) d.firstAt += 4000; S.save(); render(); K.audio.sfx('phan'); });
  K.action('cauVang', () => { const d = S.data; if (d.phase === 'ask' && !d.right.length) d.gold = true; else d.goldNext = true; S.save(); render(); K.fx.fireworks({ bursts: 3, fountains: 1 }); K.audio.sfx('win'); });

  // ---------- Giao diện ----------
  function init(o) {
    theme = o.theme; cfg = theme.hud || {}; GC = cfg.game || {};
    G.setText(theme);
    if (GC.teacherImage) { teacherImg = new Image(); teacherImg.src = GC.teacherImage; }
    root = G.mount(o.stage, STYLE);
    const el = G.el;
    const top = el('div', 'panel ld-top'); top.style.top = `${Z.top + 4}px`; top.append(el('h1', '', cfg.title?.text || G.t('title', {}, 'LỚP HỌC ĐOÁN CHỮ')), el('span', 'meta'));
    const board = el('div', 'ld-board'), hd = el('div', 'hd'), lb = el('span');
    lb.append(el('span', 'lb', G.t('hintLabel', {}, '✏️ Gợi ý')), el('span', 'tag', G.t('gold', {}, '★ CÂU VÀNG ×3')));
    hd.append(lb, el('span', 'tm'));
    const st = el('div', 'st'); st.append(el('span', 'fast'), el('span', 'cnt'));
    const bar = el('div', 'bar'); bar.append(el('div'));
    board.append(hd, el('div', 'hint'), el('div', 'tiles'), el('div', 'slots'), st, bar);
    const call = el('div', 'panel ld-call');
    G.rich(call, G.t('call', {}, 'Gõ **đáp án** vào bình luận · 🎁 1 xu mở 1 chữ · 10 xu +10 giây · 100 xu **câu vàng ×3**'));
    const best = el('div', 'panel ld-side ld-best'); best.style.left = `${L}px`; best.append(el('h3'), el('ol'));
    const feed = el('div', 'panel ld-side ld-feed'); feed.style.right = `${L}px`; feed.append(el('h3', '', G.t('feed', {}, '✅ VỪA ĐÚNG')), el('ul'));
    root.append(top, board, call, best, feed);
    for (const c of ['.gm-banner', '.gm-toast', '.gm-unmute']) root.append($(c, root)); // thẻ đáp án / hết tiết nổi trên mọi bảng
    const stack = () => {
      board.style.top = `${top.offsetTop + top.offsetHeight + 10}px`;
      call.style.top = `${board.offsetTop + board.offsetHeight + 10}px`;
      const y = call.offsetTop + call.offsetHeight + 12; best.style.top = `${y}px`; feed.style.top = `${y}px`;
      teacher.y = Math.max(y + 300, GC.teacherY || 0);
    };
    stack(); document.fonts?.ready.then(stack); new ResizeObserver(stack).observe(board);

    const d = S.data;
    if (!bank().length) { $('.hint', board).textContent = G.t('noBank', {}, 'Chưa có từ: thêm vào theme.json → hud.game.words'); return; }
    if (d.order.length !== bank().length || d.pos < 0) nextQuestion();
    else if (d.phase === 'reveal' && Date.now() - d.endAt > REVEAL()) nextQuestion();
    else if (d.phase === 'break' && Date.now() - d.endAt > BREAK()) nextPeriod();
    render(true);
    setInterval(tick, 500);
    Live.on('settings', () => render()); // đổi thời gian ở bảng điều khiển: đồng hồ tính lại ngay
  }

  function tick() {
    const d = S.data; if (!bank().length) return;
    if (d.phase === 'ask' && !timeLeft()) reveal();
    else if (d.phase === 'reveal' && Date.now() - d.endAt >= REVEAL()) { if (d.q >= PER()) endPeriod(); else nextQuestion(); }
    else if (d.phase === 'break' && Date.now() - d.endAt >= BREAK()) nextPeriod();
    render();
  }

  function render(fresh) {
    if (!root) return;
    const d = S.data, q = cur(), b = $('.ld-board', root); if (!q) return;
    const inClass = K.scene.people().filter((p) => !p.npc).length;
    $('.ld-top .meta', root).textContent = G.t('meta', { p: d.period, q: Math.min(d.q, PER()), n: PER(), c: G.fmt(inClass) }, 'Tiết {p} · Câu {q}/{n} · {c} bạn');
    b.classList.toggle('gold', Boolean(d.gold));
    const left = timeLeft(), tm = $('.tm', b);
    tm.textContent = d.phase === 'ask' ? Math.ceil(left / 1000) : d.phase === 'break' ? '☕' : '✓';
    tm.classList.toggle('low', d.phase === 'ask' && left < 6000);
    if (fresh || $('.hint', b).dataset.k !== `${d.n}`) {
      $('.hint', b).textContent = q.hint; $('.hint', b).dataset.k = `${d.n}`;
      $('.tiles', b).replaceChildren(...d.tiles.map((c, i) => { const t = G.el('i', '', c); t.style.setProperty('--r', `${((i * 37) % 9) - 4}deg`); return t; }));
    }
    const full = d.phase !== 'ask', w = letters(word(q));
    $('.slots', b).replaceChildren(...w.map((c, i) => (c === ' ' ? G.el('i', 'sp') : G.el('i', full || d.open.includes(i) ? 'open' : '', full || d.open.includes(i) ? c : ''))));
    $('.fast', b).textContent = d.right[0] ? G.t('fast', { ten: d.right[0].name }, '⚡ Nhanh nhất: {ten}') : G.t('noFast', {}, '⚡ Chưa ai đoán ra…');
    $('.cnt', b).textContent = G.t('count', { n: d.right.length }, '{n} bạn đã đúng');
    $('.bar div', b).style.width = `${d.phase === 'ask' ? Math.round((left / (ASK() + d.extra)) * 100) : 0}%`;
    $('.ld-best h3', root).textContent = G.t('board', { p: d.period }, '⭐ TOP TIẾT {p}');
    const top = G.topOf(d.periodScore, GC.boardSize || 5);
    $('.ld-best ol', root).replaceChildren(...(top.length ? top.map((r, i) => { const li = G.el('li'); li.append(G.el('span', '', `${i + 1}. ${r.name}`), G.el('b', '', G.fmt(r.v))); return li; })
      : [G.el('li', 'empty', G.t('waiting', {}, 'Chưa có ai'))]));
    const last = d.right.slice(-5).reverse();
    $('.ld-feed ul', root).replaceChildren(...(last.length ? last.map((r) => { const li = G.el('li'); li.append(G.el('span', '', r.name), G.el('b', '', `+${r.p}`)); return li; })
      : [G.el('li', 'empty', G.t('feedEmpty', {}, 'Gõ đáp án nào!'))]));
  }

  // ---------- Bàn học (vẽ trước người, theo đúng các chỗ ngồi cố định) + cô giáo ----------
  const teacher = { y: 1150, cheerAt: -9999 };
  G.onDraw('front', (ctx, t) => {
    const slots = K.scene.layout?.slots || [], byPos = new Map();
    for (const p of K.scene.people()) if (p.slot && !p.npc) byPos.set(`${p.slot.x},${p.slot.y}`, p);
    const W = GC.desk?.width || 150, H = GC.desk?.height || 44, lift = GC.desk?.lift ?? 12;
    ctx.textAlign = 'center'; ctx.lineJoin = 'round';
    for (const s of slots) {
      const x = s.x, y = s.y - lift;
      ctx.fillStyle = '#c98b4b'; ctx.beginPath(); ctx.moveTo(x - W / 2, y); ctx.lineTo(x + W / 2, y); ctx.lineTo(x + W / 2 - 8, y - 14); ctx.lineTo(x - W / 2 + 8, y - 14); ctx.fill(); // mặt bàn
      ctx.fillStyle = '#a86c33'; ctx.fillRect(x - W / 2, y, W, H); // thân bàn
      ctx.fillStyle = '#7d4d20'; ctx.fillRect(x - W / 2 + 6, y + H, 8, 14); ctx.fillRect(x + W / 2 - 14, y + H, 8, 14); // chân
      const p = byPos.get(`${s.x},${s.y}`);
      if (p) { // bảng tên trên mặt trước bàn
        const name = (p.name || '').length > 11 ? `${p.name.slice(0, 10)}…` : p.name || '';
        ctx.fillStyle = '#fff8e6'; ctx.beginPath(); ctx.roundRect(x - W / 2 + 8, y + 8, W - 16, 28, 6); ctx.fill();
        ctx.fillStyle = '#3a2410'; ctx.font = "800 20px 'Be Vietnam Pro','Noto Sans SC',sans-serif"; ctx.fillText(name, x, y + 29);
      }
    }
    // cô giáo đứng giữa, dưới bảng đen: giơ thước khi có người đúng / công bố đáp án
    const x = 540, y = teacher.y, up = performance.now() - teacher.cheerAt < 1200;
    if (teacherImg?.complete && teacherImg.naturalWidth) { const h = GC.teacherHeight || 260, w = h * teacherImg.naturalWidth / teacherImg.naturalHeight; ctx.drawImage(teacherImg, x - w / 2, y - h, w, h); return; }
    ctx.save(); ctx.translate(x, y + Math.sin(t / 500) * 1.5); ctx.lineCap = 'round';
    ctx.fillStyle = '#f2f2ee'; ctx.beginPath(); ctx.moveTo(-34, 0); ctx.lineTo(34, 0); ctx.lineTo(20, -120); ctx.lineTo(-20, -120); ctx.fill(); // quần
    ctx.fillStyle = '#2f7fd8'; ctx.beginPath(); ctx.moveTo(-26, -24); ctx.lineTo(26, -24); ctx.lineTo(24, -150); ctx.lineTo(-24, -150); ctx.fill(); // áo dài
    ctx.fillStyle = '#2f7fd8'; ctx.beginPath(); ctx.moveTo(-24, -150); ctx.quadraticCurveTo(0, -170, 24, -150); ctx.lineTo(18, -176); ctx.lineTo(-18, -176); ctx.fill();
    ctx.strokeStyle = '#2f7fd8'; ctx.lineWidth = 12;
    ctx.beginPath(); ctx.moveTo(-20, -165); ctx.lineTo(-34, -110); ctx.stroke(); // tay trái
    ctx.beginPath(); ctx.moveTo(20, -165); ctx.lineTo(up ? 46 : 38, up ? -205 : -118); ctx.stroke(); // tay phải
    ctx.strokeStyle = '#7d4d20'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(up ? 46 : 38, up ? -205 : -118); ctx.lineTo(up ? 70 : 74, up ? -262 : -150); ctx.stroke(); // thước chỉ
    ctx.fillStyle = '#f2c79b'; ctx.beginPath(); ctx.arc(0, -196, 22, 0, 6.283); ctx.fill(); // mặt
    ctx.fillStyle = '#1e1410'; ctx.beginPath(); ctx.arc(0, -202, 23, Math.PI * 1.05, Math.PI * 1.95); ctx.fill(); ctx.beginPath(); ctx.arc(0, -224, 11, 0, 6.283); ctx.fill(); // tóc búi
    ctx.fillStyle = '#1e1410'; ctx.beginPath(); ctx.arc(-8, -196, 2.5, 0, 6.283); ctx.arc(8, -196, 2.5, 0, 6.283); ctx.fill();
    ctx.strokeStyle = '#b5523f'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, -189, 7, 0.2, Math.PI - 0.2); ctx.stroke();
    ctx.restore();
  });

  // ---------- Sự kiện ----------
  function periodic(ev) { if (ev.text) G.toast(ev.text, 7000, 1110); }
  function giftCard(ev) { G.toast(`🎁 ${ev.user?.name || G.t('guest', {}, 'Bạn')} · ${ev.label || ''}${ev.count > 1 ? ` ×${ev.count}` : ''}`, 2600, 1110); }
  const noop = () => {};
  K.hud = { init, giftCard, ticker: noop, state: () => render(), guide: noop, toast: (t, ms) => G.toast(t, ms, 1110), periodic, draw: noop, remember: noop, reset: noop };

  K.on('chat', (ev) => answer(ev));
  Live.on('reset', () => { S.reset(); nextQuestion(); });
  K.on('frame', () => { for (const p of K.scene.people()) { const lv = (theme.titles || []).find((x) => x.label === p.title)?.aura; if (lv) p.aura = Math.max(p.aura, lv); } });
})();
