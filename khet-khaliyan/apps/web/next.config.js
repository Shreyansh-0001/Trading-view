/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ['en','hi','bn','te','mr','ta','gu','kn','or','ml','pa','ur'],
    defaultLocale: 'en',
  },
};

module.exports = nextConfig;