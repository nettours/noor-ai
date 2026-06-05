'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Sparkles, Bot, ChevronLeft, ChevronRight, Star, ShieldCheck, BookOpen,
} from 'lucide-react';
import { SLIDES } from '@/content/landing';

const AUTOPLAY_MS = 6000;

/**
 * Landing hero — conversion-focused first impression.
 *
 * Structure: a fixed value proposition (headline + dual CTA + trust row) that
 * never moves, plus a rotating "feature spotlight" card underneath. This is far
 * stronger for conversion than the previous design, which rotated the entire
 * headline (and shipped English CTAs inside an Arabic RTL app).
 *
 * Fully self-contained: owns its own slider state and keyframes, so app/page.tsx
 * no longer carries slider logic.
 */
export function Hero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const slide = SLIDES[index];
  const SlideIcon = slide.icon;

  const go = useCallback((next: number) => {
    setIndex((next + SLIDES.length) % SLIDES.length);
    setPaused(true);
    window.setTimeout(() => setPaused(false), 10000);
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = window.setInterval(
      () => setIndex((p) => (p + 1) % SLIDES.length),
      AUTOPLAY_MS,
    );
    return () => window.clearInterval(t);
  }, [paused]);

  return (
    <section
      dir="rtl"
      aria-label="مقدمة نور AI"
      style={{ position: 'relative', overflow: 'hidden', padding: '64px 20px 40px' }}
    >
      {/* Ambient orbs — tinted by the active feature */}
      <div
        aria-hidden
        style={{
          position: 'absolute', top: '6%', insetInlineEnd: '6%',
          width: 340, height: 340, borderRadius: '50%',
          background: slide.color, opacity: 0.18, filter: 'blur(90px)',
          transition: 'background 1.2s ease', pointerEvents: 'none',
          animation: 'heroFloat 7s ease-in-out infinite',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute', bottom: '8%', insetInlineStart: '6%',
          width: 260, height: 260, borderRadius: '50%',
          background: slide.color, opacity: 0.1, filter: 'blur(70px)',
          transition: 'background 1.2s ease', pointerEvents: 'none',
          animation: 'heroFloat 6s ease-in-out infinite 1s',
        }}
      />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 18px', borderRadius: 999,
            background: 'rgba(16,185,129,0.12)',
            border: '1px solid rgba(52,211,153,0.28)',
            color: 'var(--green-6)', fontSize: 13, fontWeight: 700,
            backdropFilter: 'blur(10px)', marginBottom: 24,
          }}
        >
          <span>☪️</span>
          منصة إسلامية ذكية متكاملة
        </motion.div>

        {/* Value proposition */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          style={{
            fontFamily: 'Amiri, serif',
            fontSize: 'clamp(36px, 6.5vw, 76px)',
            fontWeight: 700, lineHeight: 1.12, margin: '0 auto 18px',
            maxWidth: 880,
            background: 'linear-gradient(180deg, #fff 35%, #93A3B8 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          كل ما يُقرّبك إلى الله،
          <br />
          <span className="text-gradient-green">في تطبيق واحد</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12 }}
          style={{
            fontSize: 'clamp(15px, 2.4vw, 20px)', color: 'var(--text-2)',
            lineHeight: 1.85, maxWidth: 640, margin: '0 auto 30px',
          }}
        >
          القرآن الكريم بأصوات أعظم القرّاء، ومساعد ذكاء اصطناعي يجيبك في التفسير
          والفقه، مع مواقيت الصلاة والقبلة والأذكار — تجربة روحانية عصرية بين يديك.
        </motion.p>

        {/* Dual CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18 }}
          style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <Link
            href="/auth/login?tab=register"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '15px 32px', borderRadius: 14, fontSize: 16, fontWeight: 800,
              color: '#fff',
              backgroundImage: 'linear-gradient(135deg, var(--green-3), var(--green-5))',
              boxShadow: '0 16px 40px rgba(16,185,129,0.45)',
            }}
          >
            <Sparkles size={18} />
            ابدأ مجانًا الآن
          </Link>
          <Link
            href="/auth/login"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '15px 28px', borderRadius: 14, fontSize: 16, fontWeight: 700,
              color: '#fff', background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)',
            }}
          >
            <Bot size={18} color="#67E8F9" />
            جرّب المساعد الذكي
          </Link>
        </motion.div>

        {/* Trust row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.28 }}
          style={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
            gap: '10px 22px', marginTop: 26, fontSize: 13, color: 'var(--text-3)',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Star size={15} color="var(--gold-5)" fill="var(--gold-5)" /> تقييم ٤٫٩ / ٥
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={15} color="var(--green-5)" /> مجاني تمامًا · بياناتك آمنة
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <BookOpen size={15} color="var(--gold-5)" /> ١١٤ سورة · ٦ قرّاء مشاهير
          </span>
        </motion.div>

        {/* Rotating feature spotlight */}
        <div style={{ position: 'relative', maxWidth: 720, margin: '46px auto 0' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="glass-card"
              style={{ padding: '30px 26px', textAlign: 'center' }}
            >
              <div
                style={{
                  width: 84, height: 84, borderRadius: 24, margin: '0 auto 18px',
                  backgroundImage: slide.gradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 18px 50px ${slide.color}66`,
                }}
              >
                <SlideIcon size={42} color="#fff" strokeWidth={1.6} />
              </div>
              <div
                style={{
                  display: 'inline-block', padding: '5px 14px', borderRadius: 999,
                  background: `${slide.color}22`, border: `1px solid ${slide.color}55`,
                  color: slide.color, fontSize: 12, fontWeight: 700, marginBottom: 12,
                }}
              >
                {slide.badge}
              </div>
              <h2 style={{ fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 800, marginBottom: 8 }}>
                {slide.title}
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text-2)', fontWeight: 600, marginBottom: 10 }}>
                {slide.subtitle}
              </p>
              <p style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.8, maxWidth: 560, margin: '0 auto' }}>
                {slide.desc}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Arrows */}
          <button
            type="button" aria-label="السابق" onClick={() => go(index - 1)}
            style={arrowStyle('start')}
          >
            <ChevronRight size={20} />
          </button>
          <button
            type="button" aria-label="التالي" onClick={() => go(index + 1)}
            style={arrowStyle('end')}
          >
            <ChevronLeft size={20} />
          </button>

          {/* Dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 18 }}>
            {SLIDES.map((s, i) => (
              <button
                key={i} type="button" aria-label={`الميزة ${i + 1}`}
                onClick={() => go(i)}
                style={{
                  width: i === index ? 32 : 8, height: 6, borderRadius: 3, padding: 0,
                  background: i === index ? slide.gradient : 'rgba(255,255,255,0.2)',
                  transition: 'width 0.5s, background 0.5s', position: 'relative', overflow: 'hidden',
                }}
              >
                {i === index && !paused && (
                  <span
                    aria-hidden
                    style={{
                      position: 'absolute', insetBlock: 0, insetInlineStart: 0,
                      background: 'rgba(255,255,255,0.45)',
                      animation: `heroProgress ${AUTOPLAY_MS}ms linear`,
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes heroFloat { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-14px) } }
        @keyframes heroProgress { from { inline-size: 0 } to { inline-size: 100% } }
      `}</style>
    </section>
  );
}

function arrowStyle(side: 'start' | 'end'): React.CSSProperties {
  return {
    position: 'absolute', top: '38%', transform: 'translateY(-50%)',
    [side === 'start' ? 'insetInlineStart' : 'insetInlineEnd']: -6,
    width: 44, height: 44, borderRadius: '50%',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    backdropFilter: 'blur(16px)', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5,
  };
}
