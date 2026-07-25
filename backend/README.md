# Hackathon Backend

Backend API cho hệ thống quản lý và chấm điểm cuộc thi hackathon Seal — xây dựng bằng Spring Boot 4 (Java 21).

Repository: https://github.com/BryannLee202/Seal_Hackathon_Webapp

## Kiến trúc

Project được tổ chức theo mô hình phân lớp cổ điển của Spring Boot:

```
src/main/java/com/seal/hackathon/
├── controller/     REST endpoint, chỉ nhận request/trả response, không chứa logic nghiệp vụ
├── service/        Toàn bộ logic nghiệp vụ, kiểm tra quyền sở hữu, @Transactional
├── repository/      Spring Data JPA repository
├── domain/
│   ├── entity/      JPA entity
│   └── enums/       Enum dùng chung (RoleName, ScopeType, TeamStatus, ...)
├── dto/             Request/Response DTO theo từng domain (không trả entity trực tiếp ra API)
├── security/        JWT filter, AuthenticatedPrincipal, JwtService
├── config/          SecurityConfig, CORS, OpenAPI
└── exception/       ApiException, GlobalExceptionHandler (@RestControllerAdvice)
```

Một số nguyên tắc chính:
- **Phân quyền hai lớp**: vai trò tĩnh (`@PreAuthorize("hasRole(...)")` ở controller cho các thao tác quản trị) kết hợp kiểm tra quyền sở hữu động trong service (ví dụ: chỉ thành viên đội, giám khảo được phân công đúng vòng thi, hoặc mentor của đúng Hạng mục mới được xem bài nộp/điểm số của đội đó).
- **Schema quản lý bằng Flyway** (`src/main/resources/db/migration`), `ddl-auto: validate` — không dùng auto-update schema.
- **Audit log** riêng (`AuditService`) ghi lại các hành động quan trọng (duyệt tài khoản, chấm điểm, công bố kết quả...).

## Yêu cầu môi trường

- JDK 21
- PostgreSQL 16 (hoặc tương thích)
- Maven (dùng kèm `./mvnw`, không cần cài Maven riêng)

## Biến môi trường

Toàn bộ cấu hình nhạy cảm đọc qua biến môi trường trong `application.yml`. Khi chạy local, có thể tạo file `.env` (không commit) hoặc export trực tiếp trước khi start:

| Biến | Bắt buộc | Mô tả | Mặc định (chỉ dùng cho dev) |
|---|---|---|---|
| `DB_URL` | Không | JDBC URL PostgreSQL | `jdbc:postgresql://localhost:5432/seal_hackathon` |
| `DB_USERNAME` | Không | User DB | `seal_admin` |
| `DB_PASSWORD` | **Có (khi deploy)** | Mật khẩu DB | `seal_password` |
| `JWT_SECRET` | **Có (khi deploy)** | Secret ký JWT, base64-encoded, tối thiểu 256-bit | secret dev có sẵn trong repo |
| `JWT_ACCESS_EXP_MS` | Không | Thời hạn access token (ms) | `3600000` (1 giờ) |
| `JWT_REFRESH_EXP_MS` | Không | Thời hạn refresh token (ms) | `604800000` (7 ngày) |
| `CORS_ALLOWED_ORIGINS` | Không | Danh sách origin FE được phép, phân cách bởi dấu phẩy | `http://localhost:3000,http://localhost:4000` |
| `SERVER_PORT` | Không | Port HTTP | `8080` |

> ⚠️ **Quan trọng khi deploy production**: bắt buộc override `JWT_SECRET` và `DB_PASSWORD` bằng giá trị riêng, không dùng giá trị mặc định trong `application.yml` — giá trị đó chỉ để tiện chạy dev local và đã lộ công khai trong mã nguồn.

## Spring Profiles

Cấu hình được tách theo profile:

- `application.yml`: cấu hình chung, **không có giá trị mặc định** cho secret/credential (`DB_URL`, `DB_PASSWORD`, `JWT_SECRET`, `CORS_ALLOWED_ORIGINS`) — nếu thiếu biến môi trường tương ứng, ứng dụng sẽ báo lỗi ngay khi khởi động thay vì âm thầm chạy với giá trị không mong muốn.
- `application-dev.yml`: cung cấp giá trị mặc định tiện dùng cho máy dev local (DB `localhost`, JWT secret dev). Đây là profile mặc định khi không set `SPRING_PROFILES_ACTIVE`.
- `application-prod.yml`: chỉ chỉnh log level, **không** có giá trị mặc định nhạy cảm — buộc người vận hành phải tự cấu hình đầy đủ biến môi trường thật.

Chạy với profile cụ thể:

```bash
SPRING_PROFILES_ACTIVE=prod ./mvnw spring-boot:run
```

## Chạy dự án

```bash
# Tạo database PostgreSQL trống tên `seal_hackathon` trước khi chạy lần đầu (Flyway sẽ tự tạo schema)

./mvnw spring-boot:run
```

Sau khi chạy, API mặc định lắng nghe tại `http://localhost:8080` (dùng profile `dev` với giá trị mặc định ở trên).

## Tài liệu API

Swagger UI: `http://localhost:8080/swagger-ui.html`
OpenAPI JSON: `http://localhost:8080/v3/api-docs`

## Kiểm thử

```bash
./mvnw test
```

Test bao gồm unit test (Mockito) cho các service nghiệp vụ chính (`AuthService`, `SubmissionService`, `ScoreService`, `GlobalExceptionHandler`) và test context load mặc định của Spring Boot.
