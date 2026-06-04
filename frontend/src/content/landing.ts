/**
 * Landing-page content (data layer).
 * Extracted from app/page.tsx so copy/data lives separately from the UI and can
 * be edited, localized, or fed from a CMS without touching component code.
 */
import {
  BookOpen, Bot, Phone, Clock, Compass, Heart,
  Sparkles, Users, Star, Send, Zap,
  MessageCircle, Award, Lock, Smartphone,
  type LucideIcon,
} from 'lucide-react';

export interface Slide {
  badge: string;
  title: string;
  subtitle: string;
  desc: string;
  color: string;
  gradient: string;
  icon: LucideIcon;
}

export interface Service {
  icon: LucideIcon;
  title: string;
  desc: string;
  color: string;
}

export interface Testimonial {
  name: string;
  role: string;
  text: string;
  avatar: string;
  color: string;
}

export interface Stat {
  num: number;
  label: string;
  suffix: string;
}

export interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
  color: string;
}

// Hero slider — rotates every 7s
export const SLIDES: Slide[] = [
  { badge: '📖 القرآن الكريم', title: 'استمع للقرآن', subtitle: 'بأصوات أعظم القراء', desc: '114 سورة كاملة بأصوات 6 قراء مشاهير: العفاسي، السديس، المنشاوي، الحصري، الحذيفي، عبدالباسط', color: '#10B981', gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', icon: BookOpen },
  { badge: '🤖 مساعد ذكي', title: 'مساعد AI إسلامي', subtitle: 'مدعوم بـ Claude AI', desc: 'اسأل عن التفسير، الأحاديث، الفقه، الأدعية. مساعد ذكي يفهم العربية الفصحى ويجيب بأدب وعلم', color: '#67E8F9', gradient: 'linear-gradient(135deg, #67E8F9 0%, #06B6D4 100%)', icon: Bot },
  { badge: '🏠 غرف الدردشة', title: 'انضم لغرف الإخوة', subtitle: 'مدارسة، فقه، علم، نقاش', desc: 'غرف موضوعية: مدارسة القرآن، الفقه والأحكام، طلاب العلم، شباب المسلمين، والأسرة المسلمة', color: '#A855F7', gradient: 'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)', icon: Users },
  { badge: '📞 مكالمات HD', title: 'تواصل بصوت وفيديو', subtitle: 'مكالمات WebRTC مجانية', desc: 'مكالمات صوتية ومرئية مع إخوانك بجودة عالية. تشفير طرف لطرف، بدون تأخير، مجاناً تماماً', color: '#FBBF24', gradient: 'linear-gradient(135deg, #FBBF24 0%, #D97706 100%)', icon: Phone },
  { badge: '💬 دردشة احترافية', title: 'تشارك الخير', subtitle: 'رسائل، صور، صوتية، ملفات', desc: 'دردشة فورية مع علامات قراءة، مؤشر الكتابة، رسائل صوتية، صور وملفات', color: '#EC4899', gradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', icon: Send },
  { badge: '🕌 أوقات الصلاة', title: 'لا تفوتك صلاة', subtitle: 'مواقيت + قبلة + أذكار', desc: 'أوقات صلاة دقيقة حسب موقعك، بوصلة قبلة بـ GPS، أذكار يومية كاملة', color: '#F87171', gradient: 'linear-gradient(135deg, #F87171 0%, #DC2626 100%)', icon: Clock },
  { badge: '📿 التسبيح الذكي', title: 'سبحة رقمية متقدمة', subtitle: 'احصِ ذكرك في كل مكان', desc: 'عدّاد تسبيح بأنواع متعددة مع إحصائيات يومية وتذكير', color: '#34D399', gradient: 'linear-gradient(135deg, #34D399 0%, #059669 100%)', icon: Sparkles },
];

export const SUGGESTED_Q: string[] = [
  'ما حكم الصلاة في السفر؟',
  'اشرح لي تفسير سورة الفاتحة',
  'كيف أحفظ القرآن بسرعة؟',
  'ما فضل قراءة آية الكرسي؟',
];

export const SERVICES: Service[] = [
  { icon: BookOpen, title: 'القرآن الكريم', desc: '114 سورة بـ 6 قراء مشاهير', color: '#10B981' },
  { icon: Clock, title: 'مواقيت الصلاة', desc: 'دقيقة بحسب موقعك', color: '#F87171' },
  { icon: Compass, title: 'بوصلة القبلة', desc: 'GPS عالي الدقة', color: '#FBBF24' },
  { icon: Heart, title: 'الأذكار', desc: 'حصن المسلم كاملاً', color: '#EC4899' },
  { icon: Star, title: 'القصص الإسلامية', desc: '25 قصة للأنبياء', color: '#A855F7' },
  { icon: Sparkles, title: 'التسبيح الذكي', desc: 'سبحة رقمية متقدمة', color: '#34D399' },
  { icon: Bot, title: 'AI تفسير القرآن', desc: 'تفسير ذكي لأي آية', color: '#67E8F9' },
  { icon: MessageCircle, title: 'مساعد يومي', desc: 'إرشاد روحاني شخصي', color: '#60A5FA' },
];

export const TESTIMONIALS: Testimonial[] = [
  { name: 'أحمد المصري', role: 'طالب علم', text: 'تطبيق رائع، أصبح رفيقي اليومي في صلاتي وقراءتي للقرآن. التصميم احترافي جداً.', avatar: 'أ', color: '#10B981' },
  { name: 'فاطمة الزهراء', role: 'مدرّسة قرآن', text: 'أستخدمه في تحفيظ بناتي. المساعد الذكي يساعدني في شرح التفاسير بطريقة مبسطة.', avatar: 'ف', color: '#EC4899' },
  { name: 'محمد العتيبي', role: 'مهندس', text: 'غرف الدردشة فكرة عبقرية! أتناقش مع إخوة من كل العالم حول القرآن والفقه.', avatar: 'م', color: '#A855F7' },
];

export const STATS: Stat[] = [
  { num: 114, label: 'سورة كاملة', suffix: '' },
  { num: 6, label: 'قراء مشاهير', suffix: '' },
  { num: 1000, label: 'مستخدم نشط', suffix: '+' },
  { num: 50000, label: 'استفسار AI', suffix: '+' },
];

export const FEATURES: Feature[] = [
  { icon: Zap, title: 'سرعة فائقة', desc: 'يفتح في ثانية واحدة', color: '#FBBF24' },
  { icon: Bot, title: 'AI ذكي', desc: 'مدعوم بـ Claude', color: '#67E8F9' },
  { icon: Award, title: 'تصميم عصري', desc: 'بجودة Apple', color: '#A855F7' },
  { icon: Heart, title: 'تجربة روحانية', desc: 'مصممة بعناية', color: '#EC4899' },
  { icon: Smartphone, title: 'موبايل أولاً', desc: 'يعمل على أي جهاز', color: '#10B981' },
  { icon: Lock, title: 'خصوصية تامة', desc: 'بياناتك آمنة', color: '#F87171' },
];
