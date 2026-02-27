import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';

export const metadata: Metadata = {
  title: 'CashThesis Command Center',
  description: 'Trend monitoring, content generation & funnel planning',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="flex h-screen overflow-hidden bg-[#0a0a0f]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </body>
    </html>
  );
}
