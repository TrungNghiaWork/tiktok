# Lớp học đoán chữ · TikTok LIVE

Game đoán chữ cả phòng cùng chơi, chạy trên [TikTok Live Kit](https://github.com/duycuf/tiktok-live-kit) (thư mục `../tiktok-live-kit`).
Bảng đen ra **gợi ý** và **các chữ cái bị xáo trộn**, người xem **gõ đáp án vào bình luận**. Người xem thành học sinh ngồi theo bàn, mỗi tiết vinh danh học sinh giỏi.

## Chạy

1. Kit để **cạnh** thư mục này (`../tiktok-live-kit`), đã chạy `run.bat` trong kit một lần để cài thư viện. Kit để chỗ khác thì đặt biến `KIT_DIR`.
2. Chạy `run.bat` ở đây → bảng điều khiển http://localhost:3939, overlay http://localhost:3939/overlay (1080 × 1920).
3. Lên sóng: như các kênh khác, xem `../tiktok-live-kit/docs/GO-LIVE.vi.md`. `overlay.bat` mở overlay thành cửa sổ cho LIVE Studio quay.

Chùa, câu cá, game và lớp đoán chữ cùng dùng cổng 3939: chạy một cái mỗi lúc.

## Luồng một câu

```
Câu mới: gợi ý + chữ xáo trộn, ô đáp án hé sẵn chữ đầu, đồng hồ đếm ngược (mặc định 25 giây)
   │  người xem gõ đáp án vào bình luận (không cần dấu: "con khi" = "con khỉ")
   ▼
Có người đúng đầu tiên ─► cô giáo giơ thước, "⚡ … đúng đầu tiên! +10", còn 6 giây cho người khác
   ▼
Công bố đáp án (6 giây): đáp án + top 3 nhanh nhất ─► câu sau
   ▼  hết 20 câu
HẾT TIẾT: vinh danh 3 học sinh giỏi nhất tiết, pháo hoa, giải lao 12 giây ─► tiết mới (điểm tiết về 0, điểm cả buổi giữ nguyên)
```

| Người xem | Kết quả |
|---|---|
| Gõ đúng đáp án | 3 bạn nhanh nhất: **10 / 7 / 5 điểm**, bạn đúng sau: 2 điểm (tối đa 40 bạn mỗi câu) |
| Quà từ 1 xu: **Mở gợi ý** | Mở thêm một chữ của đáp án **cho cả lớp** (luôn chừa lại ít nhất một chữ) |
| Quà từ 10 xu: **Thêm giờ** | Câu đang hỏi thêm 10 giây |
| Quà từ 100 xu: **Câu vàng** | Câu này (đã có người đúng thì câu sau) điểm ×3 cho mọi người, pháo hoa |

- **Quà không mua điểm**: quà giúp cả lớp. Điểm chỉ có khi tự gõ đúng.
- **Lớp có 20 bàn** (5 cột × 4 hàng). Ai bình luận là vào lớp; lớp đầy thì **bạn lâu không tương tác nhất nhường chỗ**, tên hiện trên bàn.
- Cột trái: **top tiết này**; cột phải: **vừa đúng**. Giọng đọc **không đọc bình luận** để khỏi lộ đáp án.

## Chỉnh thời gian (bảng điều khiển)

Bảng điều khiển → tab **Live** → phần cài đặt theme. **Đổi là áp dụng ngay**, kể cả câu đang hỏi (đồng hồ tính lại):

| Cài đặt | Mặc định | Khoảng |
|---|---|---|
| Thời gian mỗi câu (giây) | 25 | 10–90, bước 5 |
| Có người đúng đầu tiên thì còn bao nhiêu giây (0 = chờ hết giờ) | 6 | 0–20 |
| Thời gian hiện đáp án (giây) | 6 | 3–20 |
| Số câu mỗi tiết | 20 | 5–50, bước 5 |
| Giải lao giữa hai tiết (giây) | 12 | 5–60, bước 5 |

Live vắng thì để câu dài hơn (30–40 giây) và "còn bao nhiêu giây" lớn hơn; live đông, người đoán nhanh thì 15–20 giây cho nhịp gắt.
Giá trị mặc định nằm ở `theme.json` → `"settings"` (và `hud.game` khi không có bảng điều khiển).

## Ngôn ngữ: Việt · English · 中文

Tab **Live** → **Ngôn ngữ**. Mỗi ngôn ngữ có **bộ từ riêng**: 116 câu tiếng Việt, 42 câu tiếng Anh, 40 câu tiếng Trung (chữ Hán xáo theo từng chữ). Giọng đọc: vi-VN-HoaiMyNeural · en-US-AriaNeural · zh-CN-XiaoxiaoNeural.

## Thêm / sửa từ

`themes/lop-doan-chu/theme.json` → `hud.game.words` (bản dịch: `i18n.en.hud.game.words`, `i18n.zh.hud.game.words`). Mỗi câu:

```json
{ "hint": "Leo trèo giỏi, thích ăn chuối", "a": ["con khỉ", "khỉ"] }
```

- Đáp án **đầu tiên** là chữ được xáo trên bảng và hiện lúc công bố; các đáp án sau là cách viết khác vẫn tính đúng.
- Chữ trên ô bỏ dấu, viết hoa ("con khỉ" → C O N · K H I). So đáp án không phân biệt dấu, hoa thường, dấu cách.
- Đáp án nên 1–3 tiếng, dưới 14 chữ cái cho ô chữ khỏi xuống dòng. Gợi ý nên một dòng ngắn.

## Có gì

| Đường dẫn | Nội dung |
|---|---|
| `themes/lop-doan-chu/theme.json` | Cài đặt thời gian, quà, bộ từ 3 thứ tiếng, danh hiệu, giọng đọc, chữ trên màn hình |
| `themes/lop-doan-chu/scene.json` | Lưới 20 bàn (`"slots"`: chỗ ngồi cố định), phối cảnh học sinh |
| `themes/lop-doan-chu/theme.js` | Bảng đen, ô chữ, tiết học, bàn + bảng tên, cô giáo |
| `themes/lop-doan-chu/game.js` | Đồ dùng chung (chép từ `tiktok-live-game/themes/danh-boss/game.js`) |
| `themes/lop-doan-chu/ASSETS.md` | Prompt tạo ảnh nền lớp học, cô giáo, học sinh; âm thanh cần tải |

## Lưu ý

- **Trạng thái game lưu trong trình duyệt** của overlay (OBS / cửa sổ `overlay.bat`): tải lại trang vẫn giữ câu, tiết, điểm. Nút **Phiên mới** (tab Thống kê) đặt lại.
- Nút **Bình luận** của tab Thử nghiệm gửi câu ngẫu nhiên nên không thử được việc gõ đáp án: chỉ thử được khi live thật. Quà thì thử được bằng các nút.
- **Không hứa thưởng tiền / quà thật** cho người đứng đầu (dễ bị TikTok coi là cờ bạc). Phần thưởng là vinh danh trên màn hình.
- Đang dùng **hình tạm** (nền SVG, bàn và cô giáo vẽ bằng code, học sinh là người giữ chỗ của kit). Làm theo `themes/lop-doan-chu/ASSETS.md` để thay ảnh thật.
- Lưới bàn kéo xuống tới y ≈ 1660: hai hàng dưới bên trái nằm trong khung bình luận của TikTok, tên trên bàn ở đó có thể bị bình luận che.
