// Kéo co Girl vs Boy: Team Girl (nửa trái, nơ hồng) đấu Team Boy (nửa phải, mũ xanh).
// Lực kéo từ tim, lệnh "kéo", quà. Hết giờ ván, đội nhiều lực hơn thắng. Dây / cờ nghiêng theo TỈ LỆ lực hai đội.
// Số liệu (điểm mỗi loại, độ dài ván, nghỉ giữa ván, độ "cứng" của dây) ở theme.json → "hud" → "game". Dùng chung ../danh-boss/game.js.
//
// Đội của mỗi người: chưa chọn thì THEO BÊN ĐANG ĐỨNG (không ai phải đi lại). Gõ "girl" / "boy" thì giữ đội đó;
// đứng nhầm bên thì đổi chỗ với một người chưa chọn đội ở bên kia (tối đa 2 cặp mỗi giây cho khỏi loạn).

(function () {
  const K = window.Kit, G = window.Game;
  const Z = K.safe || { top: 240, side: 100 };
  const L = Z.side, COL = 300;
  const $ = (s, r) => (r || document).querySelector(s);
  const TEAM = {
    g: { name: 'GIRL', icon: '🎀', color: '#ff5fa2', rgb: '255,95,162' },
    b: { name: 'BOY', icon: '🧢', color: '#3d8bff', rgb: '61,139,255' },
  };
  const LEFT = 'g', RIGHT = 'b';
  let theme = {}, cfg = {}, GC = {}, root = null;

  const STYLE = `
  .kc-team { padding:10px 16px 12px; }
  .kc-team h3 { margin:0; font-size:36px; line-height:1.05; letter-spacing:2px; }
  .kc-team .n { font-size:21px; font-weight:600; opacity:.9; }
  .kc-team .p { margin-top:4px; font:800 32px 'Baloo 2','Noto Sans SC',sans-serif; font-variant-numeric:tabular-nums; }
  .kc-team .top { margin-top:2px; font-size:21px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .kc-team.g { border-color:rgba(255,95,162,.9); } .kc-team.g h3 { color:#ff7db5; }
  .kc-team.b { border-color:rgba(61,139,255,.9); text-align:right; } .kc-team.b h3 { color:#6aa8ff; }
  .kc-score { left:50%; width:220px; margin-left:-110px; padding:8px 0 10px; text-align:center; }
  .kc-score .s { font:800 52px/1 'Baloo 2','Noto Sans SC',sans-serif; } .kc-score .s .g { color:#ff7db5; } .kc-score .s .b { color:#6aa8ff; }
  .kc-score .t { margin-top:4px; font:800 26px 'Baloo 2','Noto Sans SC',sans-serif; color:var(--gold); font-variant-numeric:tabular-nums; }
  .kc-score h1 { margin:0 0 2px; font-size:24px; letter-spacing:3px; color:var(--gold); }
  .kc-bar { left:${L}px; right:${L}px; padding:12px 18px 14px; }
  .kc-bar .track { position:relative; height:40px; border-radius:99px; background:linear-gradient(90deg, #ff5fa2 0 50%, #3d8bff 50% 100%); border:3px solid #fff; }
  .kc-bar .mid { position:absolute; left:50%; top:-4px; bottom:-4px; width:4px; margin-left:-2px; background:#fff; opacity:.8; }
  .kc-bar .flag { position:absolute; top:50%; width:48px; height:48px; margin:-24px 0 0 -24px; border-radius:50%; background:#ffd25e; border:4px solid #fff; box-shadow:0 0 18px rgba(255,210,94,.9); transition:left .5s cubic-bezier(.2,1.3,.4,1); display:grid; place-items:center; font-size:22px; }
  .kc-bar .call { margin-top:8px; text-align:center; font-size:22px; font-weight:700; }
  .kc-bar .call b { font-size:25px; } .kc-bar .call .g { color:#ff7db5; } .kc-bar .call .b { color:#6aa8ff; } .kc-bar .call .y { color:var(--gold); }
  .gm-banner h2 { margin:0; font-size:52px; line-height:1.05; }
  .gm-banner .sub { margin-top:6px; font-size:26px; font-weight:700; }
  .gm-banner ol { list-style:none; margin:12px 0 0; padding:0; display:grid; gap:6px; font-size:26px; font-weight:700; }
  .gm-banner .next { margin-top:12px; font-size:22px; opacity:.85; }
  .kc-note { position:absolute; left:${L + 30}px; right:${L + 30}px; padding:16px 24px; text-align:center; opacity:0; transition:opacity .5s; }
  .kc-note.show { opacity:1; } .kc-note h4 { margin:0 0 4px; color:var(--gold); font:800 24px 'Baloo 2','Noto Sans SC',sans-serif; } .kc-note p { margin:0; font-size:26px; line-height:1.4; font-weight:600; }
  `;

  // ---------- Trạng thái ----------
  const fresh = () => ({ round: 1, startAt: Date.now(), phase: 'play', endAt: 0, g: 0, b: 0, winG: 0, winB: 0, teams: {}, topG: {}, topB: {} });
  const S = G.store('keo-co:v2', fresh);
  const P = () => ({ chat: 3, like: 1, coin: 10, ...(GC.points || {}) });
  const ROUND = () => GC.roundMs || 90000, REST = () => GC.restMs || 9000, SOFT = () => GC.soft || 150;
  // -1: dây về hẳn phía Girl (trái), 1: phía Boy. Theo tỉ lệ, "soft" làm dây không giật hết cỡ khi mới có vài lực
  const pos = () => { const d = S.data; return Math.max(-1, Math.min(1, (d.b - d.g) / (d.b + d.g + SOFT()))); };
  const sideOf = (p) => (p?.slot ? (p.slot.x < 540 ? LEFT : RIGHT) : null);

  function teamOf(user) {
    const id = user?.id; if (!id) return null;
    const chosen = S.data.teams[id]; if (chosen) return chosen;
    return sideOf(K.scene.person(id)) || (hashSide(id));
  }
  const hashSide = (id) => { let h = 0; for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) | 0; return h & 1 ? RIGHT : LEFT; };

  function choose(user, t) {
    const d = S.data; if (!user?.id) return;
    d.teams[user.id] = t;
    const ids = Object.keys(d.teams); if (ids.length > 600) delete d.teams[ids[0]];
    S.save(); render();
  }

  function pull(user, pts, delay = 300) {
    if (!(pts > 0)) return;
    const t = teamOf(user); if (!t) return;
    setTimeout(() => {
      const d = S.data; if (d.phase !== 'play') return;
      d[t] += pts; G.addScore(t === 'g' ? d.topG : d.topB, user, pts);
      S.save(); render();
    }, delay);
  }

  function finish() {
    const d = S.data; if (d.phase !== 'play') return;
    const w = d.g === d.b ? null : d.g > d.b ? 'g' : 'b';
    d.phase = 'rest'; d.endAt = Date.now();
    if (w === 'g') d.winG += 1; else if (w === 'b') d.winB += 1;
    S.save(); render();
    const T = w && TEAM[w];
    if (T) {
      K.fx.fireworks({ bursts: 5, fountains: 2 }); K.fx.rain('confetti', { count: 140 }); K.audio.sfx('win');
      for (const p of K.scene.people()) if (teamOf(p) === w && !p.task) K.run([{ play: 'cheer', times: 3 }], p, {});
    }
    const top = G.topOf(w === 'b' ? d.topB : d.topG, 3);
    G.banner(() => {
      const el = G.el, h = el('h2', '', T ? G.t('win', { team: T.name }, '🏆 TEAM {team} THẮNG!') : G.t('draw', {}, '🤝 HOÀ!'));
      if (T) h.style.color = T.color;
      const ol = el('ol');
      if (T) top.forEach((r, i) => { ol.append(el('li', '', `${['🥇', '🥈', '🥉'][i]} ${r.name} · ${G.t('power', { v: G.fmt(r.v) }, '{v} lực')}`)); });
      return [h, el('div', 'sub', G.t('summary', { g: G.fmt(d.g), b: G.fmt(d.b), wg: d.winG, wb: d.winB, girl: TEAM.g.name, boy: TEAM.b.name }, 'Lực: {girl} {g} – {b} {boy} · Tỉ số {wg} : {wb}')), ol, el('div', 'next', G.t('nextRound', { n: d.round + 1, s: Math.round(REST() / 1000) }, 'Ván {n} bắt đầu sau {s} giây'))];
    }, REST() - 800, 820);
    setTimeout(nextRound, REST());
  }

  function nextRound() {
    const d = S.data;
    Object.assign(d, { round: d.round + 1, startAt: Date.now(), phase: 'play', g: 0, b: 0, topG: {}, topB: {} });
    S.save(); render(); G.toast(G.t('go', { n: d.round }, '🚩 VÁN {n} · KÉO!'), 2500, 1060);
  }

  // ---------- Giao diện ----------
  function init(o) {
    theme = o.theme; cfg = theme.hud || {}; GC = cfg.game || {};
    G.setText(theme);
    TEAM.g.name = G.t('girl', {}, 'GIRL'); TEAM.b.name = G.t('boy', {}, 'BOY');
    root = G.mount(o.stage, STYLE);
    const top = Z.top + 6, el = G.el;
    const mk = (t, side) => {
      const p = el('div', `panel kc-team ${t}`); p.style.cssText = `${side}:${L}px;top:${top}px;width:${COL}px`;
      p.append(el('h3', '', `${TEAM[t].icon} ${TEAM[t].name}`), el('div', 'n', ''), el('div', 'p', ''), el('div', 'top', ''));
      return p;
    };
    const score = el('div', 'panel kc-score'); score.style.top = `${top}px`;
    score.innerHTML = `<h1></h1><div class="s"><span class="g">0</span> : <span class="b">0</span></div><div class="t"></div>`;
    $('h1', score).textContent = cfg.title?.text || G.t('title', {}, 'KÉO CO');
    const bar = el('div', 'panel kc-bar');
    bar.innerHTML = `<div class="track"><div class="mid"></div><div class="flag">🚩</div></div><div class="call"></div>`;
    G.rich($('.call', bar), G.t('call', {}, 'Gõ **GIRL** / **BOY** chọn đội · **KÉO** +3 · ❤️ +1 · 🎁 1 xu = 10'), ['g', 'b', 'y']);
    const note = el('div', 'panel kc-note'); note.style.top = '1060px'; note.append(el('h4'), el('p'));
    root.append(mk(LEFT, 'left'), mk(RIGHT, 'right'), score, bar, note);
    const stack = () => { const a = root.querySelector('.kc-team'); bar.style.top = `${Math.max(a.offsetTop + a.offsetHeight, score.offsetTop + score.offsetHeight) + 12}px`; };
    stack(); document.fonts?.ready.then(stack);

    const d = S.data;
    if (d.phase === 'rest') { const left = REST() - (Date.now() - d.endAt); if (left <= 0) nextRound(); else setTimeout(nextRound, left); }
    render();
    setInterval(tick, 1000);
  }

  function tick() {
    const d = S.data;
    if (d.phase === 'play' && Date.now() - d.startAt >= ROUND()) finish();
    render(); balance();
  }

  function render() {
    if (!root) return;
    const d = S.data, count = { g: 0, b: 0 };
    for (const p of K.scene.people()) count[teamOf(p)]++;
    for (const t of ['g', 'b']) {
      const p = root.querySelector(`.kc-team.${t}`), best = G.topOf(t === 'g' ? d.topG : d.topB, 1)[0];
      $('.n', p).textContent = `👥 ${G.t('people', { n: G.fmt(count[t]) }, '{n} người')}`;
      $('.p', p).textContent = `💪 ${G.fmt(d[t])}`;
      $('.top', p).textContent = best ? `⭐ ${best.name}` : '⭐ —';
    }
    $('.kc-score .g', root).textContent = d.winG; $('.kc-score .b', root).textContent = d.winB;
    const left = Math.max(0, ROUND() - (Date.now() - d.startAt)) / 1000;
    $('.kc-score .t', root).textContent = d.phase === 'play' ? G.t('round', { n: d.round, time: `${Math.floor(left / 60)}:${String(Math.floor(left % 60)).padStart(2, '0')}` }, 'Ván {n} · {time}') : G.t('rest', {}, 'Nghỉ giữa ván');
    $('.kc-bar .flag', root).style.left = `${50 + pos() * 50}%`;
  }

  // người đã chọn đội mà đứng nhầm nửa sân: đổi chỗ với một người CHƯA chọn đội đang đứng ở nửa đúng
  function balance() {
    const d = S.data, idle = (p) => !p.task && !p.tasks.length && p.slot && !p.slot.vip;
    const ppl = K.scene.people().filter(idle);
    const wrong = ppl.filter((p) => d.teams[p.id] && d.teams[p.id] !== sideOf(p));
    let n = 0;
    for (const a of wrong) {
      if (n >= 2) break;
      const want = d.teams[a.id];
      const b = ppl.find((q) => q !== a && sideOf(q) === want && (!d.teams[q.id] || d.teams[q.id] !== want));
      if (!b) continue; // bên kia toàn người đã chọn đúng đội: đứng tạm bên này, vẫn tính đúng đội
      const sa = a.slot, sb = b.slot;
      a.slot = sb; b.slot = sa; sb.taken = a.id; sa.taken = b.id;
      K.scene.P.walkTo(a, 'home'); K.scene.P.walkTo(b, 'home');
      n++;
    }
  }

  function periodic(ev) {
    const n = root && $('.kc-note', root); if (!n || !ev.text) return;
    $('h4', n).textContent = ev.title || ''; $('p', n).textContent = ev.text;
    n.classList.add('show'); clearTimeout(periodic.t); periodic.t = setTimeout(() => n.classList.remove('show'), 10000);
  }
  function giftCard(ev) { const T = TEAM[teamOf(ev.user)] || TEAM.g; G.toast(`${T.icon} ${ev.user?.name || G.t('guest', {}, 'Khách')} · ${ev.label || ''}${ev.count > 1 ? ` ×${ev.count}` : ''}`, 2600, 1060); }
  const noop = () => {};
  K.hud = { init, giftCard, ticker: noop, state: () => render(), guide: noop, toast: (t, ms) => G.toast(t, ms, 1060), periodic, draw: noop, remember: noop, reset: noop };

  // ---------- Sự kiện → lực kéo ----------
  K.on('command', (ev) => {
    if (ev.action === 'keo') pull(ev.user, P().chat);
    if (ev.action === 'chon-girl') choose(ev.user, 'g');
    if (ev.action === 'chon-boy') choose(ev.user, 'b');
  });
  K.on('like', (ev) => pull(ev.user, (ev.count || 1) * P().like, 100));
  K.on('gift', (ev) => pull(ev.user, (ev.total || 0) * P().coin, 500));
  Live.on('reset', () => { S.reset(); render(); });

  // ---------- Hiệu ứng ----------
  const ROPE_Y = () => K.scene.point('day')?.y ?? 1000;
  const look = { jerkAt: 0, jerkDir: 0, power: 1, shown: 0 };
  const jerk = (user, power) => { look.jerkAt = performance.now(); look.jerkDir = teamOf(user) === LEFT ? -1 : 1; look.power = power; };
  const cheerTeam = (t, chance, times = 1) => { for (const q of K.scene.people()) if (teamOf(q) === t && !q.task && Math.random() < chance) K.run([{ play: 'cheer', times }], q, {}); };
  K.action('keoDay', (p, ev) => { jerk(ev?.user || p, 1); K.audio.sfx('keo'); });
  K.action('keoManh', (p, ev) => { const u = ev?.user || p; jerk(u, 2.5); K.audio.sfx('manh'); K.fx.shake({ intensity: 7, duration: 400 }); cheerTeam(teamOf(u), 0.6); });
  K.action('lucSi', (p, ev) => {
    const u = ev?.user || p, t = teamOf(u); jerk(u, 4);
    K.fx.fireworks({ bursts: 4, fountains: 1 }); K.fx.flash({ strength: 0.3, color: TEAM[t].rgb }); K.audio.sfx('manh'); cheerTeam(t, 1, 2);
  });

  // chữ GIRL / BOY trên hai nửa sân, dây + cờ giữa dây
  G.onDraw('back', (ctx, t) => {
    const y = ROPE_Y();
    ctx.textAlign = 'center'; ctx.font = "800 120px 'Baloo 2', 'Noto Sans SC', sans-serif";
    ctx.fillStyle = 'rgba(255,95,162,.28)'; ctx.fillText(TEAM.g.name, 290, y + 150);
    ctx.fillStyle = 'rgba(61,139,255,.28)'; ctx.fillText(TEAM.b.name, 790, y + 150);
    look.shown += (pos() - look.shown) * 0.08; // dây trượt mượt tới vị trí mới
    const jk = Math.max(0, 1 - (t - look.jerkAt) / 350), jx = look.shown * 260 + look.jerkDir * jk * 14 * look.power;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#5b3a1c'; ctx.lineWidth = 14;
    ctx.beginPath(); ctx.moveTo(120, y + 6); ctx.quadraticCurveTo(540 + jx, y + 18 - jk * 10, 960, y + 6); ctx.stroke();
    ctx.strokeStyle = '#c99a5c'; ctx.lineWidth = 8; ctx.setLineDash([16, 10]); ctx.stroke(); ctx.setLineDash([]);
    const fx = 540 + jx, fy = y + 14;
    ctx.fillStyle = '#fff'; ctx.fillRect(fx - 3, fy - 70, 6, 72);
    ctx.fillStyle = '#ffd25e'; ctx.beginPath(); ctx.moveTo(fx + 3, fy - 70); ctx.lineTo(fx + 52, fy - 56); ctx.lineTo(fx + 3, fy - 40); ctx.fill();
  });

  // dấu đội trên từng người: nơ hồng (Girl) / mũ lưỡi trai xanh (Boy) + vòng màu dưới chân
  G.onDraw('front', (ctx) => {
    for (const p of K.scene.people()) {
      const team = teamOf(p), T = TEAM[team]; if (!T) continue;
      const h = K.scene.height(p), hd = K.scene.P.head(p), s = h / 90;
      ctx.strokeStyle = T.color; ctx.lineWidth = Math.max(3, h * 0.05); ctx.globalAlpha = 0.9;
      ctx.beginPath(); ctx.ellipse(p.x, p.y + 2, h * 0.32, h * 0.09, 0, 0, 6.283); ctx.stroke();
      ctx.globalAlpha = 1; ctx.fillStyle = T.color;
      const x = hd.x, y = hd.y + h * 0.12;
      if (team === 'g') { // nơ: hai cánh + nút giữa
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 16 * s, y - 10 * s); ctx.lineTo(x - 16 * s, y + 10 * s); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 16 * s, y - 10 * s); ctx.lineTo(x + 16 * s, y + 10 * s); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 4 * s, 0, 6.283); ctx.fill();
      } else { // mũ lưỡi trai: chóp + vành
        ctx.beginPath(); ctx.ellipse(x, y + 2 * s, 12 * s, 9 * s, 0, Math.PI, 0); ctx.fill();
        ctx.fillRect(x - 2 * s, y + 1 * s, 20 * s, 4 * s);
      }
    }
  });

  // vầng sáng theo danh hiệu (theme.json titles[].aura)
  K.on('frame', () => { for (const p of K.scene.people()) { const lv = (theme.titles || []).find((x) => x.label === p.title)?.aura; if (lv) p.aura = Math.max(p.aura, lv); } });
})();
