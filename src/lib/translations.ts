export type Lang = 'en' | 'es';

const translations: Record<string, Record<Lang, string>> = {
  // ── Invitation Intro ──
  'intro.youAreInvitedTo': { en: 'You are invited to', es: 'Estás invitado(a) a' },
  'intro.tapToOpen': { en: 'Tap to open', es: 'Toca para abrir' },
  'intro.happyValentines': { en: "Happy Valentine's Day", es: 'Feliz Día de San Valentín' },
  'intro.happyMothersDay': { en: "Happy Mother's Day", es: 'Feliz Día de las Madres' },
  'intro.happyFathersDay': { en: "Happy Father's Day", es: 'Feliz Día del Padre' },

  // ── Countdown ──
  'countdown.days': { en: 'Days', es: 'Días' },
  'countdown.hours': { en: 'Hours', es: 'Horas' },
  'countdown.minutes': { en: 'Minutes', es: 'Minutos' },
  'countdown.seconds': { en: 'Seconds', es: 'Segundos' },
  'countdown.celebrationIsHere': { en: 'The celebration is here!', es: '¡La celebración ha llegado!' },

  // ── RSVP Form ──
  'rsvp.yourName': { en: 'Your name', es: 'Tu nombre' },
  'rsvp.attending': { en: 'Attending', es: 'Asistiré' },
  'rsvp.notAttending': { en: 'Not Attending', es: 'No asistiré' },
  'rsvp.numberOfGuests': { en: 'Number of guests', es: 'Número de invitados' },
  'rsvp.songRequest': { en: 'Song request (optional)', es: 'Canción favorita (opcional)' },
  'rsvp.leaveMessage': { en: 'Leave a message (optional)', es: 'Deja un mensaje (opcional)' },
  'rsvp.sending': { en: 'Sending...', es: 'Enviando...' },
  'rsvp.sendRsvp': { en: 'Send RSVP', es: 'Enviar RSVP' },
  'rsvp.thankYou': { en: 'Thank you, {name}!', es: '¡Gracias, {name}!' },
  'rsvp.lookForward': { en: 'We look forward to seeing you there!', es: '¡Esperamos verte ahí!' },
  'rsvp.missYou': { en: "We'll miss you!", es: '¡Te extrañaremos!' },
  'rsvp.error': { en: 'Failed to submit. Please try again.', es: 'Error al enviar. Inténtalo de nuevo.' },

  // ── Powered By Footer ──
  'footer.createYourOwn': { en: 'Create your own invitation at', es: 'Crea tu propia invitación en' },

  // ── Wedding Template ──
  'wedding.gettingMarried': { en: "We're Getting Married", es: 'Nos Casamos' },
  'wedding.daysUntilIDo': { en: 'Days Until We Say I Do', es: 'Días Para el Gran Día' },
  'wedding.ourStory': { en: 'Our Story', es: 'Nuestra Historia' },
  'wedding.churchCeremony': { en: 'Church Ceremony', es: 'Ceremonia Religiosa' },
  'wedding.weddingDetails': { en: 'Wedding Details', es: 'Detalles de la Boda' },
  'wedding.details': { en: 'Details', es: 'Detalles' },
  'wedding.giftRegistry': { en: 'Gift Registry', es: 'Mesa de Regalos' },
  'wedding.viewRegistry': { en: 'View Registry', es: 'Ver Mesa de Regalos' },
  'wedding.padrinos': { en: 'Padrinos', es: 'Padrinos' },
  'wedding.ourMoments': { en: 'Our Moments', es: 'Nuestros Momentos' },
  'wedding.rsvp': { en: 'RSVP', es: 'Confirmación' },
  'wedding.kindlyRespond': { en: 'Kindly respond by your earliest convenience', es: 'Por favor confirma tu asistencia' },
  'wedding.dressCode': { en: 'Dress Code', es: 'Código de Vestimenta' },
  'wedding.accommodations': { en: 'Accommodations', es: 'Hospedaje' },

  // ── Sweet 15 Template ──
  'sweet15.misQuince': { en: 'Mis Quince Años', es: 'Mis Quince Años' },
  'sweet15.presentedBy': { en: 'Presented by', es: 'Presentada por' },
  'sweet15.countingDown': { en: 'Counting Down To', es: 'Cuenta Regresiva' },
  'sweet15.churchCeremony': { en: 'Church Ceremony', es: 'Ceremonia Religiosa' },
  'sweet15.celebrationDetails': { en: 'Celebration Details', es: 'Detalles de la Celebración' },
  'sweet15.details': { en: 'Details', es: 'Detalles' },
  'sweet15.theme': { en: 'Theme', es: 'Temática' },
  'sweet15.dressCode': { en: 'Dress Code', es: 'Código de Vestimenta' },
  'sweet15.courtOfHonor': { en: 'Court of Honor', es: 'Corte de Honor' },
  'sweet15.padrinos': { en: 'Padrinos', es: 'Padrinos' },
  'sweet15.gallery': { en: 'Gallery', es: 'Galería' },
  'sweet15.rsvp': { en: 'RSVP', es: 'Confirmación' },
  'sweet15.rsvpMessage': { en: 'We would love to have you celebrate with us!', es: '¡Nos encantaría que celebres con nosotros!' },

  // ── Birthday Template ──
  'birthday.turning': { en: 'Turning {age}!', es: '¡Cumple {age}!' },
  'birthday.celebration': { en: 'Birthday Celebration', es: 'Fiesta de Cumpleaños' },
  'birthday.partyStartsIn': { en: 'Party Starts In', es: 'La Fiesta Comienza En' },
  'birthday.churchCeremony': { en: 'Church Ceremony', es: 'Ceremonia Religiosa' },
  'birthday.partyDetails': { en: 'Party Details', es: 'Detalles de la Fiesta' },
  'birthday.times': { en: 'Times', es: 'Horarios' },
  'birthday.theme': { en: 'Theme', es: 'Temática' },
  'birthday.dressCode': { en: 'Dress Code', es: 'Código de Vestimenta' },
  'birthday.photoGallery': { en: 'Photo Gallery', es: 'Galería de Fotos' },
  'birthday.photos': { en: 'Photos', es: 'Fotos' },
  'birthday.rsvp': { en: 'RSVP', es: 'Confirmación' },
  'birthday.rsvpMessage': { en: 'Let us know if you can make it!', es: '¡Déjanos saber si puedes asistir!' },

  // ── Baby Shower Template ──
  'babyShower.title': { en: 'Baby Shower', es: 'Baby Shower' },
  'babyShower.welcomeBaby': { en: 'Welcome Baby', es: 'Bienvenido(a) Bebé' },
  'babyShower.celebrating': { en: 'Celebrating', es: 'Celebrando a' },
  'babyShower.babyArrivesIn': { en: 'Baby Arrives In', es: 'El Bebé Llega En' },
  'babyShower.showerDayIn': { en: 'Shower Day In', es: 'Día del Shower En' },
  'babyShower.churchCeremony': { en: 'Church Ceremony', es: 'Ceremonia Religiosa' },
  'babyShower.showerDetails': { en: 'Shower Details', es: 'Detalles del Baby Shower' },
  'babyShower.details': { en: 'Details', es: 'Detalles' },
  'babyShower.times': { en: 'Times', es: 'Horarios' },
  'babyShower.shower': { en: 'Shower', es: 'Shower' },
  'babyShower.theme': { en: 'Theme', es: 'Temática' },
  'babyShower.dueDate': { en: 'Due Date', es: 'Fecha de Nacimiento' },
  'babyShower.giftRegistry': { en: 'Gift Registry', es: 'Mesa de Regalos' },
  'babyShower.registryMessage': { en: 'Help welcome the little one with something special!', es: '¡Ayúdanos a darle la bienvenida con algo especial!' },
  'babyShower.viewRegistry': { en: 'View Registry', es: 'Ver Mesa de Regalos' },
  'babyShower.photos': { en: 'Photos', es: 'Fotos' },
  'babyShower.rsvp': { en: 'RSVP', es: 'Confirmación' },
  'babyShower.rsvpMessage': { en: 'Please let us know if you can join us!', es: '¡Por favor déjanos saber si puedes acompañarnos!' },

  // ── Shared time labels ──
  'time.label': { en: 'Time:', es: 'Hora:' },
  'time.ceremony': { en: 'Ceremony:', es: 'Ceremonia:' },
  'time.reception': { en: 'Reception:', es: 'Recepción:' },
  'time.dinner': { en: 'Dinner:', es: 'Cena:' },
  'time.party': { en: 'Party:', es: 'Fiesta:' },

  // ── Event type labels (for metadata) ──
  'eventType.sweet15': { en: 'Quinceañera', es: 'Quinceañera' },
  'eventType.wedding': { en: 'Wedding', es: 'Boda' },
  'eventType.birthday': { en: 'Birthday', es: 'Cumpleaños' },
  'eventType.baby_shower': { en: 'Baby Shower', es: 'Baby Shower' },
  'eventType.valentines': { en: "Valentine's Day", es: 'Día de San Valentín' },
  'eventType.mothers_day': { en: "Mother's Day", es: 'Día de las Madres' },
  'eventType.fathers_day': { en: "Father's Day", es: 'Día del Padre' },

  // ── Landing: Navbar ──
  'landing.nav.signIn': { en: 'Sign In', es: 'Iniciar Sesión' },
  'landing.nav.signUp': { en: 'Sign Up', es: 'Regístrate' },

  // ── Landing: Hero ──
  'landing.hero.badge': { en: 'Beautiful event websites in minutes', es: 'Sitios web para eventos en minutos' },
  'landing.hero.h1Line1': { en: 'Create Your Wedding or Quinceañera Website', es: 'Crea Tu Sitio Web de Boda o Quinceañera' },
  'landing.hero.h1Line2': { en: 'Invitation in Minutes With Music, Photos & RSVP', es: 'Invitación en Minutos Con Música, Fotos y RSVP' },
  'landing.hero.paragraph': { en: 'Add your photos, choose your music, collect RSVPs, and share your custom link — all in minutes.', es: 'Agrega tus fotos, elige tu música, recibe confirmaciones y comparte tu enlace — todo en minutos.' },
  'landing.hero.cta1': { en: 'Get Started', es: 'Comenzar' },
  'landing.hero.cta2': { en: 'See Event Types', es: 'Ver Tipos de Eventos' },

  // ── Landing: EventTypes ──
  'landing.eventTypes.heading': { en: 'Built for Your Biggest Moments', es: 'Creado Para Tus Mejores Momentos' },
  'landing.eventTypes.subheading': { en: 'Premium event websites for weddings and quinceañeras — plus cards and sites for every other celebration.', es: 'Sitios web premium para bodas y quinceañeras — más tarjetas y sitios para cada celebración.' },
  'landing.eventTypes.otherCelebrations': { en: 'Other Celebrations', es: 'Otras Celebraciones' },
  'landing.eventTypes.getStarted': { en: 'Get Started', es: 'Comenzar' },
  'landing.eventTypes.startingAt': { en: 'Starting at $', es: 'Desde $' },
  'landing.eventType.sweet15.label': { en: 'Sweet 15 / Quinceañera', es: 'Quinceañera / XV Años' },
  'landing.eventType.sweet15.description': { en: 'Celebrate this milestone with a stunning rose & gold themed website featuring your court of honor.', es: 'Celebra este momento con un hermoso sitio web en rosa y dorado con tu corte de honor.' },
  'landing.eventType.wedding.label': { en: 'Wedding', es: 'Boda' },
  'landing.eventType.wedding.description': { en: 'Share your love story with an elegant ivory & sage wedding website with RSVP and registry.', es: 'Comparte tu historia de amor con un elegante sitio web de boda con RSVP y mesa de regalos.' },
  'landing.eventType.birthday.label': { en: 'Birthday', es: 'Cumpleaños' },
  'landing.eventType.birthday.description': { en: 'Throw the ultimate birthday bash with a vibrant, fun website that puts the spotlight on the guest of honor.', es: 'Organiza la mejor fiesta de cumpleaños con un sitio web vibrante y divertido.' },
  'landing.eventType.baby_shower.label': { en: 'Baby Shower', es: 'Baby Shower' },
  'landing.eventType.baby_shower.description': { en: 'Welcome the little one with a soft pastel baby shower page featuring registry and wishes.', es: 'Dale la bienvenida al bebé con una página en tonos pastel con mesa de regalos y buenos deseos.' },
  'landing.eventType.valentines.label': { en: "Valentine's Day", es: 'Día de San Valentín' },
  'landing.eventType.valentines.description': { en: "Send a sweet Valentine's card to someone special with a personalized message.", es: 'Envía una dulce tarjeta de San Valentín con un mensaje personalizado.' },
  'landing.eventType.mothers_day.label': { en: "Mother's Day", es: 'Día de las Madres' },
  'landing.eventType.mothers_day.description': { en: "Celebrate Mom with a beautiful personalized card she'll treasure.", es: 'Celebra a Mamá con una hermosa tarjeta personalizada que atesorará.' },
  'landing.eventType.fathers_day.label': { en: "Father's Day", es: 'Día del Padre' },
  'landing.eventType.fathers_day.description': { en: 'Show Dad some love with a personalized card just for him.', es: 'Demuéstrale a Papá tu cariño con una tarjeta personalizada.' },

  // ── Landing: HowItWorks ──
  'landing.howItWorks.heading': { en: 'How It Works', es: 'Cómo Funciona' },
  'landing.howItWorks.subheading': { en: 'Four simple steps to your perfect event website', es: 'Cuatro pasos sencillos para tu sitio web de evento perfecto' },
  'landing.howItWorks.step1.title': { en: 'Choose Your Event', es: 'Elige Tu Evento' },
  'landing.howItWorks.step1.description': { en: 'Pick your event type and fill in a few details to get started.', es: 'Selecciona tu tipo de evento y completa algunos detalles para comenzar.' },
  'landing.howItWorks.step2.title': { en: 'Upload Your Content', es: 'Sube Tu Contenido' },
  'landing.howItWorks.step2.description': { en: 'Use your private dashboard to add photos, music, and event details.', es: 'Usa tu panel privado para agregar fotos, música y detalles del evento.' },
  'landing.howItWorks.step3.title': { en: 'Preview & Publish', es: 'Vista Previa y Publica' },
  'landing.howItWorks.step3.description': { en: "Review your beautiful event page and publish it when you're ready.", es: 'Revisa tu hermosa página de evento y publícala cuando estés lista.' },
  'landing.howItWorks.step4.title': { en: 'Share & Celebrate', es: 'Comparte y Celebra' },
  'landing.howItWorks.step4.description': { en: 'Send your custom link to guests so they can RSVP and get excited!', es: '¡Envía tu enlace personalizado a los invitados para que confirmen su asistencia!' },

  // ── Landing: Testimonials ──
  'landing.testimonials.heading': { en: 'Loved by Families', es: 'Las Familias Nos Aman' },
  'landing.testimonials.subheading': { en: 'See what our customers have to say.', es: 'Mira lo que dicen nuestros clientes.' },

  // ── Landing: Pricing ──
  'landing.pricing.heading': { en: 'Choose Your Event Type', es: 'Elige Tu Tipo de Evento' },
  'landing.pricing.subheading': { en: 'Pick the perfect template for your celebration and get started in minutes.', es: 'Elige la plantilla perfecta para tu celebración y comienza en minutos.' },
  'landing.pricing.createYourSite': { en: 'Create Your Site', es: 'Crea Tu Sitio' },
  'landing.pricing.feature.customThemed': { en: 'Custom themed event page', es: 'Página de evento con tema personalizado' },
  'landing.pricing.feature.photoGallery': { en: 'Photo gallery with lightbox', es: 'Galería de fotos con lightbox' },
  'landing.pricing.feature.musicPlayer': { en: 'Background music player', es: 'Reproductor de música de fondo' },
  'landing.pricing.feature.countdown': { en: 'Live countdown timer', es: 'Cuenta regresiva en vivo' },
  'landing.pricing.feature.rsvp': { en: 'RSVP collection', es: 'Recolección de RSVP' },
  'landing.pricing.feature.responsive': { en: 'Mobile responsive design', es: 'Diseño adaptable a móviles' },
  'landing.pricing.feature.shareableLink': { en: 'Shareable custom link', es: 'Enlace personalizado para compartir' },
  'landing.pricing.feature.unlimitedPhotos': { en: 'Unlimited photo uploads', es: 'Subida ilimitada de fotos' },
  'landing.pricing.feature.customThemedCard': { en: 'Custom themed card page', es: 'Tarjeta con tema personalizado' },
  'landing.pricing.feature.personalizedMessage': { en: 'Personalized message', es: 'Mensaje personalizado' },

  // ── Landing: LiveDemo ──
  'landing.liveDemo.heading': { en: 'See It in Action', es: 'Míralo en Acción' },
  'landing.liveDemo.subheading': { en: 'This is a real event site built with GetInvita. Scroll, tap, and turn up the volume.', es: 'Este es un sitio de evento real hecho con GetInvita. Desplázate, toca y sube el volumen.' },
  'landing.liveDemo.tapToExplore': { en: 'Tap to Explore', es: 'Toca para Explorar' },
  'landing.liveDemo.interactiveDemo': { en: 'Interactive demo with audio', es: 'Demo interactivo con audio' },

  // ── Landing: Footer ──
  'landing.footer.tagline': { en: "Beautiful event websites for life's biggest celebrations.", es: 'Hermosos sitios web para las celebraciones más importantes de tu vida.' },
  'landing.footer.getStarted': { en: 'Get Started', es: 'Comenzar' },
  'landing.footer.eventTypes': { en: 'Event Types', es: 'Tipos de Eventos' },
  'landing.footer.eventOptions': { en: 'Event Options', es: 'Opciones de Eventos' },
  'landing.footer.termsAndPolicy': { en: 'Terms & Policy', es: 'Términos y Política' },
  'landing.footer.copyright': { en: 'All rights reserved.', es: 'Todos los derechos reservados.' },

  // ── Metadata ──
  'meta.description': {
    en: "You're invited to {name} — a {type} celebration. View details, RSVP, and more.",
    es: 'Estás invitado(a) a {name} — una celebración de {type}. Ve los detalles, confirma tu asistencia y más.',
  },
};

export function t(key: string, lang: Lang = 'en', params?: Record<string, string>): string {
  const entry = translations[key];
  if (!entry) return key;
  let result = entry[lang] ?? entry.en;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      result = result.replace(`{${k}}`, v);
    }
  }
  return result;
}

export function formatDateLocalized(dateStr: string, lang: Lang = 'en'): string {
  const datePart = dateStr.substring(0, 10);
  const locale = lang === 'es' ? 'es-MX' : 'en-US';
  return new Date(`${datePart}T12:00:00`).toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
