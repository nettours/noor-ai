'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Lang = 'ar' | 'fr' | 'en';

// ═══ قاموس الترجمات ═══
// أضف أي نص هنا بثلاث لغات، واستخدمه عبر t('key')
const DICT: Record<string, Record<Lang, string>> = {
  // عام
  'app.name': { ar: 'نور AI', fr: 'Noor AI', en: 'Noor AI' },
  'app.tagline': { ar: 'رفيقك في طريق الإيمان', fr: 'Votre compagnon de foi', en: 'Your companion in faith' },
  // التنقّل
  'nav.home': { ar: 'الرئيسية', fr: 'Accueil', en: 'Home' },
  'nav.quran': { ar: 'القرآن', fr: 'Coran', en: 'Quran' },
  'nav.adhkar': { ar: 'الأذكار', fr: 'Dhikr', en: 'Adhkar' },
  'nav.community': { ar: 'المجتمع', fr: 'Communauté', en: 'Community' },
  'nav.profile': { ar: 'حسابي', fr: 'Profil', en: 'Profile' },
  // الإعدادات
  'settings.title': { ar: 'الإعدادات', fr: 'Paramètres', en: 'Settings' },
  'settings.language': { ar: 'اللغة', fr: 'Langue', en: 'Language' },
  'settings.notifications': { ar: 'الإشعارات', fr: 'Notifications', en: 'Notifications' },
  'settings.prayer_alerts': { ar: 'تنبيهات الصلاة', fr: 'Alertes de prière', en: 'Prayer alerts' },
  'settings.sound': { ar: 'الصوت', fr: 'Son', en: 'Sound' },
  'settings.adhan': { ar: 'صوت الأذان', fr: "Son de l'Adhan", en: 'Adhan sound' },
  'settings.account': { ar: 'الحساب', fr: 'Compte', en: 'Account' },
  'settings.about': { ar: 'عن التطبيق', fr: "À propos", en: 'About' },
  'settings.logout': { ar: 'تسجيل الخروج', fr: 'Déconnexion', en: 'Log out' },
  'settings.theme': { ar: 'المظهر', fr: 'Thème', en: 'Theme' },
  'settings.dark': { ar: 'داكن', fr: 'Sombre', en: 'Dark' },
  // رسائل
  'common.save': { ar: 'حفظ', fr: 'Enregistrer', en: 'Save' },
  'common.saved': { ar: 'تم الحفظ', fr: 'Enregistré', en: 'Saved' },
  'common.enabled': { ar: 'مُفعّل', fr: 'Activé', en: 'Enabled' },
  'common.disabled': { ar: 'مُعطّل', fr: 'Désactivé', en: 'Disabled' },
  'greeting.morning': { ar: 'صباح الخير', fr: 'Bonjour', en: 'Good morning' },
  'greeting.evening': { ar: 'مساء النور', fr: 'Bonsoir', en: 'Good evening' },
};

interface I18nCtx {
  lang: Lang;
  dir: 'rtl' | 'ltr';
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const Ctx = createContext<I18nCtx | null>(null);

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    // fallback آمن إذا لم يُلفّ بالـ Provider
    return {
      lang: 'ar' as Lang, dir: 'rtl' as const,
      setLang: () => {},
      t: (k: string) => DICT[k]?.ar || k,
    };
  }
  return ctx;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ar');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('noor_lang') as Lang;
      if (saved && ['ar', 'fr', 'en'].includes(saved)) {
        setLangState(saved);
        applyDir(saved);
      }
    } catch {}
  }, []);

  const applyDir = (l: Lang) => {
    const dir = l === 'ar' ? 'rtl' : 'ltr';
    if (typeof document !== 'undefined') {
      document.documentElement.lang = l;
      document.documentElement.dir = dir;
    }
  };

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem('noor_lang', l); } catch {}
    applyDir(l);
  };

  const t = (key: string) => DICT[key]?.[lang] || DICT[key]?.ar || key;
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return <Ctx.Provider value={{ lang, dir, setLang, t }}>{children}</Ctx.Provider>;
}
