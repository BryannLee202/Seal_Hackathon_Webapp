import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  IconArrowRight,
  IconCalendar,
  IconCpu,
  IconGavel,
  IconGift,
  IconLayers,
  IconShieldCheck,
  IconSparkles,
  IconTrophy,
  IconUsers,
} from "../components/icons";
import { SealEmblem } from "../components/SealEmblem";
import { BrandMark } from "../components/BrandMark";
import { CountUp } from "../components/CountUp";
import { TiltCard } from "../components/TiltCard";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeUp}
      transition={{ duration: 0.55, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}

const STATS = [
  { value: 1240, suffix: "+", label: "Lượt đăng ký" },
  { value: 860, suffix: "+", label: "Bài dự thi" },
  { value: 3, suffix: "", label: "Bảng thi đấu" },
  { value: 20, suffix: " triệu+", label: "Tổng giải thưởng (VNĐ)" },
];

const TRACKS = [
  {
    code: "Bảng A",
    name: "Explorer",
    color: "linear-gradient(135deg, #ffb347, #ff7a33)",
    icon: <IconSparkles />,
    desc: "Dành cho người mới bắt đầu khám phá sức mạnh của AI, tập trung vào ứng dụng mô hình có sẵn và tư duy Prompt Engineering.",
    tags: ["Ứng dụng AI", "Prompt Engineering", "Báo cáo PDF"],
  },
  {
    code: "Bảng B",
    name: "Challenger",
    color: "linear-gradient(135deg, #ff7a33, #e14e0f)",
    icon: <IconLayers />,
    desc: "Thử thách xây dựng sản phẩm thực thụ: phát triển MVP hoàn chỉnh, tích hợp API do Ban tổ chức cung cấp, có Mentor đồng hành.",
    tags: ["Phát triển MVP", "Tích hợp API", "Demo trực tiếp"],
  },
  {
    code: "Bảng C",
    name: "Innovator",
    color: "linear-gradient(135deg, #e14e0f, #a8390a)",
    icon: <IconCpu />,
    desc: "Sân chơi cho những ý tưởng đột phá nhất: xây dựng AI Agent, đóng gói Docker, làm chủ LLM ở tầng kỹ thuật sâu.",
    tags: ["AI Agent", "Docker", "LLM", "pred.csv"],
  },
];

const PRIZES = [
  { track: "Bảng B: Challenger", amount: "10.000.000đ" },
  { track: "Bảng C: Innovator", amount: "10.000.000đ" },
];

const SPONSORS = ["Vietcombank", "VNPT AI", "Trung ương Hội Sinh viên Việt Nam"];

const ROUNDS = [
  {
    tag: "VÒNG LOẠI",
    title: "Ý tưởng & Đề xuất giải pháp",
    desc: "Các đội đăng ký Hạng mục, thành lập nhóm 3-5 thành viên và nộp bài dự thi gồm repository, bản demo và tài liệu thuyết minh giải pháp.",
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

const FEATURES = [
  {
    icon: <IconCalendar />,
    title: "Quản lý đa vòng, đa hạng mục",
    desc: "Cấu hình linh hoạt nhiều vòng thi, hạng mục thi đấu và quy tắc thăng vòng Top N cho mỗi sự kiện.",
  },
  {
    icon: <IconGavel />,
    title: "Chấm điểm theo tiêu chí có trọng số",
    desc: "Mỗi giám khảo chấm độc lập theo từng tiêu chí; điểm số được lưu chi tiết, không gộp mập mờ.",
  },
  {
    icon: <IconTrophy />,
    title: "Xếp hạng & thăng vòng tự động",
    desc: "Hệ thống tự tính điểm trọng số, xếp hạng theo Hạng mục và toàn sự kiện ngay khi có đủ điểm.",
  },
  {
    icon: <IconShieldCheck />,
    title: "Nhật ký kiểm tra đầy đủ",
    desc: "Mọi hành động chấm điểm, phê duyệt, loại đội đều được ghi log bất biến, sẵn sàng giải trình.",
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
  { icon: <IconGavel />, name: "Judge (Nội bộ / Khách mời)", desc: "Chấm điểm độc lập theo từng tiêu chí, mọi điểm số được ghi nhận riêng biệt, minh bạch." },
  { icon: <IconCalendar />, name: "Event Coordinator", desc: "Ban tổ chức toàn quyền cấu hình sự kiện, vòng thi, phân công và công bố kết quả." },
];

export function LandingPage() {
  const { user } = useAuth();
  const registerLabel = "Đăng ký tham gia";

  return (
    <div className="landing">
      <LandingNav loggedIn={!!user} />

      <section className="l-hero">
        <div className="l-hero-glow" />
        <div className="l-orb l-orb-1" />
        <div className="l-orb l-orb-3" />
        <div className="l-orb l-orb-4" />
        <div className="l-container l-hero-grid">
          <div className="l-hero-content">
            <div className="l-badge">
              <IconSparkles width={14} height={14} />
              Nền tảng quản lý & chấm điểm hackathon
            </div>
            <h1 className="l-hero-title">
              Ý tưởng phần mềm, <span className="l-gradient-text">hiện thực hoá.</span>
            </h1>
            <p className="l-hero-subtitle">
              Đăng ký đội, nộp bài, chấm điểm theo tiêu chí và công bố kết quả, số hoá toàn bộ quy trình thi đấu
              hackathon trong một nền tảng minh bạch, tự động.
            </p>
            <div className="l-hero-actions">
              {user ? (
                <Link className="l-btn-primary" to="/app">
                  Vào hệ thống <IconArrowRight width={16} height={16} />
                </Link>
              ) : (
                <>
                  <Link className="l-btn-primary" to="/register">
                    {registerLabel} <IconArrowRight width={16} height={16} />
                  </Link>
                  <Link className="l-btn-ghost" to="/login">
                    Đăng nhập
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="l-hero-visual">
            <div className="l-hero-visual-glow" />
            <SealEmblem size={230} />
            <div className="l-hero-float-card">
              <IconShieldCheck width={20} height={20} />
              <div>
                <strong>Hiệu chuẩn RBL</strong>
                <span>Đo độ lệch chấm điểm giữa các giám khảo trước khi chấm thật</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="l-stats-band">
        <div className="l-container">
          <div className="l-stats-row">
            {STATS.map((s) => (
              <div className="l-stat-col" key={s.label}>
                <div className="l-stat-value">
                  <CountUp target={s.value} suffix={s.suffix} />
                </div>
                <div className="l-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
          <p className="l-stats-note">* Số liệu minh hoạ giao diện, cập nhật theo dữ liệu thực tế khi vận hành chính thức.</p>
        </div>
      </section>

      <section className="l-section" id="tracks">
        <div className="l-container">
          <Reveal>
            <div className="l-eyebrow">Ba chiến tuyến</div>
            <h2 className="l-section-title">Chọn bảng thi phù hợp với bạn</h2>
            <p className="l-section-desc">
              Mỗi bảng thi là một hành trình chinh phục công nghệ khác nhau, từ khám phá AI đến làm chủ hạ tầng.
            </p>
          </Reveal>

          <div className="l-tracks-grid">
            {TRACKS.map((t, i) => (
              <Reveal key={t.code} delay={i * 0.1} className={i === 0 ? "l-track-feature-cell" : undefined}>
                <TiltCard className="l-track-card">
                  <div className="l-track-badge" style={{ background: t.color }}>
                    {t.code} · {t.name}
                  </div>
                  <div className="l-track-icon" style={{ background: t.color }}>
                    {t.icon}
                  </div>
                  <h3>{t.name}</h3>
                  <p>{t.desc}</p>
                  <div className="l-track-tags">
                    {t.tags.map((tag) => (
                      <span className="l-track-tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="l-section" id="about">
        <div className="l-container l-about-split">
          <Reveal className="l-about-lead">
            <h2 className="l-section-title">Vận hành minh bạch, đánh giá công bằng</h2>
            <p className="l-section-desc">
              Số hoá toàn bộ quy trình chấm giải, thay thế Excel rời rạc, đồng thời là công cụ nghiên cứu{" "}
              <strong>độ tin cậy liên đánh giá viên</strong>.
            </p>
            <div className="l-about-fact">
              <span className="l-about-fact-num">20</span>
              <span className="l-about-fact-label">bảng dữ liệu theo dõi toàn bộ vòng đời một lượt thi, từ đăng ký đội đến trao giải</span>
            </div>
          </Reveal>

          <div className="l-about-list">
            {FEATURES.map((f, i) => (
              <Reveal className="l-about-row" key={f.title} delay={i * 0.06}>
                <div className="l-about-row-icon">{f.icon}</div>
                <div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="l-section l-section-dark" id="timeline">
        <div className="l-container">
          <div className="l-eyebrow">Lộ trình thi đấu</div>
          <h2 className="l-section-title light">3 chặng, một hành trình minh bạch</h2>
          <div className="l-roadmap">
            {ROUNDS.map((r, i) => (
              <div className="l-roadmap-item" key={r.title}>
                <div className="l-roadmap-node">{String(i + 1).padStart(2, "0")}</div>
                <div className="l-roadmap-tag">{r.tag}</div>
                <h3>{r.title}</h3>
                <p>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="l-section" id="criteria">
        <div className="l-container">
          <Reveal>
            <div className="l-eyebrow">Tiêu chí chấm điểm</div>
            <h2 className="l-section-title">Bộ tiêu chí mẫu: minh bạch trọng số</h2>
            <p className="l-section-desc">
              Mỗi sự kiện kế thừa mẫu tiêu chí mặc định và có thể tuỳ chỉnh trọng số riêng theo từng vòng thi.
            </p>
          </Reveal>
          <div className="l-criteria-grid">
            {CRITERIA.map((c, i) => (
              <Reveal className="l-criteria-item" key={c.name} delay={i * 0.08}>
                <div className="l-criteria-weight">{c.weight}%</div>
                <h4>{c.name}</h4>
                <p>{c.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="l-section l-section-dark" id="roles">
        <div className="l-container">
          <Reveal>
            <h2 className="l-section-title light">Một nền tảng, đủ mọi vai trò</h2>
          </Reveal>
          <div className="l-roles-list">
            {ROLES.map((r, i) => (
              <Reveal className="l-role-row" key={r.name} delay={i * 0.08}>
                <div className="l-role-icon">{r.icon}</div>
                <div>
                  <h3>{r.name}</h3>
                  <p>{r.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="l-section" id="prizes">
        <div className="l-container">
          <Reveal>
            <div className="l-eyebrow">Giải thưởng</div>
            <h2 className="l-section-title">Tổng giá trị giải thưởng hấp dẫn</h2>
            <p className="l-section-desc">
              Vinh danh những đội thi xuất sắc nhất ở từng bảng, cùng sự đồng hành của các đơn vị uy tín.
            </p>
          </Reveal>

          <Reveal className="l-prize-banner">
            <div>
              <div className="l-prize-amount">
                <CountUp target={20} suffix=" triệu+" duration={1.6} />
                <small>Tổng giá trị giải thưởng tiền mặt (VNĐ)</small>
              </div>
            </div>
            <div className="l-prize-list">
              {PRIZES.map((p) => (
                <div className="l-prize-row" key={p.track}>
                  <span className="track-name">{p.track}</span>
                  <span className="amount">{p.amount}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal>
            <div className="l-eyebrow" style={{ marginTop: 48 }}>
              Đơn vị đồng hành
            </div>
            <div className="l-sponsors">
              {SPONSORS.map((s) => (
                <span className="l-sponsor-chip" key={s}>
                  <IconGift width={15} height={15} />
                  {s}
                </span>
              ))}
            </div>
            <p className="l-sponsor-note">* Danh sách minh hoạ giao diện, cập nhật theo đối tác thực tế của từng mùa giải.</p>
          </Reveal>
        </div>
      </section>

      <section className="l-cta">
        <div className="l-container l-cta-inner">
          <h2>Sẵn sàng tham gia SEAL Hackathon?</h2>
          <p>Đăng ký tài khoản, thành lập đội thi và bắt đầu hành trình chinh phục thử thách công nghệ.</p>
          <div className="l-hero-actions center">
            <Link className="l-btn-primary" to={user ? "/app" : "/register"}>
              {user ? "Vào hệ thống" : registerLabel} <IconArrowRight width={16} height={16} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="l-footer">
        <div className="l-container l-footer-inner">
          <div className="l-footer-brand">
            <div className="l-footer-mark">
              <BrandMark size={18} />
            </div>
            SEAL Hackathon
          </div>
          <div className="muted" style={{ fontSize: 13 }}>
            © 2026 SEAL Hackathon Management System, Ngành Kỹ thuật Phần mềm.
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
          <div className="l-nav-mark">
            <BrandMark size={18} />
          </div>
          SEAL Hackathon
        </div>
        <nav className="l-nav-links">
          <a href="#about">Về cuộc thi</a>
          <a href="#timeline">Lộ trình</a>
          <a href="#criteria">Tiêu chí</a>
          <a href="#roles">Vai trò</a>
          <Link to="/vote">Bình chọn</Link>
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
