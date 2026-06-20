export type LinkIcon =
  | 'lucide:calendar'
  | 'linkedin'
  | 'lucide:book-open';

export type Link = {
  title: string;
  description: string;
  href: string;
  action: string;
  icon: LinkIcon;
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
    icon: 'lucide:calendar',
  },
  {
    title: 'Conectar con LinkedIn',
    description: 'Perfil profesional y red de contactos',
    href: 'https://www.linkedin.com/in/juanmaldonadopolo',
    action: 'Conectar',
    icon: 'linkedin',
  },
  {
    title: 'Blog',
    description: 'Ideas sobre tecnología, negocio digital y sistemas',
    href: '/blog',
    action: 'Explorar',
    icon: 'lucide:book-open',
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
    name: 'Substack',
    href: 'https://juanmaldonadopolo.substack.com/',
    icon: 'simple:substack',
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/jmaldonadopolo/',
    icon: 'simple:instagram',
  },
  {
    name: 'X',
    href: 'https://twitter.com/jmaldonadopolo',
    icon: 'simple:x',
  },
  {
    name: 'Threads',
    href: 'https://www.threads.net/@jmaldonadopolo',
    icon: 'simple:threads',
  },
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/juanmaldonadopolo',
    icon: 'simple:facebook',
  },
  {
    name: 'TikTok',
    href: 'https://www.tiktok.com/@jmaldonadopolo',
    icon: 'simple:tiktok',
  },
] as const;
