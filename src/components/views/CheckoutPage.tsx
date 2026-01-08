'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { Trash2, AlertCircle, MapPin, Store, CreditCard, Loader2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { supabase } from '@/lib/supabase';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, removeItem, totalPrice, clearCart } = useCart();

  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [loading, setLoading] = useState(false);

  // Formulär state
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [allergies, setAllergies] = useState('');

  const deliveryFee = deliveryMethod === 'delivery' ? 200 : 0;
  const finalTotal = totalPrice + deliveryFee;

  const handleCheckout = async () => {
    // 1. Enkel Validering
    if (!customerName || !phone || !email) {
      toast.error('Fyll i namn, telefon och e-post.');
      return;
    }
    
    // VALIDERING FÖR GÖTEBORG
    if (deliveryMethod === 'delivery') {
      if (!address) {
        toast.error('Fyll i leveransadress.');
        return;
      }
      // Kollar om adressen innehåller "göteborg" (oberoende av stora/små bokstäver)
      if (!address.toLowerCase().includes('göteborg')) {
        toast.error('Vi erbjuder endast hemleverans inom Göteborg.');
        return;
      }
    }

    setLoading(true);

    try {
      console.log("Försöker skapa order...");

      // 2. Skapa Order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          total_price: finalTotal,
          customer_name: customerName,
          phone_number: phone,
          email: email,
          status: 'Ny',
          delivery_type: deliveryMethod === 'delivery' ? 1 : 0,
          delivery_cost: deliveryFee,
          delivery_address: address,
          allergies: allergies,
          payment_status: 'Betalas på plats'
        })
        .select()
        .single();

      if (orderError) {
        console.error("Order Error Message:", orderError.message);
        console.error("Order Error Details:", orderError.details);
        throw new Error(orderError.message || "Kunde inte skapa order");
      }

      if (!orderData) throw new Error("Ingen order-data returnerades.");

      // 3. Skapa Varor
      const orderItems = items.map(i => ({
        order_id: orderData.id,
        product_name: i.name,
        quantity: i.quantity,
        price: i.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error("Items Error:", itemsError.message);
        throw new Error(itemsError.message || "Kunde inte spara varor");
      }

      // 4. Klart
      if (clearCart) clearCart(); 
      router.push('/success');

    } catch (error: any) {
      console.error("CATCH Error:", error);
      toast.error(`Kunde inte beställa: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white py-20 px-4 text-center font-sans">
        <h1 className="text-4xl font-bold mb-6 tracking-tight">Kundkorg</h1>
        <p className="text-lg text-gray-500 mb-8">Din kundkorg är tom.</p>
        <button onClick={() => router.push('/cakes')} className="bg-black text-white px-8 py-3 rounded-full font-bold hover:opacity-90 transition-all">
          Handla Tårtor
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-24 px-4 font-sans text-gray-900">
      <Toaster position="top-center" richColors />

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-12 text-center tracking-tight">Kassan</h1>

        {/* 1. DIN BESTÄLLNING */}
        <section className="mb-8 border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm">
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
                <div className="h-[1px] bg-gray-100 mt-6"></div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. LEVERANS */}
        <section className="mb-8 border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-6">Leverans</h2>
          <div className="space-y-4">
            <label className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${deliveryMethod === 'pickup' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <div className="flex items-center gap-4">
                <input type="radio" name="delivery" checked={deliveryMethod === 'pickup'} onChange={() => setDeliveryMethod('pickup')} className="w-5 h-5 accent-black" />
                <div className="flex items-center gap-2">
                   <Store className="w-5 h-5" />
                   <span className="font-medium text-lg">Upphämtning i butik</span>
                </div>
              </div>
              <span className="font-bold">0 kr</span>
            </label>

            <label className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${deliveryMethod === 'delivery' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <div className="flex items-center gap-4">
                <input type="radio" name="delivery" checked={deliveryMethod === 'delivery'} onChange={() => setDeliveryMethod('delivery')} className="w-5 h-5 accent-black" />
                <div className="flex items-center gap-2">
                   <MapPin className="w-5 h-5" />
                   <div>
                     <span className="font-medium text-lg block">Hemleverans</span>
                     <span className="text-xs text-gray-500 font-medium">(Endast Göteborg)</span>
                   </div>
                </div>
              </div>
              <span className="font-bold">200 kr</span>
            </label>
          </div>
        </section>

        {/* 3. KUNDUPPGIFTER */}
        <section className="mb-8 border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-6">Dina uppgifter</h2>
          <div className="grid gap-4">
            <input type="text" placeholder="Namn *" className="w-full p-4 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-black outline-none transition-all" value={customerName} onChange={e => setCustomerName(e.target.value)} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="tel" placeholder="Telefon *" className="w-full p-4 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-black outline-none transition-all" value={phone} onChange={e => setPhone(e.target.value)} />
              <input type="email" placeholder="E-post *" className="w-full p-4 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-black outline-none transition-all" value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            {/* ALLERGIER */}
            <div className="mt-2">
              <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                Allergier / Specialkost (Valfritt)
              </label>
              <textarea 
                placeholder="T.ex. Glutenfri, Nötallergi..." 
                className="w-full p-4 bg-red-50/30 rounded-xl border-0 focus:ring-2 focus:ring-red-200 min-h-[80px] outline-none transition-all" 
                value={allergies} 
                onChange={e => setAllergies(e.target.value)} 
              />
            </div>

            {deliveryMethod === 'delivery' && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">Leveransadress (Göteborg) *</label>
                <input type="text" placeholder="Gatuadress, Postnummer, Ort" className="w-full p-4 bg-white border-2 border-black/10 rounded-xl outline-none focus:border-black transition-all" value={address} onChange={e => setAddress(e.target.value)} />
                <p className="text-xs text-gray-400 mt-2">Vi levererar endast inom Göteborg stad.</p>
              </div>
            )}
          </div>
        </section>

        {/* 4. SUMMERING */}
        <section className="border border-gray-200 rounded-3xl p-8 bg-gray-50/50">
          <div className="space-y-3 mb-8">
            <div className="flex justify-between text-gray-600">
              <span>Delsumma:</span>
              <span>{totalPrice} kr</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Leverans:</span>
              <span>{deliveryFee} kr</span>
            </div>
            <div className="h-[1px] bg-gray-200 my-4"></div>
            <div className="flex justify-between items-center font-bold text-2xl">
              <span>Totalt:</span>
              <span>{finalTotal} kr</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full h-16 rounded-full bg-black text-white font-bold text-xl hover:opacity-80 disabled:opacity-50 transition-all shadow-lg active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <> <CreditCard className="w-5 h-5"/> Slutför beställning ({finalTotal} kr) </>}
          </button>
          <p className="text-center text-sm text-gray-400 mt-4">
            Betalning sker vid leverans/upphämtning.
          </p>
        </section>

      </div>
    </div>
  );
}