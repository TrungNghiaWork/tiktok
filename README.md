# TikTok LIVE Interactive Streaming

Dự án livestream tương tác trên TikTok LIVE với chủ đề **Chùa Online (Đi chùa ảo)**.

## Cấu trúc thư mục

* **`tiktok-live-kit/`**: Bộ khung lõi (Engine) xử lý máy chủ Node.js, WebSockets, bắt sự kiện TikTok LIVE, giọng đọc AI (TTS), hệ thống luật và overlay 1080x1920.
* **`tiktok-live-pgd/`**: Theme Chùa ảo (Giao diện 2.5D chánh điện, nhân vật Phật tử, âm thanh chuông mõ, kịch bản dâng hương, xin xăm, lạy Phật).
* **`tiktok-live-cauca/`**: Theme Ao làng câu cá (gõ "câu" để thả cần, thẻ cá 4 hạng, quà rải thính / mồi thơm / cá chép hoá rồng).
* **`tiktok-live-game/`**: Năm game cả phòng: **Đánh boss** (gõ "đánh", tim, quà gây sát thương), **Kéo co Girl vs Boy**, **Đố vui** (gõ đáp án vào bình luận), **Đua vịt** (gõ "đua" thả vịt) và **Leo tháp** (cả phòng đẩy một người leo). Xem `tiktok-live-game/README.md`.
* **`tiktok-live-doanchu/`**: **Lớp học đoán chữ**: bảng đen ra gợi ý + chữ xáo trộn, gõ đáp án vào bình luận, người xem ngồi theo bàn, tiết 20 câu, chỉnh thời gian ngay trên bảng điều khiển. Xem `tiktok-live-doanchu/README.md`.
* **[HUONG-DAN-ANH.md](HUONG-DAN-ANH.md)**: Thay ảnh nền, nhân vật, hiệu ứng, âm thanh: kích thước chuẩn, đặt file ở đâu, khai báo thế nào, cho cả hai theme.
* **[HUONG-DAN.md](HUONG-DAN.md)**: **Tài liệu hướng dẫn sử dụng chung đầy đủ**: cách chạy, cách kết nối TikTok LIVE, các tính năng và toàn bộ bảng quy tắc kịch bản.

## Khởi động nhanh khi live

Nhấp đúp chuột chạy:
```bat
tiktok-live-pgd\run.bat
```
* Bảng điều khiển: [http://localhost:3939/](http://localhost:3939/)
* Màn hình Overlay cho OBS / LIVE Studio: [http://localhost:3939/overlay](http://localhost:3939/overlay)

