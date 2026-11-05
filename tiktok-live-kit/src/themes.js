// Nạp theme từ thư mục themes/<id>/: theme.json (nội dung, luật, giọng đọc...) + scene.json (bố cục cảnh).

import fs from 'node:fs';
import path from 'node:path';

const readJson = (f, fallback = null) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return fallback; } };

/** Theme trong một hoặc nhiều thư mục (thư mục đầu ưu tiên khi trùng tên). Mỗi theme kèm `dir` chứa nó. */
export function listThemes(dirs) {
  const seen = new Map();
  for (const dir of [].concat(dirs)) {
    let entries = [];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { continue; }
    for (const d of entries) {
      if (!d.isDirectory() || d.name.startsWith('_') || d.name.startsWith('.') || seen.has(d.name)) continue;
      const t = readJson(path.join(dir, d.name, 'theme.json'));
      if (t) seen.set(d.name, { id: d.name, name: t.name || d.name, description: t.description || '', dir: path.join(dir, d.name) });
    }
  }
  return [...seen.values()];
}

// Cài đặt kit thêm cho mọi theme (theme khai báo cùng id thì dùng bản của theme)
const STANDARD_SETTINGS = [
  { id: 'voiceEnabled', label: 'Giọng đọc xướng tên', type: 'toggle', default: true },
  { id: 'voiceVolume', label: 'Âm lượng giọng đọc', type: 'range', min: 0, max: 100, default: 90 },
  { id: 'musicVolume', label: 'Âm lượng nhạc nền (assets/music)', type: 'range', min: 0, max: 100, default: 30 },
  { id: 'sfxVolume', label: 'Âm lượng tiếng hiệu ứng (assets/sfx)', type: 'range', min: 0, max: 100, default: 60 },
  { id: 'ambientFx', label: 'Hiệu ứng môi trường (khói, hạt rơi, tia sáng)', type: 'toggle', default: true },
  { id: 'cameraFx', label: 'Camera zoom vào người tặng quà lớn', type: 'toggle', default: true },
  { id: 'chroma', label: 'Nền xanh để ghép trong OBS (chroma key)', type: 'toggle', default: false },
  { id: 'periodicEnabled', label: 'Nội dung định kỳ khi chat vắng', type: 'toggle', default: true },
];

// Ngôn ngữ theme hỗ trợ: theme.json "langs": ["vi", "en", "zh"] (ngôn ngữ đầu là ngôn ngữ gốc của theme.json)
// và "i18n": { "en": { ...phần thay thế... } }. Bảng điều khiển hiện thêm cài đặt "Ngôn ngữ" khi theme có từ 2 ngôn ngữ.
export const LANG_NAMES = { vi: 'Tiếng Việt', en: 'English', zh: '中文' };

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
function merge(base, over) {
  if (!isObj(base) || !isObj(over)) return over === undefined ? base : over;
  const out = { ...base };
  for (const [k, v] of Object.entries(over)) out[k] = merge(base[k], v);
  return out;
}

/**
 * Bản theme.json theo ngôn ngữ: ghép i18n[lang] đè lên bản gốc. Đối tượng ghép sâu, mảng thay nguyên,
 * riêng "actions" là bảng theo id ({ "danh": { "label": "Attack" } }) ghép vào hành động cùng id.
 * Ngôn ngữ không có trong "langs" (hoặc là ngôn ngữ gốc) thì trả nguyên bản gốc.
 */
export function localize(t, lang) {
  const langs = Array.isArray(t.langs) ? t.langs : [];
  const over = t.i18n?.[lang];
  if (!lang || lang === langs[0] || !langs.includes(lang) || !isObj(over)) return t;
  const { actions, ...rest } = over;
  const out = merge(t, rest);
  if (isObj(actions) && Array.isArray(t.actions)) out.actions = t.actions.map((a) => (isObj(actions[a.id]) ? merge(a, actions[a.id]) : a));
  return out;
}

const TIMES = { vi: ', {n} lần', en: ', {n} times', zh: '，{n}次' };

export function loadTheme(dirs, id, lang) {
  const all = listThemes(dirs);
  const found = all.find((t) => t.id === id) || all[0];
  if (!found) throw new Error(`Không có theme nào trong ${[].concat(dirs).join(', ')}`);
  if (found.id !== id) console.warn(`[theme] không thấy "${id}", dùng "${found.id}"`);
  const pick = found.id, dir = found.dir;
  const raw = readJson(path.join(dir, 'theme.json'), {});
  const langs = (Array.isArray(raw.langs) ? raw.langs : []).filter((l) => LANG_NAMES[l]);
  const t = localize(raw, lang);
  const useLang = langs.includes(lang) ? lang : langs[0] || 'vi';
  const langSetting = langs.length > 1 ? [{ id: 'lang', label: 'Ngôn ngữ (chữ trên màn hình + giọng đọc)', type: 'select', default: langs[0], options: langs.map((l) => ({ value: l, label: LANG_NAMES[l] })) }] : [];
  const own = [...langSetting, ...(Array.isArray(t.settings) ? t.settings : [])];
  return {
    id: pick,
    dir,
    langs,
    lang: useLang,
    name: t.name || pick,
    width: t.width || 1080,
    height: t.height || 1920,
    actions: Array.isArray(t.actions) && t.actions.length ? t.actions : [{ id: 'default', label: 'Mặc định' }],
    titles: t.titles || [],
    goals: t.goals || [],
    rules: t.rules || {},
    text: t.text || {},
    settings: [...own, ...STANDARD_SETTINGS.filter((s) => !own.some((o) => o.id === s.id))],
    // {lan} trong câu đọc: ", 3 lần" / ", 3 times" / "，3次" theo ngôn ngữ; theme đặt voice.times để đổi
    voice: { times: TIMES[useLang] || TIMES.vi, ...(t.voice || {}) },
    periodic: t.periodic || {},
    prompts: t.prompts || {},
    draws: t.draws || {},
    // phần chỉ overlay dùng, server chuyển nguyên
    characters: t.characters || [],
    animations: t.animations || {},
    npcs: t.npcs || [],
    hud: t.hud || {},
    colors: t.colors || {},
    sounds: t.sounds || {},
    bigGift: t.bigGift || {},
    reactions: t.reactions || {},
    scene: readJson(path.join(dir, 'scene.json'), {}),
  };
}

/** Giá trị cài đặt của theme: mặc định trong theme.json, ghi đè bằng giá trị đã lưu (chỉ nhận khoá có khai báo). */
export function settingValues(theme, saved = {}) {
  const out = {};
  for (const f of theme.settings) {
    let v = saved[f.id] ?? f.default;
    if (f.type === 'range') v = Math.min(f.max ?? 100, Math.max(f.min ?? 0, Number(v) || 0));
    else if (f.type === 'toggle') v = Boolean(v);
    else if (f.type === 'select') v = (f.options || []).some((o) => o.value === v) ? v : f.default;
    else v = String(v ?? '').slice(0, 500);
    out[f.id] = v;
  }
  return out;
}
