import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

export function CountUp({
  target,
  duration = 2,
  suffix = "",
  locale = "vi-VN",
}: {
  target: number;
  duration?: number;
  suffix?: string;
  locale?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: duration * 1000, bounce: 0 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      springValue.jump(target);
    } else {
      motionValue.set(target);
    }
  }, [inView, motionValue, springValue, target]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      setDisplay(Math.floor(latest).toLocaleString(locale));
    });
    return unsubscribe;
  }, [springValue, locale]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}
