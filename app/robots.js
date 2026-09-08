export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/',
    },
    sitemap: 'https://aichattopdf.netlify.com/sitemap.xml',
  };
}
