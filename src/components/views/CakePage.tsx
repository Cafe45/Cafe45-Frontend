'use client';

import { useState } from 'react';
import { Toaster, toast } from 'sonner';
import { postData } from '@/lib/api';
import { CakeInquiryCommand, CakeSize, CakeFlavor } from '@/types';
import SelectionCard from '@/components/SelectionCard'; // <--- Viktig import!

export default function CakePage() {
  const [activeTab, setActiveTab] = useState<'custom' | 'premade'>('custom');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [customRequest, setCustomRequest] = useState({
    size: '8', flavor: 'Choklad', customFlavor: '', description: '',
    extras: [] as string[], customerName: '', customerPhone: '', customerEmail: '',
  });

  // Mappers
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

  const handleSubmitRequest = async () => {
    if (!customRequest.customerName || !customRequest.customerPhone || !customRequest.description) {
      toast.error('Fyll i alla obligatoriska fält (*).');
      return;
    }
    setIsSubmitting(true);
    const payload: CakeInquiryCommand = {
      size: mapSizeToEnum(customRequest.size),
      flavor: mapFlavorToEnum(customRequest.flavor),
      description: customRequest.flavor === 'Valfritt' ? `${customRequest.description} (Smak: ${customRequest.customFlavor})` : customRequest.description,
      decorations: customRequest.extras.includes('decorations'),
      cakeText: customRequest.extras.includes('text'),
      extraFilling: customRequest.extras.includes('extra-filling'),
      customerName: customRequest.customerName,
      phoneNumber: customRequest.customerPhone,
      email: customRequest.customerEmail
    };

    try {
      await postData('/inquiry', payload);
      toast.success('Tack! Din förfrågan är skickad.');
      setCustomRequest({ size: '8', flavor: 'Choklad', customFlavor: '', description: '', extras: [], customerName: '', customerPhone: '', customerEmail: '' });
      window.scrollTo(0, 0);
    } catch {
      toast.error('Något gick fel.');
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

  // Data
  const sizes = [{ v: '6', l: '6 bitar' }, { v: '8', l: '8 bitar' }, { v: '12', l: '12 bitar' }, { v: 'custom', l: 'Större beställning' }];
  const flavors = ['Choklad', 'Hallon', 'Vanilj', 'Jordgubb', 'Citron', 'Valfritt'];
  const extras = [{ id: 'decorations', l: 'Dekorationer' }, { id: 'text', l: 'Text på tårtan' }, { id: 'extra-filling', l: 'Extra fyllning' }];

  return (
    <div className="min-h-screen bg-white py-12 px-4 font-sans text-gray-900">
      <Toaster position="top-center" richColors />
      
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">Välj tårta</h1>
          <div className="inline-flex bg-secondary p-1 rounded-full">
            <button onClick={() => setActiveTab('custom')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'custom' ? 'bg-primary text-white shadow' : 'text-gray-600'}`}>Skapa egen</button>
            <button onClick={() => setActiveTab('premade')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'premade' ? 'bg-primary text-white shadow' : 'text-gray-600'}`}>Färdiga tårtor</button>
          </div>
        </div>

        {activeTab === 'custom' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            
            {/* STEG 1 */}
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Storlek & Smak</h2>
              
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Storlek</label>
              <div className="grid gap-3 mb-6">
                {sizes.map(s => (
                  <SelectionCard key={s.v} label={s.l} selected={customRequest.size === s.v} onClick={() => setCustomRequest({...customRequest, size: s.v})} />
                ))}
              </div>

              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Smak</label>
              <div className="grid gap-3 mb-6">
                {flavors.map(f => (
                  <SelectionCard key={f} label={f} selected={customRequest.flavor === f} onClick={() => setCustomRequest({...customRequest, flavor: f})} />
                ))}
              </div>

              {customRequest.flavor === 'Valfritt' && (
                <div className="mb-6">
                  <input type="text" placeholder="Vilken smak önskar du?" className="w-full p-4 bg-input rounded-xl border border-transparent focus:border-primary outline-none" value={customRequest.customFlavor} onChange={e => setCustomRequest({...customRequest, customFlavor: e.target.value})} />
                </div>
              )}

              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Beskrivning</label>
              <textarea placeholder="Beskriv tårtan..." className="w-full p-4 bg-input rounded-xl border border-transparent focus:border-primary outline-none min-h-[120px]" value={customRequest.description} onChange={e => setCustomRequest({...customRequest, description: e.target.value})} />
            </section>

            {/* STEG 2 */}
            <section className="pt-8 border-t">
              <h2 className="text-2xl font-bold mb-4">2. Tillval</h2>
              <div className="grid gap-3">
                {extras.map(e => (
                  <SelectionCard key={e.id} label={e.l} selected={customRequest.extras.includes(e.id)} onClick={() => toggleExtra(e.id)} />
                ))}
              </div>
            </section>

            {/* STEG 3 */}
            <section className="pt-8 border-t">
              <h2 className="text-2xl font-bold mb-4">3. Kunduppgifter</h2>
              <div className="grid gap-4">
                <input type="text" placeholder="Namn *" className="w-full p-4 bg-input rounded-xl outline-none focus:ring-2 focus:ring-primary" value={customRequest.customerName} onChange={e => setCustomRequest({...customRequest, customerName: e.target.value})} />
                <input type="tel" placeholder="Telefon *" className="w-full p-4 bg-input rounded-xl outline-none focus:ring-2 focus:ring-primary" value={customRequest.customerPhone} onChange={e => setCustomRequest({...customRequest, customerPhone: e.target.value})} />
                <input type="email" placeholder="Email" className="w-full p-4 bg-input rounded-xl outline-none focus:ring-2 focus:ring-primary" value={customRequest.customerEmail} onChange={e => setCustomRequest({...customRequest, customerEmail: e.target.value})} />
              </div>
            </section>

            <button onClick={handleSubmitRequest} disabled={isSubmitting} className="w-full py-4 bg-primary text-white font-bold rounded-xl text-lg hover:opacity-90 transition-opacity">
              {isSubmitting ? 'Skickar...' : 'Skicka förfrågan'}
            </button>
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">Här kommer färdiga tårtor snart!</div>
        )}
      </div>
    </div>
  );
}