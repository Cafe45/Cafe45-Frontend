'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { CheckCircle } from 'lucide-react';

export default function SuccessPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    // Töm varukorgen när köpet är klart
    clearCart();
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>
      
      <h1 className="text-4xl font-bold mb-4 tracking-tight">Tack för din beställning!</h1>
      <p className="text-gray-500 text-lg mb-8 max-w-md">
        Vi har mottagit din betalning och börjar förbereda din matlåda/tårta direkt.
      </p>

      <div className="flex gap-4">
        <Link href="/" className="bg-black text-white px-8 py-3 rounded-full font-bold hover:opacity-90 transition-all">
          Tillbaka till start
        </Link>
      </div>
    </div>
  );
}