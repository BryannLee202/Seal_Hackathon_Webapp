# Frontend — SEAL Hackathon Management System

React 19 + TypeScript + Vite. Giao diện người dùng cho 4 vai trò: Coordinator (Ban tổ chức), Team
Leader/Member, Judge (giám khảo), Mentor — cùng một trang bình chọn khán giả công khai.

Frontend không bao giờ gọi trực tiếp backend Spring Boot — mọi request đi qua BFF (NestJS), nơi
JWT được giữ trong cookie `httpOnly` mà JavaScript không đọc được:

```text
Trình duyệt (frontend) → bff (Node) → backend (Spring Boot) → PostgreSQL
```

## Cài đặt & chạy

```bash
npm install
npm run dev       # dev server (Vite), mặc định http://localhost:5173
npm run build     # type-check (tsc -b) + build production vào dist/
npm run preview   # xem thử bản build production
npm run lint       # oxlint
npm test          # Vitest, chạy tất cả *.test.tsx trong src/
```

## Biến môi trường

Copy `.env.example` sang `.env.development` (hoặc `.env`) và chỉnh nếu cần:

| Biến           | Ý nghĩa                          | Mặc định (dev)            |
|-----------------|-----------------------------------|-----------------------------|
| `VITE_BFF_URL`  | URL gốc của BFF                   | `http://localhost:4001`     |

## Route map

| Path                              | Vai trò yêu cầu | Trang                          |
|-------------------------------------|-------------------|----------------------------------|
| `/`                                 | công khai          | Landing page                     |
| `/login`, `/register`               | công khai          | Đăng nhập / đăng ký              |
| `/vote`                             | công khai          | Bình chọn khán giả               |
| `/app`                              | đăng nhập          | Dashboard                        |
| `/rankings`                         | đăng nhập          | Bảng xếp hạng                    |
| `/my-team`                          | đăng nhập          | Đội thi của tôi                  |
| `/judge`                            | JUDGE              | Chấm điểm                        |
| `/mentor`                           | MENTOR             | Theo dõi đội được phân công      |
| `/coordinator/events`, `/coordinator/events/:eventId`, `/coordinator/users`, `/coordinator/audit-log` | COORDINATOR | Quản lý sự kiện, duyệt tài khoản, nhật ký kiểm tra |
| `*`                                 | —                  | 404                               |

Điều hướng dựa trên `ProtectedRoute` (`src/components/ProtectedRoute.tsx`) + `AuthContext`
(`src/context/AuthContext.tsx`), vốn xác định trạng thái đăng nhập bằng cách gọi `/api/auth/me` qua
BFF (không lưu token phía client).

## Công nghệ

React 19, TypeScript, Vite, React Router 7, Tailwind CSS, Framer Motion, axios.

## Triển khai

`Dockerfile` build production bằng Vite rồi serve qua nginx (`nginx.conf`, có SPA fallback cho
React Router). Là 1 trong 3 service của `docker-compose.yml` ở thư mục gốc repo
(`postgres` + `backend` + `bff` + `frontend`).
