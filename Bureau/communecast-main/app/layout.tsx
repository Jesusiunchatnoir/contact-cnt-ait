import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ToasterClient from './toaster-client';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CommuneCast - Encrypted Video Conferencing',
  description: 'Free, encrypted, and decentralized video conferencing for the people',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        {children}
        <ToasterClient />
      </body>
    </html>
  );
}