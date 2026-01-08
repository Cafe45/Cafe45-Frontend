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
  const [address, setAddress] = useState(''); // Detta blir nu bara gatuadressen
  const [allergies, setAllergies] = useState('');

  const deliveryFee = deliveryMethod === 'delivery' ? 200 : 0;
  const finalTotal = totalPrice + deliveryFee;

  const handleCheckout = async () => {
    // 1. Validering
    if (!customerName.trim()) {
      toast.error('Vänligen fyll i ditt namn.');
      return;
    }
    if (!phone.trim()) {
      toast.error('Vänligen fyll i ditt telefonnummer.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error('Vänligen fyll i en giltig e-postadress.');
      return;
    }
    
    if (deliveryMethod === 'delivery') {
      if (!address.trim() || address.length < 3) {
        toast.error('Vänligen fyll i din gatuadress.');
        return;
      }
    }

    setLoading(true);

    try {
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
          // Här lägger vi ihop gatan med "Göteborg" automatiskt för databasen
          delivery_address: deliveryMethod === 'delivery' ? `${address}, Göteborg` : 'Hämtas i butik',
          allergies: allergies,
          payment_status: 'Betalas på plats'
        })
        .select()
        .single();

      if (orderError) throw new Error(orderError.message);

      // 3. Skapa Order Items
      const orderItems = items.map(i => ({
        order_id: orderData.id,
        product_name: i.name,
        quantity: i.quantity,
        price: i.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw new Error(itemsError.message);

      // 4. Klart!
      if (clearCart) clearCart(); 
      router.push('/success');

    } catch (error: any) {
      console.error("Order error:", error);
      toast.error(`Ett fel uppstod: ${error.message}`);
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
          Se våra tårtor
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-24 px-4 font-sans text-gray-900">
      <Toaster position="top-center" richColors />

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-12 text-center tracking-tight">Kassan</h1>

        {/* DIN BESTÄLLNING */}
        <section className="mb-8 border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm bg-white">
          <h2 className="text-2xl font-bold mb-6">Din beställning</h2>
          <div className="space-y-6">
            {items.map((item) => (
              <div key={item.id}>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.quantity} st × {item.price} kr</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold text-lg">{item.quantity * item.price} kr</p>
                    <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 p-2 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="h-[1px] bg-gray-100 mt-6"></div>
              </div>
            ))}
          </div>
        </section>

        {/* LEVERANSVAL */}
        <section className="mb-8 border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm bg-white">
          <h2 className="text-2xl font-bold mb-6">Leveransmetod</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => setDeliveryMethod('pickup')}
              className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${deliveryMethod === 'pickup' ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-black'}`}
            >
              <div className="flex items-center gap-3 text-left">
                <Store className="w-6 h-6" />
                <div>
                  <span className="font-bold block">Hämta i butik</span>
                  <span className="text-xs opacity-70">Södra vägen 45</span>
                </div>
              </div>
              <span className="font-bold">0 kr</span>
            </button>

            <button 
              onClick={() => setDeliveryMethod('delivery')}
              className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${deliveryMethod === 'delivery' ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-black'}`}
            >
              <div className="flex items-center gap-3 text-left">
                <MapPin className="w-6 h-6" />
                <div>
                  <span className="font-bold block">Hemleverans</span>
                  <span className="text-xs opacity-70">Endast Göteborg</span>
                </div>
              </div>
              <span className="font-bold">200 kr</span>
            </button>
          </div>
        </section>

        {/* UPPGIFTER */}
        <section className="mb-8 border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm bg-white">
          <h2 className="text-2xl font-bold mb-6">Dina uppgifter</h2>
          <div className="grid gap-5">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">Fullständigt Namn *</label>
              <input type="text" placeholder="För- och efternamn" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all" value={customerName} onChange={e => setCustomerName(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">Telefonnummer *</label>
                <input type="tel" placeholder="07x-xxx xx xx" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">E-post *</label>
                <input type="email" placeholder="namn@mail.se" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">Allergier eller meddelande</label>
              <textarea placeholder="T.ex. nötallergi eller portkod..." className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-black/5 min-h-[80px] transition-all" value={allergies} onChange={e => setAllergies(e.target.value)} />
            </div>

            {deliveryMethod === 'delivery' && (
              <div className="pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
                <label className="text-xs font-bold text-black uppercase ml-1 mb-1 block">Leveransadress i Göteborg *</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    autoFocus
                    placeholder="Gatuadress (t.ex. Södra vägen 12)" 
                    className="flex-[2] p-4 bg-white border-2 border-black rounded-xl outline-none shadow-sm" 
                    value={address} 
                    onChange={e => setAddress(e.target.value)} 
                  />
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      readOnly 
                      value="Göteborg" 
                      className="w-full p-4 bg-gray-100 border-2 border-gray-200 rounded-xl text-gray-500 font-bold cursor-not-allowed outline-none"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 mt-2 italic">Hemleverans erbjuds endast inom Göteborg stad.</p>
              </div>
            )}
          </div>
        </section>

        {/* BETALNING */}
        <section className="border-2 border-black rounded-3xl p-8 bg-white shadow-xl">
          <div className="space-y-3 mb-8">
            <div className="flex justify-between text-gray-600">
              <span>Produkter:</span>
              <span>{totalPrice} kr</span>
            </div>
            {deliveryMethod === 'delivery' && (
              <div className="flex justify-between text-gray-600">
                <span>Leveransavgift:</span>
                <span>{deliveryFee} kr</span>
              </div>
            )}
            <div className="h-[1px] bg-gray-200 my-4"></div>
            <div className="flex justify-between items-center font-black text-3xl">
              <span>Totalt:</span>
              <span>{finalTotal} kr</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full h-20 rounded-2xl bg-black text-white font-bold text-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><CreditCard className="w-6 h-6"/> Bekräfta Beställning</>}
          </button>
          <p className="text-center text-sm text-gray-400 mt-4 italic">Betalning sker vid leverans/upphämtning.</p>
        </section>
      </div>
    </div>
  );
}