import type { Metadata } from 'next';
import { InfoShell, InfoSection } from '@/components/legal/InfoShell';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية',
  description: 'كيف تجمع نور AI بياناتك وتحميها. خصوصيتك أمانة.',
};

export default function PrivacyPage() {
  return (
    <InfoShell title="سياسة الخصوصية" subtitle="خصوصيتك أمانة عندنا. هذه الصفحة توضّح ما نجمعه ولماذا، وكيف نحميه.">
      <InfoSection heading="١. البيانات التي نجمعها">
        نجمع الحد الأدنى الضروري لتشغيل الخدمة: الاسم والبريد الإلكتروني عند إنشاء حسابك، وبعض
        التفضيلات (كاللغة وإعدادات التنبيه) التي تُحفظ على جهازك. قد نطلب موقعك الجغرافي لحساب
        مواقيت الصلاة واتجاه القبلة — ولا يُستخدم لأي غرض آخر.
      </InfoSection>
      <InfoSection heading="٢. كيف نستخدم بياناتك">
        نستخدم بياناتك فقط لتقديم الخدمات: حفظ تقدّمك، عرض المحتوى المناسب، وتحسين التجربة.
        لا نبيع بياناتك ولا نشاركها مع أطراف ثالثة لأغراض تسويقية.
      </InfoSection>
      <InfoSection heading="٣. المساعد الذكي (AI)">
        تُرسَل أسئلتك للمساعد الذكي لمعالجتها وإرجاع الإجابة. ننصح بعدم مشاركة معلومات حسّاسة أو
        شخصية في المحادثة.
      </InfoSection>
      <InfoSection heading="٤. التخزين المحلي">
        نستخدم تخزين المتصفح (localStorage) لحفظ تفضيلاتك وتقدّمك على جهازك مباشرةً — يمكنك مسحه
        في أي وقت من إعدادات المتصفح.
      </InfoSection>
      <InfoSection heading="٥. حقوقك">
        لك الحق في الوصول إلى بياناتك أو تعديلها أو حذف حسابك. للتواصل بخصوص خصوصيتك، راسلنا عبر
        صفحة <a href="https://www.snetprodz.com" target="_blank" rel="noopener noreferrer" style={{ color: '#34D399', fontWeight: 700 }}>SNetProDz</a>.
      </InfoSection>
      <InfoSection heading="٦. التحديثات">
        قد نُحدّث هذه السياسة من حين لآخر. سنُعلمك بأي تغييرات جوهرية عبر التطبيق.
      </InfoSection>
    </InfoShell>
  );
}
