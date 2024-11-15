import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Sidebar } from '@/components/layout/Sidebar';
import { SearchHeader } from '@/components/layout/SearchHeader';
import { Providers } from '@/components/providers/Providers';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VertexBazar - Gaming Marketplace',
  description: 'Your one-stop destination for game cards, top-ups, and digital gaming products',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          <div className="flex h-screen bg-background">
            <Sidebar />
            <main className="flex-1 overflow-auto">
              <SearchHeader />
              {children}
            </main>
          </div>
          <Toaster position="bottom-right" theme="dark" />
        </Providers>
      </body>
    </html>
  );
}