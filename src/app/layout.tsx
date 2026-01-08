import './globals.css';
import React from 'react';
import { Inter } from 'next/font/google';
import { CartProvider } from '@/contexts/CartContext';
import Navbar from '@/components/Navbar'; 

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
          {/* Menyn ligger utanför main så den hamnar alltid överst */}
          <Navbar />

          {/* pt-24 (96px) ser till att sidans innehåll inte göms under den fasta menyn */}
          <main className="pt-24 min-h-screen">
            {children}
          </main>
          
        </CartProvider>
      </body>
    </html>
  )
}