type SupportedLocale = 'en' | 'es';

const CORE_KEYWORDS_EN = [
  'event website',
  'event websites',
  'digital invitations',
  'online invitations',
  'RSVP online',
  'custom event page',
  'party website',
  'invitation website',
  'event planning website',
  'GetInvita',
];

const CORE_KEYWORDS_ES = [
  'sitio web para eventos',
  'sitios web para eventos',
  'invitaciones digitales',
  'invitaciones en linea',
  'confirmar asistencia',
  'pagina personalizada para eventos',
  'sitio web para fiestas',
  'invitacion digital',
  'organizacion de eventos',
  'GetInvita',
];

const LANDING_KEYWORDS_EN = [
  ...CORE_KEYWORDS_EN,
  'quinceanera website',
  'quinceanera invitation',
  'wedding website',
  'wedding invitation website',
  'birthday website',
  'birthday invitation website',
  'baby shower website',
  'baby shower invitation',
  'event website builder',
  'create event website',
];

const LANDING_KEYWORDS_ES = [
  ...CORE_KEYWORDS_ES,
  'sitio web para quinceanera',
  'invitacion de quinceanera',
  'sitio web para boda',
  'invitacion de boda digital',
  'sitio web para cumpleanos',
  'invitacion de cumpleanos',
  'sitio web para baby shower',
  'invitacion de baby shower',
  'crear sitio web para eventos',
];

const EVENT_TYPE_KEYWORDS_EN: Record<string, string[]> = {
  sweet15: ['quinceanera website', 'quinceanera invitation', 'mis quince invitation'],
  wedding: ['wedding website', 'wedding invitation website', 'wedding RSVP page'],
  birthday: ['birthday website', 'birthday invitation website', 'birthday RSVP'],
  baby_shower: ['baby shower website', 'baby shower invitation', 'baby shower RSVP'],
  valentines: ['valentines digital card', 'valentines invitation', 'love note website'],
  mothers_day: ['mothers day card', 'mothers day digital invitation', 'mom celebration page'],
  fathers_day: ['fathers day card', 'fathers day digital invitation', 'dad celebration page'],
};

const EVENT_TYPE_KEYWORDS_ES: Record<string, string[]> = {
  sweet15: ['sitio web para quinceanera', 'invitacion de quinceanera', 'mis quince'],
  wedding: ['sitio web para boda', 'invitacion de boda digital', 'confirmacion de boda'],
  birthday: ['sitio web para cumpleanos', 'invitacion de cumpleanos', 'confirmar asistencia cumpleanos'],
  baby_shower: ['sitio web para baby shower', 'invitacion de baby shower', 'confirmar asistencia baby shower'],
  valentines: ['tarjeta digital de san valentin', 'invitacion de san valentin', 'mensaje romantico'],
  mothers_day: ['tarjeta para el dia de la madre', 'mensaje para mama', 'tarjeta digital para mama'],
  fathers_day: ['tarjeta para el dia del padre', 'mensaje para papa', 'tarjeta digital para papa'],
};

function uniqueKeywords(keywords: string[]): string[] {
  return [...new Set(keywords)];
}

export const GLOBAL_KEYWORDS = uniqueKeywords([...CORE_KEYWORDS_EN, ...CORE_KEYWORDS_ES]);
export const LANDING_KEYWORDS_ENGLISH = uniqueKeywords(LANDING_KEYWORDS_EN);
export const LANDING_KEYWORDS_SPANISH = uniqueKeywords(LANDING_KEYWORDS_ES);

export function getEventKeywords(eventType: string, eventName: string, locale: SupportedLocale): string[] {
  const localeCore = locale === 'es' ? CORE_KEYWORDS_ES : CORE_KEYWORDS_EN;
  const localeTypeMap = locale === 'es' ? EVENT_TYPE_KEYWORDS_ES : EVENT_TYPE_KEYWORDS_EN;
  const typeKeywords = localeTypeMap[eventType] || [];
  return uniqueKeywords([eventName, ...localeCore, ...typeKeywords]);
}
