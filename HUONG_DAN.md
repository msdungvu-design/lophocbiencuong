# Hướng dẫn đưa website "Lớp học biên cương" lên mạng

## Cấu hình đang sử dụng: Vercel

- Website chính thức để đưa vào hồ sơ, mã QR và chia sẻ: **https://lophocbiencuong.vercel.app/**.
- Repository: https://github.com/msdungvu-design/lophocbiencuong, nhánh `main`.
- `index.html` khai báo cùng tên miền cho `canonical`, `og:url`, `og:image` và `twitter:image`.
- Ảnh chia sẻ: **https://lophocbiencuong.vercel.app/og-image.jpg**, JPEG 1200 × 630 px. Ảnh sử dụng hình lớp học `home_hero.jpg` cùng màu xanh đậm – vàng hiện có của website.
- Các thẻ chia sẻ nằm sẵn trong HTML, không cần chạy JavaScript để đọc.

### Xác nhận sau khi triển khai

1. Trong dự án Vercel liên kết với repository này, kiểm tra deployment của commit mới nhất trên `main` có trạng thái **Ready**, là deployment **Production**, và tên miền `lophocbiencuong.vercel.app` trỏ tới deployment đó. Nếu chưa có deployment tự động, dùng **Redeploy**. Đây là website tĩnh, không cần thêm bước build cho thay đổi metadata/ảnh.
2. Mở https://lophocbiencuong.vercel.app/ và https://lophocbiencuong.vercel.app/og-image.jpg. Cả hai phải trả HTTP 200; đường dẫn ảnh phải hiển thị ảnh thực, không phải trang HTML/404. Ảnh phải có Content-Type `image/jpeg` và kích thước 1200 × 630 px.
3. Xem **mã nguồn trang** (View Page Source), tìm `canonical`, `og:url`, `og:image`, `twitter:image`. Tất cả phải dùng `https://lophocbiencuong.vercel.app/`; không còn tên miền Netlify trong các thẻ này. `og:image:width`/`height` phải khớp với ảnh thực. Kiểm tra cả tab VI/EN và các tab nội dung để xác nhận giao diện hoạt động như trước.
4. Với Facebook/Messenger, mở https://developers.facebook.com/tools/debug/, nhập URL chính thức rồi bấm **Debug**, sau đó **Scrape Again** để làm mới bản xem trước. Có thể cần đăng nhập Facebook. Xác nhận ảnh, tên dự án và mô tả xuất hiện đúng.
5. Thử dán URL chính thức vào một tin nhắn mới trên Zalo/Messenger. Các nền tảng giữ cache riêng; tin nhắn cũ có thể vẫn hiển thị ảnh cũ. Nếu ảnh đã truy cập công khai được nhưng bản xem trước chưa đổi, chờ cache cập nhật rồi thử lại. Nếu thay ảnh trong tương lai, có thể dùng tên tệp ảnh có phiên bản mới và cập nhật đồng thời cả `og:image`/`twitter:image` để tránh cache ảnh cũ.

### Lưu ý về hướng dẫn cũ bên dưới

Các phần Netlify/Decap CMS dưới đây là phương án triển khai trước đây, không phải cấu hình Vercel hiện tại. Repository hiện chưa có thư mục `admin/`, `images/` hoặc các tệp cấu hình CMS được mô tả trong phương án cũ. Không dùng tên miền Netlify bên dưới làm đường dẫn chính trong hồ sơ; không mặc định rằng `/admin/` đang hoạt động.

---

## Tài liệu triển khai Netlify trước đây (tham khảo)

Thư mục này (`site`) là toàn bộ website. Cấu trúc:

```
site/
├── index.html         ← trang web chính
├── content.json       ← nội dung song ngữ (biên tập viên sửa file này qua /admin)
├── admin/             ← trang quản trị (đăng nhập để sửa nội dung)
│   ├── index.html
│   └── config.yml
└── images/            ← nơi chứa ảnh tải lên
```

---

## PHẦN 1 — Cách NHANH NHẤT để có link nộp (khoảng 2 phút)

Dùng khi chỉ cần một địa chỉ web để dán vào hồ sơ/QR. (Cách này **chưa** có đăng nhập biên tập.)

1. Mở trình duyệt, vào **https://app.netlify.com/drop**
2. **Kéo–thả nguyên thư mục `site`** vào ô trên trang đó.
3. Đợi vài giây → Netlify tạo ngay một địa chỉ dạng `https://ten-ngau-nhien.netlify.app`. Đó là link website đang chạy thật.
4. Muốn đổi tên đẹp: đăng nhập Netlify (miễn phí) → *Site settings → Change site name* → đổi thành ví dụ `lophocbiencuong` → link thành `https://lophocbiencuong.netlify.app`.

> Gửi link này cho tôi, tôi sẽ tạo **mã QR** để chị chèn vào hồ sơ.

---

## PHẦN 2 — Bản đầy đủ có ĐĂNG NHẬP BIÊN TẬP (thêm ~15 phút)

Để có trang `/admin` cho biên tập viên đăng nhập, sửa nội dung và tải ảnh, cần đưa lên qua GitHub (để lưu thay đổi).

### Bước 1. Tạo tài khoản & kho lưu trữ GitHub
1. Tạo tài khoản miễn phí tại **https://github.com**
2. Bấm **New repository** → đặt tên (vd `lop-hoc-bien-cuong`) → chọn **Public** → **Create**.
3. Trong repo, bấm **Add file → Upload files** → kéo–thả **toàn bộ các file bên trong thư mục `site`** (index.html, content.json, thư mục admin, thư mục images) → **Commit changes**.

### Bước 2. Đưa lên Netlify
1. Tạo tài khoản tại **https://app.netlify.com** (đăng nhập bằng GitHub cho nhanh).
2. **Add new site → Import an existing project → GitHub** → chọn repo vừa tạo.
3. Để trống phần build, bấm **Deploy**. Vài phút sau có link `https://....netlify.app`.

### Bước 3. Bật đăng nhập (Netlify Identity)
1. Vào **Site configuration → Identity → Enable Identity**.
2. Mục **Registration** chọn **Invite only** (chỉ người được mời mới vào được).
3. Kéo xuống **Services → Git Gateway → Enable Git Gateway**.

### Bước 4. Mời biên tập viên
1. Tab **Identity → Invite users** → nhập email của biên tập viên → **Send**.
2. Người đó nhận email, bấm link, đặt mật khẩu.

### Bước 5. Biên tập nội dung
1. Vào `https://<tên-site>.netlify.app/admin/` → đăng nhập.
2. Mở **Nội dung website → Nội dung các trang**: sửa chữ song ngữ, thêm thẻ kết quả, thêm bước lộ trình, **tải ảnh lên**, dán link video/bài báo…
3. Bấm **Publish** → website tự cập nhật sau ~1 phút.

---

## Ghi chú quan trọng

- **Phân quyền:** Decap CMS cho **mọi người được mời** đều sửa được nội dung (đăng nhập = biên tập). Việc tách vai trò "admin riêng / biên tập riêng" ở mức chi tiết thì công cụ miễn phí này chưa làm được — nếu bắt buộc phải có, cần bản app tự lập trình (React + Supabase), tôi hỗ trợ được nhưng công phu hơn.
- **Thêm / bớt TAB:** có thể sửa tên tab trong mục *Menu (VI/EN)*. Việc thêm hẳn một tab MỚI với bố cục riêng là thay đổi cấu trúc (nâng cao) — nhắn tôi, tôi chỉnh giúp.
- **Ảnh trẻ em:** chỉ đăng ảnh đã được đồng ý hoặc đã làm mờ mặt, đúng nguyên tắc bảo vệ trẻ em ghi trong website.
- **Xem thử trên máy:** mở trực tiếp `index.html` vẫn xem được (dùng bản nội dung nhúng sẵn). Khi đã đăng web, phần biên tập trong `content.json` sẽ được ưu tiên hiển thị.
