# AGENTS.md

Instructions for AI coding agents working in this folder (the "word guess classroom" theme for TikTok Live Kit). Reply to the user in their language (usually Vietnamese).

- The engine is [TikTok Live Kit](https://github.com/duycuf/tiktok-live-kit), next to this folder (`../tiktok-live-kit`). Its `AGENTS.md` and `docs/THEME.md` cover how themes work; this folder only holds the `lop-doan-chu` theme, `config.json` and the launch scripts.
- Don't change the kit from here. Theme changes go in `themes/lop-doan-chu/` (`theme.json`, `scene.json`, `theme.js`).
- `themes/lop-doan-chu/game.js` is a copy of `tiktok-live-game/themes/danh-boss/game.js`: change both together.
- Timing lives in `theme.json` `"settings"` (control panel, applies live); keep `hud.game` defaults in sync with them.
- Gifts help the whole class (letters, time, golden question); never let gifts buy points or promise real rewards.
- Word lists: the first answer is the one scrambled on the board, keep answers short (1–3 words), check facts.

## Going live

When the user wants to go live, **ask before giving steps**: which app puts the picture on air (LIVE Studio window capture, OBS → Virtual Camera, OBS stream key), what the account allows, and TikFinity or the direct connection. Then walk them through only that route in `../tiktok-live-kit/docs/GO-LIVE.vi.md`. `run.bat` must run for the whole live.
