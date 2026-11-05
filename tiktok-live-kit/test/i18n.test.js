import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { localize, loadTheme, settingValues } from '../src/themes.js';
import { createTTS } from '../src/core/tts.js';

const base = {
  name: 'Đánh boss', langs: ['vi', 'en', 'zh'],
  actions: [{ id: 'danh', label: 'Đánh', icon: '👊', steps: [{ play: 'cheer' }] }, { id: 'lua', label: 'Cầu lửa' }],
  voice: { voice: 'vi-VN-NamMinhNeural', gift: ['{ten} tung {hanh_dong}!'], cooldown: { gift: 3000 } },
  hud: { text: { call: 'Gõ ĐÁNH', board: 'SÁT THƯƠNG' }, game: { bosses: [{ name: 'Ếch Bùn', hp: 600 }] } },
  i18n: {
    en: { name: 'Boss fight', actions: { danh: { label: 'Attack' } }, voice: { voice: 'en-US-GuyNeural', gift: ['{ten} used {hanh_dong}!'] }, hud: { text: { call: 'Type ATTACK' }, game: { bosses: [{ name: 'Mud Frog', hp: 600 }] } } },
  },
};

test('i18n: ghép bản dịch, đối tượng ghép sâu, mảng thay nguyên, actions theo id', () => {
  const t = localize(base, 'en');
  assert.equal(t.name, 'Boss fight');
  assert.equal(t.actions[0].label, 'Attack');
  assert.deepEqual(t.actions[0].steps, [{ play: 'cheer' }]); // phần không dịch giữ nguyên
  assert.equal(t.actions[0].icon, '👊');
  assert.equal(t.actions[1].label, 'Cầu lửa'); // chưa dịch thì giữ chữ gốc
  assert.equal(t.voice.voice, 'en-US-GuyNeural');
  assert.deepEqual(t.voice.gift, ['{ten} used {hanh_dong}!']);
  assert.deepEqual(t.voice.cooldown, { gift: 3000 });
  assert.equal(t.hud.text.call, 'Type ATTACK');
  assert.equal(t.hud.text.board, 'SÁT THƯƠNG');
  assert.deepEqual(t.hud.game.bosses, [{ name: 'Mud Frog', hp: 600 }]);
  assert.equal(base.actions[0].label, 'Đánh'); // không sửa bản gốc
});

test('i18n: ngôn ngữ gốc, ngôn ngữ không khai báo, chưa có bản dịch → giữ nguyên bản gốc', () => {
  assert.equal(localize(base, 'vi'), base);
  assert.equal(localize(base, 'fr'), base);
  assert.equal(localize(base, 'zh'), base); // zh có trong langs nhưng chưa có i18n.zh
  assert.equal(localize({ name: 'x' }, 'en').name, 'x');
});

test('i18n: loadTheme thêm cài đặt "Ngôn ngữ" khi theme có từ 2 ngôn ngữ, nạp đúng bản dịch', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tlk-i18n-'));
  fs.mkdirSync(path.join(dir, 'boss')); fs.writeFileSync(path.join(dir, 'boss', 'theme.json'), JSON.stringify(base));
  fs.mkdirSync(path.join(dir, 'mot')); fs.writeFileSync(path.join(dir, 'mot', 'theme.json'), JSON.stringify({ name: 'Một thứ tiếng' }));

  const vi = loadTheme(dir, 'boss');
  const lang = vi.settings.find((s) => s.id === 'lang');
  assert.ok(lang);
  assert.deepEqual(lang.options.map((o) => o.value), ['vi', 'en', 'zh']);
  assert.equal(settingValues(vi, {}).lang, 'vi');
  assert.equal(settingValues(vi, { lang: 'xx' }).lang, 'vi'); // giá trị lạ về mặc định
  assert.equal(vi.lang, 'vi');
  assert.equal(vi.actions[0].label, 'Đánh');

  const en = loadTheme(dir, 'boss', 'en');
  assert.equal(en.lang, 'en');
  assert.deepEqual(en.langs, ['vi', 'en', 'zh']);
  assert.equal(en.actions[0].label, 'Attack');
  assert.equal(en.voice.voice, 'en-US-GuyNeural');
  assert.equal(en.hud.text.call, 'Type ATTACK');

  const one = loadTheme(dir, 'mot');
  assert.equal(one.settings.some((s) => s.id === 'lang'), false); // theme một thứ tiếng: không có cài đặt ngôn ngữ
  assert.deepEqual(one.langs, []);
});

test('tts: giọng Anh / Trung được dùng đúng, giọng lạ về giọng Việt mặc định', async () => {
  const used = [];
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tlk-voice-'));
  const tts = createTTS({ dir, synthesize: async (text, voice) => { used.push(voice); return Buffer.from(text); } });
  tts.say('Hello', { voice: 'en-US-GuyNeural' });
  await new Promise((r) => setTimeout(r, 30));
  tts.say('你好', { voice: 'zh-CN-XiaoxiaoNeural' });
  await new Promise((r) => setTimeout(r, 350));
  tts.say('Xin chào', { voice: 'xx-XX-Lạ' });
  await new Promise((r) => setTimeout(r, 350));
  assert.deepEqual(used, ['en-US-GuyNeural', 'zh-CN-XiaoxiaoNeural', 'vi-VN-HoaiMyNeural']);
});

test('i18n: {lan} (số lần tặng) đọc theo ngôn ngữ của theme, theme đặt voice.times thì dùng câu của theme', async () => {
  const { createVoice } = await import('../src/core/voice.js');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tlk-times-'));
  const t = { ...base, voice: { ...base.voice, enabled: true, gift: ['{ten} {hanh_dong}{lan}.'] }, i18n: { en: { voice: { gift: ['{ten} {hanh_dong}{lan}.'] } }, zh: { voice: { gift: ['{ten}{hanh_dong}{lan}。'], times: '{n}连' } } } };
  fs.mkdirSync(path.join(dir, 'boss')); fs.writeFileSync(path.join(dir, 'boss', 'theme.json'), JSON.stringify(t));
  const ev = { kind: 'gift', user: { id: 'a', name: 'Lan' }, label: 'Đánh', total: 5, count: 3 };
  const line = (lang) => createVoice().line(loadTheme(dir, 'boss', lang).voice, ev);
  assert.equal(line('vi'), 'Lan đánh, 3 lần.');
  assert.equal(line('en'), 'Lan đánh, 3 times.');
  assert.equal(line('zh'), 'Lanđánh3连。');
  assert.equal(createVoice().line({ enabled: true, gift: ['{ten}{lan}'] }, { ...ev, count: 1 }), 'Lan'); // một lần: bỏ trống
});
