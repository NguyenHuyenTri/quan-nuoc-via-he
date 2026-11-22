# Quán Nước Vỉa Hè

Quán mở với 6 bàn, mỗi bàn 4 ghế, và có thể mở rộng đến 30 bàn. Khách có thể vào bàn, cụng ly, cổ vũ và đăng ký lên sân khấu.

[Chơi thử trên Netlify](https://quannuocviahe.netlify.app/)

## Lệnh và điều khiển

| Bình luận | Hành động |
| --- | --- |
| `VÀO BÀN`, `GHÉ` | Xin ghế. Quán tự phục vụ nước khi khách ngồi. |
| `CỤNG LY`, `DZÔ` | Cụng ly với khách cùng bàn đã có nước. |
| `CHILL`, `RAP`, `ROCK` | Đăng ký lượt biểu diễn miễn phí 30 giây. |
| `XIN BÀI CHILL`, `XIN BÀI RAP`, `XIN BÀI ROCK` | Đề nghị thể loại nhạc cho lượt sau. |
| `VỖ TAY`, `THẢ TIM` | Cổ vũ sân khấu. Đủ 10 tim từ cùng một người sẽ hiện hoa thử. |
| `TẶNG 10` | Hiện 10 hoa thử. |

Khi hết ghế ở quy mô tối đa và có khách chờ, quán ưu tiên cho khách mẫu nhường chỗ. Với khách thật, game xét người đã ngồi ít nhất 10 phút và lâu nhất chưa tương tác. Khách đang diễn giữ ghế đến hết lượt.

Sân khấu có tối đa 5 người cùng diễn và 10 lượt chờ. Lượt thường kéo dài 30 giây, lượt VIP 3 phút tính từ lúc tới vị trí biểu diễn. Hàng chờ ưu tiên VIP theo số quà đã xác nhận cho lượt đang chờ, rồi đến thứ tự đăng ký. Khách đang biểu diễn hoàn thành lượt của mình. LED hiện ba lượt chờ đầu cùng tên bài, thể loại, thời lượng và lý do hoặc thời gian chờ ước lượng của lượt đầu.

Bấm **Bật nhạc cho quán** và **Bật giọng chủ quán** để bật từng luồng âm thanh. Dùng **Thử quà VIP** để đăng ký lượt thử. Bấm **Khung phát 9:16** để mở khung phát dọc, rồi chạm vào vùng tối bên ngoài để thoát.

## Quà và mục tiêu ngày

Bảng VIP hôm nay xếp theo tổng xu nhận được. Quà combo được tính khi chuỗi kết thúc. Quà có giá đơn từ 10.000 xu hiện thêm hiệu ứng sao.

| Mốc | Phần thưởng |
| --- | --- |
| 100 xu | Tiết mục Rock đặc biệt |
| 500 xu | Đêm Chill và trà đá |
| 1.000 xu | Đêm Rap và trà đá |
| 5.000 xu | Đại nhạc hội Rock và trà đá |
| 10.000 xu | Đêm Chill và trà đá |
| Mỗi 10.000 xu tiếp theo | Đêm nhạc hội xoay thể loại và trà đá |

Khi một quà vượt nhiều mốc, quán ăn mừng mốc cao nhất và báo mốc kế tiếp. Quà mốc được ưu tiên trong lịch diễn tự động khi hàng chờ khách đã hết. Nếu vượt thêm mốc trước khi nhạc mốc phát, mốc mới nhất sẽ được dùng.

## Cấu trúc

- `index.html` chứa giao diện, cảnh SVG và xử lý tương tác.
- `styles.css` chứa bố cục, màu sắc và cách hiển thị trên điện thoại.

## Chạy trên máy

Tải dự án rồi mở `index.html` để thử trên máy. Để nhận sự kiện trên iPhone cùng Wi-Fi, giữ TikFinity Desktop mở, chạy `Mo-game-iPhone.cmd` trên Windows rồi mở link được in ra trong Safari. Cầu nối cần Node.js 22 trở lên.

Bản thử xử lý bình luận ngay trên trang và tự tạo khách mẫu đi hai chiều trên đường trước quầy. Để thử ảnh đại diện, điền tên và URL ảnh HTTPS rồi bấm **Thử khách ghé LIVE**. Dùng cùng tên để gửi **Vào bàn** hoặc thử tặng quà. Bạn có thể chọn kiểu nhân vật **Nam**, **Nữ** hoặc **Mặc định**. Tạo hình đi theo khách từ đường đến bàn và lên sân khấu. Nhân vật đang đi trước quầy sẽ rẽ từ vị trí hiện tại. Khách đã có bàn sẽ đi từ ghế của mình lên sân khấu. Bản giả lập nhận diện một người theo tên, bỏ qua chữ hoa, chữ thường và khoảng trắng thừa. Khi nối TikTok LIVE, nên dùng ID tài khoản để phân biệt những người khác nhau có cùng tên hiển thị.

Trang tự kết nối TikFinity Desktop trên cùng máy và thử lại khi mất kết nối. Nút Ngắt kết nối lưu lựa chọn cho lần tải lại. Cầu nối sự kiện trong trình duyệt có thể gửi tên hiển thị và URL ảnh đại diện lấy từ nguồn LIVE:

```js
window.dispatchEvent(new CustomEvent('quannuoc:viewer', {
  detail: {name: displayName, avatarUrl: profilePhotoUrl, gender: profileGender}
}));
```

Khi nguồn LIVE xác nhận một lượt tặng quà, cầu nối có thể gửi một sự kiện riêng. Nếu nguồn gửi lại cùng một sự kiện, dùng cùng `eventId` để tránh tạo lượt hát trùng.

```js
window.dispatchEvent(new CustomEvent('quannuoc:gift', {
  detail: {name: displayName, avatarUrl: profilePhotoUrl, gender: profileGender, eventId: giftEventId, unitCoins: 60, count: 1}
}));
```

Trường `gender` là tùy chọn và nhận `male`, `female`, `nam` hoặc `nữ`. Quán dùng tạo hình mặc định khi thiếu dữ liệu.

Các sự kiện chỉ chạy trong phiên trình duyệt đang mở. Bình luận giả lập vẫn được xử lý riêng.
