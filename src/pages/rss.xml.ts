import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_URL } from '@/lib/structured-data';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );

  return rss({
    title: 'Juan Maldonado — Blog',
    description:
      'Tecnología, sistemas, inteligencia artificial y negocio digital para emprender con criterio.',
    site: context.site ?? SITE_URL,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.id}/`,
      categories: post.data.tags,
      author: 'Juan Maldonado',
    })),
    customData: '<language>es-PE</language>',
    stylesheet: false,
  });
}
