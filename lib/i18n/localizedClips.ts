import type { Locale } from './locales';
import { DEFAULT_LOCALE } from './locales';

export type ClipTranslation = { title: string; description: string };

/** Curated Explore clip copy per locale (clip id → locale → fields). */
export const CURATED_CLIP_TRANSLATIONS: Record<
  string,
  Partial<Record<Locale, ClipTranslation>>
> = {
  '1': {
    es: { title: 'Refugio seguro', description: 'Imágenes que calman y un ritmo suave para momentos de ansiedad.' },
    fr: { title: 'Refuge sûr', description: 'Visuels apaisants et rythme doux pour les moments d’anxiété.' },
    hi: { title: 'सुरक्षित आश्रय', description: 'चिंता के समय के लिए शांत दृश्य और धीमी गति।' },
    ta: { title: 'பாதுகாப்பான இடம்', description: 'கவலை நேரங்களுக்கு அமைதியான காட்சிகள் மற்றும் மெதுவான ஓட்டம்.' },
  },
  '2': {
    es: { title: 'Viaje interior', description: 'Un arco reflexivo entre luz, sombra y quietud.' },
    fr: { title: 'Voyage intérieur', description: 'Un parcours réflexif entre lumière, ombre et calme.' },
    hi: { title: 'अंतर्मुखी यात्रा', description: 'प्रकाश, छाया और शांति के बीच चिंतनशील अनुभव।' },
    ta: { title: 'உள்ளுறை பயணம்', description: 'ஒளி, நிழல், அமைதி வழியான சிந்தனைப் பாதை.' },
  },
  '3': {
    es: { title: 'Claridad matutina', description: 'Reinicio breve para empezar el día con intención.' },
    fr: { title: 'Clarté du matin', description: 'Courte pause pour commencer la journée avec intention.' },
    hi: { title: 'सुबह की स्पष्टता', description: 'दिन की शुरुआत संकल्प के साथ करने के लिए छोटा विराम।' },
    ta: { title: 'காலை தெளிவு', description: 'நோக்கத்துடன் நாளைத் தொடங்க சிறிய இடைவெளி.' },
  },
  '4': {
    es: { title: 'Pausa agradecida', description: 'Enfoque suave y señales de respiración para la gratitud.' },
    fr: { title: 'Pause reconnaissante', description: 'Focus doux et respiration pour la gratitude.' },
    hi: { title: 'कृतज्ञ विराम', description: 'कृतज्ञता अभ्यास के लिए कोमल फोकस और श्वास संकेत।' },
    ta: { title: 'நன்றி இடைவெளி', description: 'நன்றி பயிற்சிக்கு மென்மையான கவனமும் சுவாச வழிகாட்டியும்.' },
  },
  '5': {
    es: { title: 'Respiración en caja', description: 'Conteos rítmicos para regular el sistema nervioso.' },
    fr: { title: 'Respiration carrée', description: 'Comptes rythmiques pour réguler le système nerveux.' },
    hi: { title: 'बॉक्स श्वास', description: 'तंत्रिका तंत्र को संतुलित करने के लिए लयबद्ध गिनती।' },
    ta: { title: 'பெட்டி சுவாசம்', description: 'நரம்பு மண்டலத்தை சமநிலைப்படுத்த ரிதமிக் எண்ணிக்கை.' },
  },
  '6': {
    es: { title: 'Relajación 4-7-8', description: 'Patrón clásico de respiración con ambiente calmante.' },
    fr: { title: 'Relaxation 4-7-8', description: 'Schéma respiratoire classique avec ambiance apaisante.' },
    hi: { title: '4-7-8 विश्राम', description: 'शांत वातावरण के साथ क्लासिक श्वास पैटर्न।' },
    ta: { title: '4-7-8 தளர்வு', description: 'அமைதியான சூழலுடன் கிளாசிக் சுவாச முறை.' },
  },
  '7': {
    es: { title: 'Movimiento alegre', description: 'Estiramientos ligeros y liberación de energía.' },
    fr: { title: 'Mouvement joyeux', description: 'Étirements légers et libération d’énergie.' },
    hi: { title: 'आनंदित गति', description: 'हल्की स्ट्रेचिंग और ऊर्जा मुक्ति।' },
    ta: { title: 'மகிழ்ச்சி இயக்கம்', description: 'லேசான நீட்சி மற்றும் ஆற்றல் விடுதலை.' },
  },
  '8': {
    es: { title: 'Escaneo corporal', description: 'Atención progresiva de la cabeza a los pies.' },
    fr: { title: 'Scan corporel', description: 'Attention progressive de la tête aux pieds.' },
    hi: { title: 'शरीर स्कैन', description: 'सिर से पैर तक क्रमिक ध्यान।' },
    ta: { title: 'உடல் சோதனை', description: 'தலை முதல் பாதம் வரை படிப்படியான கவனம்.' },
  },
};

export function localizeCuratedClip<T extends { id: string; title: string; description: string }>(
  clip: T,
  locale: Locale,
): T & { aiTranslated?: boolean } {
  if (locale === DEFAULT_LOCALE) return clip;
  const tr = CURATED_CLIP_TRANSLATIONS[clip.id]?.[locale];
  if (!tr) return clip;
  return { ...clip, title: tr.title, description: tr.description, aiTranslated: true };
}
