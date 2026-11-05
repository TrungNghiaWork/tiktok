# Ao làng câu cá · TikTok LIVE

Không gian câu cá thư giãn trên TikTok LIVE: người xem ngồi câu bên ao làng lúc hoàng hôn, gõ **"câu"** để thả cần, câu được cá thì thẻ cá hiện giữa màn và giọng đọc báo tên cá.
Engine là [TikTok Live Kit](https://github.com/duycuf/tiktok-live-kit). Repo này chỉ giữ phần riêng của ao.

## Chạy

1. Kit nằm **cạnh** thư mục này (`../tiktok-live-kit`), đã chạy `run.bat` của kit một lần để cài thư viện. Kit để chỗ khác thì đặt biến `KIT_DIR`.
2. Chạy `run.bat` ở đây → bảng điều khiển http://localhost:3939, overlay http://localhost:3939/overlay (1080 × 1920).
3. Lên sóng giống kênh chùa: OBS (nguồn Browser `/overlay`) → Virtual Camera → LIVE Studio, hoặc `overlay.bat` cho LIVE Studio quay cửa sổ. Từng bước: `docs/GO-LIVE.vi.md` trong kit.

Kênh chùa và kênh câu cá cùng dùng cổng 3939: chạy một kênh mỗi lúc.

## Người xem làm gì

| Người xem | Trên màn hình |
|---|---|
| Vào live, chat, thả tim | Thành cần thủ ngồi bờ ao, có cần câu và phao; thả tim thì đom đóm bay |
| Gõ `câu` / `thả cần` / `câu cá` / 🎣 | Giật cần, bọt nước, **thẻ cá** (Thường · Khá · Hiếm · Huyền thoại), giọng đọc tên cá + số ký. Mỗi người 45 giây một lần, miễn phí |
| Quà từ 1 xu: **Rải thính** | Thính rơi xuống ao, gợn sóng |
| Quà từ 10 xu: **Mồi thơm** | Ra đầu cầu tre quăng cần, chắc chắn câu được cá hiếm |
| Quà từ 100 xu: **Cá chép hoá rồng** | Camera zoom, cá chép vàng nhảy khỏi mặt nước, pháo hoa, thẻ Huyền thoại |
| Cả phòng đủ 1.000 tim | Đàn cá chép vàng bơi ngang ao |

Danh hiệu: Người mới → Cần thủ (50 xu) → Lão ngư (300) → Vua câu (1.000).

## Hai bố cục

| Theme | Bố cục | Chọn |
|---|---|---|
| `cau-ca-v2` (mặc định) | **Ao dọc giữa khung, người ngồi hai bờ trái phải**, cầu tre bắc ngang. Dễ nhìn hơn trên điện thoại, thẻ cá hiện ngay trên mặt ao | `config.json` |
| `cau-ca` | Ao ngang phía trên, người ngồi bờ dưới, cầu tre nhô ra ao | Đổi trong ô Theme của bảng điều khiển |

Hai bản dùng chung `themes/cau-ca/theme.js`: **đừng xoá thư mục `cau-ca`** dù chỉ dùng v2. Prompt ảnh riêng cho v2: `themes/cau-ca-v2/ASSETS.md`.

## Ngôn ngữ: Việt · English · 中文

Cả hai bản (v1, v2) có đủ ba thứ tiếng: chữ trên màn hình, tên cá, câu đọc. Chọn ở tab **Live** → **Ngôn ngữ (chữ trên màn hình + giọng đọc)**, overlay tự tải lại.

| | Tiếng Việt | English | 中文 |
|---|---|---|---|
| Lệnh câu (gõ tiếng nào cũng được) | `câu`, `thả cần`, `câu cá` | `fish`, `cast`, `fishing` | `钓鱼`, `钓`, `甩竿` |
| Ví dụ thẻ cá | Cá trắm cỏ · 3,2 kg · HIẾM | Grass carp · 3.2 kg · RARE | 草鱼 · 3.2 kg · 稀有 |
| Giọng đọc | vi-VN-HoaiMyNeural | en-US-AriaNeural | zh-CN-XiaoxiaoNeural |

- Bảng cá dịch nằm ở `theme.json` → `i18n.en.draws.ca.items`, `i18n.zh.draws.ca.items` (cùng thứ tự, cùng số dòng với bảng gốc). Thêm / bớt cá ở bảng gốc thì sửa cả hai bản dịch cho khớp thứ tự.
- **Ảnh cá chỉ cần điền `image` ở bảng gốc** (tiếng Việt): bản dịch tự lấy ảnh của món cùng vị trí.
- Sửa chữ trên màn hình: `hud.text` (tiếng Việt) và `i18n.en.hud.text` / `i18n.zh.hud.text`.

## Có gì

| Đường dẫn | Nội dung |
|---|---|
| `themes/cau-ca/theme.json` | Luật quà, lệnh chat, **bảng cá** (`draws.ca`: lặp dòng = tăng tỉ lệ), danh hiệu, giọng đọc, thông báo |
| `themes/cau-ca/scene.json` | Bố cục: mặt ao, cầu tre (`cau-tre`), chỗ phao (`mat-ao`), bờ cỏ cho người ngồi |
| `themes/cau-ca/theme.js` | Giao diện riêng, thẻ cá, cần câu + phao, cá nhảy, đàn cá |
| `themes/cau-ca/ASSETS.md` | **Prompt gen ảnh nền, nhân vật, cá** và danh sách âm thanh cần tải |
| `docs/superpowers/` | Bản thiết kế và kế hoạch |

Hiện đang dùng hình tạm (nền SVG, người giữ chỗ, cá emoji). Làm theo `ASSETS.md` để thay bằng ảnh thật.
