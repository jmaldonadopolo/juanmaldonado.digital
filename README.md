# juanmaldonado.digital

Sitio personal de Juan Maldonado construido con Astro. Combina una portada de enlaces profesionales con un blog estático, optimizado para rendimiento, accesibilidad, SEO técnico y previsualizaciones sociales.

## Objetivo

El proyecto cumple dos funciones:

1. `/` presenta el perfil, CTA de consultoría, enlaces principales y redes sociales.
2. `/blog/` publica artículos propios migrados desde LinkedIn con portada, metadatos y contenido completo.

La interfaz sigue la identidad visual de la marca personal JM: fondo oscuro, superficies de grafito, tipografía geométrica y acento verde ácido.

La portada mantiene tres accesos principales:

1. Consultoría gratuita de 30 minutos.
2. Perfil profesional de LinkedIn.
3. Blog interno.

Los artículos se consultan desde `/blog/`; no se duplican como botones individuales en la portada.

## Stack

- Astro 6 con generación estática.
- TypeScript estricto.
- Tailwind CSS 4 mediante `@tailwindcss/vite`.
- `@tailwindcss/typography` para el cuerpo de los artículos.
- Astro Content Collections para gestionar el blog.
- `astro:assets` para imágenes locales optimizadas.
- `astro-seo` para metadatos, Open Graph y Twitter Cards.
- `@astrojs/sitemap` para generar el sitemap.

## Comandos

```bash
npm install
npm run dev
npm run check
npm run build
npm run preview
```

El servidor local usa normalmente:

```text
http://localhost:4321/
```

## Rutas

```text
/                                            Perfil y enlaces
/404.html                                    Página de error personalizada
/blog/                                      Índice del blog
/blog/enganchados-al-scroll/
/blog/en-busca-del-equilibrio/
/blog/considera-astro-en-lugar-de-wordpress/
```

Las rutas de artículos se generan estáticamente desde `src/content/blog`.

## Estructura

```text
src/
├── assets/
│   ├── blog/                 Portadas originales de los artículos
│   ├── icons/                Iconos SVG locales
│   ├── avatar-profile.png    Avatar principal
│   └── logo.svg              Logotipo JM
├── components/
│   ├── BlogPostCard.astro    Tarjeta del índice
│   ├── AuthorBadge.astro     Firma del autor en tarjetas y artículos
│   ├── Icon.astro            Registro central de iconos
│   ├── ShareButtons.astro    Enlaces sociales para compartir artículos
│   └── SiteSeo.astro         Integración central de astro-seo
├── content/blog/             Artículos Markdown
├── data/links.ts             Perfil, CTA, enlaces y redes
├── layouts/
│   ├── BaseLayout.astro      Documento HTML y fondo global
│   └── BlogLayout.astro      Navegación y estructura del blog
├── lib/structured-data.ts    Grafo JSON-LD compartido
├── pages/
│   ├── 404.astro                 Página de error no indexable
│   ├── index.astro
│   └── blog/
└── styles/global.css         Theme de Tailwind
```

## Diseño y theme

Los tokens están definidos en `src/styles/global.css` mediante `@theme`:

| Token | Valor | Uso |
| --- | --- | --- |
| `void` | `#090909` | Fondo principal |
| `graphite` | `#131313` | Tarjetas y superficies |
| `steel` | `#1e1e1e` | Bordes y divisores |
| `bone` | `#eaeaea` | Texto principal |
| `smoke` | `#929292` | Texto secundario accesible |
| `acid` | `#b6ff28` | CTA, foco y acentos |

Tipografías:

- Geist: texto general y referencia principal de marca.
- Space Grotesk: títulos.
- JetBrains Mono: etiquetas, metadatos y elementos técnicos.

No añadir CSS personalizado si una utilidad o token de Tailwind resuelve el caso. Las clases deben usar sintaxis canónica de Tailwind 4 siempre que exista.

El plugin `@tailwindcss/typography` está registrado en `src/styles/global.css` y se aplica con `prose prose-invert` al contenido Markdown. Proporciona una base tipográfica consistente para párrafos, encabezados, listas, enlaces, citas, bloques de código y tablas; las variantes `prose-*` adaptan esa base al theme JM.

Detalles de interacción:

- Ningún botón principal mantiene un estado activo permanente.
- Los botones comparten estados `hover` y foco consistentes.
- La bolita verde del avatar gira una vez al cargar y vuelve a girar al pasar el cursor.
- La animación se desactiva cuando el usuario solicita reducción de movimiento.
- El logo del blog conserva un área táctil mínima de 44 px y se muestra a 48 px en móvil y 56 px desde `sm`.

## Contenido del blog

La colección se define en `src/content.config.ts`.

Frontmatter requerido:

```yaml
---
title: "Título"
description: "Descripción SEO"
pubDate: 2025-01-01
updatedDate: 2025-01-02 # opcional
image: "../../assets/blog/portada.jpg"
imageAlt: "Descripción accesible de la portada"
sourceUrl: "https://www.linkedin.com/pulse/..."
tags: ["Tecnología", "IA"]
readingTime: "4 min"
draft: false
---
```

Para añadir un artículo:

1. Guardar la portada en `src/assets/blog`.
2. Crear el Markdown en `src/content/blog`.
3. Completar todo el frontmatter.
4. Usar un nombre de archivo en minúsculas y con guiones.
5. Ejecutar `npm run build`.
6. Verificar la tarjeta, el artículo y la imagen Open Graph.

No guardar portadas ni el avatar en `public`. Deben permanecer en `src/assets` para ser procesados por `astro:assets`.

Los archivos deben tener una extensión coherente con su formato real. La portada de `enganchados-al-scroll` fue normalizada de PNG renombrado a JPEG real, reduciendo su peso aproximado de 1.38 MB a 144 KB sin alterar sus dimensiones de 1024×576.

## SEO

`src/components/SiteSeo.astro` es la única integración con `astro-seo`.

Genera:

- Título con plantilla `Título | Juan Maldonado`.
- Descripción.
- Canonical absoluto.
- Robots.
- Open Graph.
- Twitter Card con `@jmaldonadopolo`.
- Favicon y manifest.
- Metadatos específicos de artículos.

`astro-seo` no genera Schema.org. El JSON-LD se mantiene separado en `src/lib/structured-data.ts`.

El grafo incluye, según la página:

- `Person`
- `WebSite`
- `ImageObject`
- `ProfilePage`
- `CollectionPage`
- `WebPage`
- `BlogPosting`
- `BreadcrumbList`
- `ItemList`

La propiedad `Person.image` usa el avatar optimizado desde `src/assets`; las imágenes de Open Graph usan la miniatura de marca o la portada específica del artículo.

Cada artículo genera una portada social JPG de 1200×630 con `getImage()`. Esta transformación es necesaria para obtener una URL pública estable desde una imagen almacenada en `src/assets`.

La imagen general del sitio es:

```text
public/miniatura-social.jpg
```

El dominio canónico se configura en `astro.config.mjs`:

```text
https://juanmaldonado.digital
```

### Página 404

`src/pages/404.astro` genera `dist/404.html` para que el proveedor de hosting la utilice ante rutas inexistentes.

- Mantiene la identidad visual JM y el fondo global.
- Incluye enlaces accesibles hacia `/` y `/blog/`.
- Utiliza `noindex, nofollow`.
- No emite JSON-LD, porque una página de error no debe presentarse como contenido enriquecido.
- No se incluye en el sitemap.
- Funciona sin JavaScript cliente.

## Accesibilidad

Decisiones implementadas:

- Un solo `h1` por página.
- Enlace para saltar al contenido.
- Estados de foco visibles con el color `acid`.
- Contraste AA en texto principal y secundario.
- Objetivos táctiles de al menos 44×44 en redes.
- Textos alternativos en imágenes.
- Iconos decorativos ocultos a tecnologías de asistencia.
- Aviso accesible en enlaces que abren una pestaña nueva.
- Migas de pan semánticas en artículos.
- Soporte para `prefers-reduced-motion`.
- `lang="es-PE"`.

## Rendimiento

- Salida completamente estática.
- Sin framework cliente ni hidratación JavaScript.
- Imágenes responsivas mediante `astro:assets`.
- La primera portada del índice y la portada del artículo se priorizan.
- Las demás portadas usan carga diferida.
- Fuentes cargadas desde el `<head>` con conexiones anticipadas.
- Sitemap, robots y manifest generados o servidos como archivos estáticos.
- El build publicado no contiene archivos JavaScript.
- El artefacto estático completo pesa aproximadamente 1.66 MB en el estado auditado.

## Enlaces configurados

- Consultoría: `https://calendly.com/juanmaldonadopolo/30min`
- LinkedIn: `https://www.linkedin.com/in/juanmaldonadopolo`
- Instagram: `https://www.instagram.com/jmaldonadopolo/`
- X: `https://twitter.com/jmaldonadopolo`
- Threads: `https://www.threads.net/@jmaldonadopolo`
- Facebook: `https://www.facebook.com/juanmaldonadopolo`
- TikTok: `https://www.tiktok.com/@jmaldonadopolo`

Los datos editables de la portada están centralizados en `src/data/links.ts`.

El botón del blog abre `/blog` en una pestaña nueva. Los artículos enlazan internamente desde las tarjetas y conservan un enlace a su publicación original en LinkedIn.

## Reglas para futuros cambios

1. Mantener la identidad visual y los tokens existentes.
2. Usar siempre clases Tailwind; no crear estilos aislados en los componentes.
3. Preferir rutas `@/` para importaciones internas.
4. Guardar imágenes procesables en `src/assets`.
5. No duplicar metadatos SEO fuera de `SiteSeo.astro`.
6. Mantener JSON-LD separado de `astro-seo`.
7. No eliminar contenido, enlaces o iconos sin eliminar también sus referencias.
8. No introducir JavaScript cliente salvo necesidad demostrable.
9. Conservar HTML semántico, navegación por teclado y estados de foco.
10. Ejecutar `npm run build` después de modificar contenido, rutas, imágenes o configuración.
11. Ejecutar también `npm run check`; no depender únicamente de que el build termine correctamente.
12. Comprobar que la extensión de cada imagen coincida con su formato binario real.

## Verificación esperada

Antes de considerar un cambio terminado:

```bash
npm run check
npm run build
```

Además, comprobar:

- `/` en escritorio y móvil.
- `/blog/` en escritorio y móvil.
- Al menos un artículo.
- Ausencia de desbordamiento horizontal.
- Canonical y `og:image`.
- Un solo `h1`.
- Ninguna imagen sin `alt`.
- Ningún enlace vacío.
- Consola del navegador sin errores.

Última auditoría:

- `astro check`: 0 errores, 0 advertencias y 0 sugerencias.
- `astro build`: 6 páginas estáticas generadas correctamente, 5 indexables y la página `404.html`.
- `404.html` queda fuera del sitemap.
- Portada, índice y artículo verificados a 360 px sin desbordamiento horizontal.
- Canonicals, Open Graph, Twitter Cards, sitemap y JSON-LD verificados en el HTML final.
- `Person.image` utiliza el avatar optimizado.
- Las imágenes Open Graph de los artículos utilizan sus portadas JPG de 1200×630.
- Ninguna imagen renderizada carece de atributo `alt`.
- Ningún enlace renderizado carece de texto o nombre accesible.

## Estado conocido de dependencias

`npm audit` reporta vulnerabilidades moderadas sin corrección disponible en `yaml-language-server`, dependencia transitiva de las herramientas de comprobación incluidas por `astro-seo`.

El sitio se genera como HTML estático y ese servidor de lenguaje no se incluye en los archivos publicados. No aplicar `npm audit fix --force`, porque no existe una corrección compatible confirmada y podría romper la cadena de Astro.

## Solución de problemas en desarrollo

Astro sirve las imágenes procesadas mediante `/_image` durante el desarrollo. Si se reemplaza un archivo binario mientras `npm run dev` está activo, el servicio puede conservar temporalmente metadatos o caché incompatibles y responder `500`.

Procedimiento:

1. Confirmar que solo exista una instancia de Astro para este workspace.
2. Detener el servidor de desarrollo.
3. Iniciar nuevamente `npm run dev`.
4. Recargar la página y comprobar que las imágenes tengan dimensiones naturales válidas.

No mantener dos procesos Astro sobre el puerto `4321`; puede provocar respuestas inconsistentes y dificultar el diagnóstico.
