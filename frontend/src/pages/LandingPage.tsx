import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  IconArrowRight,
  IconCalendar,
  IconGavel,
  IconShieldCheck,
  IconSparkles,
  IconTrophy,
  IconUsers,
} from "../components/icons";
import { MascotBot } from "../components/MascotBot";

const ROUNDS = [
  {
    tag: "VÒNG LOẠI",
    title: "Ý tưởng & Đề xuất giải pháp",
    desc: "Các đội đăng ký Hạng mục, thành lập nhóm 3–5 thành viên và nộp bài dự thi gồm repository, bản demo và tài liệu thuyết minh giải pháp.",
  },
  {
    tag: "VÒNG CHUNG KẾT",
    title: "Hoàn thiện sản phẩm & Bảo vệ",
    desc: "Top đội xuất sắc nhất mỗi Hạng mục (theo quy tắc Top N) bước vào vòng chung kết, hoàn thiện sản phẩm và thuyết trình trước Ban giám khảo.",
  },
  {
    tag: "TRAO GIẢI",
    title: "Xếp hạng & Vinh danh",
    desc: "Hệ thống tự động tổng hợp điểm có trọng số từ toàn bộ giám khảo, xếp hạng minh bạch và công bố kết quả, trao giải theo từng Hạng mục.",
  },
];

const CRITERIA = [
  { name: "Tính sáng tạo", weight: 20, desc: "Mức độ mới mẻ và sáng tạo của ý tưởng, giải pháp" },
  { name: "Tính khả thi kỹ thuật", weight: 30, desc: "Chất lượng kỹ thuật, độ hoàn thiện và khả năng triển khai" },
  { name: "Trải nghiệm người dùng", weight: 20, desc: "Giao diện, trải nghiệm sử dụng và giá trị mang lại" },
  { name: "Thuyết trình & Demo", weight: 30, desc: "Chất lượng thuyết trình, demo và khả năng truyền đạt" },
];

const ROLES = [
  { icon: <IconUsers />, name: "Team Member / Leader", desc: "Thành lập đội, mời thành viên, đăng ký Hạng mục và nộp bài dự thi qua từng vòng." },
  { icon: <IconShieldCheck />, name: "Mentor", desc: "Đồng hành, hướng dẫn các đội trong Hạng mục được phân công xuyên suốt cuộc thi." },
  { icon: <IconGavel />, name: "Judge (Nội bộ / Khách mời)", desc: "Chấm điểm độc lập theo từng tiêu chí — mọi điểm số được ghi nhận riêng biệt, minh bạch." },
  { icon: <IconCalendar />, name: "Event Coordinator", desc: "Ban tổ chức toàn quyền cấu hình sự kiện, vòng thi, phân công và công bố kết quả." },
];

export function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="landing">
      <LandingNav loggedIn={!!user} />

      <section className="l-hero">
        <div className="l-hero-glow" />
        <div className="l-orb l-orb-1" />
        <div className="l-orb l-orb-2" />
        <div className="l-orb l-orb-3" />
        <div className="l-orb l-orb-4" />
        <div className="l-orb l-orb-5" />
        <div className="l-orb l-orb-6" />
        <div className="l-hero-mascot">
          <MascotBot size={190} />
        </div>
        <div className="l-container l-hero-inner">
          <div className="l-badge">
            <IconSparkles width={14} height={14} />
            SEAL Hackathon · RBL Research
          </div>
          <h1 className="l-hero-title">
            <span className="l-gradient-text">SEAL HACKATHON</span>
            <br />
            Ý tưởng phần mềm,
            <br />
            hiện thực hoá.
          </h1>
          <p className="l-hero-subtitle">Quản lý cuộc thi hackathon toàn diện — minh bạch, tự động, tin cậy.</p>
          <div className="l-hero-actions">
            {user ? (
              <Link className="l-btn-primary" to="/app">
                Vào hệ thống <IconArrowRight width={16} height={16} />
              </Link>
            ) : (
              <>
                <Link className="l-btn-primary" to="/register">
                  Đăng ký dự thi <IconArrowRight width={16} height={16} />
                </Link>
                <Link className="l-btn-ghost" to="/login">
                  Đăng nhập
                </Link>
              </>
            )}
          </div>

          <div className="l-stats">
            <div className="l-stat">
              <div className="l-stat-value">3</div>
              <div className="l-stat-label">Vòng thi chuẩn hoá</div>
            </div>
            <div className="l-stat">
              <div className="l-stat-value">5</div>
              <div className="l-stat-label">Vai trò nghiệp vụ</div>
            </div>
            <div className="l-stat">
              <div className="l-stat-value">100%</div>
              <div className="l-stat-label">Nhật ký kiểm tra minh bạch</div>
            </div>
            <div className="l-stat">
              <div className="l-stat-value">RBL</div>
              <div className="l-stat-label">Nghiên cứu độ tin cậy giám khảo</div>
            </div>
          </div>
        </div>
      </section>

      <section className="l-section" id="about">
        <div className="l-container">
          <div className="l-eyebrow">Về cuộc thi</div>
          <h2 className="l-section-title">Vận hành minh bạch, đánh giá công bằng</h2>
          <p className="l-section-desc">
            Số hoá toàn bộ quy trình chấm giải — thay thế Excel rời rạc — đồng thời là công cụ nghiên cứu{" "}
            <strong>độ tin cậy liên đánh giá viên</strong>.
          </p>

          <div className="l-feature-grid">
            <div className="l-feature-card">
              <div className="l-feature-icon">
                <IconCalendar />
              </div>
              <h3>Quản lý đa vòng, đa hạng mục</h3>
              <p>Cấu hình linh hoạt nhiều vòng thi, hạng mục thi đấu và quy tắc thăng vòng Top N cho mỗi sự kiện.</p>
            </div>
            <div className="l-feature-card">
              <div className="l-feature-icon">
                <IconGavel />
              </div>
              <h3>Chấm điểm theo tiêu chí có trọng số</h3>
              <p>Mỗi giám khảo chấm độc lập theo từng tiêu chí; điểm số được lưu chi tiết, không gộp mập mờ.</p>
            </div>
            <div className="l-feature-card">
              <div className="l-feature-icon">
                <IconTrophy />
              </div>
              <h3>Xếp hạng & thăng vòng tự động</h3>
              <p>Hệ thống tự tính điểm trọng số, xếp hạng theo Hạng mục và toàn sự kiện ngay khi có đủ điểm.</p>
            </div>
            <div className="l-feature-card">
              <div className="l-feature-icon">
                <IconShieldCheck />
              </div>
              <h3>Nhật ký kiểm tra đầy đủ</h3>
              <p>Mọi hành động chấm điểm, phê duyệt, loại đội đều được ghi log bất biến — sẵn sàng giải trình.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="l-section l-section-dark" id="timeline">
        <div className="l-container">
          <div className="l-eyebrow">Lộ trình thi đấu</div>
          <h2 className="l-section-title light">3 chặng, một hành trình minh bạch</h2>
          <div className="l-timeline">
            {ROUNDS.map((r, i) => (
              <div className="l-timeline-item" key={r.title}>
                <div className="l-timeline-index">{String(i + 1).padStart(2, "0")}</div>
                <div className="l-timeline-tag">{r.tag}</div>
                <h3>{r.title}</h3>
                <p>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="l-section" id="criteria">
        <div className="l-container">
          <div className="l-eyebrow">Tiêu chí chấm điểm</div>
          <h2 className="l-section-title">Bộ tiêu chí mẫu — minh bạch trọng số</h2>
          <p className="l-section-desc">
            Mỗi sự kiện kế thừa mẫu tiêu chí mặc định và có thể tuỳ chỉnh trọng số riêng theo từng vòng thi.
          </p>
          <div className="l-criteria-grid">
            {CRITERIA.map((c) => (
              <div className="l-criteria-card" key={c.name}>
                <div className="l-criteria-weight">{c.weight}%</div>
                <div>
                  <h4>{c.name}</h4>
                  <p>{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="l-section l-section-dark" id="roles">
        <div className="l-container">
          <div className="l-eyebrow">Vai trò tham gia</div>
          <h2 className="l-section-title light">Một nền tảng, đủ mọi vai trò</h2>
          <div className="l-roles-grid">
            {ROLES.map((r) => (
              <div className="l-role-card" key={r.name}>
                <div className="l-role-icon">{r.icon}</div>
                <h3>{r.name}</h3>
                <p>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="l-cta">
        <div className="l-container l-cta-inner">
          <h2>Sẵn sàng tham gia SEAL Hackathon?</h2>
          <p>Đăng ký tài khoản, thành lập đội thi và bắt đầu hành trình chinh phục thử thách công nghệ.</p>
          <div className="l-hero-actions center">
            <Link className="l-btn-primary" to={user ? "/app" : "/register"}>
              {user ? "Vào hệ thống" : "Bắt đầu ngay"} <IconArrowRight width={16} height={16} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="l-footer">
        <div className="l-container l-footer-inner">
          <div className="l-footer-brand">
            <div className="l-footer-mark">SH</div>
            SEAL Hackathon
          </div>
          <div className="muted" style={{ fontSize: 13 }}>
            © 2026 SEAL Hackathon Management System — Ngành Kỹ thuật Phần mềm.
          </div>
        </div>
      </footer>
    </div>
  );
}

function LandingNav({ loggedIn }: { loggedIn: boolean }) {
  return (
    <header className="l-nav">
      <div className="l-container l-nav-inner">
        <div className="l-nav-brand">
          <div className="l-nav-mark">SH</div>
          SEAL Hackathon
        </div>
        <nav className="l-nav-links">
          <a href="#about">Về cuộc thi</a>
          <a href="#timeline">Lộ trình</a>
          <a href="#criteria">Tiêu chí</a>
          <a href="#roles">Vai trò</a>
        </nav>
        <div className="l-nav-actions">
          {loggedIn ? (
            <Link className="l-btn-primary small" to="/app">
              Vào hệ thống
            </Link>
          ) : (
            <>
              <Link className="l-btn-ghost small" to="/login">
                Đăng nhập
              </Link>
              <Link className="l-btn-primary small" to="/register">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
