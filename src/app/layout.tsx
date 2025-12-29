import './globals.css';
import React from 'react';
import { Inter } from 'next/font/google';
import { CartProvider } from '@/contexts/CartContext';
import Navbar from '@/components/Navbar'; // <--- 1. VIKTIG IMPORT HÄR

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'Café 45',
  description: 'Tårtbeställning och Matlådor',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sv" suppressHydrationWarning>
      <body className={`${inter.className} bg-white text-primary antialiased`} suppressHydrationWarning={true}>
        <CartProvider>
          {/* 2. HÄR LÄGGER VI MENYN SÅ DEN SYNS PÅ ALLA SIDOR */}
          <Navbar />

          <main>
            {children}
          </main>
        </CartProvider>
      </body>
    </html>
  )
}