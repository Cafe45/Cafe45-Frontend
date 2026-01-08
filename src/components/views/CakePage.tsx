'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image'; 
import { Toaster, toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { CakeSize, CakeFlavor, StandardCake } from '@/types';
import SelectionCard from '@/components/SelectionCard';
import { useCart } from '@/contexts/CartContext'; 
import { Loader2, AlertCircle, MapPin, Store } from 'lucide-react';

// --- KOMPONENT: KORT FÖR FÄRDIGA TÅRTOR ---
function StandardCakeCard({ cake, addItem }: { cake: StandardCake, addItem: any }) {
  const [pieces, setPieces] = useState(8); 
  const pricePerPiece = 45; 
  const currentPrice = pieces * pricePerPiece;

  const handleAddToCart = () => {
    addItem({
      id: `${cake.id}-${pieces}`, 
      name: `${cake.name} (${pieces} bitar)`, 
      price: currentPrice,
      quantity: 1,
      image: cake.image_url
    });
    toast.success(`${cake.name} lagd i korgen!`);
  };

  return (
    <div className="group bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col h-full">
      <div className="aspect-square relative bg-gray-50">
        {cake.image_url ? (
          <Image src={cake.image_url} alt={cake.name} fill className="object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300">Ingen bild</div>
        )}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold shadow-sm">
          {currentPrice} kr
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-2xl font-bold mb-2">{cake.name}</h3>
        <p className="text-gray-600 text-sm mb-6 flex-1 leading-relaxed">{cake.description}</p>
        
        <div className="mb-6">
          <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Välj storlek</label>
          <div className="grid grid-cols-3 gap-2">
            {[6, 8, 12].map((size) => (
              <button
                key={size}
                onClick={() => setPieces(size)}
                className={`py-2 text-sm rounded-lg border transition-all ${
                  pieces === size
                    ? 'border-black bg-black text-white font-bold'
                    : 'border-gray-200 text-gray-600 hover:border-black'
                }`}
              >
                {size} bit
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={handleAddToCart}
          className="w-full py-4 bg-black text-white font-bold rounded-xl hover:scale-[1.02] transition-transform active:scale-[0.98]"
        >
          Köp för {currentPrice} kr
        </button>
      </div>
    </div>
  );
}

// --- HUVUDKOMPONENT ---
export default function CakePage() {
  const [activeTab, setActiveTab] = useState<'custom' | 'premade'>('custom');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addItem } = useCart(); 

  const [standardCakes, setStandardCakes] = useState<StandardCake[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);

  // --- STATE FÖR SKAPA EGEN ---
  const [customRequest, setCustomRequest] = useState({
    size: '6', 
    flavor: 'Choklad', 
    customFlavor: '', 
    description: '',
    allergies: '',
    extras: [] as string[], 
    customerName: '', 
    customerPhone: '', 
    customerEmail: '',
    deliveryType: 0, 
    address: ''
  });

  useEffect(() => {
    if (activeTab === 'premade' && standardCakes.length === 0) {
      fetchStandardCakes();
    }
  }, [activeTab]);

  const fetchStandardCakes = async () => {
    setIsLoadingMenu(true);
    const { data, error } = await supabase.from('standard_cakes').select('*');
    if (data) setStandardCakes(data);
    setIsLoadingMenu(false);
  };

  const mapSizeToEnum = (val: string): number => {
    if (val === '6') return CakeSize.SixPieces;
    if (val === '8') return CakeSize.EightPieces;
    if (val === '12') return CakeSize.TwelvePieces;
    return CakeSize.LargerOrder;
  };

  const mapFlavorToEnum = (val: string): number => {
    const map: Record<string, number> = {
      'Choklad': CakeFlavor.Chocolate, 'Hallon': CakeFlavor.Raspberry,
      'Vanilj': CakeFlavor.Vanilla, 'Jordgubb': CakeFlavor.Strawberry,
      'Citron': CakeFlavor.Lemon, 'Valfritt': CakeFlavor.Custom
    };
    return map[val] ?? CakeFlavor.Chocolate;
  };

  // --- SKICKA FÖRFRÅGAN TILL ADMIN ---
  const handleSubmitRequest = async () => {
    // Validering
    if (!customRequest.customerName || !customRequest.customerPhone || !customRequest.description) {
      toast.error('Fyll i alla obligatoriska fält (*).');
      return;
    }

    // VALIDERING FÖR GÖTEBORG
    if (customRequest.deliveryType === 1) {
       if (!customRequest.address.trim()) {
         toast.error('Du måste ange en leveransadress.');
         return;
       }
       if (!customRequest.address.toLowerCase().includes('göteborg')) {
         toast.error('Vi levererar endast inom Göteborg.');
         return;
       }
    }

    setIsSubmitting(true);

    const finalDescription = `
      BESKRIVNING: ${customRequest.description}
      ${customRequest.flavor === 'Valfritt' ? `(Önskad smak: ${customRequest.customFlavor})` : ''}
      
      ALLERGIER: ${customRequest.allergies || 'Inga angivna'}
    `;

    const payload = {
      size: mapSizeToEnum(customRequest.size),
      flavor: mapFlavorToEnum(customRequest.flavor),
      description: finalDescription,
      decorations: customRequest.extras.includes('decorations'),
      cake_text: customRequest.extras.includes('text'),
      extra_filling: customRequest.extras.includes('extra-filling'),
      customer_name: customRequest.customerName,
      phone_number: customRequest.customerPhone,
      email: customRequest.customerEmail,
      workflow_status: 1,
      delivery_type: customRequest.deliveryType,
      address: customRequest.address
    };

    try {
      const { error } = await supabase.from('cake_inquiries').insert(payload);
      if (error) throw error;

      toast.success('Tack! Din förfrågan är skickad.');
      
      // Återställ formulär
      setCustomRequest({ 
        size: '6', flavor: 'Choklad', customFlavor: '', description: '', allergies: '', extras: [], 
        customerName: '', customerPhone: '', customerEmail: '',
        deliveryType: 0, address: '' 
      });
      
      window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
      toast.error('Något gick fel med din förfrågan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleExtra = (id: string) => {
    setCustomRequest(prev => ({
      ...prev,
      extras: prev.extras.includes(id) ? prev.extras.filter(x => x !== id) : [...prev.extras, id]
    }));
  };

  const sizes = [{ v: '6', l: '6 bitar' }, { v: '8', l: '8 bitar' }, { v: '12', l: '12 bitar' }, { v: 'custom', l: 'Större beställning' }];
  const flavors = ['Choklad', 'Hallon', 'Vanilj', 'Jordgubb', 'Citron', 'Valfritt'];
  const extras = [{ id: 'decorations', l: 'Dekorationer' }, { id: 'text', l: 'Text på tårtan' }, { id: 'extra-filling', l: 'Extra fyllning' }];

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-4 font-sans text-gray-900">
      <Toaster position="top-center" richColors />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black mb-6 tracking-tight">Välj tårta</h1>
          
          <div className="inline-flex bg-gray-100 p-1.5 rounded-full">
            <button 
              onClick={() => setActiveTab('custom')} 
              className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === 'custom' ? 'bg-black text-white shadow-lg transform scale-105' : 'text-gray-500 hover:text-black'}`}
            >
              Skapa egen
            </button>
            <button 
              onClick={() => setActiveTab('premade')} 
              className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === 'premade' ? 'bg-black text-white shadow-lg transform scale-105' : 'text-gray-500 hover:text-black'}`}
            >
              Färdiga tårtor
            </button>
          </div>
        </div>

        {/* --- FLIK 1: SKAPA EGEN (FORMULÄR) --- */}
        {activeTab === 'custom' && (
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-xl max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4">
            
            {/* STEG 1 */}
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                Storlek & Smak
              </h2>
              
              <label className="block text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Storlek</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                {sizes.map(s => (
                  <SelectionCard 
                    key={s.v} 
                    label={s.l} 
                    selected={customRequest.size === s.v} 
                    onClick={() => setCustomRequest({ ...customRequest, size: s.v })} 
                  />
                ))}
              </div>

              <label className="block text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Smak</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {flavors.map(f => (
                  <SelectionCard 
                    key={f} 
                    label={f} 
                    selected={customRequest.flavor === f} 
                    onClick={() => setCustomRequest({ ...customRequest, flavor: f })} 
                  />
                ))}
              </div>

              {customRequest.flavor === 'Valfritt' && (
                <div className="mb-8">
                  <input type="text" placeholder="Vilken smak önskar du?" className="w-full p-4 bg-gray-50 rounded-xl border border-transparent focus:border-black outline-none transition-all" value={customRequest.customFlavor} onChange={e => setCustomRequest({ ...customRequest, customFlavor: e.target.value })} />
                </div>
              )}

              <label className="block text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Beskrivning</label>
              <textarea 
                placeholder="Beskriv tårtan, tema, önskemål om utseende..." 
                className="w-full p-4 bg-gray-50 rounded-xl border border-transparent focus:border-black outline-none min-h-[120px] transition-all resize-none" 
                value={customRequest.description} 
                onChange={e => setCustomRequest({ ...customRequest, description: e.target.value })} 
              />
            </section>

            {/* STEG 2: ALLERGIER & TILLVAL */}
            <section className="pt-10 mt-10 border-t border-gray-100">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                Allergier & Tillval
              </h2>

              <div className="mb-8">
                <label className="flex items-center gap-2 text-xs font-bold text-red-500 mb-3 uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4" /> Allergier
                </label>
                <textarea 
                  placeholder="Skriv in eventuella allergier här (t.ex. nötter, gluten, laktos)..." 
                  className="w-full p-4 bg-red-50/50 border border-red-100 rounded-xl focus:border-red-300 focus:ring-2 focus:ring-red-100 outline-none min-h-[80px] transition-all resize-none placeholder:text-gray-400" 
                  value={customRequest.allergies} 
                  onChange={e => setCustomRequest({ ...customRequest, allergies: e.target.value })} 
                />
              </div>

              <label className="block text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Extra tillval</label>
              <div className="grid gap-3 mb-6">
                {extras.map(e => (
                  <SelectionCard key={e.id} label={e.l} selected={customRequest.extras.includes(e.id)} onClick={() => toggleExtra(e.id)} />
                ))}
              </div>
            </section>

            {/* STEG 3: LEVERANS & KONTAKT */}
            <section className="pt-10 mt-10 border-t border-gray-100">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                Leverans & Kontakt
              </h2>
              
              {/* LEVERANSVAL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setCustomRequest({...customRequest, deliveryType: 0})}
                  className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                    customRequest.deliveryType === 0 
                      ? 'border-black bg-gray-50' 
                      : 'border-gray-100 hover:border-gray-300'
                  }`}
                >
                  <div className={`p-2 rounded-full ${customRequest.deliveryType === 0 ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <Store className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm">Hämta i butik</div>
                    <div className="text-xs text-gray-500">Gratis</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCustomRequest({...customRequest, deliveryType: 1})}
                  className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                    customRequest.deliveryType === 1 
                      ? 'border-black bg-gray-50' 
                      : 'border-gray-100 hover:border-gray-300'
                  }`}
                >
                  <div className={`p-2 rounded-full ${customRequest.deliveryType === 1 ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm">Hemleverans</div>
                    <div className="text-xs text-gray-500">+200 kr (Endast Gbg)</div>
                  </div>
                </button>
              </div>

              {/* ADRESSFÄLT - Visas bara vid hemleverans */}
              {customRequest.deliveryType === 1 && (
                <div className="mb-6 animate-in slide-in-from-top-2 fade-in">
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Leveransadress *</label>
                  <input 
                    type="text" 
                    placeholder="Gatuadress, Postnummer, Ort" 
                    className="w-full p-4 bg-white border-2 border-black/10 rounded-xl outline-none focus:border-black transition-all" 
                    value={customRequest.address} 
                    onChange={e => setCustomRequest({ ...customRequest, address: e.target.value })} 
                  />
                  <p className="text-xs text-gray-400 mt-2">Endast inom Göteborg.</p>
                </div>
              )}

              <div className="grid gap-4">
                <input type="text" placeholder="Namn *" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-black transition-all" value={customRequest.customerName} onChange={e => setCustomRequest({ ...customRequest, customerName: e.target.value })} />
                <input type="tel" placeholder="Telefon *" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-black transition-all" value={customRequest.customerPhone} onChange={e => setCustomRequest({ ...customRequest, customerPhone: e.target.value })} />
                <input type="email" placeholder="Email (valfritt)" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-black transition-all" value={customRequest.customerEmail} onChange={e => setCustomRequest({ ...customRequest, customerEmail: e.target.value })} />
              </div>
            </section>

            <div className="mt-10 pt-6 border-t border-gray-100">
              <button 
                onClick={handleSubmitRequest} 
                disabled={isSubmitting} 
                className="w-full py-5 bg-black text-white font-bold rounded-2xl text-lg hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Skicka förfrågan'}
              </button>
              <p className="text-center text-gray-400 text-sm mt-4">Detta är en förfrågan. Vi återkommer med pris och bekräftelse.</p>
            </div>
          </div>
        )}

        {/* --- FLIK 2: FÄRDIGA TÅRTOR --- */}
        {activeTab === 'premade' && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            {isLoadingMenu ? (
              <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-gray-300" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {standardCakes.map((cake) => (
                  <StandardCakeCard key={cake.id} cake={cake} addItem={addItem} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}