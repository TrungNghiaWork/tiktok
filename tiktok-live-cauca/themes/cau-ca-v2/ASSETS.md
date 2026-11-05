# Asset cho Ao làng câu cá v2 (ao giữa, người hai bờ)

v2 dùng chung `theme.js` với `../cau-ca/` (bật bằng `"hud": { "layout": "sides" }` trong `theme.json`). Bảng cá, giọng đọc, luật copy từ v1, sửa riêng trong `theme.json` của v2.
**Ảnh cá và âm thanh giống hệt v1**: làm theo mục 3, 4 của `../cau-ca/ASSETS.md`, đặt vào `assets/fish/`, `assets/sfx/`, `assets/music/` của **v2**.
Khác v1 ở hai thứ dưới đây.

## 1. Ảnh nền: ao dọc giữa khung

Tham chiếu bố cục: mở `http://localhost:3939/overlay` lúc chưa có người, chụp màn hình, kéo vào Flow. Giữ đúng các vùng sau (khung 1080 × 1920), vì `scene.json` đã đo theo đó:

| Vùng | Vị trí |
|---|---|
| Trời, mặt trời, lũy tre + mái đình phía xa | y 0 → ~560 |
| Mặt ao dọc, ở giữa | mép trái x ≈ 365 ở y 640 → x ≈ 305 ở y 1650; mép phải đối xứng (x ≈ 715 → 775) |
| Hai bờ cỏ trống cho người ngồi | trái và phải mặt ao, từ y ≈ 790 xuống |
| Cầu tre bắc **ngang** ao | y ≈ 1100 → 1170, từ x ≈ 270 tới 810 |
| Góc dưới trái | Khung bình luận TikTok che: chỉ vẽ cỏ hoa, không cần chỗ ngồi |

```
Vertical 9:16 illustration, 1080x1920, of a peaceful Vietnamese countryside village pond at golden sunset, seen from a high three-quarter top-down camera, for a cozy live-stream game background. Use the attached image ONLY as the layout guide: keep the pond, the two grass banks and the bridge exactly where they are.

TOP: warm sunset sky (deep violet to pink and orange), a soft glowing sun on the right, a distant line of bamboo clumps and the curved tiled roof of a small village communal house (đình) at the far end of the pond.
CENTER: one long calm pond running vertically down the middle of the image, slightly wider toward the bottom, reflecting the sunset, a golden reflection of the sun near the far end, a few lotus leaves and pink lotus flowers near its edges in the lower half.
LEFT AND RIGHT: two soft grassy banks along the full length of the pond, with small reeds at the water's edge, open and EMPTY so characters can be placed on them later.
ACROSS THE POND: one simple bamboo footbridge (cầu tre) crossing the pond horizontally a little below the middle of the image, with a thin bamboo handrail.
BOTTOM: the pond ends with a rounded edge, grass with small wild flowers.

STYLE: high-quality 2D painted game art, soft cel shading, warm cozy lighting, gentle colours, clean shapes, like a polished relaxing mobile game. No people, no animals, no boats, no text, no logo, no frame.
```

Lưu `assets/background.jpg` (1080 × 1920), sửa `scene.json`: `"background": "assets/background.jpg"`. Ảnh lệch bố cục thì chỉnh bằng `/overlay?scene`:
- `aisle.half` là **mép ao**: `[[y, nửa bề rộng ao], [y, nửa bề rộng ao]]` đo ở hai độ cao.
- `obstacles[1]` là dải cầu tre (không cho ngồi lên cầu).
- `points.cau-tre` là giữa cầu (chỗ người tặng quà ra câu).

## 2. Tờ cần thủ: ngồi NGHIÊNG nhìn ra ao

Khác v1: người ngồi hai bên nhìn **ngang** ra ao, nên dáng chờ, quăng, giật đều vẽ **nghiêng, quay sang phải**. Code tự lật cho bờ phải. Vẫn **không vẽ cần câu**.

```
Create ONE 16:9 animation model sheet (sprite sheet) of a single character for a cozy 2D live-stream fishing game set at the Vietnamese village pond of the attached reference image, seen from a high three-quarter top-down camera. Use the reference only for colours and lighting.

CHARACTER: a friendly Vietnamese villager (gender-neutral look) wearing a conical straw hat (nón lá), a loose light-brown shirt, dark rolled-up trousers, simple sandals.
IMPORTANT: the character holds NO fishing rod and NO fish unless a pose says so. Hands are empty (the game draws the rod).

ART STYLE: high-quality 2D illustrated game art, clean thin dark-brown lineart, soft cel shading, warm golden rim light, natural proportions about 6 heads tall, same high three-quarter camera looking slightly down. Not chibi, not photorealistic, no thick black outlines.

LAYOUT: exactly 24 drawings of the SAME person in a strict invisible grid of 6 columns and 4 rows, each centred in its own cell with empty space around it, feet or stool on the bottom line of the cell, all at the same scale.
BACKGROUND: perfectly flat pure chroma green (#00FF00). No floor, no shadow, no text, no numbers, no grid lines.

Row 1, walking away from the camera (seen from behind), 6-frame walk cycle with clearly alternating legs.
Row 2, walking toward the camera (seen from the front), relaxed smile, the same 6-frame walk cycle.
Row 3, walking to the right (side view), the same 6-frame walk cycle.
Row 4, all FACING RIGHT in three-quarter side view: 1) sitting on a tiny low wooden stool, both hands forward at chest height as if holding a rod (hands empty), calm; 2) the same sitting pose leaning slightly forward, watching the water; 3) standing upright, relaxed; 4) standing, both arms swinging forward to the right as if casting (hands empty); 5) standing, leaning back and pulling both arms up and back as if hooking a fish (hands empty); 6) standing, proudly lifting a big fish with both hands.

FINAL CHECK: no fishing rod in any frame; no text anywhere; 6 × 4 grid of the same person; row 4 all facing right; flat green background. Regenerate if any check fails.
```

Cắt và khai báo giống v1 (`../cau-ca/ASSETS.md` mục 2), nhưng đặt file vào thư mục **v2**: `assets/chars/fisher.png`, và khai báo trong `theme.json` của **v2**.
