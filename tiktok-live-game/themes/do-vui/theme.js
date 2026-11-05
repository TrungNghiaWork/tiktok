// Đố vui cả phòng: màn hình ra câu hỏi, người xem gõ đáp án vào bình luận, ai đúng nhanh được điểm.
// Quà giúp CẢ PHÒNG (không mua điểm): 1 xu mở một chữ, 10 xu thêm giây, 100 xu biến câu đang hỏi thành câu vàng (điểm ×3).
// Bộ câu hỏi, điểm, thời gian ở theme.json → "hud" → "game" (bản dịch: i18n.<lang>.hud.game.questions). Dùng chung ../danh-boss/game.js.
//
// Bố cục (vùng an toàn TikTok): bảng câu hỏi giữa trên (y 260–), dưới nó bên phải là bảng điểm, bên trái là "vừa trả lời đúng";
// nửa trái dưới y 1250 là khung bình luận nên để trống, khán giả đứng ở sàn dưới.

(function () {
  const K = window.Kit, G = window.Game;
  const Z = K.safe || { top: 240, side: 100 };
  const L = Z.side, COL = 330;
  const $ = (s, r) => (r || document).querySelector(s);
  let theme = {}, cfg = {}, GC = {}, root = null;

  const STYLE = `
  .dv-q { left:${L}px; right:${L}px; padding:18px 26px 20px; text-align:center; }
  .dv-q .hd { display:flex; justify-content:space-between; align-items:center; font:800 28px 'Baloo 2','Noto Sans SC',sans-serif; color:var(--gold); }
  .dv-q .hd .tm { font-variant-numeric:tabular-nums; color:#fff; }
  .dv-q .hd .tm.low { color:#ff6b6b; }
  .dv-q .txt { margin:10px 0 6px; font:800 44px/1.25 'Baloo 2','Be Vietnam Pro','Noto Sans SC',sans-serif; color:#fff; min-height:110px; display:flex; align-items:center; justify-content:center; }
  .dv-q .hint { display:flex; flex-wrap:wrap; justify-content:center; gap:8px; margin:6px 0 10px; min-height:58px; }
  .dv-q .hint i { font-style:normal; width:44px; height:54px; display:grid; place-items:center; border-radius:10px; background:rgba(255,255,255,.1); border:2px solid rgba(255,210,94,.6); font:800 32px 'Baloo 2','Noto Sans SC',sans-serif; color:var(--gold); }
  .dv-q .hint i.sp { width:18px; background:none; border:none; }
  .dv-q .hint i.open { background:rgba(255,210,94,.25); }
  .dv-q .bar { height:14px; border-radius:99px; background:rgba(255,255,255,.15); overflow:hidden; }
  .dv-q .bar div { height:100%; width:100%; border-radius:99px; background:linear-gradient(90deg,#ffd25e,#ff8a3d); transition:width 1s linear; }
  .dv-q.gold { border-color:#ffd25e; box-shadow:0 0 0 3px rgba(255,210,94,.5), 0 0 40px rgba(255,200,80,.6); }
  .dv-q .tag { display:none; margin-left:10px; padding:2px 12px; border-radius:99px; background:#ffd25e; color:#2a1260; font-size:22px; }
  .dv-q.gold .tag { display:inline-block; }
  .dv-call { left:${L}px; right:${L}px; padding:10px 18px; text-align:center; font-size:23px; font-weight:700; }
  .dv-call b { color:var(--gold); }
  .dv-side { width:${COL}px; padding:12px 18px 14px; }
  .dv-side h3 { margin:0 0 8px; font-size:26px; letter-spacing:1px; color:var(--gold); text-align:center; }
  .dv-side ol, .dv-side ul { list-style:none; margin:0; padding:0; display:grid; gap:6px; }
  .dv-side li { display:flex; justify-content:space-between; gap:10px; font-size:23px; font-weight:700; white-space:nowrap; }
  .dv-side li span:first-child { overflow:hidden; text-overflow:ellipsis; }
  .dv-side li b { flex:none; color:var(--gold); font-variant-numeric:tabular-nums; }
  .dv-side li.empty { opacity:.55; font-weight:600; }
  .gm-banner h2 { margin:0; font-size:30px; color:var(--gold); letter-spacing:2px; }
  .gm-banner .ans { margin:6px 0 4px; font:800 56px/1.1 'Baloo 2','Be Vietnam Pro','Noto Sans SC',sans-serif; color:#fff; }
  .gm-banner ol { list-style:none; margin:10px 0 0; padding:0; display:grid; gap:4px; font-size:26px; font-weight:700; }
  .gm-banner .sub { margin-top:8px; font-size:22px; opacity:.85; }
  `;

  // ---------- So đáp án ----------
  // bỏ dấu, chữ thường, bỏ dấu câu; tiếng Trung giữ nguyên chữ
  const plain = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'd').toLowerCase()
    .replace(/[.,!?;:'"“”‘’()\[\]{}…~`@#$%^&*+=_\\/|<>，。！？、；：（）【】《》「」]/g, ' ').replace(/\s+/g, ' ').trim();
  const cjk = (s) => /[㐀-鿿]/.test(s);
  function isRight(text, answers) {
    const m = plain(text); if (!m) return false;
    return answers.some((a) => {
      const k = plain(a); if (!k) return false;
      if (m === k) return true;
      if (cjk(k)) return m.replace(/\s/g, '').length <= k.length + 6 && m.replace(/\s/g, '').includes(k.replace(/\s/g, ''));
      // câu ngắn (≤ 5 từ) có chứa đúng cụm đáp án: "đáp án là hà nội" vẫn tính; câu dài liệt kê nhiều đáp án thì không
      return m.split(' ').length <= 5 && ` ${m} `.includes(` ${k} `);
    });
  }

  // ---------- Trạng thái (giữ khi tải lại trang) ----------
  const fresh = () => ({ n: 0, order: [], pos: 0, phase: 'ask', startAt: Date.now(), endAt: 0, extra: 0, gold: false, open: [], firstAt: 0, right: [], score: {} });
  const S = G.store('do-vui:v1', fresh);
  const ASK = () => GC.askMs || 25000, REVEAL = () => GC.revealMs || 6000, AFTER = () => GC.afterFirstMs || 6000;
  const PTS = () => GC.points || [10, 7, 5], LATE = () => GC.latePoints ?? 2, MAXRIGHT = () => GC.maxRight || 30;
  const bank = () => (Array.isArray(GC.questions) ? GC.questions : []).filter((q) => q && q.q && Array.isArray(q.a) && q.a.length);
  const cur = () => { const b = bank(), d = S.data; return b[d.order[d.pos] ?? 0] || b[0]; };
  const hintWord = (q) => String(q?.show || q?.a?.[0] || '');
  const timeLeft = () => { const d = S.data; if (d.phase !== 'ask') return 0; const end = d.startAt + ASK() + d.extra; const soon = d.firstAt ? d.firstAt + AFTER() : Infinity; return Math.max(0, Math.min(end, soon) - Date.now()); };

  function shuffle(n) { const a = Array.from({ length: n }, (_, i) => i); for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  function nextQuestion() {
    const d = S.data, b = bank(); if (!b.length) return;
    // xáo bộ câu hỏi, hết lượt mới xáo lại: không lặp câu cho tới khi dùng hết
    if (d.order.length !== b.length || d.pos + 1 >= d.order.length) { d.order = shuffle(b.length); d.pos = 0; } else d.pos += 1;
    Object.assign(d, { n: d.n + 1, phase: 'ask', startAt: Date.now(), extra: 0, gold: d.goldNext || false, goldNext: false, open: [], firstAt: 0, right: [] });
    S.save(); render(true);
  }

  function reveal() {
    const d = S.data; if (d.phase !== 'ask') return;
    d.phase = 'reveal'; d.endAt = Date.now(); S.save(); render();
    const q = cur(), top = d.right.slice(0, 3);
    if (top.length) { K.fx.rain('confetti', { count: 60 }); K.audio.sfx('win'); }
    G.banner(() => {
      const el = G.el, ol = el('ol');
      top.forEach((r, i) => ol.append(el('li', '', `${['🥇', '🥈', '🥉'][i]} ${r.name} · +${G.fmt(r.p)}`)));
      return [el('h2', '', G.t('answer', {}, 'ĐÁP ÁN')), el('div', 'ans', String(q?.a?.[0] || '')),
        top.length ? ol : el('div', 'sub', G.t('nobody', {}, 'Chưa ai trả lời đúng, câu sau nhé!')),
        el('div', 'sub', G.t('more', { n: d.right.length }, '{n} người trả lời đúng'))];
    }, REVEAL() - 600, 820);
  }

  function answer(ev) {
    const d = S.data, u = ev.user; if (d.phase !== 'ask' || !u?.id || !timeLeft()) return;
    if (d.right.some((r) => r.id === u.id) || d.right.length >= MAXRIGHT()) return;
    const q = cur(); if (!q || !isRight(ev.text, q.a)) return;
    const i = d.right.length, p = (PTS()[i] ?? LATE()) * (d.gold ? 3 : 1);
    d.right.push({ id: u.id, name: u.name || G.t('guest', {}, 'Khách'), p });
    if (!d.firstAt) d.firstAt = Date.now();
    G.addScore(d.score, u, p); S.save(); render();
    const person = K.scene.person(u.id);
    if (person) K.run([{ play: 'cheer', times: 2 }, { fx: 'emit', preset: 'star', at: 'head', count: i < 3 ? 14 : 6 }, { fx: 'text', at: 'head', text: `+${p}` }], person, ev);
    K.audio.sfx(i === 0 ? 'dung1' : 'dung', { force: i === 0 });
    if (i === 0) G.toast(G.t('first', { ten: u.name || '', p }, '⚡ {ten} trả lời đúng đầu tiên! +{p}'), 2600, 1080);
  }

  // ---------- Quà: giúp cả phòng ----------
  function openLetter() {
    const d = S.data, w = [...hintWord(cur())]; if (d.phase !== 'ask') return;
    const closed = w.map((c, i) => i).filter((i) => w[i] !== ' ' && !d.open.includes(i));
    // giữ lại ít nhất một chữ chưa mở: quà không đưa thẳng đáp án
    if (closed.length <= 1) return;
    d.open.push(closed[Math.floor(Math.random() * closed.length)]); S.save(); render();
  }
  function addTime() { const d = S.data; if (d.phase !== 'ask') return; d.extra += GC.giftSeconds ? GC.giftSeconds * 1000 : 10000; if (d.firstAt) d.firstAt += 4000; S.save(); render(); }
  function goldQuestion() { const d = S.data; if (d.phase === 'ask' && !d.right.length) d.gold = true; else d.goldNext = true; S.save(); render(); }
  K.action('goiY', (p, ev) => { for (let i = 0; i < Math.min(3, ev?.count || 1); i++) openLetter(); K.audio.sfx('mo'); }); // tặng ×3 mở tối đa 3 chữ
  K.action('themGio', () => { addTime(); K.audio.sfx('mo'); });
  K.action('cauVang', () => { goldQuestion(); K.fx.fireworks({ bursts: 3, fountains: 1 }); K.audio.sfx('win'); });

  // ---------- Giao diện ----------
  function init(o) {
    theme = o.theme; cfg = theme.hud || {}; GC = cfg.game || {};
    G.setText(theme);
    root = G.mount(o.stage, STYLE);
    const el = G.el, top = Z.top + 20;
    const q = el('div', 'panel dv-q'); q.style.top = `${top}px`;
    const hd = el('div', 'hd'), no = el('span', 'no'); no.append(el('span', 'n'), el('span', 'tag', G.t('gold', {}, '★ CÂU VÀNG ×3')));
    hd.append(no, el('span', 'tm'));
    const bar = el('div', 'bar'); bar.append(el('div'));
    q.append(hd, el('div', 'txt'), el('div', 'hint'), bar);
    const call = el('div', 'panel dv-call');
    G.rich(call, G.t('call', {}, 'Gõ **đáp án** vào bình luận · 🎁 1 xu mở 1 chữ · 10 xu +10 giây · 100 xu **câu vàng ×3**'));
    const board = el('div', 'panel dv-side dv-board'); board.style.right = `${L}px`; board.append(el('h3', '', G.t('board', {}, '🏆 BẢNG ĐIỂM')), el('ol'));
    const feed = el('div', 'panel dv-side dv-feed'); feed.style.left = `${L}px`; feed.append(el('h3', '', G.t('feed', {}, '✅ VỪA ĐÚNG')), el('ul'));
    root.append(q, call, board, feed);
    for (const c of ['.gm-banner', '.gm-toast', '.gm-unmute']) root.append($(c, root)); // thẻ đáp án nổi trên bảng điểm
    const stack = () => { call.style.top = `${q.offsetTop + q.offsetHeight + 12}px`; const y = call.offsetTop + call.offsetHeight + 16; board.style.top = `${y}px`; feed.style.top = `${y}px`; };
    stack(); document.fonts?.ready.then(stack); new ResizeObserver(stack).observe(q);

    const d = S.data;
    if (!bank().length) { $('.txt', q).textContent = G.t('noBank', {}, 'Chưa có câu hỏi: thêm vào theme.json → hud.game.questions'); return; }
    if (d.order.length !== bank().length) { d.order = shuffle(bank().length); d.pos = 0; d.phase = 'ask'; d.startAt = Date.now(); S.save(); }
    if (d.phase === 'reveal' && Date.now() - d.endAt > REVEAL()) nextQuestion();
    render(true);
    setInterval(tick, 500);
  }

  function tick() {
    const d = S.data; if (!bank().length) return;
    if (d.phase === 'ask' && !timeLeft()) reveal();
    else if (d.phase === 'reveal' && Date.now() - d.endAt >= REVEAL()) nextQuestion();
    render();
  }

  function render(fresh) {
    if (!root) return;
    const d = S.data, q = cur(), qe = $('.dv-q', root); if (!q) return;
    $('.n', qe).textContent = G.t('no', { n: d.n || 1 }, 'CÂU {n}');
    qe.classList.toggle('gold', Boolean(d.gold));
    const left = timeLeft(), tm = $('.tm', qe);
    tm.textContent = d.phase === 'ask' ? `⏱ ${Math.ceil(left / 1000)}` : G.t('reveal', {}, 'Đáp án…');
    tm.classList.toggle('low', d.phase === 'ask' && left < 6000);
    if (fresh || $('.txt', qe).dataset.k !== `${d.n}`) { $('.txt', qe).textContent = q.q; $('.txt', qe).dataset.k = `${d.n}`; }
    const full = d.phase === 'reveal', w = [...hintWord(q)];
    $('.hint', qe).replaceChildren(...w.map((c, i) => {
      if (c === ' ') return G.el('i', 'sp');
      const show = full || d.open.includes(i);
      return G.el('i', show ? 'open' : '', show ? c.toUpperCase() : '');
    }));
    const total = ASK() + d.extra;
    $('.bar div', qe).style.width = `${d.phase === 'ask' ? Math.round((left / total) * 100) : 0}%`;
    const top = G.topOf(d.score, GC.boardSize || 5), ol = $('.dv-board ol', root);
    ol.replaceChildren(...(top.length ? top.map((r, i) => { const li = G.el('li'); li.append(G.el('span', '', `${i + 1}. ${r.name}`), G.el('b', '', G.fmt(r.v))); return li; })
      : [G.el('li', 'empty', G.t('waiting', {}, 'Chưa có ai'))]));
    const ul = $('.dv-feed ul', root), last = d.right.slice(-5).reverse();
    ul.replaceChildren(...(last.length ? last.map((r) => { const li = G.el('li'); li.append(G.el('span', '', r.name), G.el('b', '', `+${r.p}`)); return li; })
      : [G.el('li', 'empty', G.t('feedEmpty', {}, 'Gõ đáp án nào!'))]));
  }

  function periodic(ev) { if (ev.text) G.toast(ev.text, 7000, 1080); }
  function giftCard(ev) { G.toast(`🎁 ${ev.user?.name || G.t('guest', {}, 'Khách')} · ${ev.label || ''}${ev.count > 1 ? ` ×${ev.count}` : ''}`, 2600, 1080); }
  const noop = () => {};
  K.hud = { init, giftCard, ticker: noop, state: () => render(), guide: noop, toast: (t, ms) => G.toast(t, ms, 1080), periodic, draw: noop, remember: noop, reset: noop };

  K.on('chat', (ev) => answer(ev));
  Live.on('reset', () => { S.reset(); nextQuestion(); });
  K.on('frame', () => { for (const p of K.scene.people()) { const lv = (theme.titles || []).find((x) => x.label === p.title)?.aura; if (lv) p.aura = Math.max(p.aura, lv); } });
})();
