export type LinkIcon =
  | 'calendar'
  | 'linkedin'
  | 'article'
  | 'blog';

export type Link = {
  title: string;
  description: string;
  href: string;
  action: string;
  icon: LinkIcon;
  featured?: boolean;
  newTab?: boolean;
};

export const profile = {
  name: 'Juan Maldonado',
  handle: '@jmaldonadopolo',
  description: 'Descubre las herramientas para emprender en la era digital.',
};

export const links: Link[] = [
  {
    title: 'Consultoría gratuita 30 minutos',
    description: 'Reserva una sesión estratégica en Calendly',
    href: 'https://calendly.com/juanmaldonadopolo/30min',
    action: 'Reservar',
    icon: 'calendar',
    featured: true,
  },
  {
    title: 'Conectar con LinkedIn',
    description: 'Perfil profesional y red de contactos',
    href: 'https://www.linkedin.com/in/juanmaldonadopolo',
    action: 'Conectar',
    icon: 'linkedin',
  },
  {
    title: 'En busca del equilibrio',
    description: 'Cómo la privacidad y las notificaciones impactan en la ansiedad y el enfoque',
    href: 'https://www.linkedin.com/pulse/en-busca-del-equilibrio-c%25C3%25B3mo-la-privacidad-y-las-el-maldonado-polo-9hzre/',
    action: 'Leer',
    icon: 'article',
  },
  {
    title: 'Blog',
    description: 'Ideas sobre tecnología, negocio digital y sistemas',
    href: '/blog',
    action: 'Explorar',
    icon: 'blog',
    newTab: true,
  },
];

export const socialLinks = [
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/juanmaldonadopolo/',
    icon: 'linkedin',
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/jmaldonadopolo/',
    icon: 'instagram',
  },
  {
    name: 'X',
    href: 'https://twitter.com/jmaldonadopolo',
    icon: 'x',
  },
  {
    name: 'Threads',
    href: 'https://www.threads.net/@jmaldonadopolo',
    icon: 'threads',
  },
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/juanmaldonadopolo',
    icon: 'facebook',
  },
  {
    name: 'TikTok',
    href: 'https://www.tiktok.com/@jmaldonadopolo',
    icon: 'tiktok',
  },
] as const;
