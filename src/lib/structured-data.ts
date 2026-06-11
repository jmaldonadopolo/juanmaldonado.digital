export type StructuredData = Record<string, unknown>;

export const SITE_URL = 'https://juanmaldonado.digital/';
export const PERSON_ID = `${SITE_URL}#person`;
export const WEBSITE_ID = `${SITE_URL}#website`;

const socialProfiles = [
  'https://www.linkedin.com/in/juanmaldonadopolo/',
  'https://www.instagram.com/jmaldonadopolo/',
  'https://twitter.com/jmaldonadopolo',
  'https://www.threads.net/@jmaldonadopolo',
  'https://www.facebook.com/juanmaldonadopolo',
  'https://www.tiktok.com/@jmaldonadopolo',
];

interface StructuredDataOptions {
  canonical: string;
  imageUrl: string;
  imageAlt: string;
  title: string;
  description: string;
  page?: StructuredData[];
}

export function buildStructuredData({
  canonical,
  imageUrl,
  imageAlt,
  title,
  description,
  page,
}: StructuredDataOptions) {
  const primaryImageId = `${canonical}#primary-image`;
  const defaultPage: StructuredData[] = [
    {
      '@type': 'ProfilePage',
      '@id': `${canonical}#profile-page`,
      url: canonical,
      name: title,
      description,
      inLanguage: 'es-CO',
      isPartOf: { '@id': WEBSITE_ID },
      mainEntity: { '@id': PERSON_ID },
      primaryImageOfPage: { '@id': primaryImageId },
    },
    {
      '@type': 'ItemList',
      '@id': `${canonical}#featured-links`,
      name: 'Enlaces destacados de Juan Maldonado',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Consultoría gratuita 30 minutos',
          url: 'https://calendly.com/juanmaldonadopolo/30min',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Perfil de LinkedIn',
          url: 'https://www.linkedin.com/in/juanmaldonadopolo',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Artículo: En busca del equilibrio',
          url: 'https://www.linkedin.com/pulse/en-busca-del-equilibrio-c%25C3%25B3mo-la-privacidad-y-las-el-maldonado-polo-9hzre/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Blog de Juan Maldonado',
          url: `${SITE_URL}blog/`,
        },
      ],
    },
  ];

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': PERSON_ID,
        name: 'Juan Maldonado',
        alternateName: '@jmaldonadopolo',
        url: SITE_URL,
        description:
          'Tecnología, sistemas, inteligencia artificial y negocio digital para emprender con criterio.',
        jobTitle: 'Consultor de tecnología y negocio digital',
        image: `${SITE_URL}miniatura-social.jpg`,
        knowsAbout: [
          'Tecnología',
          'Negocio digital',
          'Emprendimiento',
          'Sistemas',
          'Inteligencia artificial',
        ],
        sameAs: socialProfiles,
      },
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        url: SITE_URL,
        name: 'Juan Maldonado',
        alternateName: 'juanmaldonado.digital',
        description:
          'Tecnología, sistemas, inteligencia artificial y negocio digital para emprender con criterio.',
        inLanguage: 'es-CO',
        publisher: { '@id': PERSON_ID },
      },
      {
        '@type': 'ImageObject',
        '@id': primaryImageId,
        url: imageUrl,
        contentUrl: imageUrl,
        width: 1200,
        height: 630,
        caption: imageAlt,
        representativeOfPage: true,
      },
      ...(page ?? defaultPage),
    ],
  };
}
