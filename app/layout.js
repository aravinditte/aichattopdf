import './globals.css';
import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
  weight: ['400'],
});

export const metadata = {
  metadataBase: new URL('https://aichattopdf.com'),
  title: {
    default: 'AIChat to PDF — Convert ChatGPT & Gemini Conversations to PDF (Free)',
    template: '%s | AIChat to PDF',
  },
  description:
    'Convert public ChatGPT and Gemini share links into clean, beautifully formatted PDF files — code blocks, tables and formatting preserved. 100% free, no login, no extension required.',
  keywords: [
    'chatgpt to pdf',
    'convert chatgpt to pdf',
    'save chatgpt conversation as pdf',
    'export chatgpt conversation',
    'gemini to pdf',
    'convert gemini to pdf',
    'save gemini conversation as pdf',
    'chatgpt export pdf',
    'ai chat to pdf',
    'chatgpt pdf converter',
    'gemini pdf converter',
    'chatgpt share link to pdf',
    'print chatgpt conversation',
    'download chatgpt as pdf',
    'ai conversation to pdf',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'AIChat to PDF — Convert ChatGPT & Gemini Conversations to PDF (Free)',
    description:
      'Convert public ChatGPT and Gemini share links into clean, beautifully formatted PDF files. Free, no login, no extension required.',
    siteName: 'AIChat to PDF',
    type: 'website',
    url: 'https://aichattopdf.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AIChat to PDF — Convert ChatGPT & Gemini Conversations to PDF',
    description:
      'Convert public ChatGPT and Gemini share links into clean, formatted PDF files. Free, no login, no extension.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'AIChat to PDF',
  url: 'https://aichattopdf.com',
  applicationCategory: 'UtilityApplication',
  operatingSystem: 'Any',
  description:
    'Convert public ChatGPT and Gemini share links into clean, beautifully formatted PDF files. Free, no login, no extension required.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'Convert ChatGPT share links to PDF',
    'Convert Gemini share links to PDF',
    'Preserves code blocks, tables and formatting',
    'No login or extension required',
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
