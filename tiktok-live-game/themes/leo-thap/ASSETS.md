# Asset cho Leo tháp

Đang chạy bằng hình tạm. Kích thước chuẩn, cách cắt / tách nền: `../../../HUONG-DAN-ANH.md`.
Tháp gạch (cuộn theo độ cao), mốc tầng, người leo, màu trời theo tầng **do code vẽ**: ảnh nền chỉ cần trời và bãi cỏ, **không vẽ tháp**.

## 1. Ảnh nền → `assets/background.jpg` (1080 × 1920)

Giữ bố cục: trời trống y 0–1150 (code phủ màu trời theo tầng và vẽ tháp ở giữa x 440–640); núi xa thấp ở chân trời y ≈ 1000–1150; **bãi cỏ trống** cho khán giả từ y ≈ 1150.

```
Vertical 9:16 illustration, 1080x1920, of a wide open sky above a green meadow, for a live-stream tower climbing game. Straight-on view.
TOP 60%: soft blue sky with a few light clouds, completely empty in the center (a tower will be drawn there by code).
HORIZON (around 55% height): distant low blue mountains.
BOTTOM 40%: an EMPTY bright green meadow for the audience.
STYLE: polished 2D painted game art, soft cel shading, bright happy colours. No tower, no people, no text, no logo.
```

Sửa `scene.json`: `"background": "assets/background.jpg"`. Tháp đặt khác chỗ thì sửa `hud.game.tower` (`x`, `width`, `climberY`, `top`, `bottom`).

## 2. Tầng, tốc độ

`hud.game.zones`: tên tầng và màu trời (`at` = độ cao bắt đầu, mét). `points` (tim / lệnh "leo" / mỗi xu, mét), `maxGift` (một lần tặng đẩy tối đa bao nhiêu mét), `idleMs` + `fallPerSec` (ngừng tay bao lâu thì gió thổi, tụt bao nhiêu mét mỗi giây). Bản dịch tên tầng: `i18n.en.hud.game.zones`, `i18n.zh.hud.game.zones` (cùng thứ tự).

## 3. Nhân vật, âm thanh

- Tờ nhân vật khán giả: mẫu prompt trong `tiktok-live-kit/docs/ASSETS-GUIDE.vi.md` mục 2 (người xem nhìn từ phía sau, hàng động tác: đứng, giơ tay reo). Khai báo `characters` + `animations.cheer`.
- Âm thanh (CC0) vào `assets/sfx/`: `leo.mp3` (tiếng bám leo ngắn), `tang.mp3` (fanfare khi lên tầng mới); nhạc nền phiêu lưu không lời vào `assets/music/`.
