// app/layout.js
import './globals.css';

export const metadata = {
  title: 'Homeschool Curriculum Explorer',
  description: 'Discover and plan homeschool curriculum with AI assistance.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground font-sans antialiased min-h-screen">
        <div className="relative z-0">{children}</div>
      </body>
    </html>
  );
}
