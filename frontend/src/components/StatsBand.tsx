import { useEffect, useRef, useState } from "react";

type Stat = {
  value: number;
  suffix?: string;
  decimals?: number;
  label: string;
};

const stats: Stat[] = [
  { value: 2.5, suffix: "B+", decimals: 1, label: "Portfolio Value" },
  { value: 850, suffix: "+", label: "Transactions Closed" },
  { value: 20, label: "Years Active" },
];

function formatNumber(value: number, decimals = 0) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function AnimatedStat({ stat, active }: { stat: Stat; active: boolean }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!active) return;

    const duration = 1400;
    const startedAt = performance.now();
    let frame = 0;

    function tick(now: number) {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(stat.value * eased);

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, stat.value]);

  return (
    <div className="text-center">
      <div className="font-serif text-4xl font-normal leading-none text-[#e0bb35] sm:text-5xl lg:text-6xl">
        {formatNumber(displayValue, stat.decimals)}
        {stat.suffix}
      </div>
      <p className="mt-3 text-xs font-black uppercase tracking-[0.2em] text-neutral-200 sm:text-sm">
        {stat.label}
      </p>
    </div>
  );
}

export function StatsBand() {
  const [active, setActive] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="bg-[#383838] px-4 py-7 sm:py-8 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <AnimatedStat key={stat.label} stat={stat} active={active} />
        ))}
      </div>
    </section>
  );
}
