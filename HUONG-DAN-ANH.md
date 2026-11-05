# HƯỚNG DẪN THAY ẢNH, ÂM THANH CHO CÁC THEME

Áp dụng cho mọi theme chạy trên `tiktok-live-kit`: **Chùa ảo** (`tiktok-live-pgd/themes/chua`) và **Ao làng câu cá** (`tiktok-live-cauca/themes/cau-ca`).
Hướng dẫn tạo ảnh bằng AI chi tiết hơn: `tiktok-live-kit/docs/ASSETS-GUIDE.vi.md`.

---

## 1. Ảnh nằm ở đâu, theme dùng thế nào

Mỗi theme có thư mục `assets/`. Code **không cần sửa**: chỉ cần thả file vào đúng chỗ, rồi khai báo đường dẫn trong `scene.json` hoặc `theme.json`.

```
themes/<theme>/
  scene.json        ← khai báo ảnh nền, đo vị trí sàn / lối đi / điểm mốc
  theme.json        ← khai báo nhân vật, biểu tượng quà, ảnh hiệu ứng, ảnh cá...
  assets/
    raw/            ← ảnh gốc vừa gen (KHÔNG vào git, để cắt / xử lý)
    background.jpg  ← ảnh nền
    chars/          ← tờ nhân vật đã cắt
    fx/             ← hiệu ứng nền trong suốt
    fish/, cdo/...  ← đạo cụ, biểu tượng (tên thư mục tuỳ theme)
    sfx/            ← tiếng hiệu ứng (kit tự nhận theo tên file)
    music/          ← nhạc nền (kit tự phát lặp mọi file trong đây)
```

Bốn lớp, từ quan trọng nhất:

| Lớp | Là gì | Quyết định |
|---|---|---|
| 1. Ảnh nền | Một ảnh dọc toàn khung | ~70% cảm giác đẹp / xấu |
| 2. Nhân vật | Một tờ hoạt hình, cả đám đông dùng chung | Có "sống" hay không |
| 3. Hiệu ứng, đạo cụ | Hào quang, tia sáng, biểu tượng quà, ảnh cá | Độ "đã" khi có quà |
| 4. Giao diện | Bảng, thẻ, chữ | Đã code sẵn trong `theme.js`, chỉ đổi chữ / màu |

---

## 2. Bảng kích thước chuẩn

| Loại | Gen ra (ảnh gốc) | Sau xử lý, để trong `assets/` | Định dạng | Hiện trên màn |
|---|---|---|---|---|
| **Ảnh nền** | 9:16, càng nét càng tốt (2K / 4K) | **đúng 1080 × 1920** | JPG chất lượng 85–90%, ≤ 1 MB | Toàn khung |
| **Tờ nhân vật** | 16:9, 2K / 4K, nền xanh `#00FF00`, lưới đều | Dải ngang các khung, **cao ~300px** (vd chùa: 6240 × 296 = 32 khung) | PNG nền trong | Người cao ~60–150px tuỳ xa gần |
| **Hiệu ứng** (hào quang, tia, khói) | Vuông hoặc dọc, **nền đen tuyệt đối** | Cạnh dài **≤ 1024px** | PNG nền trong | 200–800px |
| **Biểu tượng quà** | Nền xanh, một vật | **~200 × 200px** | PNG nền trong | 40–44px |
| **Ảnh cá / đạo cụ trên thẻ** | Nền xanh, mỗi vật một ô | Cạnh dài **~512px** | PNG nền trong | Cao tối đa 140px, rộng 420px |
| **Tiếng hiệu ứng** | | 0,5–5 giây, cuối nhỏ dần | MP3 | |
| **Nhạc nền** | | Vài phút trở lên, không lời | MP3 128–192 kbps | |

Lý do các con số:
- Overlay luôn là khung **1080 × 1920**. Ảnh nền to hơn kit tự co, nhưng nặng máy và tốn RAM của OBS vô ích.
- Người trong cảnh chỉ cao tối đa ~150px. Tờ nhân vật cao ~300px là đủ nét. To hơn chỉ nặng thêm (30 khung × 4K là quá thừa).
- Khán giả xem trên điện thoại, khung 1080px chỉ còn khoảng 1/3. Chi tiết nhỏ hơn ~20px coi như không thấy.

---

## 3. Quy trình chung (mọi loại ảnh)

```
Gen ảnh (Flow / GPT Image / Gemini...)  →  lưu assets/raw/
        ↓
Xử lý bằng công cụ của kit (tách nền xanh / nền đen, cắt khung, thu nhỏ)
        ↓
File sạch vào assets/...  →  khai báo đường dẫn trong scene.json / theme.json
        ↓
Kiểm tra: /overlay?scene, /overlay?safe, tab Thử nghiệm
```

**Mẹo giữ một phong cách:** gen ảnh nền **trước**, rồi kéo chính ảnh nền vào làm ảnh tham chiếu cho mọi ảnh sau (nhân vật, cá, hiệu ứng), kèm câu *"use the reference only for colours and lighting"*.

### Công cụ xử lý (chạy trong thư mục `tiktok-live-kit`, cần cài [uv](https://docs.astral.sh/uv/))

Cắt tờ nhân vật / đạo cụ nền xanh:

```bash
pnpm assets:cut <ảnh-gốc.png> <ảnh-ra.png> --auto --scale 0.7 --preview <ảnh-soát.png>
```

- `--auto`: tự dò từng dáng, kể cả khi AI xếp lệch lưới (nên luôn bật).
- `--cols 6 --rows 4`: chỉ khi **không** dùng `--auto` và lưới khác mặc định 6 × 5.
- `--scale 0.7`: thu nhỏ. Chỉnh sao cho ảnh ra cao ~300px.
- Mở ảnh soát: mỗi khung có **số thứ tự**. Dùng số này khai báo `poses`, `walkUp`...

Hiệu ứng nền đen → trong suốt:

```bash
pnpm assets:alpha <ảnh-gốc.jpg> <ảnh-ra.png> --max 1024
```

Công cụ tự xoá dấu ✦ mà Gemini / Flow chèn ở góc dưới phải. Thêm `--corner 0` nếu không muốn xoá góc.

---

## 4. Thay ảnh nền (cả hai theme)

1. Gen ảnh **đúng bố cục cũ**: chụp màn hình `http://localhost:3939/overlay` lúc chưa có người, đưa ảnh đó vào AI làm tham chiếu bố cục. Chùa có sẵn `assets/ref/layout-guide.png`.
2. Ảnh nền **không có người**: kit tự thêm người. Sàn chỗ người đứng phải **trống**.
3. Thu về đúng **1080 × 1920**, lưu JPG.
4. Sửa dòng `"background"` trong `scene.json`.
5. Mở `http://localhost:3939/overlay?scene` (vẽ đè vùng sàn, lối đi, chỗ ngồi, điểm mốc) và chỉnh `scene.json` tới khi người đứng đúng sàn, đúng cỡ:

| Khoá trong `scene.json` | Chỉnh khi |
|---|---|
| `horizonY` | Đường chân trời / mép sàn xa |
| `person.refY`, `person.refHeight` | Người to / nhỏ quá so với cảnh (người đứng ở `refY` cao `refHeight` px) |
| `person.exponent` | Người gần với người xa chênh nhau quá nhiều / quá ít |
| `floor` (top, bottom, left, right) | Vùng người được đứng / ngồi |
| `aisle` | Lối giữa để người đi vào (người không ngồi lên lối) |
| `obstacles` | Vùng cấm đứng (cột, bàn, chậu cây...) |
| `seats` | Ghế danh dự cho top người tặng |
| `points` | Điểm mốc hành động đi tới (vd `cau-tre`, `mat-ao`, lư hương...) |

Mỗi lần sửa `scene.json` phải **tắt server và chạy lại `run.bat`**, rồi tải lại overlay (trong OBS: chuột phải → *Refresh cache of current page*).

---

## 5. Theme Chùa ảo: `tiktok-live-pgd/themes/chua/assets/`

Đã có đủ, chỉ thay nếu muốn đẹp hơn. Giữ **đúng tên file** thì không phải sửa gì.

| File | Kích thước hiện tại | Dùng ở đâu |
|---|---|---|
| `bg-key.jpg` | 1080 × 1920 | Ảnh nền chánh điện (`scene.json`) |
| `chars/devotee.png` | 6240 × 296 (32 khung, ~195px mỗi khung) | Phật tử, `theme.json` → `characters` |
| `fx/halo.png` | 1024 × 1024 | Hào quang đại lễ |
| `fx/rays.png` | 781 × 1400 | Tia sáng (đại lễ, mục tiêu) |
| `fx/sparkle.png` | 768 × 768 | Lấp lánh |
| `cdo/fx_incense.png`, `fx_bell.png`, `fx_lotus.png` | ~220px | Biểu tượng mức quà + hoa sen bay |
| `cdo/fx_petal.png` | 204 × 209 | Cánh hoa rơi |
| `cdo/c_*.png`, `anim_*.png` | ~260px | Bộ nhân vật phụ (nguồn ở `cdo/LICENSE`) |
| `sfx/chuong.mp3`, `chuong-lon.mp3`, `mo.mp3`, `sen.mp3` | | Chuông, chuông lớn, mõ, tiếng sen |
| `music/music1.mp3`, `music2.mp3` | | Nhạc nền |

- **Thay tờ Phật tử mới**: prompt ở `themes/chua/FLOW-BRIEF.md` (lưới 6 × 5 = 30 khung). Lưới mới khác tờ cũ 32 khung, nên sau khi cắt phải khai báo lại số khung trong `theme.json` → `characters[0]`: `frames`, `walkUp`, `walkDown`, `walkSide`, `poses`.
- Prompt ảnh nền và asset khác: `themes/chua/ASSETS.md`. Ghi nguồn vào `themes/chua/CREDITS.md`.

---

## 6. Theme Ao làng câu cá: `tiktok-live-cauca/themes/cau-ca/assets/`

Đang chạy bằng **hình tạm**. Prompt đầy đủ cho từng mục: `themes/cau-ca/ASSETS.md`.

| Cần làm | Đặt file | Khai báo | Trước khi có |
|---|---|---|---|
| Ảnh nền ao làng | `background.jpg` (1080 × 1920) | `scene.json`: `"background": "assets/background.jpg"` | Nền SVG vẽ tay |
| Tờ cần thủ (6 × 4 = 24 khung, **không vẽ cần câu**, code tự vẽ) | gốc `raw/fisher.png` → cắt ra `chars/fisher.png` | `theme.json` → `characters` + `animations` (mẫu có sẵn trong `ASSETS.md`) | Người giữ chỗ của kit |
| 15 ảnh cá + chiếc dép | `fish/<tên>.png` (~512px) | `theme.json` → `draws.ca.items[].image` | Emoji |
| Tiếng hiệu ứng | `sfx/thinh.mp3`, `quang.mp3`, `ca.mp3`, `lon.mp3` | Không cần (kit nhận theo tên) | Im lặng |
| Nhạc nền | `music/*.mp3` | Không cần | Im lặng |

Bố cục ảnh nền phải giữ đúng các vùng đã đo (khung 1080 × 1920):

| Vùng | Toạ độ y |
|---|---|
| Trời, mặt trời, bờ xa | 0 → ~630 |
| Mặt ao (có phao) | ~630 → 1220 |
| Cầu tre chính giữa | từ ~860 (đầu xa) tới ~1236 (sát bờ) |
| Bờ cỏ trống cho người ngồi | ~1220 → 1700 |

Gợi ý tên file cá (khớp thứ tự trong prompt): `ca-ro-dong`, `ca-diec`, `ca-ro-phi`, `ca-tre`, `ca-me`, `tom-cang`, `dep-to-ong`, `ca-chep`, `ca-loc`, `ca-tram-co`, `con-luon`, `ca-chep-do`, `ca-koi`, `ca-chinh`, `ca-chep-vang`.
Một loại cá xuất hiện nhiều dòng trong `draws.ca.items` (mỗi dòng một mức ký): **điền `image` cho tất cả các dòng** của loại đó.

---

### Câu cá v2 (`themes/cau-ca-v2/`, bản mặc định): ao dọc giữa, người ngồi hai bờ

Cùng danh sách file như bảng trên, đặt trong `themes/cau-ca-v2/assets/`. Khác v1 hai điểm, prompt ở `themes/cau-ca-v2/ASSETS.md`:
- **Ảnh nền**: ao dọc giữa khung. Mép ao x ≈ 365 → 305 (trái), 715 → 775 (phải), từ y 640 tới 1650. Cầu tre bắc ngang ở y ≈ 1100–1170. Hai bờ cỏ trống từ y ≈ 790.
- **Tờ cần thủ**: dáng ngồi, quăng, giật vẽ **nghiêng quay sang phải** (code tự lật cho bờ phải).

### Game: `tiktok-live-game/themes/danh-boss/`, `keo-co/`

| Game | Cần làm | Đặt file | Khai báo |
|---|---|---|---|
| Đánh boss | Nền đấu trường (bục đá giữa y ≈ 1060, sân trống từ y ≈ 1120) | `assets/background.jpg` | `scene.json` → `background` |
| | Mỗi boss một ảnh nền xanh, cao ~600px | `assets/chars/boss-<tên>.png` | `theme.json` → `hud.game.bosses[].image` |
| Kéo co | Nền sân hội làng (vũng bùn giữa y ≈ 1000, sân trống từ y ≈ 1150), **không vẽ dây** | `assets/background.jpg` | `scene.json` → `background` |
| Cả hai | Tờ nhân vật, tiếng hiệu ứng, nhạc | `assets/chars/`, `assets/sfx/`, `assets/music/` | Tên tiếng: xem `ASSETS.md` của từng game |

Prompt: `themes/danh-boss/ASSETS.md`, `themes/keo-co/ASSETS.md`.

## 7. Kiểm tra sau khi thay

| Mở | Để xem |
|---|---|
| `http://localhost:3939/overlay?scene` | Vùng sàn, lối đi, ghế, điểm mốc có khớp ảnh nền không |
| `http://localhost:3939/overlay?safe` | Chữ / bảng có bị giao diện TikTok che không (vùng đỏ là bị che) |
| Bảng điều khiển → tab **Thử nghiệm** | Thả 60 / 400 người, bấm từng hiệu ứng, từng mức quà, đọc thử giọng |
| F12 trên overlay → Console | Dòng đỏ báo ảnh không tìm thấy (sai tên / sai đường dẫn) |

---

## 8. Lỗi hay gặp

| Hiện tượng | Nguyên nhân / cách sửa |
|---|---|
| Nền hiện chữ "Chưa thấy ảnh nền: ..." | Sai tên file hoặc đường dẫn trong `scene.json` (phân biệt `.jpg` / `.png`) |
| Người đứng lơ lửng / chìm dưới sàn | Chỉnh `floor`, `horizonY`, `person.refY` bằng `?scene` |
| Người to như khổng lồ / bé tí | Chỉnh `person.refHeight` (và `exponent`) |
| Nhân vật có viền xanh lá | Nền gen chưa đủ trơn: gen lại với nền `#00FF00` phẳng, không bóng |
| Nhân vật nhảy khung, sai dáng | Số khung khai báo trong `poses` / `walk*` không khớp ảnh soát: mở `*-preview.png` xem lại số |
| Hiệu ứng có nền đen hình vuông | Quên chạy `pnpm assets:alpha` |
| Ảnh cá không hiện, vẫn là emoji | `image` sai đường dẫn hoặc chưa điền cho mọi dòng của loại cá đó |
| Không có tiếng | Nhấp chuột vào overlay một lần (trình duyệt chặn tự phát); kiểm tra tên file `sfx/` đúng chữ thường |
| Sửa xong không thấy đổi | Tắt và chạy lại `run.bat`, refresh overlay (OBS: *Refresh cache of current page*) |
| Overlay giật khi đông | Ảnh quá to: ảnh nền ≤ 1 MB, hiệu ứng ≤ 1024px, tờ nhân vật cao ~300px |

---

## 9. Bản quyền

- Asset lấy ở nơi khác: ghi nguồn và giấy phép vào `CREDITS.md` của theme. Âm thanh chỉ lấy loại **CC0** hoặc có quyền dùng.
- Ảnh / nhạc tạo bằng AI: tự kiểm tra điều khoản của công cụ nếu kênh có kiếm tiền.
- Không dùng nhân vật, logo, nhạc của game / phim / thương hiệu khác.
