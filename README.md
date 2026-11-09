# Quán Nước Vỉa Hè

Bản mô phỏng một quán nước tương tác có ba bàn vuông, mỗi bàn bốn ghế. Khách vào bàn, nhận nước ngẫu nhiên, cụng ly và nhường ghế qua ô bình luận giả lập. Khách có thể ngồi bao lâu tuỳ thích khi quán còn chỗ. Khi đủ 12 ghế và có khách chờ, quán mời khách đã ngồi lâu nhất nhường ghế sau tối thiểu 60 giây. Người chờ được mời theo thứ tự.

[Chơi thử trên Netlify](https://quannuocviahe.netlify.app/)

## Chơi thử

Bấm **Xem một lượt phục vụ** hoặc nhập tên khách và gửi từng lệnh. Nhân viên quầy nhắc lệnh trên khung chơi và ngay dưới ô bình luận.

Khi quán vắng, bàn giữa có Trí, Đào, Mai và Hái Thứ Hiêu. Hai bàn bên mỗi bàn có hai khách mẫu với tên chọn ngẫu nhiên. Nhóm khách mẫu nhường chỗ khi có khách vào bàn và trở lại khi quán vắng.

| Bình luận | Hành động |
| --- | --- |
| `VÀO BÀN` | Xin ghế trống hoặc vào hàng chờ |
| `CỤNG LY` | Cụng ly với khách cùng bàn đã có nước. Khi mọi khách cùng bàn đều hô, cả bàn cụng ly và hiện câu thoại ngẫu nhiên |
| `RỜI BÀN` | Trả ghế hoặc rời hàng chờ |

Mỗi tiết mục kéo dài một phút và có tối đa năm người trên sân khấu. Người tặng quà có thể tham gia khi còn chỗ và còn đủ thời gian. Các lượt tới muộn hoặc vượt quá sức chứa được xếp vào tiết mục kế tiếp. Ghế và ly nước được giữ trong lúc khách biểu diễn rồi khách trở về đúng chỗ. Dùng nút **Thử tặng quà để lên hát** để thử nhiều tên. Bấm **Bật âm thanh** để nghe nhạc, và trình duyệt có giọng tiếng Việt sẽ đọc lời.

Khi vắng quà, sân khấu tự mời khách mẫu. Hái Thứ Hiêu mở màn với lời rap và beat tự tạo, sau đó các khách mẫu được chọn ngẫu nhiên. Khi có quà, khách mẫu sẽ nhường sân khấu cho người tặng.

Nhân viên tự chọn ngẫu nhiên trà đá, cà phê hoặc nước mía cho khách mới, rồi gom các ly của từng bàn lên một khay. Nút **Xem một lượt phục vụ** làm tương tự cho tất cả khách đang ngồi và chưa có nước. Khách đã có nước vẫn giữ ly của mình. Khi rời bàn, khách có nước sẽ tính tiền hoặc đôi khi diễn một cảnh lén chuồn để tạo tình huống vui.

## Cấu trúc

- `index.html` chứa giao diện, cảnh SVG và xử lý tương tác.
- `styles.css` chứa bố cục, màu sắc và cách hiển thị trên điện thoại.

## Chạy trên máy

Tải cả hai tệp vào cùng thư mục rồi mở `index.html` bằng trình duyệt.

Bản thử xử lý bình luận ngay trên trang và tự tạo khách mẫu đi hai chiều trên đường trước quầy. Để thử ảnh đại diện, điền tên và URL ảnh HTTPS rồi bấm **Thử khách ghé LIVE**. Dùng cùng tên để gửi **Vào bàn** hoặc thử tặng quà. Nhân vật đang đi trước quầy sẽ rẽ từ vị trí hiện tại. Khách đã có bàn sẽ đi từ ghế của mình lên sân khấu. Bản giả lập nhận diện một người theo tên, bỏ qua chữ hoa, chữ thường và khoảng trắng thừa. Khi nối TikTok LIVE, nên dùng ID tài khoản để phân biệt những người khác nhau có cùng tên hiển thị.

Bản thử chưa kết nối TikTok LIVE. Cầu nối sự kiện trong trình duyệt có thể gửi tên hiển thị và URL ảnh đại diện lấy từ nguồn LIVE:

```js
window.dispatchEvent(new CustomEvent('quannuoc:viewer', {
  detail: {name: displayName, avatarUrl: profilePhotoUrl}
}));
```

Khi nguồn LIVE xác nhận một lượt tặng quà, cầu nối có thể gửi một sự kiện riêng. Nếu nguồn gửi lại cùng một sự kiện, dùng cùng `eventId` để tránh tạo lượt hát trùng.

```js
window.dispatchEvent(new CustomEvent('quannuoc:gift', {
  detail: {name: displayName, avatarUrl: profilePhotoUrl, eventId: giftEventId}
}));
```

Các sự kiện chỉ chạy trong phiên trình duyệt đang mở. Bình luận giả lập vẫn được xử lý riêng.
