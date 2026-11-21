# Quán Nước Vỉa Hè

Bản mô phỏng một quán nước tương tác có ba bàn vuông, mỗi bàn bốn ghế. Khách vào bàn, nhận nước ngẫu nhiên, cụng ly và nhường ghế qua ô bình luận giả lập. Khách có thể ngồi bao lâu tuỳ thích khi quán còn chỗ. Khi đủ 12 ghế và có khách chờ, quán ưu tiên khách mẫu nhường chỗ. Nếu tất cả ghế đều là khách tham gia, quán mời người đã ngồi lâu nhất nhường ghế sau tối thiểu 60 giây. Người chờ được mời theo thứ tự.

[Chơi thử trên Netlify](https://quannuocviahe.netlify.app/)

## Chơi thử

Bấm **Xem một lượt phục vụ** hoặc nhập tên khách và gửi từng lệnh. Nhân viên quầy nhắc lệnh trên khung chơi và ngay dưới ô bình luận.

Khi mở hoặc dọn quán, bàn giữa có Trí, Đào, Mai và Hái Thứ Hiêu. Hai bàn bên mỗi bàn có hai khách mẫu với tên chọn ngẫu nhiên. Khách mới dùng ghế trống trước. Khi cả 12 ghế đã có người và còn khách chờ, khách mẫu được mời nhường chỗ trước. Nếu tên trùng một khách đang ngồi, phiên giả lập dùng đúng người và ghế đó.

| Bình luận | Hành động |
| --- | --- |
| `VÀO BÀN` | Xin ghế trống hoặc vào hàng chờ |
| `CỤNG LY` | Cụng ly với khách cùng bàn đã có nước. Khi mọi khách cùng bàn đều hô, cả bàn cụng ly và hiện câu thoại ngẫu nhiên |
| `RỜI BÀN` | Trả ghế hoặc rời hàng chờ |
| `VỖ TAY`, `THẢ TIM` | Cổ vũ trong lúc sân khấu đang diễn |
| `XIN BÀI CHILL`, `XIN BÀI RAP`, `XIN BÀI ROCK` | Xin nhạc tự tạo cho lượt kế. Chill diễn hát, Rap nhún theo nhịp, Rock biểu diễn nhảy |

Mỗi tiết mục kéo dài một phút và có tối đa năm người trên sân khấu. Người tặng quà có thể tham gia khi còn chỗ và còn đủ thời gian. Các lượt tới muộn hoặc vượt quá sức chứa được xếp vào tiết mục kế tiếp. Ghế và ly nước được giữ trong lúc khách biểu diễn rồi khách trở về đúng chỗ. Dùng nút **Thử tặng quà để lên hát** để thử nhiều tên. Bấm **Bật âm thanh** để nghe nhạc, và trình duyệt có giọng tiếng Việt sẽ đọc lời.

Khi vắng quà, sân khấu tự mời khách mẫu. Hái Thứ Hiêu mở màn với lời rap và beat tự tạo, sau đó quán luân phiên mời khách mẫu tại bàn và một người đang đi ngang trước quầy. Người đi ngang rẽ từ vị trí hiện tại lên sân khấu. Khi có quà, khách mẫu sẽ nhường sân khấu cho người tặng.

Nhân viên tự đến hỏi nước khi khách ngồi, kể cả khách mẫu lúc mở quán. Quán chọn ngẫu nhiên trà đá, cà phê hoặc nước mía rồi gom các ly của từng bàn lên một khay. Nút **Xem một lượt phục vụ** dùng cùng luồng phục vụ tự động. Khách đã có nước vẫn giữ ly của mình. Khi rời bàn, khách có nước sẽ tính tiền hoặc đôi khi diễn một cảnh lén chuồn để tạo tình huống vui.

**Chạy thử một buổi LIVE** cho hai khách đi từ đường vào cùng bàn, nhận nước, cụng ly rồi thử tặng quà và cổ vũ. Cần hai ghế trống cùng bàn. **Khung phát 9:16** ẩn bảng điều khiển trong tab đang mở. Bấm **Thoát khung phát** hoặc phím Esc để quay lại.

**Đố vui vỉa hè** cho khách đang ngồi lẫn khách đi ngang 15 giây để trả lời A, B hoặc C. Mỗi tên gửi một đáp án mỗi câu. Khi hết giờ, bảng trên cảnh quán mở đáp án, xướng tên người đúng nhanh nhất và cộng một điểm cho mỗi người trả lời đúng. Câu đố luân phiên qua bộ câu hỏi trước khi lặp lại. Bảng điểm áp dụng cho phiên đang mở và được xóa khi dọn bàn.

## Cấu trúc

- `index.html` chứa giao diện, cảnh SVG và xử lý tương tác.
- `styles.css` chứa bố cục, màu sắc và cách hiển thị trên điện thoại.

## Chạy trên máy

Tải cả hai tệp vào cùng thư mục rồi mở `index.html` bằng trình duyệt.

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


## Quà và mục tiêu ngày

VIP hôm nay xếp theo tổng xu thực nhận (giá một quà nhân số lượng). Quà combo tính khi chuỗi kết thúc. Điểm thưởng của bản cũ được giữ trong dữ liệu cũ và tính riêng với xu. Mục tiêu lần lượt là 100, 500, 1.000, 5.000, 10.000 xu rồi tăng thêm 10.000 mỗi mốc. Quà có giá đơn từ 10.000 xu chạy hiệu ứng sao và hiện tên người tặng.
