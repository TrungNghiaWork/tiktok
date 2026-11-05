# Game TikTok LIVE: Đánh boss · Kéo co Girl vs Boy

Hai trò chơi cả phòng cùng chơi, chạy trên [TikTok Live Kit](https://github.com/duycuf/tiktok-live-kit) (thư mục `../tiktok-live-kit`).
Chạy `run.bat` → bảng điều khiển http://localhost:3939, overlay http://localhost:3939/overlay. Đổi game trong ô **Theme** của bảng điều khiển (mặc định: đánh boss, đổi trong `config.json`).
Kênh chùa, câu cá và game cùng dùng cổng 3939: chạy một cái mỗi lúc.

## Đánh boss cả phòng (`themes/danh-boss`)

### Luồng một con boss

```
Boss trồi lên trên bục (nảy nhẹ, rung màn, dòng "⚔️ Rùa Đá xuất hiện! · 1.500 máu")
   │  tên + cấp + thanh máu hiện ngay trên đầu boss
   ▼
Người xem đánh ─► mỗi đòn: hiệu ứng bay vào boss → boss chớp trắng, rung → số "-25" bay lên
   │              thanh máu tụt (phần trắng tụt chậm theo sau); dưới 30% máu thanh nhấp nháy, boss càng giận
   ▼
Máu về 0 ─► boss mờ dần · pháo hoa · cả phòng reo · thẻ "ĐÃ HẠ …!" (đòn kết liễu + top 3 sát thương với boss này)
   │
   ▼  7 giây
Boss cấp sau TO HƠN (×0,8 → ×1,3) và NHIỀU MÁU HƠN, lặp lại
```

| Cấp | Boss | Máu | Cỡ |
|---|---|---|---|
| 1 | Ếch Bùn | 600 | ×0,8 |
| 2 | Rùa Đá | 1.500 | ×0,93 |
| 3 | Cua Lửa | 3.000 | ×1,05 |
| 4 | Bạch Tuộc Tím | 5.000 | ×1,18 |
| 5 | Rồng Mây | 8.000 | ×1,3 |
| 6+ | Rồng Mây +1, +2… | ×1,45 mỗi cấp | ×1,3 |

### Sát thương

| Người xem | Sát thương (mặc định) | Trên màn hình |
|---|---|---|
| Gõ `đánh` / `đấm` / `chém` / `tấn công` / 👊 | 15 (mỗi người 4 giây một lần) | Ngôi sao bay vào boss |
| Thả tim | 2 mỗi tim | |
| Quà từ 1 xu: **Phi tiêu** | 25 mỗi xu (ít nhất 25) | Chùm sao bay vào boss |
| Quà từ 10 xu: **Cầu lửa** | 25 mỗi xu (ít nhất 400) | Lên tuyến đầu ném cầu lửa, boss rung |
| Quà từ 100 xu: **Sấm sét** | 25 mỗi xu (ít nhất 3.000) | Camera vào boss, cột sấm sét, cả phòng hô |
| Cả phòng đủ 1.000 tim | | **Tiếp sức**: sát thương ×2 trong 30 giây (nhãn ×2 nhấp nháy) |

### Hai kiểu báo đòn đánh (chọn ở tab **Live** của bảng điều khiển)

| Lựa chọn | Bật / tắt | Kết quả |
|---|---|---|
| **1. Giọng đọc nhanh** (mặc định) | "Giọng đọc xướng tên" **bật** | Chỉ đọc chiêu từ 10 xu trở lên, mỗi câu cách nhau ít nhất 3 giây, câu ngắn; lệnh "đánh" không đọc. Chữ tên chiêu hiện trên boss với quà |
| **2. Chỉ hiệu ứng đánh** | "Giọng đọc xướng tên" **tắt** | Không đọc gì. Mỗi đòn quà hiện chữ chiêu lớn ("🔥 CẦU LỬA!") + tên người, vòng va chạm, rung màn theo độ mạnh; lệnh "đánh" cũng hiện chữ |

Giọng đọc chậm vì mỗi câu phải chờ dịch vụ giọng Microsoft tạo (~1–3 giây) và phát lần lượt: trận đông mà câu nào cũng đọc thì dồn hàng, càng lúc càng trễ. Lựa chọn 1 giảm số câu; độ trễ ~1–3 giây của từng câu vẫn còn (do dịch vụ).

"Ít nhất" (`minDamage`) giúp chiêu lớn luôn ra đòn mạnh, kể cả khi bấm nút **Xem thử từng hiệu ứng** (nút đó luôn tính như quà 1 xu).
Bảng phải trên là **sát thương cả buổi**, không phải số xu.

## Kéo co Girl vs Boy (`themes/keo-co`)

| Người xem | Lực (mặc định) |
|---|---|
| Gõ `girl` / `gái` / `nữ` / 🎀 hoặc `boy` / `trai` / `nam` / 🧢 | Chọn đội |
| Gõ `kéo` / `cố lên` / 💪 | +3 (3 giây một lần) |
| Thả tim | +1 mỗi tim |
| Quà: **Tiếp sức** (1 xu) · **Kéo mạnh** (10 xu) · **Lực sĩ** (100 xu) | +10 mỗi xu |

- **Team Girl** đứng nửa trái (nơ hồng trên đầu), **Team Boy** nửa phải (mũ lưỡi trai xanh), vòng màu dưới chân.
- Chưa chọn đội: **đứng bên nào thuộc đội bên đó** (không ai bị dời chỗ). Đã chọn mà đứng nhầm bên thì đổi chỗ với một người chưa chọn ở bên kia, tối đa 2 cặp mỗi giây.
- Dây và cờ nghiêng theo **tỉ lệ** lực hai đội (không phải hiệu số), nên một món quà lớn không kết thúc ván ngay.
- Một ván **90 giây**, hết giờ đội nhiều lực hơn thắng: pháo hoa, thẻ top 3 của đội thắng, tỉ số cộng dồn, nghỉ 9 giây rồi ván mới.

## Ngôn ngữ: Việt · English · 中文

Cả hai game có đủ ba thứ tiếng. Chọn ở tab **Live** → **Ngôn ngữ (chữ trên màn hình + giọng đọc)**. Đổi xong overlay tự tải lại, mọi chữ trên màn hình và giọng đọc đổi theo:

| | Tiếng Việt | English | 中文 |
|---|---|---|---|
| Giọng đọc | vi-VN-NamMinhNeural | Boss: en-US-GuyNeural · Kéo co: en-US-AriaNeural | Boss: zh-CN-YunxiNeural · Kéo co: zh-CN-XiaoxiaoNeural |
| Boss | Ếch Bùn, Rùa Đá… | Mud Frog, Stone Turtle… | 泥巴蛙, 石头龟… |
| Kéo co | GIRL / BOY | GIRL / BOY | 女生 / 男生 |

- **Lệnh chat nhận cả ba thứ tiếng cùng lúc**, ngôn ngữ nào cũng được: đánh boss `đánh` / `attack` / `hit` / `打` / `攻击`; kéo co `kéo` / `pull` / `拉` / `加油`, chọn đội `girl` / `gái` / `女` / `女生` và `boy` / `trai` / `男` / `男生`.
- Mỗi buổi live chọn **một** ngôn ngữ đọc. Tên và bình luận tiếng Việt đọc bằng giọng Anh / Trung nghe sẽ lạ.
- Sửa chữ / bản dịch: `theme.json` → `hud.text` (tiếng Việt) và `i18n.en` / `i18n.zh` (chỉ ghi phần khác). Cách khai báo: mục "Nhiều ngôn ngữ" trong `tiktok-live-kit/docs/THEME.vi.md`.

## Chỉnh số liệu

Trong `theme.json` của từng game → `"hud"` → `"game"`:

| Game | Khoá | Ý nghĩa |
|---|---|---|
| Đánh boss | `damage.chat`, `damage.like`, `damage.coin` | Sát thương mỗi lệnh / mỗi tim / mỗi xu |
| | `bosses[]` (`name`, `hp`, `color`, `image`) | Danh sách boss theo cấp |
| | `grow` | Hết danh sách thì mỗi cấp máu ×grow |
| | `respawnMs`, `boostMs` | Thời gian chờ boss mới, thời gian tiếp sức ×2 |
| | `minDamage` | Sát thương tối thiểu của từng chiêu quà |
| | `sizeStart`, `sizeStep`, `sizeMax` | Cỡ boss cấp 1, mỗi cấp to thêm, cỡ lớn nhất (hoặc `bosses[].size` cho từng boss) |
| Kéo co | `points.chat`, `points.like`, `points.coin` | Lực mỗi lệnh / mỗi tim / mỗi xu |
| | `soft` | Dây "cứng" cỡ nào lúc đầu ván (càng lớn càng cần nhiều lực mới lệch) |
| | `roundMs`, `restMs` | Độ dài ván, nghỉ giữa ván |

Live vắng (vài chục người) thì giảm máu boss; live đông thì tăng lên để một ván không kết thúc quá nhanh.

## Lưu ý

- **Trạng thái game lưu trong trình duyệt** của overlay (OBS hoặc cửa sổ `overlay.bat`): OBS tải lại trang vẫn giữ máu boss, tỉ số. Đổi máy hoặc trình duyệt khác thì bắt đầu lại. Khung xem trước trong bảng điều khiển chỉ hiển thị, có thể lệch số với overlay thật. Nút **Phiên mới** (tab Thống kê) đặt lại game.
- **Không hứa thưởng tiền / quà thật** cho người tặng quà hay đội thắng (dễ bị TikTok coi là cờ bạc). Phần thưởng chỉ là hiệu ứng và vinh danh trên màn hình.
- Giọng đọc chỉ đọc theo sự kiện của TikTok (quà, người vào, lệnh chat). Lúc boss gục / đội thắng chỉ có chữ và hiệu ứng, không có câu đọc.
- Nút **Bình luận** trong tab Thử nghiệm gửi câu ngẫu nhiên, không gõ được "đánh", "kéo", "girl", "boy": lệnh chat chỉ thử được khi live thật. Quà và tim thì thử được bằng các nút.
- `themes/danh-boss/game.js` dùng chung cho cả hai game: **đừng xoá thư mục `danh-boss`** dù chỉ chơi kéo co.
- Đang dùng **hình tạm** (nền SVG, boss vẽ bằng code, người giữ chỗ). Prompt ảnh thật: `themes/<game>/ASSETS.md`, hướng dẫn chung: `../HUONG-DAN-ANH.md`.
