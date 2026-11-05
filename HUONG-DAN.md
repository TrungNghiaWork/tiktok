# HƯỚNG DẪN VẬN HÀNH TIKTOK LIVE TƯƠNG TÁC
### Hệ thống: `tiktok-live-kit` (Lõi Engine) & `tiktok-live-pgd` (Theme Chùa ảo)

---

## 1. Tổng quan kiến trúc hệ thống

Thư mục này gồm 2 dự án hoạt động theo mô hình **Engine (Phần lõi)** và **Theme (Giao diện & Nội dung)**:

```
                  ┌─────────────────────────────────────────────────────────┐
                  │              tiktok-live-kit (Lõi Engine)               │
                  │  - Server Node.js (cổng 3939), WebSocket realtime       │
                  │  - Bộ nhận diện sự kiện: Quà, Tim, Chat, Follow         │
                  │  - Giọng đọc tự động TTS (Microsoft Edge AI Tiếng Việt) │
                  │  - Công cụ quản lý bảng điều khiển, xếp hạng, combo quà │
                  └───────────────────────────┬─────────────────────────────┘
                                              │ nạp vào
                                              ▼
                  ┌─────────────────────────────────────────────────────────┐
                  │              tiktok-live-pgd (Theme Chùa ảo)            │
                  │  - Giao diện chánh điện 2.5D, chiếu sen, đỉnh hương     │
                  │  - Nhân vật Phật tử áo lam (30+ khung hình hoạt hình)   │
                  │  - Âm thanh: chuông gia trì, gõ mõ, nhạc thiền thanh tịnh│
                  │  - Kịch bản: xin xăm gieo quẻ, lạy Phật, dâng hương     │
                  └───────────────────────────┬─────────────────────────────┘
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
            Bảng điều khiển Streamer                         Màn hình Overlay Chùa
            http://localhost:3939/                           http://localhost:3939/overlay
          (Theo dõi live, test máy,                        (Đưa vào OBS / LIVE Studio
             xem top công đức)                                khung dọc 1080 x 1920)
```

---

## 2. Khi Live: Chạy cái nào?

> 👉 **KHI LÊN SÓNG THẬT, BẠN CHỈ CẦN CHẠY:**  
> **`tiktok-live-pgd\run.bat`**

### Quy trình khởi động hàng ngày:
1. Vào thư mục **`tiktok-live-pgd`**, bấm đúp chạy **`run.bat`**.
2. Một cửa sổ dòng lệnh đen tiêu đề **`Chua ao - TikTok Live`** sẽ xuất hiện: **ĐÂY LÀ MÁY CHỦ, TUYỆT ĐỐI KHÔNG TẮT TRONG SUỐT BUỔI LIVE**.
3. Trình duyệt tự mở Bảng điều khiển tại: [http://localhost:3939/](http://localhost:3939/).

*(Lưu ý: Nếu chuyển máy tính mới hoặc vừa tải dự án về lần đầu, hãy chạy `tiktok-live-kit\run.bat` trước 1 lần để máy tải thư viện `node_modules` về).*

---

## 3. Cách đưa hình ảnh Chùa lên TikTok LIVE

Sau khi chạy `run.bat`, bạn chọn **1 trong 2 cách** sau để đưa hình ảnh vào luồng phát trực tiếp:

### Cách A — Sử dụng OBS Studio (Khuyên dùng, hình ảnh mượt nhất)
* **Bước 1**: Mở OBS Studio, vào **Settings → Video**:
  * Base Resolution: `1080 x 1920` (khung dọc).
  * Output Resolution: `1080 x 1920`, tốc độ khung hình: `30` hoặc `60 FPS`.
* **Bước 2**: Tại khung **Sources**, bấm **+** chọn **Browser**:
  * URL: `http://localhost:3939/overlay`
  * Width: `1080`, Height: `1920`
  * Tick chọn: **Control audio via OBS**.
  * Nhấp chuột phải vào nguồn Browser vừa tạo → chọn **Interact** → nhấp chuột 1 cái vào màn hình để kích hoạt âm thanh chuông mõ.
* **Bước 3**: Chỉnh âm thanh trong OBS: Nhấp chuột phải nguồn Browser → **Advanced Audio Properties** → cột Audio Monitoring chuyển sang **Monitor and Output**.
* **Bước 4**: Bấm nút **Start Virtual Camera** trên OBS.
* **Bước 5**: Mở **TikTok LIVE Studio** trên máy tính:
  * Chọn khung dọc (9:16).
  * Bấm **Thêm nguồn → Camera** → chọn **OBS Virtual Camera** rồi kéo phóng to kín khung hình.

---

### Cách B — Dùng trực tiếp TikTok LIVE Studio (Không cần cài OBS)
* **Bước 1**: Vào thư mục `tiktok-live-pgd`, chạy file **`overlay.bat`** (Màn hình Chùa sẽ mở ra trong một cửa sổ riêng).
* **Bước 2**: Mở **TikTok LIVE Studio**, chọn khung dọc (9:16).
* **Bước 3**: Bấm **Thêm nguồn → Quay màn hình cửa sổ (Window Capture)** → chọn cửa sổ Chùa ảo. Kéo căng phủ kín khung hình.
* *(Lưu ý: Không thu nhỏ (minimize) cửa sổ Chùa; bạn có thể để nó bị các cửa sổ khác che lên vẫn bình thường).*

---

## 4. Cách liên kết dữ liệu với TikTok LIVE (Quà, Chat, Thả tim)

Hệ thống **hoàn toàn liên kết trực tiếp theo thời gian thực** với TikTok LIVE. Sau khi bạn bấm "Phát trực tiếp", chọn 1 trong 2 cách kết nối:

```
TikTok LIVE ──> TikFinity Desktop ──ws://127.0.0.1:21213──┐
(Quà, Tim, Chat)  (Khuyên dùng, chống rớt mạng)            │
        └───> Hoặc Kết nối trực tiếp (@tên_kênh) ─────────┴──> Bảng điều khiển (cổng 3939)
```

### Cách 1: Qua TikFinity Desktop (Khuyên dùng - Cực kỳ ổn định)
1. Tải ứng dụng [TikFinity](https://tikfinity.zerody.one/) cho Windows và cài đặt.
2. Đăng nhập đúng tài khoản TikTok của kênh bạn lên TikFinity Desktop.
3. Khi bạn bấm **Phát trực tiếp** trên LIVE Studio, TikFinity sẽ tự động nhận diện phòng live.
4. Mở Bảng điều khiển [http://localhost:3939/](http://localhost:3939/):
   * Nguồn: chọn **TikFinity Desktop** (cổng mặc định `21213`).
   * Bấm nút **Kết nối**. Chấm trạng thái chuyển sang **màu xanh** là thành công.

### Cách 2: Kết nối trực tiếp (Direct Connection)
1. Bấm **Phát trực tiếp** trên LIVE Studio trước.
2. Trên Bảng điều khiển [http://localhost:3939/](http://localhost:3939/):
   * Nguồn: chọn **Trực tiếp**.
   * Nhập đúng **tên người dùng TikTok** của kênh (phần sau chữ `@`, ví dụ kênh `@nammoadidaphat` thì chỉ nhập `nammoadidaphat`).
   * Bấm **Kết nối**.

---

## 5. Tổng hợp các chức năng chính

| Chức năng | Địa chỉ / Cách dùng | Mô tả chi tiết |
|---|---|---|
| **Màn hình Overlay Chùa** | `http://localhost:3939/overlay` | Hiển thị phối cảnh chánh điện 2.5D, nhân vật Phật tử, lư đồng nghi ngút khói, 16 vị trí ngồi danh dự, thả đèn hoa đăng và bảng thơ rút quẻ. |
| **Bảng điều khiển (Control Panel)** | `http://localhost:3939/` | Theo dõi kết nối, nhật ký sự kiện vào live theo thời gian thực, bật/tắt nhạc nền, điều chỉnh âm lượng chuông mõ. |
| **Giọng đọc tự động (TTS)** | Tự động xử lý trong lõi | Đọc tên Phật tử khi bước vào chùa, đọc cảm ơn người dâng hương cúng dường, đọc lời cầu bình an của người xem. |
| **Tab Thử nghiệm (Stress test)** | Tab "Thử nghiệm" trên web | Cho phép bấm thử từng hiệu ứng quà, đọc thử giọng nói, thả thử 10 / 60 / 400 người vào chùa để kiểm tra máy tính chịu tải trước khi live thật. |
| **Bảng xếp hạng & Tri ân** | Tab "Thống kê" trên web | Lưu giữ danh sách các Phật tử công đức nhiều nhất, cấp danh hiệu hoa sen, cho phép xuất file **CSV** để tri ân sau buổi live. |

---

## 6. Các quy tắc (Rules) cần tuân thủ

### 6.1. Quy tắc về điều kiện tài khoản TikTok
* **Quyền mở khóa TikTok LIVE Studio trên PC**: Tài khoản cần có quyền phát qua máy tính.
* **Mẹo mở khóa cho tài khoản mới (Phiên mở khoá 25 phút)**:
  * Nếu LIVE Studio báo *"Không có quyền truy cập"*, hãy dùng app TikTok trên điện thoại phát trực tiếp 1 phiên bình thường khoảng **25 phút**. Sau phiên này, TikTok sẽ mở quyền sử dụng LIVE Studio trên PC.
* **Quy tắc về livestream tĩnh / treo máy**: Thuật toán TikTok kiểm tra rất nghiêm ngặt việc treo video lặp lại. Dự án này **an toàn** vì là đồ họa tương tác thời gian thực: người ra vào liên tục, có tiếng gõ mõ khi thả tim, cử động thắp nhang theo quà và giọng đọc AI phản hồi liên tục.

### 6.2. Quy tắc văn hóa & kịch bản Chùa (`tiktok-live-pgd`)
* **Tôn nghiêm và thanh tịnh:** Không gian chánh điện mang ý nghĩa tâm linh hướng thiện.
* **Tuyệt đối không thương mại hóa / không bán phước lành:** Lời thoại cảm ơn quà luôn dùng khái niệm *"công đức, dâng hương, cúng dường, gieo duyên lành"*; không bao giờ dùng từ ngữ mang tính chất "trả tiền để nhận lộc".
* **Gieo quẻ / Xin xăm hoàn toàn MIỄN PHÍ:** Khán giả chỉ cần gõ lệnh chat là được rút quẻ, mỗi người giới hạn 1 quẻ mỗi ngày (`perDay: true`).

### 6.3. Bảng quy tắc tương tác (Khai báo trong `theme.json`)

| Sự kiện từ người xem | Từ khóa / Điều kiện | Phản ứng trên màn hình Chùa | Giọng đọc & Âm thanh |
|---|---|---|---|
| **Vào xem live** | Bất kỳ ai vào xem | Xuất hiện nhân vật Phật tử áo lam bước vào chánh điện quỳ ngồi | Đọc tên chào đón Phật tử |
| **Thả tim (Like)** | Thả tim màn hình | Hiệu ứng tim bay trên đầu + hiện số `+1 công đức` | Tiếng gõ mõ giòn giã thanh tịnh |
| **Chat bình thường** | Bất kỳ bình luận nào | Phật tử cúi đầu xá nhẹ (`nod`) | Đọc bình luận (giãn cách cooldown 10s) |
| **Lệnh Lạy Phật** | Chat: `lạy Phật`, `nam mô`, `a di đà`, `con lạy`, `🙏` | Phật tử đứng lên quỳ xuống lạy 3 lạy trang nghiêm | Cooldown 8 giây |
| **Lệnh Xin xăm** | Chat: `xin xăm`, `gieo quẻ`, `xin quẻ`, `rút quẻ` | Quỳ lắc ống xăm, rơi quẻ gỗ, hiển thị thơ quẻ và lời bàn giải quẻ | Cooldown 30s (tối đa 1 lần/ngày) |
| **Lệnh Cầu an** | Chat: `cầu an`, `cầu cho [lời cầu]` | Thả đèn hoa đăng lung linh trôi trên dòng nước | Đọc lời cầu nguyện của Phật tử |
| **Quà 1 xu** *(Hoa hồng...)* | Quà tặng từ 1 xu | Bước lên trước đỉnh hương đồng làm lễ **Dâng hương**, khói tỏa | Tiếng chuông gia trì |
| **Quà 5 xu** | Quà tặng từ 5 xu | Ra giữa thảm thực hiện **Lễ bái lớn**, hào quang phát sáng | Tiếng chuông mõ |
| **Quà 10 xu** | Quà tặng từ 10 xu | Động tác **Dâng hoa sen** cúng dường Tam Bảo | Chuông ngân |
| **Quà lớn >= 100 xu** | Quà tặng từ 100 xu | Kích hoạt **Đại lễ**: Phóng to góc quay, vầng hào quang rực rỡ, mưa cánh hoa sen rơi khắp chánh điện | Tiếng đại lễ trang nghiêm |

---

## 7. Xử lý các sự cố thường gặp (Troubleshooting)

1. **Màn hình Overlay không có tiếng chuông mõ:**
   * Trình duyệt Chrome mặc định chặn tự phát âm thanh. Hãy nhấp chuột vào màn hình Overlay một lần (hoặc trong OBS chuột phải vào Browser chọn **Interact** rồi nhấp chuột vào màn hình).
2. **TikTok LIVE Studio báo lỗi "Không thấy nguồn OBS Virtual Camera":**
   * Hãy mở OBS và bấm nút **Start Virtual Camera** trước, sau đó mới bật phần mềm TikTok LIVE Studio.
3. **Mất kết nối với TikTok giữa chừng:**
   * Hệ thống có cơ chế tự động kết nối lại sau 2–30 giây. Nếu bị đứt hẳn, mở trang [http://localhost:3939/](http://localhost:3939/) và bấm nút **Kết nối** lại.
4. **Lỡ tay tắt cửa sổ màu đen (`Chua ao - TikTok Live`):**
   * Chạy lại file `tiktok-live-pgd\run.bat`.
   * Trên OBS: Nhấp chuột phải vào nguồn Browser → chọn **Refresh cache of current page**.

