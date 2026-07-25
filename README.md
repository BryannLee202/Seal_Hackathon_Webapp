# Seal Hackathon Webapp

Hệ thống quản lý và chấm điểm cuộc thi hackathon: đăng ký đội, nộp bài, phân công giám khảo, chấm điểm theo tiêu chí, xếp hạng và công bố kết quả.

**Demo trực tuyến:** https://sealhackathon.onrender.com

## Kiến trúc

Monorepo gồm 3 phần:

```
├── backend/    Spring Boot 4 (Java 21) — REST API, nghiệp vụ chính, JWT auth, JPA/PostgreSQL
├── bff/        Node.js (NestJS) — Backend-For-Frontend, giữ JWT trong cookie httpOnly, proxy sang backend
└── frontend/   React + TypeScript + Vite — giao diện người dùng
```

Luồng dữ liệu: `Trình duyệt → frontend (React) → bff (Node) → backend (Spring Boot) → PostgreSQL`

BFF tồn tại để trình duyệt không bao giờ thấy JWT trực tiếp — token được lưu trong cookie `httpOnly`, mọi request từ frontend đi qua BFF trước khi tới backend thật.

## Vai trò người dùng

- **Coordinator** (Ban tổ chức): tạo sự kiện, vòng thi, Hạng mục, tiêu chí chấm điểm, phân công giám khảo, công bố kết quả, duyệt tài khoản.
- **Team Leader / Team Member**: tạo/tham gia đội, đăng ký Hạng mục, nộp bài theo từng vòng thi.
- **Judge** (giám khảo, bao gồm giám khảo khách mời): chấm điểm bài nộp được phân công theo tiêu chí.
- **Mentor**: theo dõi các đội trong Hạng mục được phân công.

## Chạy dự án tại local

Xem hướng dẫn chi tiết từng phần:
- [backend/README.md](backend/README.md) — cấu hình, biến môi trường, cách chạy, test
- `bff/` — `npm install && npm run build && npm start` (cần biến `BACKEND_URL`, `CORS_ALLOWED_ORIGINS`)
- `frontend/` — `npm install && npm run dev` (cần biến `VITE_BFF_URL`)

Hoặc chạy toàn bộ bằng Docker Compose (đã có `postgres` + `backend` + `bff` + `frontend`):

```bash
docker compose up --build
```

## Công nghệ sử dụng

- **Backend**: Spring Boot 4, Spring Security (JWT), Spring Data JPA, Flyway (quản lý schema DB), springdoc-openapi (Swagger)
- **BFF**: NestJS, Axios, cookie-parser
- **Frontend**: React 19, TypeScript, Vite, React Router
- **Database**: PostgreSQL

## Tài liệu API

Sau khi chạy backend, xem Swagger UI tại `/swagger-ui.html` (local: `http://localhost:8080/swagger-ui.html`).

## Giấy phép

Phát hành theo giấy phép [MIT](LICENSE).
