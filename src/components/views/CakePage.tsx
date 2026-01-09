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

    // VALIDERING FÖR ADRESS
    if (customRequest.deliveryType === 1) {
       if (!customRequest.address.trim() || customRequest.address.length < 3) {
         toast.error('Vänligen fyll i en gatuadress för leverans.');
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
      // Sparar kombinerad adress i databasen
      address: customRequest.deliveryType === 1 ? `${customRequest.address}, Göteborg` : 'Hämtas i butik'
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
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-xl max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 text-black">
            
            {/* STEG 1 */}
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 italic">
                <span className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center text-sm not-italic">1</span>
                STORLEK & SMAK
              </h2>
              
              <label className="block text-xs font-black text-black mb-3 uppercase tracking-widest">Välj antal bitar *</label>
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

              <label className="block text-xs font-black text-black mb-3 uppercase tracking-widest">Välj bassmak *</label>
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
                  <input type="text" placeholder="Vilken smak önskar du?" className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-black outline-none transition-all" value={customRequest.customFlavor} onChange={e => setCustomRequest({ ...customRequest, customFlavor: e.target.value })} />
                </div>
              )}

              <label className="block text-xs font-black text-black mb-3 uppercase tracking-widest">Beskriv din drömtårta *</label>
              <textarea 
                placeholder="Berätta om tema, färger eller specifika önskemål..." 
                className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-black outline-none min-h-[120px] transition-all resize-none" 
                value={customRequest.description} 
                onChange={e => setCustomRequest({ ...customRequest, description: e.target.value })} 
              />
            </section>

            {/* STEG 2: ALLERGIER & TILLVAL */}
            <section className="pt-10 mt-10 border-t border-gray-100">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 italic text-black">
                <span className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center text-sm not-italic">2</span>
                ALLERGIER & TILLVAL
              </h2>

              <div className="mb-8">
                <label className="flex items-center gap-2 text-xs font-black text-red-500 mb-3 uppercase tracking-widest">
                  <AlertCircle className="w-4 h-4" /> Allergier / Specialkost
                </label>
                <textarea 
                  placeholder="T.ex. nötter, gluten, laktosfritt..." 
                  className="w-full p-4 bg-red-50/30 border-2 border-transparent focus:border-red-200 rounded-xl outline-none min-h-[80px] transition-all resize-none" 
                  value={customRequest.allergies} 
                  onChange={e => setCustomRequest({ ...customRequest, allergies: e.target.value })} 
                />
              </div>

              <label className="block text-xs font-black text-black mb-3 uppercase tracking-widest">Extra tillval (valfritt)</label>
              <div className="grid gap-3 mb-6">
                {extras.map(e => (
                  <SelectionCard key={e.id} label={e.l} selected={customRequest.extras.includes(e.id)} onClick={() => toggleExtra(e.id)} />
                ))}
              </div>
            </section>

            {/* STEG 3: LEVERANS & KONTAKT */}
            <section className="pt-10 mt-10 border-t border-gray-100">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 italic text-black">
                <span className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center text-sm not-italic">3</span>
                LEVERANS & KONTAKT
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <button
                  type="button"
                  onClick={() => setCustomRequest({...customRequest, deliveryType: 0})}
                  className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-all ${
                    customRequest.deliveryType === 0 
                      ? 'border-black bg-black text-white shadow-lg' 
                      : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-black/20'
                  }`}
                >
                  <Store className="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-black text-sm uppercase">Hämta själv</div>
                    <div className="text-[10px] opacity-70">Södra vägen 45</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCustomRequest({...customRequest, deliveryType: 1})}
                  className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-all ${
                    customRequest.deliveryType === 1 
                      ? 'border-black bg-black text-white shadow-lg' 
                      : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-black/20'
                  }`}
                >
                  <MapPin className="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-black text-sm uppercase">Hemleverans</div>
                    <div className="text-[10px] opacity-70">+200 kr</div>
                  </div>
                </button>
              </div>

              {/* NY ADRESS-DESIGN */}
              {customRequest.deliveryType === 1 && (
                <div className="mb-8 animate-in slide-in-from-top-4 fade-in duration-500">
                  <label className="block text-[10px] font-black text-black mb-2 uppercase tracking-widest">Gatuadress i Göteborg *</label>
                  <div className="flex flex-col md:flex-row gap-2">
                    <input 
                      type="text" 
                      autoFocus
                      placeholder="Gata och nummer" 
                      className="flex-[2] p-4 bg-white border-2 border-black rounded-xl outline-none shadow-sm" 
                      value={customRequest.address} 
                      onChange={e => setCustomRequest({ ...customRequest, address: e.target.value })} 
                    />
                    <div className="flex-1">
                      <input 
                        type="text" 
                        readOnly 
                        value="GÖTEBORG" 
                        className="w-full p-4 bg-gray-100 border-2 border-gray-200 rounded-xl text-gray-400 font-black tracking-widest outline-none text-center cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid gap-4">
                <div>
                  <label className="block text-[10px] font-black text-black mb-1 uppercase tracking-widest ml-1">Ditt namn *</label>
                  <input type="text" placeholder="För- och efternamn" className="w-full p-4 bg-gray-50 rounded-xl outline-none border-2 border-transparent focus:border-black focus:bg-white transition-all text-black" value={customRequest.customerName} onChange={e => setCustomRequest({ ...customRequest, customerName: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-black mb-1 uppercase tracking-widest ml-1">Telefonnummer *</label>
                    <input type="tel" placeholder="07x-xxx xx xx" className="w-full p-4 bg-gray-50 rounded-xl outline-none border-2 border-transparent focus:border-black focus:bg-white transition-all text-black" value={customRequest.customerPhone} onChange={e => setCustomRequest({ ...customRequest, customerPhone: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-black mb-1 uppercase tracking-widest ml-1">E-post</label>
                    <input type="email" placeholder="namn@mail.se" className="w-full p-4 bg-gray-50 rounded-xl outline-none border-2 border-transparent focus:border-black focus:bg-white transition-all text-black" value={customRequest.customerEmail} onChange={e => setCustomRequest({ ...customRequest, customerEmail: e.target.value })} />
                  </div>
                </div>
              </div>
            </section>

            <div className="mt-12 pt-8 border-t-2 border-black/5">
              <button 
                onClick={handleSubmitRequest} 
                disabled={isSubmitting} 
                className="w-full py-6 bg-black text-white font-black rounded-2xl text-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 flex items-center justify-center gap-3 tracking-tighter shadow-xl"
              >
                {isSubmitting ? <Loader2 className="animate-spin w-6 h-6" /> : 'SKICKA FÖRFRÅGAN'}
              </button>
              <p className="text-center text-gray-400 text-[10px] uppercase font-bold tracking-widest mt-6">Vi svarar normalt inom 24 timmar med prisförslag.</p>
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