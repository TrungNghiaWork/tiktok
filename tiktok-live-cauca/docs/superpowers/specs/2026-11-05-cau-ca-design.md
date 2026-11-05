# Thiết kế: theme "Ao làng câu cá" (`cau-ca`)

Ngày: 2026-11-05 · Trạng thái: chờ duyệt

## Ý định

Kênh TikTok LIVE thứ hai, cùng engine `tiktok-live-kit` như kênh chùa (`tiktok-live-pgd`). Người xem vào live thành cần thủ ngồi câu bên ao làng lúc hoàng hôn. Không khí **thư giãn**: câu được cá là khoảnh khắc nhỏ để chúc mừng, không đua điểm. Người dùng ưu tiên **nhìn rõ, đẹp, UI/UX tốt** trên điện thoại.

## Mục tiêu / không làm / phản mục tiêu

- Mục tiêu: chạy được ngay hôm nay bằng hình tạm để thử luồng; thay ảnh AI vào là đẹp, không sửa code.
- Không làm: xếp hạng theo ký cá, bộ sưu tập cá, mini-game đua, lưu thành tích ngoài cái kit đã lưu (xu, danh hiệu).
- Phản mục tiêu: màn hình rối, chữ nhỏ khó đọc trên điện thoại, khung che mặt ao, âm thanh ồn ào, sửa lõi kit.

## Ràng buộc

- Không sửa `tiktok-live-kit` (`src/`, `public/sdk/`). Mọi thứ trong theme.
- Khung 1080 × 1920, chữ ≥ 28px có viền tối, nằm trong vùng an toàn `Kit.safe`.
- Dữ liệu người xem chèn bằng `textContent`. Có giới hạn số thẻ, hiệu ứng, tiếng.
- Trang có thể tải lại: chỉ trạng thái hiển thị tạm nằm ở trang (hàng chờ thẻ cá), mất cũng không sao.
- Giọng đọc tiếng Việt (HoaiMy).
- Bốc thăm của kit chọn đều, không trọng số → độ hiếm làm bằng cách lặp món trong `items`, `perDay: false`.

## Cách làm đã chọn

| Câu hỏi | Các lựa chọn | Đã chọn |
|---|---|---|
| Đặt theme ở đâu | (a) thư mục riêng `tiktok-live-cauca` cạnh `tiktok-live-pgd`, có `run.bat`/`config.json`/`data/` riêng; (b) chung `tiktok-live-pgd/themes/` | (a): kênh riêng, dữ liệu riêng, sao chép cách `tiktok-live-pgd` đang chạy |
| Asset khi chưa có ảnh | (a) hình tạm (nền SVG vẽ tay, người giữ chỗ có sẵn của kit, cá bằng emoji) + prompt gen ảnh thật; (b) chỉ prompt, chờ ảnh | (a): thử luồng được ngay, thay file là xong |

## Thiết kế

**Thư mục** `tiktok-live-cauca/`: `run.bat`, `overlay.bat` (chép từ pgd, đổi tiêu đề), `config.json` (`theme: cau-ca`, port 3939), `.gitignore`, `README.md`, `themes/cau-ca/` (`theme.json`, `scene.json`, `index.html`, `theme.js`, `ASSETS.md` prompt, `CREDITS.md`, `assets/`). Hai kênh dùng chung cổng 3939, chạy một kênh mỗi lúc.

**Cảnh** (`scene.json`): nửa trên mặt ao + tre + mái đình xa; bờ cỏ phía dưới; cầu tre giữa. Điểm: `cau-tre`, `mat-ao`, `entry`, `focus`. Người đứng/ngồi trên vùng bờ, lối giữa dẫn ra cầu.

**Người xem**: `joinMode: all`. Nhân vật cần thủ (tạm: người giữ chỗ của kit). Lúc chờ ngồi yên.

**Chat "câu" / "thả cần" / "câu cá"** (cooldown 45s): hành động `cau` = giật cần, bọt nước tại `mat-ao`, rồi `draws.ca` trả về con cá → thẻ cá + giọng *"{ten} câu được {title}. {text}"*. Bảng cá ~14 loại + chiếc dép, mỗi món có `title` (tên), `text` (câu ngắn kèm số ký), thêm trường riêng `rank` (thuong/kha/hiem/huyenthoai), `emoji`, `image` (để trống đến khi có ảnh). Tỉ lệ ~60/25/12/3% bằng lặp.

**Quà**:
- 1 xu "Rải thính": gợn sóng + hạt rơi tại `mat-ao`, `+{total}` trên đầu.
- 10 xu "Mồi thơm": đi ra `cau-tre`, quăng, nước bắn, theme.js chọn cá hạng hiếm trở lên → thẻ cá, về chỗ.
- 100+ xu "Cá chép hoá rồng": camera zoom cầu tre, cá vàng nhảy, hào quang, pháo hoa nhẹ, đám đông vỗ tay.

**Tim**: đom đóm (`firefly`). Mục tiêu mỗi 1.000 tim → đàn cá chép bơi ngang ao (theme.js).

**Danh hiệu**: Người mới 0 · Cần thủ 50 · Lão ngư 300 · Vua câu 1.000.

**HUD** (`theme.js` thay `Kit.hud`, giữ đủ hàm `init, giftCard, ticker, state, guide, toast, periodic, draw, remember, reset`):
- Trên cùng: tên kênh + dòng "Gõ CÂU để thả cần" cố định.
- Thẻ cá giữa màn khung gỗ kem: ảnh/emoji cá lớn, tên, số ký, nhãn độ hiếm màu (xám / xanh / tím / vàng), tên người. Một thẻ mỗi lúc, hàng chờ tối đa 5, mỗi thẻ ~4s.
- Góc dưới trái: "Cần thủ hôm nay" top 3 theo xu (dữ liệu `state` từ server).
- 3 dòng "vừa câu được" mờ dần. Toast, thông báo định kỳ nhỏ gọn.

**Giọng**: chào khi vào, đọc cá câu bằng chat, cảm ơn quà, lên danh hiệu, mục tiêu, định kỳ, lời mời gõ "câu".

**Âm**: nền nước/chim/côn trùng; "tõm" quăng, "ào" kéo cá. Tạm thời để trống (kit chạy không tiếng) đến khi có file CC0.

## Hạn chế đã biết

- Cá câu bằng quà do overlay chọn; giọng đọc chỉ cảm ơn quà, không đọc tên cá.
- Hình tạm chỉ để thử luồng, chưa đẹp; độ đẹp đến từ ảnh gen theo `ASSETS.md`.

## Để người làm tự quyết

Tọa độ cụ thể trong `scene.json`, số hạt hiệu ứng, màu chi tiết, câu chữ giọng đọc, cách vẽ dây câu / phao trong `theme.js`.
