# Quán Nước Vỉa Hè

Bản mô phỏng một quán nước tương tác có ba bàn vuông, mỗi bàn bốn ghế. Khách vào bàn, gọi nước, cụng ly và nhường ghế qua ô bình luận giả lập. Khi cả ba bàn đầy, người đến trước được mời vào trước.

[Chơi thử trên Netlify](https://quannuocviahe.netlify.app/)

## Chơi thử

Bấm **Xem một lượt phục vụ** hoặc nhập tên khách và gửi từng lệnh.

| Bình luận | Hành động |
| --- | --- |
| `VÀO BÀN` | Xin ghế trống hoặc vào hàng chờ |
| `ORDER TRÀ ĐÁ`, `ORDER CÀ PHÊ`, `ORDER NƯỚC MÍA` | Gọi một món từ quầy |
| `CỤNG LY` | Cụng ly với khách cùng bàn đã có nước |
| `LÊN HÁT` | Từ ghế lên sân khấu, biểu diễn rồi trở về trong khoảng 15 giây. Hiện lời trên sân khấu và đọc theo nếu thiết bị có giọng tiếng Việt |
| `RỜI BÀN` | Trả ghế hoặc rời hàng chờ |

## Cấu trúc

- `index.html` chứa giao diện, cảnh SVG và xử lý tương tác.
- `styles.css` chứa bố cục, màu sắc và cách hiển thị trên điện thoại.

## Chạy trên máy

Tải cả hai tệp vào cùng thư mục rồi mở `index.html` bằng trình duyệt.

Bản thử xử lý bình luận ngay trên trang và tự tạo khách mẫu đi hai chiều trên đường trước quầy. Để thử ảnh đại diện, điền tên và URL ảnh HTTPS rồi bấm **Thử khách ghé LIVE** hoặc **Vào bàn**.

Bản thử chưa kết nối TikTok LIVE. Cầu nối sự kiện trong trình duyệt có thể gửi tên hiển thị và URL ảnh đại diện lấy từ nguồn LIVE:

```js
window.dispatchEvent(new CustomEvent('quannuoc:viewer', {
  detail: {name: displayName, avatarUrl: profilePhotoUrl}
}));
```

Sự kiện này chỉ hiển thị khách đi ngang. Bình luận giả lập vẫn được xử lý riêng trong từng phiên.
