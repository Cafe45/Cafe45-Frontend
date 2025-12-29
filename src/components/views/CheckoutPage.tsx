'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { Trash2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { supabase } from '@/lib/supabase';
import { DeliveryType } from '@/types';

export default function CheckoutPage() {
  const router = useRouter();

  // FIXEN HÄR: Vi hämtar 'totalPrice' (siffra) istället för 'getTotalPrice'
  const { items, removeItem, totalPrice } = useCart();

  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [loading, setLoading] = useState(false);

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const deliveryFee = deliveryMethod === 'delivery' ? 200 : 0;

  // FIXEN HÄR: Vi använder variabeln direkt, inga parenteser ()
  const finalTotal = totalPrice + deliveryFee;

  const handleCheckout = async () => {
    if (!customerName || !phone || !email) {
      toast.error('Fyll i namn, telefon och e-post.');
      return;
    }
    if (deliveryMethod === 'delivery' && !address) {
      toast.error('Fyll i leveransadress.');
      return;
    }

    setLoading(true);

    try {
      // 1. Skapa Order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          total_amount: finalTotal,
          customer_name: customerName,
          phone_number: phone,
          email: email,
          delivery_type: deliveryMethod === 'delivery' ? 1 : 0,
          delivery_cost: deliveryFee,
          delivery_address: address || null,
          payment_status: 'Betalas på plats',
          workflow_status: 1 // Pending
        })
        .select()
        .single();

      if (orderError) throw orderError;
      if (!orderData) throw new Error("Ingen order skapades.");

      // 2. Skapa OrderItems
      const orderItemsPayload = items.map(i => ({
        order_id: orderData.id,
        product_id: i.id, // Assuming i.id is the product ID string/uuid
        product_name: i.name,
        quantity: i.quantity,
        unit_price: i.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsPayload);

      if (itemsError) throw itemsError;

      // 3. Framgång
      router.push('/success');

    } catch (error) {
      console.error(error);
      toast.error('Kunde inte lägga beställningen. Försök igen.');
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white py-20 px-4 text-center">
        <h1 className="text-4xl font-bold mb-6 tracking-tight">Kundkorg</h1>
        <p className="text-lg text-gray-500 mb-8">Din kundkorg är tom.</p>
        <button onClick={() => router.push('/meals')} className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:opacity-90">
          Handla Matlådor
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 font-sans text-primary">
      <Toaster position="top-center" richColors />

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-12 text-center tracking-tight">Kassan</h1>

        {/* 1. DIN BESTÄLLNING */}
        <section className="mb-12 border border-border rounded-3xl p-6 md:p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-6">Din beställning</h2>
          <div className="space-y-6">
            {items.map((item) => (
              <div key={item.id}>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.quantity} × {item.price} kr</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold text-lg">{item.quantity * item.price} kr</p>
                    <button onClick={() => removeItem(item.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="h-[1px] bg-border mt-6"></div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. LEVERANS */}
        <section className="mb-12 border border-border rounded-3xl p-6 md:p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-6">Leverans</h2>
          <div className="space-y-4">
            <label className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${deliveryMethod === 'pickup' ? 'border-primary bg-accent/10' : 'border-border hover:border-gray-300'}`}>
              <div className="flex items-center gap-4">
                <input type="radio" name="delivery" checked={deliveryMethod === 'pickup'} onChange={() => setDeliveryMethod('pickup')} className="w-5 h-5 accent-primary" />
                <span className="font-medium text-lg">Upphämtning i butik</span>
              </div>
              <span className="font-bold">0 kr</span>
            </label>

            <label className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${deliveryMethod === 'delivery' ? 'border-primary bg-accent/10' : 'border-border hover:border-gray-300'}`}>
              <div className="flex items-center gap-4">
                <input type="radio" name="delivery" checked={deliveryMethod === 'delivery'} onChange={() => setDeliveryMethod('delivery')} className="w-5 h-5 accent-primary" />
                <span className="font-medium text-lg">Hemleverans</span>
              </div>
              <span className="font-bold">200 kr</span>
            </label>
          </div>
        </section>

        {/* 3. KUNDUPPGIFTER */}
        <section className="mb-12 border border-border rounded-3xl p-6 md:p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-6">Dina uppgifter</h2>
          <div className="grid gap-4">
            <input type="text" placeholder="Namn *" className="w-full p-4 bg-input rounded-xl border-0 focus:ring-2 focus:ring-primary" value={customerName} onChange={e => setCustomerName(e.target.value)} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="tel" placeholder="Telefon *" className="w-full p-4 bg-input rounded-xl border-0 focus:ring-2 focus:ring-primary" value={phone} onChange={e => setPhone(e.target.value)} />
              <input type="email" placeholder="E-post *" className="w-full p-4 bg-input rounded-xl border-0 focus:ring-2 focus:ring-primary" value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            {deliveryMethod === 'delivery' && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <input type="text" placeholder="Leveransadress *" className="w-full p-4 bg-input rounded-xl border-0 focus:ring-2 focus:ring-primary mt-2" value={address} onChange={e => setAddress(e.target.value)} />
              </div>
            )}
          </div>
        </section>

        {/* 4. SUMMERING & BETALNING */}
        <section className="border border-border rounded-3xl p-8 bg-gray-50/50">
          <div className="space-y-3 mb-8">
            <div className="flex justify-between text-gray-600">
              <span>Delsumma:</span>
              <span>{totalPrice} kr</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Leverans:</span>
              <span>{deliveryFee} kr</span>
            </div>
            <div className="h-[1px] bg-border my-4"></div>
            <div className="flex justify-between items-center font-bold text-2xl">
              <span>Totalt:</span>
              <span>{finalTotal} kr</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full h-16 rounded-full bg-primary text-white font-bold text-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg active:scale-[0.99]"
          >
            {loading ? 'Behandlar...' : 'Slutför beställning (Betala i butik)'}
          </button>
          <p className="text-center text-sm text-gray-400 mt-4 flex items-center justify-center gap-2">
            🛍️ Du betalar enkelt när du hämtar eller får leverans.
          </p>
        </section>

      </div>
    </div>
  );
}