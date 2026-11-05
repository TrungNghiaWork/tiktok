# Asset cho Kéo co

Đang chạy bằng hình tạm. Kích thước chuẩn, cách cắt / tách nền: `../../../HUONG-DAN-ANH.md`.
Dây, cờ giữa dây và vòng màu đội dưới chân **do code vẽ**: ảnh nền không vẽ dây.

## 1. Ảnh nền sân hội làng → `assets/background.jpg` (1080 × 1920)

Giữ bố cục: trời + hàng cây + dây cờ hội y 0–900; **vũng bùn giữa sân** ở y ≈ 1000 (dây đi ngang qua đây); **sân cỏ trống** cho người đứng từ y ≈ 1150; nửa trái hơi ngả hồng (Team Girl), nửa phải hơi ngả xanh dương (Team Boy), vạch giữa sân. Phần y 240–560 bị bảng tỉ số che: chỉ cần trời.

```
Vertical 9:16 illustration, 1080x1920, of a cheerful Vietnamese village festival field on a sunny day, for a live-stream tug-of-war game. Straight-on view, camera about 3 meters high, perfectly symmetrical.
TOP: bright blue sky with soft clouds, a line of green trees and bamboo, a string of small festival flags (pink on the left half, blue on the right half).
MIDDLE (around 52% height): a small muddy puddle in the center of the field, a white dashed center line running down the field.
BOTTOM 40%: an EMPTY grass field for two teams, the left half tinted slightly pink, the right half tinted slightly blue.
STYLE: polished 2D painted game art, soft cel shading, bright happy colours. No people, no rope, no text, no logo.
```

Sửa `scene.json`: `"background": "assets/background.jpg"`. Dây đặt theo `points.day` (y của dây).

## 2. Nhân vật, âm thanh

- Tờ nhân vật: mẫu prompt trong `tiktok-live-kit/docs/ASSETS-GUIDE.vi.md` mục 2 (người dân làng, nhìn từ phía sau; hàng động tác: đứng chờ, nghiêng người kéo dây, giơ tay reo). Một nhân vật dùng cho cả hai đội: code tự vẽ nơ hồng (Girl), mũ lưỡi trai xanh (Boy) và vòng màu dưới chân. (Kit chọn nhân vật theo từng người chứ không theo đội, nên hai nhân vật riêng bé gái / bé trai cần thêm code chọn theo đội.) Khai báo `characters` + `animations.cheer`.
- Âm thanh (CC0) vào `assets/sfx/`: `keo.mp3` (tiếng "hây" ngắn), `manh.mp3` (trống / hô lớn), `win.mp3` (reo thắng); nhạc nền vui không lời vào `assets/music/`.
