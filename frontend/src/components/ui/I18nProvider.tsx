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

  // ═══ الصفحة الرئيسية ═══
  'home.greeting.dawn': { ar: 'وقت السحَر', fr: "L'aube", en: 'Pre-dawn' },
  'home.greeting.morning': { ar: 'صباح الخير', fr: 'Bonjour', en: 'Good morning' },
  'home.greeting.afternoon': { ar: 'طاب يومك', fr: 'Bon après-midi', en: 'Good afternoon' },
  'home.greeting.evening': { ar: 'مساء الخير', fr: 'Bonsoir', en: 'Good evening' },
  'home.greeting.night': { ar: 'مساء النور', fr: 'Bonne nuit', en: 'Good evening' },
  'home.tab.verse': { ar: 'آية', fr: 'Verset', en: 'Verse' },
  'home.tab.hadith': { ar: 'حديث', fr: 'Hadith', en: 'Hadith' },
  'home.tab.wisdom': { ar: 'حكمة', fr: 'Sagesse', en: 'Wisdom' },
  'home.section.basics': { ar: 'الأساسيات', fr: 'Essentiels', en: 'Essentials' },
  'home.section.community': { ar: 'المجتمع', fr: 'Communauté', en: 'Community' },
  'home.feature.ai': { ar: 'مساعد AI', fr: 'Assistant IA', en: 'AI Assistant' },
  'home.feature.quran': { ar: 'القرآن', fr: 'Coran', en: 'Quran' },
  'home.feature.prayer': { ar: 'الصلاة', fr: 'Prière', en: 'Prayer' },
  'home.feature.adhkar': { ar: 'الأذكار', fr: 'Dhikr', en: 'Adhkar' },
  'home.feature.stories': { ar: 'قصص الأنبياء', fr: 'Les Prophètes', en: 'Prophet Stories' },
  'home.feature.qibla': { ar: 'القبلة', fr: 'Qibla', en: 'Qibla' },
  'home.feature.tajweed': { ar: 'تعلّم التجويد', fr: 'Apprendre le Tajwid', en: 'Learn Tajweed' },
  'home.rooms.title': { ar: 'غرف الدردشة', fr: 'Salons de discussion', en: 'Chat Rooms' },
  'home.rooms.desc': { ar: 'نقاشات + مكالمات جماعية', fr: 'Discussions + appels de groupe', en: 'Discussions + group calls' },
  'home.feed.title': { ar: 'تأمّلات نور', fr: 'Méditations Noor', en: 'Noor Reflections' },
  'home.feed.desc': { ar: 'محتوى يلمس القلب يومياً', fr: 'Du contenu qui touche le cœur', en: 'Heart-touching content daily' },
  'home.chat.title': { ar: 'الدردشة الخاصة', fr: 'Messages privés', en: 'Private Chat' },
  'home.chat.desc': { ar: 'رسائل مع المؤمنين', fr: 'Messages avec les croyants', en: 'Messages with believers' },
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
