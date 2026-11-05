# Asset cho Lớp học đoán chữ

Đang chạy bằng hình tạm. Kích thước chuẩn, cách cắt / tách nền: `../../../HUONG-DAN-ANH.md`.
Bảng đen (gợi ý, ô chữ, đồng hồ), bàn học + bảng tên, bảng điểm **do code vẽ**: ảnh nền **không vẽ bảng đen chữ, không vẽ bàn**.

## 1. Ảnh nền lớp học → `assets/background.jpg` (1080 × 1920)

Giữ bố cục: tường lớp y 0–1150 (bảng đen của code phủ y 300–740 giữa khung, hai bên còn thấy cửa sổ); bục giảng giữa y ≈ 1100–1170 (cô giáo đứng ở đây, x 540); **sàn lớp trống** từ y ≈ 1160 (code vẽ 20 bàn theo `scene.json` `"slots"`).

```
Vertical 9:16 illustration, 1080x1920, of a bright, cheerful Vietnamese primary school classroom, for a live-stream word guessing game. Straight-on view from the back of the room, perfectly symmetrical.
TOP 55%: a warm cream wall with tall wooden windows on the left and right edges showing green trees outside, a plain wooden frame area in the middle (a blackboard will be drawn there by code), a small wall clock.
MIDDLE (around 57% height): a low wooden teacher's platform in the center, two potted plants at its sides.
BOTTOM 40%: an EMPTY tiled classroom floor in warm orange-brown, no desks, no chairs.
STYLE: polished 2D painted game art, soft cel shading, warm happy colours. No people, no desks, no text, no logo.
```

Sửa `scene.json`: `"background": "assets/background.jpg"`. Sàn khác chỗ thì sửa `"slots"` (toạ độ chân học sinh, 1 dòng = 1 bàn) và `hud.game.desk` (`width`, `height`, `lift`).

## 2. Cô giáo (tuỳ chọn) → `assets/teacher.png`

Một cô giáo **đứng thẳng, nhìn về phía trước**, nền trong suốt, cao khoảng 520 px. Đặt `"teacherImage": "assets/teacher.png"` (và `teacherHeight` nếu cần) trong `hud.game`; có ảnh thì code thôi vẽ cô giáo tạm.

```
A friendly young Vietnamese female teacher in a light blue áo dài, hair in a neat bun, holding a thin wooden pointer, standing straight and facing the viewer, full body, cartoon game art with clean outlines, isolated on a pure green #00FF00 background, no shadow, no text.
```

## 3. Học sinh (tờ nhân vật)

Mẫu prompt trong `tiktok-live-kit/docs/ASSETS-GUIDE.vi.md` mục 2: học sinh tiểu học mặc áo trắng, **nhìn từ phía sau** (người xem nhìn từ cuối lớp lên bảng), hàng động tác: ngồi yên, giơ tay, reo. Chỉ phần trên người lộ ra sau bàn nên quan trọng nhất là đầu và vai. Khai báo `characters` + `animations.cheer`.

## 4. Âm thanh (CC0) → `assets/sfx/`

`dung1.mp3` (chuông "ting" bạn đúng đầu tiên), `dung.mp3` (tiếng đúng ngắn), `phan.mp3` (tiếng phấn viết bảng khi mở chữ), `trong.mp3` (trống trường báo hết tiết), `win.mp3` (công bố đáp án); nhạc nền vui không lời vào `assets/music/`.
