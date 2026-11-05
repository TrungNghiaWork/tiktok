# Asset cho Đánh boss

Đang chạy bằng hình tạm. Kích thước chuẩn, cách cắt / tách nền: `../../../HUONG-DAN-ANH.md`.

## 1. Ảnh nền đấu trường → `assets/background.jpg` (1080 × 1920)

Giữ bố cục (chụp `/overlay` lúc vắng làm tham chiếu): trời + núi xa y 0–960, **bục đá giữa** cho boss (mặt bục y ≈ 1060–1110), **sân đá trống** cho người xem từ y ≈ 1120 xuống. Phần y 240–700 sẽ bị bảng điểm, thanh máu che: chỉ cần trời.

```
Vertical 9:16 illustration, 1080x1920, of a fantasy stone arena at dusk for a cozy-epic live-stream boss battle game. Straight-on view, camera about 3 meters high, perfectly symmetrical.
TOP HALF: dramatic purple-pink dusk sky with a huge glowing moon in the center, distant jagged mountains.
CENTER (around 55% height): a low round stone stage for a giant monster, flanked by two burning torches, an arena wall behind it.
BOTTOM 40%: an EMPTY flat stone courtyard for the audience, with subtle tile lines in perspective.
STYLE: polished 2D painted game art, soft cel shading, rich colours, warm torch light. No people, no monsters, no text, no logo.
```

Sửa `scene.json`: `"background": "assets/background.jpg"`.

## 2. Ảnh boss → `assets/chars/boss-<tên>.png`

Mỗi boss một ảnh, **nền xanh `#00FF00`**, cắt bằng `pnpm assets:cut ... --auto`, cao khoảng **600px**, chân ở đáy ảnh. Điền đường dẫn vào `theme.json` → `hud.game.bosses[].image`. Để trống thì vẫn dùng boss vẽ bằng code.

```
A single cute-but-menacing giant monster for a 2D live-stream boss battle game: [Ếch Bùn: a huge muddy green frog with angry eyebrows / Rùa Đá: a giant rock turtle with mossy shell / Cua Lửa: a fiery red crab with glowing claws / Bạch Tuộc Tím: a purple octopus with swirling tentacles / Rồng Mây: a chubby blue cloud dragon].
Facing the camera, full body, standing, centered, large and readable from far away. Polished 2D game art, clean lineart, soft cel shading, bold silhouette, expressive face.
Perfectly flat chroma green (#00FF00) background, no shadow, no text.
```

## 3. Nhân vật người xem, âm thanh

- Tờ nhân vật: theo mẫu prompt trong `tiktok-live-kit/docs/ASSETS-GUIDE.vi.md` mục 2 (một chiến binh nhỏ, nhìn từ phía sau hướng về boss; hàng động tác: đứng chờ, giơ tay ra đòn, cổ vũ). Khai báo `characters` + `animations.cheer` trong `theme.json`.
- Âm thanh (CC0) đặt vào `assets/sfx/`: `hit.mp3` (trúng đòn ngắn), `boom.mp3` (nổ lớn), `win.mp3` (chiến thắng); nhạc nền hào hứng không lời vào `assets/music/`.
