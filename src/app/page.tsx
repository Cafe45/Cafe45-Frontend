'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { MapPin, Phone, Clock, X, Droplet, Coffee, Utensils, Cookie } from 'lucide-react';
import CafeHero from '@/components/CafeHero'; 

export default function HomePage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = [
    { name: 'Dryck', icon: Droplet, items: [{ name: 'Läsk', price: '20 kr' }] },
    { name: 'Kaffe & Te', icon: Coffee, items: [{ name: 'Kaffe', price: '35–45 kr (L/S)' }, { name: 'Chai Latte', price: '35–45 kr (L/S)' }, { name: 'Te', price: '25 kr' }] },
    { name: 'Mat', icon: Utensils, items: [{ name: 'Baguetter', price: '65 kr' }, { name: 'Fralla (halv)', price: '25 kr' }, { name: 'Fralla (hel)', price: '35 kr' }, { name: 'Persisk mat på plats', price: '75 kr' }] },
    { name: 'Desserter', icon: Cookie, items: [{ name: 'Tårta', price: '35 kr' }, { name: 'Färska bakelser', price: '40 kr' }] },
  ];

  return (
    <main className="min-h-screen bg-white font-sans text-gray-900">
      
      {/* 1. HERO SEKTION */}
      <CafeHero />
      
      {/* 2. KNAPP (Endast Tårta) */}
      <section className="relative -mt-10 pb-16 px-4 z-30">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center">
            <button 
              onClick={() => router.push('/cakes')} 
              className="group bg-white text-black px-12 py-5 rounded-full font-bold text-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3 border border-gray-100"
            >
              <Cookie className="w-6 h-6 text-gray-400 group-hover:text-black transition-colors" />
              Beställ Tårta
            </button>
          </div>
        </div>
      </section>

      {/* 3. MENY KATEGORIER */}
      <section className="pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Vår Meny</h2>
          <div className="flex justify-center flex-wrap gap-8 md:gap-16 mb-12">
            {categories.map((category) => {
              const IconComponent = category.icon;
              const isActive = activeCategory === category.name;
              return (
                <button
                  key={category.name}
                  className={`flex flex-col items-center gap-3 group cursor-pointer transition-all duration-300 ${isActive ? 'scale-110 opacity-100' : 'opacity-70 hover:opacity-100 hover:scale-105'}`}
                  onClick={() => setActiveCategory(isActive ? null : category.name)}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-black text-white shadow-lg' : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'}`}>
                    <IconComponent className="w-7 h-7" strokeWidth={isActive ? 2 : 1.5} />
                  </div>
                  <span className={`text-sm font-bold uppercase tracking-wide ${isActive ? 'text-black' : 'text-gray-500'}`}>{category.name}</span>
                </button>
              );
            })}
          </div>
          {activeCategory && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 animate-in fade-in slide-in-from-top-4 duration-300 max-w-2xl mx-auto relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-black to-transparent opacity-20" />
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold flex items-center gap-2">{activeCategory}</h3>
                <button onClick={() => setActiveCategory(null)} className="text-gray-400 hover:text-black hover:bg-gray-100 p-2 rounded-full transition-all"><X className="w-6 h-6" /></button>
              </div>
              <div className="space-y-6">
                {categories.find(cat => cat.name === activeCategory)?.items.map((item) => (
                  <div key={item.name} className="flex justify-between items-end border-b border-gray-50 pb-2 last:border-0">
                    <span className="text-gray-800 text-lg font-medium">{item.name}</span>
                    <span className="font-bold text-black text-lg">{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. BILDER FRÅN CAFEET */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">En titt in i vårt café</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Vi lägger stor vikt vid detaljerna – från bönorna i kaffet till atmosfären i lokalen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group relative h-[400px] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
              <Image
                src="/images/coffee.jpg"
                alt="Nybryggt kaffe hos Café 45"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80" />
              <div className="absolute bottom-8 left-8 text-white">
                <div className="bg-white/20 backdrop-blur-md w-fit px-3 py-1 rounded-full text-xs font-bold mb-3 border border-white/30">
                  PREMIUM KAFFE
                </div>
                <h3 className="text-2xl font-bold mb-2">Hantverkskaffe</h3>
                <p className="text-white/90 max-w-xs text-sm">
                  Njut av en perfekt espresso eller en krämig cappuccino.
                </p>
              </div>
            </div>

            <div className="group relative h-[400px] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
              <Image
                src="/images/cafe-interior.jpg"
                alt="Interiör Café 45"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80" />
              <div className="absolute bottom-8 left-8 text-white">
                <div className="bg-white/20 backdrop-blur-md w-fit px-3 py-1 rounded-full text-xs font-bold mb-3 border border-white/30">
                  ATMOSFÄR
                </div>
                <h3 className="text-2xl font-bold mb-2">Välkommen in</h3>
                <p className="text-white/90 max-w-xs text-sm">
                  En lugn och modern miljö där du kan koppla av.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. KONTAKT & KARTA (Uppdaterad med rätt adress) */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-8 tracking-tight">Hitta till oss</h2>
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 space-y-8">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shrink-0 shadow-md"><MapPin className="w-5 h-5" /></div>
                <div><h3 className="font-bold text-lg">Adress</h3><p className="text-gray-600">Nordanvindsgatan 2F</p><p className="text-gray-600">417 12 Göteborg</p></div>
              </div>
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shrink-0 shadow-md"><Clock className="w-5 h-5" /></div>
                <div className="w-full">
                  <h3 className="font-bold text-lg mb-2">Öppettider</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between border-b border-gray-100 pb-2"><span>Mån - Fre</span><span className="font-bold text-black">07:00 – 15:00</span></div>
                    <div className="flex justify-between pt-1"><span>Lör - Sön</span><span className="font-bold text-black">07:00 – 15:00</span></div>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shrink-0 shadow-md"><Phone className="w-5 h-5" /></div>
                <div><h3 className="font-bold text-lg">Kontakt</h3><p className="text-gray-600">072-150 47 40</p><p className="text-gray-600">cafe.45sweden@gmail.com</p></div>
              </div>
            </div>
          </div>
          <div className="relative h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white group">
            
            {/* HÄR ÄR ÄNDRINGEN: En länk som söker direkt på din adress */}
            <iframe 
              src="https://maps.google.com/maps?q=Nordanvindsgatan%202F%2C%20417%2012%20G%C3%B6teborg&t=&z=15&ie=UTF8&iwloc=&output=embed" 
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
                // Och här öppnar knappen rätt sökning i Google Maps
                href="https://www.google.com/maps/search/?api=1&query=Café+45+Nordanvindsgatan+2F+Göteborg"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-black text-white py-4 rounded-xl font-bold shadow-xl pointer-events-auto hover:bg-gray-800 hover:scale-[1.02] transition-all duration-300"
              >
                <MapPin className="w-5 h-5" />
                <span>Öppna i Google Maps</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}