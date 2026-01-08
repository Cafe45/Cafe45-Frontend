'use client';

import { useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { CheckCircle } from 'lucide-react';

function SuccessContent() {
  const { clearCart } = useCart();

  useEffect(() => {
    // Nu när clearCart är stabil (tack vare useCallback) kommer denna bara köras EN gång.
    clearCart();
  }, [clearCart]);

  return (
    <div className="flex flex-col items-center justify-center p-4 text-center animate-in fade-in zoom-in duration-500">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>

      <h1 className="text-4xl font-bold mb-4 tracking-tight">Tack för din beställning!</h1>
      <p className="text-gray-500 text-lg mb-8 max-w-md">
        Vi har mottagit din order direkt i vårt kökssystem. Betalning sker på plats/vid leverans.
      </p>

      <div className="flex gap-4">
        <Link href="/" className="bg-black text-white px-8 py-3 rounded-full font-bold hover:opacity-90 transition-all">
          Tillbaka till start
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <Suspense fallback={<div>Laddar...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}