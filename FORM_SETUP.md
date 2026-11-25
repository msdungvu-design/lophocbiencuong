# Gửi đăng ký ngay trên website

**Trạng thái:** đã chuẩn bị luồng gửi; chưa kích hoạt tiếp nhận thật vì chưa có
Form ID của dự án. Không ghép mã này vào `main` trước khi cấu hình và kiểm tra
dịch vụ. Không điền Form ID minh họa hoặc biểu mẫu thuộc tài khoản khác.

Người đăng ký điền biểu mẫu hiện có, bấm **Gửi thông tin · Submit** và nhận
thông báo ngay trong cửa sổ đó, không mở email, không cần tài khoản Formspree.
Formspree lưu đăng ký trong dashboard riêng của đơn vị quản lý và gửi thông báo
đến `lophocbiencuong@gmail.com`. Website xác nhận **tiếp nhận đăng ký**, không
khẳng định email đã được giao đến hộp thư hay người đăng ký đã được tuyển chọn.

## So sánh trước khi lựa chọn dịch vụ — 27/10/2026

| Phương án | Người đăng ký | Cấu hình / vận hành | Dữ liệu và giới hạn |
| --- | --- | --- | --- |
| **Formspree (đề xuất cho website hiện tại)** | Gửi trực tiếp trong biểu mẫu hiện có bằng HTTPS POST, nhận kết quả ngay trên web | Tạo form và xác minh email nhận; không cần backend, API key hoặc đổi cấu hình build Vercel | Dashboard riêng + thông báo email; gói Free hiện 50 lượt/tháng, lịch sử 30 ngày. Cần theo dõi quota và quản lý cả bản sao trong Gmail |
| Vercel Function + Resend | Gửi trực tiếp, giữ nguyên giao diện | Cần API key trong biến môi trường Vercel, tên miền gửi thuộc quyền sở hữu đã xác minh DNS, xử lý spam và lỗi phía máy chủ | Email API không thay thế kho đăng ký; muốn tra cứu bền vững cần thêm cơ sở dữ liệu và phân quyền |
| Vercel Function + Google Apps Script / Sheets | Gửi trực tiếp, giữ nguyên giao diện | Triển khai Apps Script và kiểm soát truy cập qua máy chủ; thêm xác thực, quota, lọc spam và bảo vệ bảng tính | Dễ xem danh sách nhưng phải giữ Sheets riêng tư, xử lý xóa dữ liệu và bảo trì thêm mã |

Formspree được đề xuất vì giữ website tĩnh và giảm thao tác cho người đăng ký.
Không dùng Netlify Forms trên tên miền Vercel, `mailto:`, iframe Google Forms,
hoặc `fetch(..., {mode: 'no-cors'})` để giả lập gửi thành công.

Nguồn chính thức:

- https://vercel.com/kb/guide/deploying-react-forms-using-formspree-with-vercel
- https://help.formspree.io/articles/building-your-form/submit-forms-with-javascript-ajax/
- https://formspree.io/plans
- https://help.formspree.io/articles/form-and-project-settings/restrict-to-domain/
- https://help.formspree.io/articles/building-your-form/honeypot-spam-filtering
- https://help.formspree.io/articles/form-and-project-settings/recaptcha-settings
- https://formspree.io/legal/privacy-policy/
- https://vercel.com/kb/guide/sending-emails-from-an-application-on-vercel
- https://resend.com/docs/dashboard/domains/introduction
- https://developers.google.com/apps-script/guides/web

## Kích hoạt một lần

1. Người quản lý dự án tạo/đăng nhập tài khoản tại https://formspree.io/ bằng
   tài khoản của dự án. Tạo form **Border Classroom — Join**; đặt email nhận
   là **lophocbiencuong@gmail.com** và hoàn thành xác minh email. Không gửi
   mật khẩu, mã OTP hay API key qua chat hoặc đưa vào repository.
2. Trong phần cài đặt project, đặt **Restrict to Domain** thành chính xác
   `lophocbiencuong.vercel.app`, không điền `vercel.app`. Thiết lập này dùng
   Referer để lọc spam, không phải xác thực người dùng. Với preview khác miền,
   dùng form thử riêng hoặc kiểm tra trên production khi đã cho phép đúng miền;
   không mở toàn bộ `*.vercel.app` để thử.
3. Giữ bộ lọc spam của Formspree. Mã đã thêm trường honeypot chuẩn `_gotcha`
   (không hiển thị cho người đăng ký). Với luồng AJAX thuần này, tắt **trang
   chuyển hướng reCAPTCHA mặc định** trong Settings → Spam protection; nếu cần
   CAPTCHA, phải tích hợp khóa CAPTCHA riêng và kiểm tra trước khi bật. Không
   đánh dấu thành công khi chỉ nhận HTML/challenge. Không tắt bộ lọc spam khác.
4. Sao chép endpoint được cấp, ví dụ `https://formspree.io/f/<FORM_ID>`. Chỉ đưa
   phần `<FORM_ID>` thực tế vào `data-formspree-id=""` của `#joinForm` trong
   `index.html`. Đây là mã công khai để nhận bài gửi, không phải API key.
   Email nhận được cấu hình trong dashboard, không nhận từ dữ liệu người gửi.
5. Kiểm tra tài khoản/form đã kích hoạt, quota còn đủ và thông báo trỏ đúng email
   chính thức. Nếu lượng đăng ký vượt gói miễn phí, chọn gói phù hợp trước khi
   triển khai; không tự đăng ký gói trả phí. Chỉ ghép thay đổi khi đã cấu hình.
6. Vercel tiếp tục dùng nhánh `main`, cấu hình website tĩnh hiện tại. Không cần
   thêm serverless function, mật khẩu Gmail, SMTP hay biến môi trường. Sau khi
   ghép, xác nhận deployment **Ready / Production** tương ứng commit mới.

## Bảo vệ dữ liệu

- Chỉ gửi các trường đang có: họ tên, điện thoại, email, nơi ở, vai trò (tất cả
  lựa chọn), hình thức và xác nhận đồng ý liên hệ. Không thêm CCCD, ngày sinh,
  ảnh, địa chỉ nhà chi tiết hay dữ liệu trẻ em. Không tự tích hợp marketing.
- Dữ liệu đi trong HTTPS POST đến endpoint Formspree cố định, không nằm trong
  URL, GitHub, console, localStorage hoặc sessionStorage. Không chèn nguyên văn
  thông báo lỗi từ dịch vụ vào HTML; không tự chuyển hướng theo phản hồi.
- Dòng thông tin dưới form công khai Formspree là bên xử lý kèm liên kết chính
  sách. Dịch vụ có xử lý dữ liệu ở Hoa Kỳ/các nơi hoạt động theo chính sách của
  họ. Đơn vị quản lý cần xem chính sách trước khi kích hoạt; không tuyên bố
  dữ liệu chỉ ở Việt Nam hoặc tuyệt đối không qua bên thứ ba.
- Giữ dashboard và Gmail riêng tư; bật xác thực hai bước, chỉ cấp quyền cho
  người tiếp nhận được giao nhiệm vụ. Không công khai danh sách đăng ký.
- Free giữ lịch sử Formspree 30 ngày; bản sao email có vòng đời riêng. Đề xuất
  đơn vị thống nhất xóa thông tin không còn cần sau 90 ngày và tiếp nhận yêu cầu
  sửa/xóa qua email chính thức. Đây là đề xuất vận hành, chưa phải cơ chế xóa
  tự động hoặc chính sách đã được đơn vị phê duyệt.

## Kiểm tra trước khi xác nhận hoàn tất

Chạy kiểm tra tự động: `node --test tests/join.test.cjs`.

Các kiểm tra mô phỏng phản hồi HTTP không thay thế lần gửi thật dưới đây:

1. Trên điện thoại (ít nhất 375 px) và máy tính (ít nhất 1280 px), mở form,
   kiểm tra đủ sáu nhóm trường và checkbox đồng ý, không tràn ngang, cuộn đến
   được nút gửi và thông báo. Bàn phím Tab/Escape và đóng/mở form phải hoạt động.
2. Bỏ trống trường, dùng email sai, chưa chọn vai trò hoặc chưa đồng ý: không
   có POST. Điền đủ và chọn nhiều vai trò: chỉ có một POST khi bấm liên tiếp.
3. Gửi bản thử có tên **KIỂM TRA WEBSITE — XÓA SAU KHI THỬ** với thông tin liên
   hệ thử do dự án kiểm soát. Người đăng ký không mở ứng dụng email, không bị
   đưa sang trang khác. Chỉ hiện thành công sau HTTP thành công + JSON xác nhận
   `ok: true`; sau đó các trường được xóa. URL không chứa dữ liệu cá nhân.
4. Đối chiếu đủ tất cả trường trong **dashboard Formspree**, kiểm tra thư thông
   báo ở **lophocbiencuong@gmail.com** (kể cả Spam). Không kết luận email giao
   thành công chỉ từ phản hồi API. Xóa đăng ký thử ở dashboard và Gmail.
5. Ngắt mạng, mô phỏng 400/422, 429, 5xx, phản hồi không phải JSON và quá 20 giây:
   có thông báo lỗi, giữ dữ liệu trong form, nút gửi sử dụng lại được. Lỗi kết nối
   có thể xảy ra sau khi dịch vụ nhận dữ liệu; không tự thử lại, cần đối chiếu
   trước khi gửi lại. Form không đảm bảo loại bỏ trùng lặp giữa các thiết bị.
6. Đổi VI/EN, mở toàn bộ bảy tab, kiểm tra email Liên hệ và chặn `content.json`
   để kiểm tra bản dự phòng. Nội dung, ảnh, số liệu, menu và metadata ngoài phạm
   vi sửa phải giống bản trước.

## Quay lại khi gặp lỗi

Nếu dịch vụ đã hoạt động nhưng gặp sự cố, gỡ Form ID để chặn gửi, giữ thông báo
chưa kích hoạt và email hỗ trợ; không trả lại `mailto:` làm nút submit hoặc
giả báo thành công. Có thể revert riêng commit sửa form; thay đổi email liên hệ
được giữ riêng để không quay về email cá nhân.
