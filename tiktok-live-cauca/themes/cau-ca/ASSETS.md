# Asset cho Ao làng câu cá

Theme đang chạy bằng **hình tạm**: nền `assets/background.svg` (vẽ tay), người giữ chỗ của kit, cá bằng emoji. Làm xong từng mục dưới đây thì thả file vào đúng chỗ là thay, không phải sửa code (trừ một dòng khai báo ghi rõ ở từng mục).

Cách gen: dùng Flow như lúc làm chùa. Cách cắt, tách nền: `docs/ASSETS-GUIDE.vi.md` trong kit.

## 1. Ảnh nền (quan trọng nhất)

**Tham chiếu bố cục:** mở `http://localhost:3939/overlay`, chụp màn hình khi chưa có người, kéo ảnh đó vào Flow làm ảnh tham chiếu bố cục. Ảnh mới phải giữ đúng các vị trí sau, vì `scene.json` đã đo theo đó:

| Vùng | Vị trí trên khung 1080 × 1920 |
|---|---|
| Trời, mặt trời, bờ xa (tre, mái đình) | trên cùng tới y ≈ 630 |
| Mặt ao | y ≈ 630 → 1220 |
| Cầu tre | chính giữa, từ bờ (y ≈ 1236, rộng ~160px) nhô ra tới y ≈ 860 (rộng ~85px) |
| Bờ cỏ trống cho người ngồi | y ≈ 1220 → 1700, không có vật cản |

```
Vertical 9:16 illustration, 1080x1920, of a peaceful Vietnamese countryside village pond at golden sunset, for a cozy live-stream game background. Use the attached image ONLY as the layout guide: keep the horizon, pond, bamboo pier and grass bank exactly where they are.

TOP THIRD: warm sunset sky (deep violet at the top, pink and orange near the horizon), a soft glowing sun low on the right, a distant bank with clumps of bamboo, banana trees and the curved tiled roof of a small village communal house (đình) in silhouette.
MIDDLE: a calm pond reflecting the sunset, a long golden reflection of the sun, a few lotus leaves and pink lotus flowers near the left and right edges only, gentle ripples.
CENTER: a simple bamboo pier (cầu tre) made of bamboo poles and planks, starting at the bottom grass bank in the centre and reaching straight into the middle of the pond, drawn in perspective (wide near, narrow far).
BOTTOM THIRD: a soft grassy bank with small reeds at the water's edge, open and EMPTY so characters can be placed on it later; slightly darker toward the bottom edge.

STYLE: high-quality 2D painted game art, soft cel shading, warm cozy lighting, gentle colours, clean shapes, like a polished relaxing mobile game. No people, no animals, no boats, no text, no logo, no frame.
```

Lưu `assets/background.jpg`, rồi trong `scene.json` đổi `"background": "assets/background.svg"` thành `"assets/background.jpg"`. Ảnh lệch bố cục thì mở `/overlay?scene` để chỉnh `horizonY`, `floor`, `points` cho khớp.

## 2. Tờ nhân vật cần thủ

Code đã tự vẽ **cần câu, dây và phao**, nên nhân vật **không cầm cần** (tay để tư thế như đang cầm, trống không). Một nhân vật dùng chung cho cả đám đông, code tự lật trái phải.

```
Create ONE 16:9 animation model sheet (sprite sheet) of a single character for a cozy 2D live-stream fishing game set at the Vietnamese village pond of the attached reference image. Use the reference only for colours and lighting.

CHARACTER: a friendly Vietnamese villager (gender-neutral look) wearing a conical straw hat (nón lá), a loose light-brown shirt, dark rolled-up trousers, barefoot or simple sandals.
IMPORTANT: the character holds NO fishing rod and NO fish unless a pose says so. Hands are empty (the game draws the rod).

ART STYLE: high-quality 2D illustrated game art, clean thin dark-brown lineart, soft cel shading, warm golden rim light from the sunset ahead, natural proportions about 6 heads tall. Not chibi, not photorealistic, no thick black outlines.

LAYOUT: exactly 24 drawings of the SAME person in a strict invisible grid of 6 columns and 4 rows, each centred in its own cell with empty space around it, feet or stool on the bottom line of the cell, all at the same scale.
BACKGROUND: perfectly flat pure chroma green (#00FF00). No floor, no shadow, no text, no numbers, no grid lines.

"Seen from behind" means we see the back of the hat and shirt, the face is hidden.

Row 1, walking away from the camera, seen from behind, 6-frame walk cycle with clearly alternating legs.
Row 2, walking toward the camera, seen from the front, relaxed smile, the same 6-frame walk cycle.
Row 3, walking to the right, seen exactly from the side, the same 6-frame walk cycle.
Row 4, seen from behind: 1) sitting on a tiny low wooden stool, both hands forward at chest height as if holding a rod (hands empty); 2) the same sitting pose leaning slightly forward, watching the water; 3) standing upright, relaxed; 4) standing, both arms swinging forward as if casting (hands empty); 5) standing, leaning back and pulling both arms up and back as if hooking a fish (hands empty); 6) standing, proudly lifting a big fish with both hands above the head.

FINAL CHECK: no fishing rod in any frame; no text anywhere; 6 × 4 grid of the same person; rows 1 and 4 seen from behind; flat green background. Regenerate if any check fails.
```

Lưu `assets/raw/fisher.png`, rồi mở terminal trong thư mục `tiktok-live-kit` và cắt (đổi `D:\...` thành đường dẫn thật tới `themes\cau-ca`):

```bash
pnpm assets:cut D:\...\themes\cau-ca\assets\raw\fisher.png D:\...\themes\cau-ca\assets\chars\fisher.png --auto --scale 0.7 --preview D:\...\themes\cau-ca\assets\raw\fisher-check.png
```

Mở `fisher-check.png` xem có cắt đủ 24 khung không.

Rồi khai báo trong `theme.json` (thay `"characters": []`) và cho hoạt cảnh dùng khung thật:

```jsonc
"characters": [{ "id": "canthu", "label": "Cần thủ", "sheet": "assets/chars/fisher.png", "frames": 24,
  "walk": [0,1,2,3,4,5], "walkUp": [0,1,2,3,4,5], "walkDown": [6,7,8,9,10,11], "walkSide": [12,13,14,15,16,17],
  "poses": { "idle": 18, "watch": 19, "stand": 20, "cast": 21, "pull": 22, "hold": 23 } }],
"animations": {
  "giat":  { "frames": ["watch", "pull", "pull", "hold", "hold", "idle"], "ms": 1600 },
  "quang": { "frames": ["stand", "cast", "cast", "stand"], "ms": 1000 },
  "nod":   { "frames": ["idle", "watch", "idle"], "ms": 900 }
}
```

## 3. Ảnh cá (thẻ cá)

Một tờ gồm 15 con, nền xanh, rồi cắt từng con:

```
One 16:9 sheet of 15 separate fish illustrations for a cozy 2D fishing game, in a strict invisible grid of 5 columns and 3 rows, each centred in its own cell, all facing right, same art style: polished 2D game art, clean thin lineart, soft cel shading, glossy highlights, friendly but realistic. Perfectly flat chroma green (#00FF00) background, no text, no numbers, no shadow.
Row 1: climbing perch (cá rô đồng), crucian carp (cá diếc), tilapia (cá rô phi), walking catfish with long whiskers (cá trê), silver carp (cá mè).
Row 2: small freshwater prawn with long claws (tôm càng), an old honeycomb plastic sandal (dép tổ ong, funny), common carp (cá chép), snakehead fish (cá lóc), grass carp (cá trắm cỏ).
Row 3: swamp eel (con lươn), bright red carp (cá chép đỏ), white-orange-black koi with brocade pattern (cá koi gấm), long eel-like freshwater eel (cá chình), a majestic GOLDEN carp with a soft magical glow and flowing fins (cá chép vàng).
```

Cắt ra `assets/fish/` (`pnpm assets:cut ... --auto`), đặt tên theo bảng rồi điền `"image"` cho từng món trong `theme.json` → `draws.ca.items` (vd `"image": "assets/fish/ca-chep.png"`). Ảnh chưa có thì thẻ vẫn hiện emoji.

## 4. Âm thanh (CC0, miễn phí)

Tải từ Pixabay Sound Effects / Freesound (lọc giấy phép CC0), đổi tên đúng như sau là kit tự nhận:

| File | Tiếng |
|---|---|
| `assets/sfx/thinh.mp3` | rắc hạt nhẹ xuống nước |
| `assets/sfx/quang.mp3` | vút dây câu + "tõm" |
| `assets/sfx/ca.mp3` | cá quẫy nước "ào" |
| `assets/sfx/lon.mp3` | tiếng chuông / sáo vui ngắn cho quà lớn |
| `assets/music/*.mp3` | nền: nước, ếch nhái, côn trùng buổi tối, sáo trúc nhẹ (phát lặp) |

Ghi nguồn từng file vào `CREDITS.md`.
