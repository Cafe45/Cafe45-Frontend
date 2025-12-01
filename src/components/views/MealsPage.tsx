'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react'; // Ikoner
import { useCart } from '@/contexts/CartContext'; // Vår nya Context
import { toast, Toaster } from 'sonner';

export default function MealsPage() {
  const { addItem } = useCart();

  const meals = [
    {
      id: 'meal-pasta',
      name: 'Pasta Carbonara',
      description: 'Klassisk italiensk pasta med krämig sås och bacon',
      price: 75,
      emoji: '🍝', // Använder emoji istället för bild för enkelhetens skull
    },
    {
      id: 'meal-chicken',
      name: 'Kycklinggryta',
      description: 'Saftig kycklinggryta med grönsaker och ris',
      price: 75,
      emoji: '🥘',
    },
    {
      id: 'meal-vegetarian',
      name: 'Vegetarisk Lasagne',
      description: 'Lagervis med grönsaker, mozzarella och tomatsås',
      price: 75,
      emoji: '🍆',
    },
    {
      id: 'meal-traditional',
      name: 'Köttbullar med Potatismos',
      description: 'Klassisk svensk husmanskost med lingonsylt',
      price: 75,
      emoji: '🥔',
    },
  ];

  // State för antal av varje rätt (lokalt på sidan innan man lägger i korgen)
  const [quantities, setQuantities] = useState<{ [key: string]: number }>(
    meals.reduce((acc, meal) => ({ ...acc, [meal.id]: 0 }), {})
  );

  const updateQuantity = (id: string, change: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + change),
    }));
  };

  const handleAddMeal = (meal: typeof meals[0]) => {
    const qty = quantities[meal.id];
    if (!qty || qty === 0) {
      toast.error('Välj minst 1 matlåda');
      return;
    }
    
    addItem({
      id: meal.id,
      name: meal.name,
      price: meal.price,
      quantity: qty,
      type: 'meal',
    });
    
    toast.success(`${qty}x ${meal.name} tillagd i kundkorgen!`);
    
    // Nollställ räknaren för den rätten
    setQuantities((prev) => ({ ...prev, [meal.id]: 0 }));
  };

  const getTotalPrice = () => {
    // Visar totalen för det man håller på att välja just nu
    return meals.reduce((sum, meal) => sum + meal.price * (quantities[meal.id] || 0), 0);
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 font-sans text-primary">
      <Toaster position="top-center" richColors />
      
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-center tracking-tight">Våra Matlådor</h1>
        <p className="text-center text-gray-500 mb-12">Hemlagad mat för avhämtning eller leverans.</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {meals.map((meal) => (
            <div key={meal.id} className="rounded-3xl border border-border bg-white overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
              
              {/* BILD / EMOJI */}
              <div className="aspect-square bg-secondary/30 flex items-center justify-center text-8xl">
                {meal.emoji}
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold mb-2">{meal.name}</h3>
                <p className="text-sm text-gray-500 mb-4 flex-grow">{meal.description}</p>
                <p className="text-xl font-bold mb-4">{meal.price} kr</p>

                {/* Räknare */}
                <div className="flex items-center justify-between bg-secondary/50 rounded-full p-1 mb-4">
                  <button 
                    onClick={() => updateQuantity(meal.id, -1)}
                    className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-lg font-bold w-8 text-center">{quantities[meal.id] || 0}</span>
                  <button 
                    onClick={() => updateQuantity(meal.id, 1)}
                    className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Totalt för denna rätt */}
                <p className="text-xs text-center text-gray-400 mb-4 h-4">
                  {quantities[meal.id] > 0 ? `Totalt: ${meal.price * quantities[meal.id]} kr` : ''}
                </p>

                {/* Köp-knapp */}
                <button
                  onClick={() => handleAddMeal(meal)}
                  className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors active:scale-95"
                >
                  Lägg i kundvagn
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summering (Flytande längst ner om man valt något, eller statisk) */}
        {getTotalPrice() > 0 && (
           <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-primary text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-10 fade-in duration-300 z-50">
             <div>
               <p className="text-xs opacity-70">Att lägga till</p>
               <p className="text-xl font-bold">{getTotalPrice()} kr</p>
             </div>
             <div className="h-8 w-[1px] bg-white/20"></div>
             <p className="text-sm font-medium">Glöm inte klicka "Lägg i kundvagn" på rätterna!</p>
           </div>
        )}
        
      </div>
    </div>
  );
}