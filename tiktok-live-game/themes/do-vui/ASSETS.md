# Asset cho Đố vui

Đang chạy bằng hình tạm. Kích thước chuẩn, cách cắt / tách nền: `../../../HUONG-DAN-ANH.md`.
Bảng câu hỏi, ô chữ gợi ý, bảng điểm **do code vẽ**: ảnh nền chỉ cần màn LED trống.

## 1. Ảnh nền sân khấu gameshow → `assets/background.jpg` (1080 × 1920)

Giữ bố cục: **màn LED lớn tối màu** ở y 240–880 (bảng câu hỏi nằm đè lên), bục MC giữa y 900–1140, **sàn khán giả trống** từ y ≈ 1150. Hai bên trên cùng (y 0–240) chỉ cần đèn, tên kênh TikTok che chỗ này.

```
Vertical 9:16 illustration, 1080x1920, of a bright TV quiz show stage for a live-stream quiz game. Straight-on view, perfectly symmetrical.
TOP: dark purple studio ceiling with spotlights shining down, a large EMPTY dark LED screen with a glowing purple and gold frame filling the upper third.
MIDDLE (around 50% height): a small host podium with a big golden question mark, a row of round marquee bulbs.
BOTTOM 40%: an EMPTY glossy purple stage floor for the audience, light reflections.
STYLE: polished 2D game art, soft glow, purple and gold colours. No people, no text except the question mark, no logo.
```

Sửa `scene.json`: `"background": "assets/background.jpg"`.

## 2. Nhân vật, âm thanh

- Tờ nhân vật: mẫu prompt trong `tiktok-live-kit/docs/ASSETS-GUIDE.vi.md` mục 2 (khán giả gameshow nhìn từ phía sau; hàng động tác: đứng chờ, giơ tay reo). Khai báo `characters` + `animations.cheer`.
- Âm thanh (CC0) vào `assets/sfx/`: `dung1.mp3` (chuông "ting" người đúng đầu tiên), `dung.mp3` (tiếng "đúng" ngắn), `mo.mp3` (tiếng lật chữ gợi ý), `win.mp3` (nhạc công bố đáp án); nhạc nền gameshow không lời vào `assets/music/`.

## 3. Thêm câu hỏi

`theme.json` → `hud.game.questions`: mỗi câu `{ "q": "Câu hỏi?", "a": ["đáp án chính", "cách viết khác"] }`.

- Đáp án đầu tiên là chữ hiện trong ô gợi ý và lúc công bố; các đáp án sau là cách viết khác vẫn tính đúng.
- So đáp án **không phân biệt dấu, hoa thường, dấu câu**: gõ "ha noi" hay "Hà Nội!" đều đúng. Câu ngắn có chứa đáp án ("đáp án là hà nội") cũng tính.
- Đáp án nên ngắn (1–3 từ). Ô gợi ý dài quá 14 chữ sẽ xuống dòng.
- Bản tiếng Anh / Trung có bộ câu hỏi riêng: `i18n.en.hud.game.questions`, `i18n.zh.hud.game.questions` (không cần cùng số câu với bản Việt).
