"use client";

import { useState, useEffect } from "react";
import { Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

export default function FlashSaleBanner() {
  // Set sale end to 3 days from now (rolling)
  const [saleEnd] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    d.setHours(23, 59, 59, 0);
    return d;
  });

  const { days, hours, minutes, seconds } = useCountdown(saleEnd);

  return (
    <section className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 lg:py-14">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left: Sale info */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <Zap size={18} className="text-amber-400 fill-amber-400" />
              <p className="text-[11px] tracking-[0.3em] uppercase opacity-80">
                Limited Time Offer
              </p>
            </div>
            <h2
              className="text-3xl lg:text-4xl font-normal mb-3"
              style={{ fontFamily: "var(--font-lora), serif" }}
            >
              Buy 2, Get 3rd <em className="italic">Free</em>
            </h2>
            <p className="text-sm opacity-70 font-light max-w-md">
              Stock up on your herbal essentials. Add 3 items to your bag and the lowest priced product is on us!
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 mt-6 bg-background text-foreground px-8 py-3.5 text-xs tracking-[0.2em] uppercase hover:bg-accent hover:text-primary-foreground transition-colors duration-300"
            >
              Shop Now <ArrowRight size={14} />
            </Link>
          </div>

          {/* Right: Countdown */}
          <div className="flex items-center gap-4 md:gap-6">
            {[
              { label: "Days", value: days },
              { label: "Hours", value: hours },
              { label: "Minutes", value: minutes },
              { label: "Seconds", value: seconds },
            ].map((unit) => (
              <div key={unit.label} className="text-center">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-background/10 backdrop-blur-sm border border-primary-foreground/20 rounded-xl flex items-center justify-center mb-2">
                  <span className="text-2xl lg:text-3xl font-medium tabular-nums">
                    {String(unit.value).padStart(2, "0")}
                  </span>
                </div>
                <p className="text-[9px] tracking-[0.2em] uppercase opacity-60">{unit.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
