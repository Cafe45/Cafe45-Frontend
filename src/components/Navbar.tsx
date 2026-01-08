'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Hämta varukorgens antal
  const { items } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Enkel funktion för att kolla om länken är aktiv
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 border-b border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* VÄNSTER: Logotyp */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl font-black tracking-tighter hover:opacity-80 transition-opacity">
              Café 45
            </span>
          </Link>

          {/* MITTEN: Meny (Desktop) - ADMIN ÄR BORTTAGEN HÄR */}
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <Link 
              href="/" 
              className={`text-sm font-bold uppercase tracking-wide transition-colors ${isActive('/') ? 'text-black bg-gray-100/50 px-3 py-1 rounded-md' : 'text-gray-500 hover:text-black'}`}
            >
              Hem
            </Link>
            <Link 
              href="/cakes" 
              className={`text-sm font-bold uppercase tracking-wide transition-colors ${isActive('/cakes') ? 'text-black bg-gray-100/50 px-3 py-1 rounded-md' : 'text-gray-500 hover:text-black'}`}
            >
              Tårta
            </Link>
          </div>

          {/* HÖGER: Varukorg & Mobilmeny */}
          <div className="flex items-center gap-4">
            
            {/* Varukorg */}
            <Link href="/checkout" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors group">
              <ShoppingBag className="w-6 h-6 text-gray-900" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 bg-black text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white transform translate-x-1 -translate-y-1 animate-in zoom-in">
                  {itemCount}
                </span>
              )}
            </Link>
            
            {/* Mobilmeny-knapp */}
            <button 
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILMENY - ADMIN ÄR BORTTAGEN HÄR OCKSÅ */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 animate-in slide-in-from-top-5 absolute w-full left-0 top-20 shadow-lg">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link 
              href="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-3 rounded-xl text-base font-medium ${isActive('/') ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              Hem
            </Link>
            <Link 
              href="/cakes" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-3 rounded-xl text-base font-medium ${isActive('/cakes') ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              Tårta
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}