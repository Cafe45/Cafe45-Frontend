'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CafeHero from '@/components/CafeHero';
import { MapPin, Phone, Mail, Utensils, Cookie, Coffee, Droplet, Clock, X } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  const router = useRouter();
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const openingHours = [
    { day: 'Måndag', hours: '07:00 – 15:00' },
    { day: 'Tisdag', hours: '07:00 – 15:00' },
    { day: 'Onsdag', hours: '07:00 – 15:00' },
    { day: 'Torsdag', hours: '07:00 – 15:00' },
    { day: 'Fredag', hours: '07:00 – 15:00' },
    { day: 'Lördag', hours: '07:00 – 15:00' },
    { day: 'Söndag', hours: '07:00 – 15:00' },
  ];

  const categories = [
    { 
      name: 'Dryck', 
      icon: Droplet,
      items: [ { name: 'Läsk', price: '20 kr' } ]
    },
    { 
      name: 'Kaffe & Te', 
      icon: Coffee,
      items: [
        { name: 'Kaffe', price: '35–45 kr (L/S)' },
        { name: 'Chai Latte', price: '35–45 kr (L/S)' },
        { name: 'Te', price: '25 kr' },
      ]
    },
    { 
      name: 'Mat', 
      icon: Utensils,
      items: [
        { name: 'Baguetter', price: '65 kr' },
        { name: 'Fralla (halv)', price: '25 kr' },
        { name: 'Fralla (hel)', price: '35 kr' },
        { name: 'Persisk mat på plats', price: '75 kr' },
      ]
    },
    { 
      name: 'Desserter', 
      icon: Cookie,
      items: [
        { name: 'Tårta', price: '35 kr' },
        { name: 'Färska bakelser', price: '40 kr' },
      ]
    },
  ];

  return (
    <main className="min-h-screen bg-white font-sans text-primary">
      
      {/* 1. HERO SEKTION */}
      <CafeHero />
      
      {/* 2. KNAPPAR */}
      <section className="relative -mt-16 pb-16 px-4 z-20">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-lg md:text-xl text-gray-700 font-medium mb-8 leading-relaxed bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-white/50">
            Hos Café 45 kan du dricka kaffe, te, äta klassiska desserter och god varm mat i en lugn miljö.
          </p>
        
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <button onClick={() => router.push('/cakes')} className="bg-primary text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:opacity-90 hover:scale-105 transition-all active:scale-95">
              Beställ Tårta
            </button>
            <button onClick={() => router.push('/meals')} className="bg-primary text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:opacity-90 hover:scale-105 transition-all active:scale-95">
              Beställ Matlåda
            </button>
          </div>
        </div>
      </section>

      {/* 3. MENY KATEGORIER */}
      <section className="pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center flex-wrap gap-8 md:gap-12">
            {categories.map((category) => {
              const IconComponent = category.icon;
              const isActive = activeCategory === category.name;
              return (
                <button
                  key={category.name}
                  className={`flex flex-col items-center gap-2 group cursor-pointer transition-all duration-300 ${
                    isActive ? 'scale-110 opacity-100' : 'opacity-70 hover:opacity-100 hover:scale-105'
                  }`}
                  onClick={() => setActiveCategory(isActive ? null : category.name)}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                    isActive ? 'bg-primary text-white shadow-lg' : 'bg-secondary text-primary'
                  }`}>
                    <IconComponent className="w-6 h-6" strokeWidth={isActive ? 2 : 1.5} />
                  </div>
                  <span className={`text-sm font-bold uppercase tracking-wide ${
                    isActive ? 'text-primary' : 'text-gray-500'
                  }`}>{category.name}</span>
                </button>
              );
            })}
          </div>

          {/* Meny-lista */}
          {activeCategory && (
            <div className="mt-8 bg-white rounded-3xl border border-border shadow-lg p-8 animate-in fade-in slide-in-from-top-4 duration-300 max-w-2xl mx-auto">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <h3 className="text-2xl font-bold">{activeCategory}</h3>
                <button onClick={() => setActiveCategory(null)} className="text-gray-400 hover:text-primary transition-colors p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                {categories.find(cat => cat.name === activeCategory)?.items.map((item) => (
                  <div key={item.name} className="flex justify-between items-center py-2">
                    <span className="text-gray-700 text-lg">{item.name}</span>
                    <span className="font-bold text-primary text-lg">{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. KONTAKT & KARTA */}
      <section className="py-20 px-6 bg-secondary/30 relative overflow-hidden">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          
          {/* VÄNSTER: Info */}
          <div>
            <h2 className="text-4xl font-bold mb-8 tracking-tight">Hitta till oss</h2>
            
            <div className="space-y-8 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              {/* Adress */}
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Adress</h3>
                  <p className="text-gray-600">Nordanvindsgatan 2F</p>
                  <p className="text-gray-600">417 12 Göteborg</p>
                </div>
              </div>

              {/* Öppettider */}
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="w-full">
                  <h3 className="font-bold text-lg mb-2">Öppettider</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span>Mån - Fre</span>
                      <span className="font-bold text-black">07:00 – 15:00</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span>Lör - Sön</span>
                      <span className="font-bold text-black">07:00 – 15:00</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kontakt */}
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Kontakt</h3>
                  <p className="text-gray-600">072-150 47 40</p>
                  <p className="text-gray-600 break-all">cafe.45sweden@gmail.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* HÖGER: Karta */}
          <div className="relative h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white group">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2130.865997624243!2d11.944321376662768!3d57.72263697387396!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x464f374712345678%3A0x1234567890abcdef!2sNordanvindsgatan%202F%2C%20417%2012%20G%C3%B6teborg!5e0!3m2!1sen!2sse!4v1700000000000!5m2!1sen!2sse"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale group-hover:grayscale-0 transition-all duration-700"
            ></iframe>
            
            <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
               <a 
                href="https://goo.gl/maps/Q8z5z5z5z5z"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-black text-white py-4 rounded-xl font-bold shadow-xl pointer-events-auto hover:bg-gray-800 hover:scale-[1.02] transition-all duration-300"
              >
                <MapPin className="w-5 h-5" />
                <span>Öppna Google Maps</span>
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* 5. UPPLEVELSER (Bilder) */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Café 45 – Upplevelser</h2>
          <p className="text-gray-500 text-lg">En känsla av vår miljö och vad vi erbjuder.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Kort 1 */}
          <button onClick={() => setIsImageOpen(true)} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all p-8 text-left group">
            <div className="mb-6 overflow-hidden rounded-2xl h-64 bg-gray-100 relative">
              <Image src="/cafe-interior.png" alt="Café Interiör" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Lugn & Värme</h3>
            <p className="text-gray-600">En känsla av vår café-miljö.</p>
          </button>

          {/* Kort 2 */}
          <button onClick={() => setActiveCategory('Kaffe & Te')} className="bg-secondary/20 rounded-3xl border border-transparent hover:border-primary/10 hover:bg-secondary/40 transition-all p-8 flex flex-col justify-center items-center text-center h-full min-h-[300px]">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm"><Coffee className="w-10 h-10" strokeWidth={1} /></div>
            <h3 className="text-2xl font-bold mb-2">Kaffestunder</h3>
            <p className="text-gray-600 max-w-sm">Espresso, cappuccino, latte – gjorda med omsorg.</p>
          </button>
        </div>
      </section>

      {/* IMAGE MODAL */}
      {isImageOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-200" onClick={() => setIsImageOpen(false)}>
          <div className="relative max-w-5xl w-full max-h-[90vh]">
            <button onClick={() => setIsImageOpen(false)} className="absolute -top-12 right-0 text-white hover:text-gray-300"><X className="w-8 h-8" /></button>
            <div className="relative w-full h-[80vh] rounded-xl overflow-hidden bg-black">
                <Image src="/cafe-interior.png" alt="Café Interiör Stor" fill className="object-contain" />
            </div>
          </div>
        </div>
      )}

    </main>
  );
}