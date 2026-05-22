'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Bot, Heart, ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    icon: '☪️',
    title: 'مرحباً بك في نور AI',
    subtitle: 'رفيقك في رحلة الإيمان',
    desc: 'تطبيق إسلامي شامل يجمع كل ما تحتاجه: القرآن الكريم، أوقات الصلاة، الأذكار، والمساعد الذكي',
    color: 'var(--green-5)',
  },
  {
    icon: '📖',
    title: 'القرآن بصوت أعظم القرّاء',
    subtitle: '114 سورة + 5 قراء عالميين',
    desc: 'استمع لتلاوة العفاسي، السديس، بصفر، الحذيفي، والمنشاوي بجودة عالية',
    color: 'var(--gold-5)',
  },
  {
    icon: '🤖',
    title: 'مساعد إسلامي ذكي',
    subtitle: 'مدعوم بـ Claude AI',
    desc: 'اسأل عن الفقه، التفسير، الأحاديث، الأدعية، أو اطلب إنشاء خطبة جمعة',
    color: '#67E8F9',
  },
  {
    icon: '🕌',
    title: 'صلاة وقبلة وأذكار',
    subtitle: 'كل ما تحتاجه في مكان واحد',
    desc: 'أوقات صلاة دقيقة بـ GPS، بوصلة قبلة بمستشعر حي، أذكار يومية مع عداد',
    color: 'var(--blue-5)',
  },
  {
    icon: '👥',
    title: 'انضم لمجتمع المؤمنين',
    subtitle: 'تواصل، تشارك، تشجع',
    desc: 'تحديات يومية، نقاط ومستويات، Feed إسلامي، ودردشة مع إخوانك',
    color: 'var(--purple-5)',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const slide = SLIDES[step];

  const next = () => {
    if (step < SLIDES.length - 1) setStep(step + 1);
    else {
      localStorage.setItem('noor_onboarded', '1');
      router.push('/auth/register');
    }
  };

  const skip = () => {
    localStorage.setItem('noor_onboarded', '1');
    router.push('/auth/register');
  };

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex', flexDirection: 'column',
      padding: 'var(--safe-top) 24px var(--safe-bottom)',
    }}>
      <div className="container-app" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Skip */}
        <div style={{ textAlign: 'left', paddingTop: '20px' }}>
          {step < SLIDES.length - 1 && (
            <button onClick={skip} style={{
              fontSize: '13px',
              color: 'var(--text-3)',
              padding: '8px 16px',
            }}>
              تخطي ←
            </button>
          )}
        </div>

        {/* Content */}
        <div key={step} className="animate-scale-in" style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: '24px',
        }}>
          <div style={{
            fontSize: '120px',
            animation: 'float 3s ease-in-out infinite',
            filter: `drop-shadow(0 0 40px ${slide.color}66)`,
          }}>
            {slide.icon}
          </div>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: 900,
              color: slide.color,
              marginBottom: '8px',
            }}>
              {slide.title}
            </h1>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-2)', marginBottom: '20px' }}>
              {slide.subtitle}
            </p>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-3)',
              lineHeight: 2,
              maxWidth: '420px',
              margin: '0 auto',
            }}>
              {slide.desc}
            </p>
          </div>
        </div>

        {/* Dots */}
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
          marginBottom: '24px',
        }}>
          {SLIDES.map((_, i) => (
            <div key={i} style={{
              width: i === step ? '32px' : '8px',
              height: '8px',
              borderRadius: '4px',
              background: i === step ? slide.color : 'var(--border-3)',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>

        {/* CTA */}
        <button onClick={next} className="btn btn-primary" style={{
          width: '100%',
          padding: '16px',
          fontSize: '16px',
        }}>
          {step < SLIDES.length - 1 ? 'التالي' : 'هيا نبدأ 🌙'}
          <ChevronLeft size={20} />
        </button>
      </div>
    </div>
  );
}
