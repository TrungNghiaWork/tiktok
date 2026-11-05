# Asset cho Đua vịt

Đang chạy bằng hình tạm. Kích thước chuẩn, cách cắt / tách nền: `../../../HUONG-DAN-ANH.md`.
Vịt, vạch xuất phát, vạch đích ô cờ, tên người **do code vẽ**: ảnh nền chỉ cần mặt sông trống.

## 1. Ảnh nền sông quê → `assets/background.jpg` (1080 × 1920)

Giữ bố cục: trời + bờ tre + mái nhà y 0–500; **mặt sông phẳng, trống** y 520–1120 (vịt bơi ngang từ trái x 160 sang phải x 930); bờ cỏ cho khán giả từ y ≈ 1130. Phần y 240–450 bị bảng tên vòng che: chỉ cần trời.

```
Vertical 9:16 illustration, 1080x1920, of a calm Vietnamese countryside river on a sunny day, for a live-stream duck race game. Straight-on side view, the river runs horizontally across the frame.
TOP: bright blue sky with soft clouds, a far riverbank with bamboo, banana trees and one small tiled-roof house.
MIDDLE (from 27% to 58% height): a WIDE, FLAT, EMPTY blue river with gentle ripples, faint white lane lines, small red buoys at the left and right ends.
BOTTOM 40%: a grassy near riverbank, empty, for the audience.
STYLE: polished 2D painted game art, soft cel shading, bright happy colours. No ducks, no people, no boats, no text, no logo.
```

Sửa `scene.json`: `"background": "assets/background.jpg"`. Mặt sông khác chỗ thì sửa `hud.game.river` (`top`, `bottom`, `start`, `finish`).

## 2. Ảnh vịt (tuỳ chọn) → `assets/duck.png`

Một con vịt **nhìn ngang, quay sang phải**, nền trong suốt, khoảng 160 × 130. Code tự vẽ tên và gợn nước; mọi vịt dùng chung ảnh này (khi có ảnh thì không tô màu theo làn nữa).

```
A single cute cartoon rubber duck floating on water, side view facing RIGHT, full body, bright yellow with an orange beak, simple clean outline, isolated on a pure green #00FF00 background, no shadow, no text.
```

Tách nền xanh (`pnpm assets:alpha` / công cụ trong `HUONG-DAN-ANH.md`), rồi đặt `"duckImage": "assets/duck.png"` trong `hud.game`.

## 3. Âm thanh (CC0) → `assets/sfx/`

`coi.mp3` (còi xuất phát), `nuoc.mp3` (tiếng nước bắn khi có quà), `win.mp3` (reo khi về đích); nhạc nền vui không lời vào `assets/music/`.
