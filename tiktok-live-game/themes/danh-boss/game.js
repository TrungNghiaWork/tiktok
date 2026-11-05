// Đồ dùng chung cho các theme game (đánh boss, kéo co). Kéo co nạp file này qua "../danh-boss/game.js": đừng xoá.
//
//   Game.store(key, init)   trạng thái game lưu trong trình duyệt: OBS / overlay.bat tải lại trang vẫn giữ (ván, máu boss, điểm)
//                           khung xem trước trong bảng điều khiển (?quiet) chỉ đọc, không ghi đè
//   Game.onDraw(layer, fn)  vẽ thêm trong cảnh, đi theo camera: "back" (sau người) | "front" (trước người)
//   Game.toast(text, ms)    dòng chữ lớn giữa màn
//   Game.banner(build, ms)  thẻ lớn giữa màn (một thẻ mỗi lúc, xếp hàng tối đa 4)
//   Game.el(tag, cls, text) tạo phần tử, chữ luôn qua textContent (tên người xem không bao giờ thành HTML)
//   Game.setText(theme) / Game.t(khoá, biến) chữ theo ngôn ngữ đang chọn (hud.text) · Game.fmt(số) định dạng số theo ngôn ngữ
//   Game.rich(el, 'Gõ **ĐÁNH** để…') chữ giữa ** ** được tô đậm (thẻ <b>), vẫn qua textContent
//
// shortcut: trạng thái ở trình duyệt, không ở server: đổi máy / trình duyệt khác thì ván mới; khi cần chắc chắn hơn thì nâng cấp kit cho server giữ trạng thái theme.

(function () {
  const K = window.Kit;
  const quiet = new URLSearchParams(location.search).has('quiet');
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  // Ngôn ngữ (kit: theme.json "langs" + "i18n", chọn ở bảng điều khiển). Chữ trên màn hình lấy từ theme.json → hud.text,
  // bản dịch đè lên ở i18n.<lang>.hud.text. Game.t('khoa', { boss: 'Ếch' }) điền {boss}; thiếu khoá thì dùng chữ dự phòng.
  const LOCALE = { vi: 'vi-VN', en: 'en-US', zh: 'zh-CN' };
  let words = {}, locale = 'vi-VN';
  const setText = (theme) => { words = theme?.hud?.text || {}; locale = LOCALE[theme?.lang] || 'vi-VN'; document.documentElement.lang = theme?.lang || 'vi'; };
  const t = (key, vars = {}, fallback = key) => String(words[key] ?? fallback).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
  const fmt = (n) => Math.round(Number(n || 0)).toLocaleString(locale);

  function store(key, init) {
    let data = init();
    try { const s = JSON.parse(localStorage.getItem(key) || 'null'); if (s && typeof s === 'object') data = { ...data, ...s }; } catch {}
    let timer = null;
    return {
      get data() { return data; },
      set data(v) { data = v; this.save(); },
      save() { if (quiet || timer) return; timer = setTimeout(() => { timer = null; try { localStorage.setItem(key, JSON.stringify(data)); } catch {} }, 800); },
      reset() { data = init(); if (!quiet) try { localStorage.setItem(key, JSON.stringify(data)); } catch {} },
    };
  }

  const drawers = { back: [], front: [] };
  const fxDraw = K.fx.draw;
  // shortcut: chen vào Kit.fx.draw để vẽ theo camera; đổi khi kit có móc vẽ riêng cho theme
  K.fx.draw = (ctx, layer, t) => {
    fxDraw(ctx, layer, t);
    for (const fn of drawers[layer] || []) { try { ctx.save(); fn(ctx, t); } catch (e) { console.error('[game] vẽ', e); } finally { ctx.restore(); } }
  };
  const onDraw = (layer, fn) => drawers[layer].push(fn);

  const CSS = `
  .gm { position:absolute; inset:0; pointer-events:none; font-family:'Be Vietnam Pro','Noto Sans SC', system-ui, sans-serif; color:#fff7e6; --gold:#ffd25e; --ink:#1d1230; }
  .gm h1, .gm h2, .gm h3, .gm .big { font-family:'Baloo 2','Be Vietnam Pro','Noto Sans SC',sans-serif; }
  .gm .panel { position:absolute; box-sizing:border-box; background:linear-gradient(180deg, rgba(40,22,70,.82), rgba(18,10,36,.86)); border:2px solid rgba(255,210,94,.55); border-radius:18px; box-shadow:0 8px 22px rgba(0,0,0,.45); text-shadow:0 2px 3px rgba(0,0,0,.7); }
  .gm-toast { position:absolute; left:100px; right:100px; text-align:center; font:800 44px 'Baloo 2',sans-serif; color:#fff3cf; text-shadow:0 0 18px rgba(255,140,40,.95), 0 3px 4px #000; opacity:0; transition:opacity .35s; }
  .gm-toast.show { opacity:1; }
  .gm-banner { position:absolute; left:50%; width:660px; margin-left:-330px; box-sizing:border-box; padding:24px 30px; text-align:center; opacity:0; transform:scale(.85); transition:opacity .35s, transform .45s cubic-bezier(.2,1.4,.4,1); }
  .gm-banner.show { opacity:1; transform:none; }
  .gm-unmute { position:absolute; left:50%; top:900px; transform:translateX(-50%); padding:14px 34px; font:800 28px 'Baloo 2',sans-serif; color:var(--gold); pointer-events:auto; cursor:pointer; display:none; white-space:nowrap; }
  `;

  let root = null;
  function mount(stage, extraCss) {
    root = el('div', 'gm');
    stage.appendChild(root);
    const st = el('style'); st.textContent = CSS + (extraCss || ''); document.head.appendChild(st);
    const un = el('div', 'panel gm-unmute', t('unmute', {}, '🔔 Chạm để bật âm thanh'));
    const toastEl = el('div', 'gm-toast'), banner = el('div', 'panel gm-banner');
    root.append(toastEl, banner, un);
    un.onclick = () => { Live.audio()?.resume(); un.style.display = 'none'; K.audio.init(); };
    setTimeout(() => { const a = Live.audio(); if (a && a.state === 'suspended') un.style.display = 'block'; }, 1500);
    return root;
  }

  function toast(text, ms = 3500, top) {
    const t = root && root.querySelector('.gm-toast'); if (!t) return;
    if (top != null) t.style.top = `${top}px`;
    t.textContent = text; t.classList.add('show');
    clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), ms);
  }

  const bannerQ = [];
  function banner(build, ms = 4000, top = 700) {
    bannerQ.push({ build, ms, top }); if (bannerQ.length > 4) bannerQ.splice(0, bannerQ.length - 4);
    if (!banner.busy) nextBanner();
  }
  function nextBanner() {
    const b = root && root.querySelector('.gm-banner'), it = bannerQ.shift();
    if (!b) return;
    if (!it) { banner.busy = false; b.classList.remove('show'); return; }
    banner.busy = true;
    b.style.top = `${it.top}px`; b.replaceChildren(...[].concat(it.build()));
    void b.offsetWidth; b.classList.add('show');
    setTimeout(() => { b.classList.remove('show'); setTimeout(nextBanner, 400); }, bannerQ.length > 1 ? Math.min(it.ms, 2500) : it.ms);
  }

  // xếp hạng gọn: map id -> { name, v }, giữ tối đa 200 người
  function addScore(map, user, v) {
    if (!user?.id) return;
    const r = map[user.id] || (map[user.id] = { name: user.name || 'Khách', v: 0 });
    r.name = user.name || r.name; r.v += v;
    const ids = Object.keys(map);
    if (ids.length > 200) { ids.sort((a, b) => map[a].v - map[b].v); for (const id of ids.slice(0, ids.length - 200)) delete map[id]; }
  }
  const topOf = (map, n = 3) => Object.values(map).sort((a, b) => b.v - a.v).slice(0, n);

  function rich(parent, text, cls = []) {
    String(text).split('**').forEach((part, i) => { if (!part) return; parent.append(i % 2 ? el('b', cls[(i - 1) / 2] || '', part) : document.createTextNode(part)); });
    return parent;
  }

  window.Game = { quiet, el, fmt, t, setText, rich, store, onDraw, mount, toast, banner, addScore, topOf };
})();
