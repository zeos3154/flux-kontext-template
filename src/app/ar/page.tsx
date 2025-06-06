import type { Metadata } from 'next'
import { HomeContentSimple } from '@/components/HomeContentSimple'

export const metadata: Metadata = {
  title: 'Flux Kontext AI - منصة احترافية لتوليد الصور بالذكاء الاصطناعي | إنشاء صور مذهلة',
  description: 'حول أفكارك إلى صور احترافية باستخدام تقنية الذكاء الاصطناعي المتطورة. أنشئ صورًا من النص، وحرر الصور الموجودة، ومعالج صور متعددة بقوة Flux Kontext AI.',
  openGraph: {
    title: 'Flux Kontext AI - منصة احترافية لتوليد الصور بالذكاء الاصطناعي',
    url: 'https://fluxkontext.space/ar',
    locale: 'ar_SA',
    type: 'website',
  }
}

const arDictionary = {
  hero: {
    badge: "منصة احترافية لتوليد الصور بالذكاء الاصطناعي",
    title: "إنشاء صور مذهلة مع",
    subtitle: "Flux Kontext AI",
    description: "حول أفكارك إلى صور احترافية باستخدام تقنية الذكاء الاصطناعي المتطورة. أنشئ صورًا من النص، وحرر الصور الموجودة، ومعالج صور متعددة بقوة Flux Kontext AI.",
    cta: {
      primary: "ابدأ الإنشاء",
      secondary: "عرض الأسعار"
    }
  },
  features: {
    title: "الميزات الرئيسية لمنصة Flux Kontext AI",
    subtitle: "يجمع Flux Kontext AI الخاص بنا بين التكنولوجيا المتطورة لتقديم توليد وتحرير الصور الاحترافية في منصة واحدة سلسة.",
    items: [
      {
        title: "توليد الصور من النص",
        description: "حول أوصافك النصية إلى صور مذهلة وعالية الجودة باستخدام تقنية الذكاء الاصطناعي المتقدمة."
      },
      {
        title: "تحرير الصور الاحترافي",
        description: "حرر الصور الموجودة باستخدام تعليمات اللغة الطبيعية للتعديلات الدقيقة."
      },
      {
        title: "معالجة الصور المتعددة",
        description: "معالج صور متعددة في وقت واحد بأسلوب وجودة متسقة."
      }
    ]
  },
  faq: {
    title: "الأسئلة الشائعة",
    subtitle: "اعثر على إجابات للأسئلة الشائعة حول منصة Flux Kontext AI وميزات توليد الصور القوية.",
    items: [
      {
        question: "ما هو Flux Kontext AI؟",
        answer: "Flux Kontext AI هي منصة متقدمة لتوليد الصور تستخدم الذكاء الاصطناعي المتطور لإنشاء صور مذهلة من الأوصاف النصية، وتحرير الصور الموجودة، ومعالجة صور متعددة في وقت واحد."
      }
    ]
  },
  cta: {
    title: "هل أنت مستعد لإنشاء صور رائعة؟",
    subtitle: "انضم إلى آلاف المبدعين الذين يستخدمون Flux Kontext AI لإحياء أفكارهم.",
    button: "ابدأ الآن"
  },
  footer: {
    brand: {
      name: "Flux Kontext",
      description: "منصة احترافية لتوليد الصور بالذكاء الاصطناعي.",
      copyright: "© 2025 Flux Kontext. جميع الحقوق محفوظة."
    },
    contact: {
      title: "اتصل بنا",
      email: "support@fluxkontext.space"
    },
    legal: {
      title: "قانوني",
      terms: "شروط الخدمة",
      privacy: "سياسة الخصوصية",
      refund: "سياسة الاسترداد"
    },
    languages: {
      title: "اللغات"
    },
    social: {
      builtWith: "مبني بـ ❤️ للمبدعين في جميع أنحاء العالم",
      followUs: "تابعنا على"
    }
  }
}

export default function ArabicPage() {
  return <HomeContentSimple dictionary={arDictionary} />
} 