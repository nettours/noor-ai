import type { Metadata } from 'next';
import { InfoShell, InfoSection } from '@/components/legal/InfoShell';

export const metadata: Metadata = {
  title: 'شروط الاستخدام',
  description: 'شروط وأحكام استخدام منصة نور AI.',
};

export default function TermsPage() {
  return (
    <InfoShell title="شروط الاستخدام" subtitle="باستخدامك نور AI فإنك توافق على الشروط التالية.">
      <InfoSection heading="١. قبول الشروط">
        باستخدامك لمنصة نور AI فإنك تقرّ بقراءتك لهذه الشروط وموافقتك عليها. إن لم توافق، يُرجى
        عدم استخدام الخدمة.
      </InfoSection>
      <InfoSection heading="٢. طبيعة المحتوى الديني">
        نحرص على دقّة المحتوى الشرعي (القرآن، التفسير، الأحاديث، الفقه)، لكنّ إجابات المساعد الذكي
        قد تحتوي أخطاء. للمسائل المهمّة أو الخلافية، ارجع دائمًا إلى أهل العلم الموثوقين.
      </InfoSection>
      <InfoSection heading="٣. حسابك ومسؤوليتك">
        أنت مسؤول عن سرّية بيانات دخولك وعن كل نشاط يجري عبر حسابك. التزم بالأدب والاحترام في
        المجتمع والغرف والمحادثات، وامتنع عن نشر ما يخالف الشرع أو القانون.
      </InfoSection>
      <InfoSection heading="٤. المحتوى الذي تنشره">
        تبقى مالكًا للمحتوى الذي تنشره، وتمنحنا إذنًا بعرضه داخل المنصة. نحتفظ بحق إزالة أي محتوى
        مخالف دون إشعار مسبق.
      </InfoSection>
      <InfoSection heading="٥. حدود المسؤولية">
        تُقدَّم الخدمة «كما هي». لا نتحمّل مسؤولية أي أضرار ناتجة عن الاستخدام، ضمن ما يسمح به
        القانون.
      </InfoSection>
      <InfoSection heading="٦. التواصل">
        لأي استفسار حول هذه الشروط، تواصل معنا عبر{' '}
        <a href="https://www.snetprodz.com" target="_blank" rel="noopener noreferrer" style={{ color: '#34D399', fontWeight: 700 }}>SNetProDz</a>.
      </InfoSection>
    </InfoShell>
  );
}
