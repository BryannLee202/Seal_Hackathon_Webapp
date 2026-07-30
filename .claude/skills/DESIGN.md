---
name: SEAL Hackathon
description: Visual identity for SEAL Hackathon — hệ thống quản lý & chấm điểm cuộc thi hackathon. Hai bề mặt song song — công khai (landing/bình chọn/auth, tối màu) và vận hành (dashboard/coordinator/judge/mentor, sáng màu) — dùng chung một hệ token và một màu nhấn duy nhất.
colors:
  primary: "#E14E0F"
  primary-dark: "#A8390A"
  primary-light: "#FCE7D9"
  gold: "#D97706"
  neutral: "#F7F4EF"
  ink: "#1C1815"
  ink-muted: "#726B5E"
  on-primary: "#FFFFFF"
  success: "#12A878"
  danger: "#DC2626"
  warning: "#CA8A04"
  info: "#2563EB"
  dark-bg: "#0D0B09"
  dark-bg-2: "#17130F"
  dark-text: "#FAF6EF"
  dark-text-muted: "#B5AA98"
  dark-accent: "#FF7A33"
typography:
  h1:
    fontFamily: Space Grotesk
    fontSize: 3.5rem
    fontWeight: 700
    letterSpacing: -0.02em
  h2:
    fontFamily: Space Grotesk
    fontSize: 2rem
    fontWeight: 700
    letterSpacing: -0.015em
  h3:
    fontFamily: Space Grotesk
    fontSize: 1.2rem
    fontWeight: 700
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 1rem
    fontWeight: 400
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.85rem
    fontWeight: 500
  label-caps:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.75rem
    fontWeight: 700
    letterSpacing: 0.08em
  numeric-display:
    fontFamily: JetBrains Mono
    fontSize: 1.8rem
    fontWeight: 600
rounded:
  sm: 8px
  md: 12px
  lg: 18px
  pill: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.pill}"
    padding: 12px 22px
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
  button-secondary:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: 10px 18px
  card:
    backgroundColor: "#FFFFFF"
    rounded: "{rounded.lg}"
    padding: 22px 24px
  badge-primary:
    backgroundColor: "{colors.primary-light}"
    textColor: "{colors.primary-dark}"
    rounded: "{rounded.pill}"
    padding: 3px 11px
---

## Overview

SEAL Hackathon là một hệ thống hai mặt: **mặt công khai** (landing page, trang bình chọn khán giả, đăng nhập/đăng ký) cần cảm giác năng lượng, kích thích tham gia — và **mặt vận hành** (dashboard điều phối viên, giám khảo, mentor, đội thi) cần rõ ràng, đáng tin, dễ đọc dữ liệu trong thời gian dài. Cả hai dùng chung một ngôn ngữ hình ảnh: nền trung tính ấm (graphite tối ở mặt công khai, stone sáng ở mặt vận hành) cộng một màu nhấn cam "ignite" duy nhất — ẩn dụ tia lửa khởi động ý tưởng, tránh hẳn tông tím/hồng "AI glow" đã lạm dụng khắp nơi.

Hai dial khác nhau theo bề mặt:
- **Công khai** (landing/vote/auth-hero): variance cao (bố cục bất đối xứng, không phải mọi thứ đều căn giữa/lưới đều), motion vừa phải (reveal khi cuộn, tilt card, đếm số), density thấp (nhiều khoảng trắng, một CTA rõ ràng).
- **Vận hành** (dashboard/coordinator/judge...): variance thấp (lưới dự đoán được, số liệu phải dễ so sánh), motion tối giản (chỉ hover/active, không distraction khi thao tác điểm số), density trung bình-cao (nhiều thông tin/lượt trên một màn hình).

## Colors

- **Primary `#E14E0F` (ignite orange):** màu nhấn duy nhất toàn hệ thống — nút CTA chính, link, trạng thái active, border nhấn. Dùng nhất quán ở cả hai mặt sáng/tối (mặt tối dùng biến thể sáng hơn `dark-accent #FF7A33` để đủ tương phản trên nền đen).
- **Primary-dark `#A8390A`:** dùng cho text/link cam trên nền sáng để đạt WCAG AA (cam gốc quá sáng để làm text trên trắng).
- **Primary-light `#FCE7D9`:** nền pill/badge/hover nhẹ trên nền sáng.
- **Gold `#D97706`:** tông phụ duy nhất được phép đi kèm primary trong gradient thương hiệu (cam → hổ phách), không dùng như một accent độc lập thứ hai.
- **Ink `#1C1815` / Ink-muted `#726B5E`:** text chính/phụ trên nền sáng — đen ấm (ánh nâu), không phải đen/xám lạnh.
- **Nền tối `dark-bg #0D0B09` / `dark-bg-2 #17130F`:** graphite ấm gần đen, không phải navy hay tím-đen.
- **Success/Danger/Warning/Info:** giữ vùng hue tách biệt rõ khỏi primary (xanh lá, đỏ, **vàng** — không phải cam — và xanh dương) để không bị nhầm với trạng thái nhấn thương hiệu.

## Typography

- **Space Grotesk** cho mọi tiêu đề (h1/h2/h3, hero title, section title, số liệu nổi bật dạng chữ lớn) — hình học, kỹ thuật, hợp không khí hackathon; thay cho Lexend.
- **Plus Jakarta Sans** cho toàn bộ body text, form, bảng, nav — giữ nguyên vì đã đọc tốt ở mật độ cao trên dashboard.
- **JetBrains Mono** dùng có chủ đích cho các con số cần cảm giác "kỹ thuật/đo lường" (điểm số giám khảo, số phiếu bình chọn, số liệu thống kê) — không dùng cho heading hay body thường.
- h1 chỉ dùng cho tiêu đề trang/hero; h2 cho tiêu đề section; h3 cho tiêu đề card/sub-block. Không nhảy cấp.

## Layout

- Container marketing: `max-width: 1140px`. Container app/dashboard: `max-width: 1280px` (đã có sẵn, giữ nguyên).
- Spacing theo bội số 4px (thang xs→2xl ở trên). Mặt vận hành ưu tiên khoảng cách chặt hơn mặt công khai.
- Mặt công khai: tránh lặp lại cùng một layout family (grid 3-4 cột đều) liên tiếp quá 2 section — luân phiên giữa grid, timeline lệch trục, banner bất đối xứng.

## Shapes

- Một hệ bo góc duy nhất, áp dụng nhất quán: card/section dùng `rounded.lg` (18px), input/button phụ dùng `rounded.sm` (8px), CTA chính/badge/pill dùng `rounded.pill`. Không dùng giá trị bo góc ngoài thang này.

## Components

- Button primary luôn là pill, nền `primary`, chữ trắng — không đổi hình dạng theo section.
- Card trên nền tối dùng `rgba(255,255,255,0.05)` + border cam mờ `rgba(225,138,61,0.22)` thay vì border tím như bản cũ.
- Mascot (SEAL bot) đổi từ gradient xanh dương/tím sang gradient cam ấm (đầu) + graphite ấm (thân), giữ nguyên tia lửa vàng ở ngực — vì tia lửa đã đúng tinh thần "ignite" từ đầu.

## Do's and Don'ts

- ✅ Luôn dùng token từ file này; không tự chọn hex mới ngoài bảng trên.
- ✅ Một màu nhấn (`primary`/`dark-accent`) dùng giống nhau ở mọi nơi trên trang.
- ❌ Không quay lại tông tím/hồng/xanh dương kiểu "AI glow" đã bỏ.
- ❌ Không dùng `warning` (vàng) và `primary` (cam) cạnh nhau theo cách dễ nhầm — giữ đủ khoảng cách hue.
- ❌ Không thêm màu nhấn thứ hai độc lập; `gold` chỉ xuất hiện trong gradient cùng `primary`, không đứng riêng làm CTA.
