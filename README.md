# Quán Nước Vỉa Hè

Bản mô phỏng một quán nước tương tác có bàn vuông bốn ghế. Khách vào bàn, gọi nước, cụng ly và nhường ghế qua ô bình luận giả lập. Khi bàn đầy, người đến trước được mời vào trước.

[Chơi thử trên Netlify](https://quannuocviahe.netlify.app/)

## Chơi thử

Bấm **Xem một lượt phục vụ** hoặc nhập tên khách và gửi từng lệnh.

| Bình luận | Hành động |
| --- | --- |
| `VÀO BÀN` | Xin ghế trống hoặc vào hàng chờ |
| `ORDER TRÀ ĐÁ`, `ORDER CÀ PHÊ`, `ORDER NƯỚC MÍA` | Gọi một món từ quầy |
| `CỤNG LY` | Cụng ly với khách đã có nước |
| `RỜI BÀN` | Trả ghế hoặc rời hàng chờ |

## Cấu trúc

- `index.html` chứa giao diện, cảnh SVG và xử lý tương tác.
- `styles.css` chứa bố cục, màu sắc và cách hiển thị trên điện thoại.

## Chạy trên máy

Tải cả hai tệp vào cùng thư mục rồi mở `index.html` bằng trình duyệt.

Bản thử xử lý bình luận ngay trên trang. Các phiên mở độc lập và chưa kết nối với TikTok LIVE.
