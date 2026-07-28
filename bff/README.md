# BFF (Backend-For-Frontend) — SEAL Hackathon Management System

NestJS service đứng giữa frontend React và backend Spring Boot. Lý do tồn tại: giữ JWT trong
cookie `httpOnly`, để trình duyệt **không bao giờ** thấy token trực tiếp. Mọi request từ frontend
đi qua BFF, BFF đọc token từ cookie và forward sang backend dưới dạng `Authorization: Bearer`.

```
Trình duyệt → frontend (React) → bff (Node/NestJS, service này) → backend (Spring Boot) → PostgreSQL
```

## Cài đặt & chạy

```bash
npm install
npm run build
npm start          # hoặc: npm run start:dev (watch mode)
```

## Biến môi trường

Copy `.env.example` sang `.env` và chỉnh lại nếu cần:

| Biến                    | Ý nghĩa                                                              | Mặc định (dev)                                |
|-------------------------|-----------------------------------------------------------------------|------------------------------------------------|
| `PORT`                  | Cổng lắng nghe của BFF                                                | `4001`                                          |
| `BACKEND_URL`            | URL gốc của backend Spring Boot                                       | `http://localhost:8080`                         |
| `CORS_ALLOWED_ORIGINS`  | Danh sách origin được phép gọi (phân tách bằng dấu phẩy)              | `http://localhost:3000,http://localhost:5173`   |
| `NODE_ENV`               | `production` bật `Secure`/`SameSite=None` cho cookie (cross-subdomain)| `development`                                   |

## Route map

| Controller             | Base path                                    | Ghi chú                                                                 |
|-------------------------|-----------------------------------------------|--------------------------------------------------------------------------|
| `AuthController`         | `/api/auth/*` (register, login, refresh, logout, me) | Set/clear cookie auth + CSRF                                       |
| `DashboardController`    | `/api/bff/*`                                   | Gộp nhiều lời gọi backend thành 1 response cho các màn hình dashboard    |
| `VotingController`       | `POST /api/public/voting/tracks/:trackId/votes` | Set cookie `shms_voter` (token bình chọn ẩn danh) — cần xử lý Set-Cookie nên tách khỏi proxy chung |
| `HealthController`       | `GET /health`                                  | Dùng cho Docker `HEALTHCHECK` / compose `depends_on: condition: service_healthy` |
| `ProxyController`        | `/api/*` (catch-all)                           | Forward mọi route `/api/**` còn lại, đính kèm Bearer token từ cookie      |

## Cookie

| Tên              | httpOnly | Vai trò                                            | SameSite (dev / prod) |
|-------------------|----------|------------------------------------------------------|-------------------------|
| `shms_at`         | ✅        | Access token (1h)                                     | Lax / None              |
| `shms_rt`         | ✅        | Refresh token (7 ngày)                                | Lax / None              |
| `shms_voter`      | ✅        | Token định danh người bình chọn ẩn danh (180 ngày)     | Lax / None              |
| `XSRF-TOKEN`      | ❌ (JS phải đọc được) | Double-submit CSRF token, cấp cùng lúc với auth cookie | Lax / None |

`SameSite=None` chỉ bật ở `NODE_ENV=production` vì frontend và BFF chạy trên 2 subdomain khác nhau
của `onrender.com` (cross-site theo định nghĩa của trình duyệt). Ở local cả hai chạy trên
`localhost` (khác port, vẫn same-site) nên dùng `Lax`, không cần HTTPS.

## CSRF

Vì cookie auth dùng `SameSite=None` ở production (tự làm mất cơ chế chống CSRF mặc định của trình
duyệt), BFF áp dụng double-submit cookie: mọi request state-changing (không phải GET/HEAD/OPTIONS)
**có kèm cookie session** (`shms_at`/`shms_rt`) bắt buộc phải có header `X-XSRF-TOKEN` khớp với giá
trị cookie `XSRF-TOKEN` (xem `src/common/csrf.guard.ts`). Request ẩn danh (login, register, bình
chọn công khai) không bị chặn vì chưa có quyền phiên nào để giả mạo.

Phía frontend, axios tự đọc/gửi cặp cookie/header này khi cấu hình `xsrfCookieName`/`xsrfHeaderName`/`withXSRFToken`
(xem `frontend/src/api/client.ts`).

## Rate limit

`/api/auth/login` và `/api/auth/register` giới hạn 5 request/phút/IP (`@nestjs/throttler`), các
route khác giới hạn chung 30 request/phút/IP. Chạy sau reverse proxy của Render nên `main.ts` đã
bật `trust proxy` để `req.ip` phản ánh đúng IP người dùng thật.

## Test & lint

```bash
npm test      # Jest, chạy tất cả *.spec.ts trong src/
npm run lint  # ESLint
```

## Ghi chú kỹ thuật

- NestJS đang ở major v10. Có nâng lên v11 hay không sẽ để làm riêng ở một đợt sau — rủi ro
  regression không tương xứng với việc chỉ đang vá các lỗ hổng bảo mật/thiếu sót ở đợt này.
