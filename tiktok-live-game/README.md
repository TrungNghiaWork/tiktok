# Game TikTok LIVE: Đánh boss · Kéo co · Đố vui · Đua vịt · Leo tháp

Năm trò chơi cả phòng cùng chơi, chạy trên [TikTok Live Kit](https://github.com/duycuf/tiktok-live-kit) (thư mục `../tiktok-live-kit`).
Chạy `run.bat` → bảng điều khiển http://localhost:3939, overlay http://localhost:3939/overlay. Đổi game trong ô **Theme** của bảng điều khiển: `danh-boss`, `keo-co`, `do-vui`, `dua-vit`, `leo-thap` (mặc định: đánh boss, đổi trong `config.json`).
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

## Đố vui cả phòng (`themes/do-vui`)

Màn hình ra câu đố (40 câu tiếng Việt: câu đố dân gian, điền ca dao, kiến thức; 30 câu tiếng Anh, 30 câu tiếng Trung). Người xem **gõ đáp án vào bình luận**.

| Người xem | Kết quả |
|---|---|
| Gõ đúng đáp án | 3 người đúng nhanh nhất: **10 / 7 / 5 điểm**, người đúng sau: 2 điểm (tối đa 30 người mỗi câu) |
| Quà từ 1 xu: **Mở gợi ý** | Mở một chữ của đáp án **cho cả phòng** (luôn chừa lại ít nhất một chữ) |
| Quà từ 10 xu: **Thêm giờ** | Câu đang hỏi thêm 10 giây |
| Quà từ 100 xu: **Câu vàng** | Câu này (đã có người đúng thì câu sau) điểm ×3 cho mọi người, pháo hoa |

- Mỗi câu 25 giây. Có người đúng đầu tiên thì còn 6 giây cho người khác rồi công bố đáp án (thẻ đáp án + top 3 nhanh nhất), nghỉ 6 giây, câu mới.
- **Quà không mua điểm**: quà giúp cả phòng (gợi ý, thêm giờ, điểm ×3 cho tất cả). Điểm chỉ có khi tự gõ đúng.
- So đáp án không phân biệt dấu, hoa thường, dấu câu (`ha noi` = `Hà Nội!`). Câu ngắn có chứa đáp án ("đáp án là hà nội") cũng tính.
- Bảng điểm cả buổi (cột phải) và "vừa đúng" (cột trái). Giọng đọc **không đọc bình luận** để khỏi lộ đáp án.
- Thêm câu hỏi: `themes/do-vui/ASSETS.md` mục 3.

## Đua vịt (`themes/dua-vit`)

```
Chờ thả vịt 20 giây (gõ "đua") ─► Đua: vịt bơi trái → phải, tối đa 80 giây
   │                                 sông tự đẩy mọi vịt trôi: không ai bấm vẫn về đích
   ▼
Vịt đầu tiên về đích ─► pháo hoa, còn 4 giây cho vịt khác ─► bục trao giải top 3 ─► nghỉ 10 giây, vòng mới
```

| Người xem | Vịt của mình |
|---|---|
| Gõ `đua` / `vịt` / `race` / `比赛` | Thả một con vịt (tối đa 24 vịt mỗi vòng, 8 làn) |
| Gõ `bơi` / `nhanh` / `swim` / `游` | +15 (2 giây một lần) |
| Thả tim | +3 mỗi tim |
| Quà: **Tăng tốc** (1 xu) · **Sóng đẩy** (10 xu, ít nhất 200) · **Vịt tên lửa** (100 xu, ít nhất 500) | +20 mỗi xu, **mỗi lần tặng tối đa 400** (40% đường đua) |

- Quà chỉ đẩy vịt của chính người tặng, không cản vịt người khác. Tặng quà mà chưa có vịt thì được thả vịt luôn.
- Tên hiện cạnh 6 vịt dẫn đầu và vịt vừa được đẩy (đông vịt thì không đè chữ kín sông). Cột phải: thứ hạng vòng đang đua; lúc nghỉ: vô địch hôm nay (số vòng thắng).

## Cả phòng leo tháp (`themes/leo-thap`)

Cả phòng cùng đẩy **một** người leo tháp. Mỗi 100 m là một tầng: Chân tháp → Tầng mây (100 m) → Đỉnh núi tuyết (300 m) → Trời đêm (600 m) → Vũ trụ (1.000 m) → Mặt Trăng (2.000 m) → Sao Hỏa (5.000 m). Trời đổi màu theo tầng.

| Người xem | Độ cao |
|---|---|
| Thả tim | +0,5 m mỗi tim |
| Gõ `leo` / `lên` / `climb` / `爬` | +2 m (3 giây một lần) |
| Quà: **Tiếp sức** (1 xu) · **Dây thừng** (10 xu, ít nhất 40 m) · **Khinh khí cầu** (100 xu, ít nhất 200 m) | +3 m mỗi xu, **mỗi lần tặng tối đa 250 m** |

- **Gió**: cả phòng ngừng tay quá 8 giây thì tụt 1,2 m mỗi giây, nhưng **không tụt quá tầng đã lên** (mốc an toàn).
- Lên tầng mới: pháo hoa, khán giả reo, thẻ "🎉 400 M!" + người góp sức nhiều nhất. Cột phải: top góp sức và **kỷ lục cao nhất** cả buổi.

## Ngôn ngữ: Việt · English · 中文

Cả năm game có đủ ba thứ tiếng. Chọn ở tab **Live** → **Ngôn ngữ (chữ trên màn hình + giọng đọc)**. Đổi xong overlay tự tải lại, mọi chữ trên màn hình và giọng đọc đổi theo:

| | Tiếng Việt | English | 中文 |
|---|---|---|---|
| Giọng đọc | vi-VN-NamMinhNeural | Boss: en-US-GuyNeural · Kéo co: en-US-AriaNeural | Boss: zh-CN-YunxiNeural · Kéo co: zh-CN-XiaoxiaoNeural |
| Boss | Ếch Bùn, Rùa Đá… | Mud Frog, Stone Turtle… | 泥巴蛙, 石头龟… |
| Kéo co | GIRL / BOY | GIRL / BOY | 女生 / 男生 |
| Đố vui | 40 câu riêng | 30 câu riêng | 30 câu riêng |
| Đua vịt / Leo tháp | ĐUA VỊT · LEO THÁP | DUCK RACE · TOWER CLIMB | 鸭子赛跑 · 爬塔 |

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
| Đố vui | `questions[]` (`q`, `a`) | Bộ câu hỏi; `a` là các cách viết đáp án được tính đúng |
| | `askMs`, `afterFirstMs`, `revealMs` | Thời gian mỗi câu, còn bao lâu sau người đúng đầu, thời gian công bố |
| | `points`, `latePoints`, `maxRight` | Điểm 3 người đầu, điểm người đúng sau, số người được điểm mỗi câu |
| Đua vịt | `points.chat`, `points.like`, `points.coin`, `points.drift` | Đẩy mỗi lệnh / tim / xu (đường đua dài 1.000), sông tự đẩy mỗi giây |
| | `maxGift`, `minGift` | Một lần tặng đẩy tối đa / tối thiểu theo chiêu |
| | `lobbyMs`, `raceMs`, `restMs`, `maxDucks`, `lanes` | Chờ thả vịt, độ dài vòng, nghỉ, số vịt, số làn |
| Leo tháp | `points`, `maxGift`, `minGift` | Mét mỗi tim / lệnh / xu, giới hạn mỗi lần tặng |
| | `floorM`, `zones[]`, `idleMs`, `fallPerSec` | Mỗi tầng bao nhiêu mét, tên + màu trời từng tầng, gió |

Live vắng (vài chục người) thì giảm máu boss; live đông thì tăng lên để một ván không kết thúc quá nhanh.

## Lưu ý

- **Trạng thái game lưu trong trình duyệt** của overlay (OBS hoặc cửa sổ `overlay.bat`): OBS tải lại trang vẫn giữ máu boss, tỉ số. Đổi máy hoặc trình duyệt khác thì bắt đầu lại. Khung xem trước trong bảng điều khiển chỉ hiển thị, có thể lệch số với overlay thật. Nút **Phiên mới** (tab Thống kê) đặt lại game.
- **Không hứa thưởng tiền / quà thật** cho người tặng quà hay đội thắng (dễ bị TikTok coi là cờ bạc). Phần thưởng chỉ là hiệu ứng và vinh danh trên màn hình.
- Giọng đọc chỉ đọc theo sự kiện của TikTok (quà, người vào, lệnh chat). Lúc boss gục / đội thắng chỉ có chữ và hiệu ứng, không có câu đọc.
- Nút **Bình luận** trong tab Thử nghiệm gửi câu ngẫu nhiên, không gõ được "đánh", "kéo", "girl", "boy", "đua", "leo" hay đáp án đố vui: lệnh chat chỉ thử được khi live thật. Quà và tim thì thử được bằng các nút.
- `themes/danh-boss/game.js` dùng chung cho cả năm game: **đừng xoá thư mục `danh-boss`** dù không chơi đánh boss.
- Đang dùng **hình tạm** (nền SVG, boss vẽ bằng code, người giữ chỗ). Prompt ảnh thật: `themes/<game>/ASSETS.md`, hướng dẫn chung: `../HUONG-DAN-ANH.md`.
