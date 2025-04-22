// app/layout.js
import './globals.css';
import Header from './components/Header';

export const metadata = {
  title: 'Homeschool Curriculum Explorer',
  description: 'Discover and plan homeschool curriculum with AI assistance.',
  keywords: [
    'homeschool curriculum',
    'homeschool schedule planner',
    'AI homeschool assistant',
    'custom homeschool plan',
    'weekly homeschool planner',
    'best homeschool tools',
    'Utah homeschool',
    'state-aligned homeschool',
    'homeschool planning app',
    'curriculum recommendation tool',
  ],
  icons: {
    icon: '/favicon.ico',
  },
  metadataBase: new URL('https://homeschoolhelp.ai'),
  alternates: {
    canonical: 'https://homeschoolhelp.ai',
  },
  openGraph: {
    title: 'Homeschool Curriculum Explorer',
    description: 'Discover and plan homeschool curriculum with AI assistance.',
    url: 'https://homeschoolhelp.ai',
    siteName: 'Homeschool Curriculum Explorer',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Homeschool Curriculum Explorer',
      },
    ],
    type: 'website',
  },
  themeColor: '#ffffff',
  viewport: 'width=device-width, initial-scale=1',
};


export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground font-sans antialiased min-h-screen">
        <Header />
        <main className="relative z-0">{children}</main>
      </body>
    </html>
  );
}
