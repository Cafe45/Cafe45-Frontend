'use client';

import { useEffect, useState } from 'react';
import { Loader2, LogOut, Trash2, Phone, Mail, MapPin, Store, Cake, ShoppingBag, AlertCircle, Copy } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        window.location.href = '/admin/login';
        return;
      }
      setIsAuthLoading(false);
      fetchAllData();
    };
    checkUser();
  }, []);

  async function fetchAllData() {
    // Hämta Inquiries
    const { data: inquiries } = await supabase.from('cake_inquiries').select('*').order('created_at', { ascending: false });
    // Hämta Ordrar
    const { data: orders } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });

    // Normalisera data
    const allInquiries = (inquiries || []).map(i => ({ 
      ...i, 
      type: 'inquiry',
      uiStatus: i.workflow_status === 1 ? 'Ny' : i.workflow_status === 2 ? 'Pågår' : 'Klar'
    }));

    const allOrders = (orders || []).map(o => ({ 
      ...o, 
      type: 'order',
      uiStatus: o.status || 'Ny'
    }));

    // Slå ihop och sortera
    const combined = [...allInquiries, ...allOrders].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    setItems(combined);
    setLoading(false);
  }

  // Kopiera till urklipp (Bättre än att öppna mail-app)
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} kopierad!`);
  };

  async function handleStatusChange(id: number, type: 'inquiry'|'order', newUiStatus: string) {
    setItems(prev => prev.map(item => 
      (item.id === id && item.type === type) ? { ...item, uiStatus: newUiStatus } : item
    ));

    if (type === 'inquiry') {
      const statusInt = newUiStatus === 'Ny' ? 1 : newUiStatus === 'Pågår' ? 2 : 3;
      await supabase.from('cake_inquiries').update({ workflow_status: statusInt }).eq('id', id);
    } else {
      await supabase.from('orders').update({ status: newUiStatus }).eq('id', id);
    }
    toast.success(`Status ändrad till: ${newUiStatus}`);
  }

  async function handleDelete(id: number, type: 'inquiry' | 'order') {
    if (!confirm('Ta bort beställning?')) return;
    const table = type === 'inquiry' ? 'cake_inquiries' : 'orders';
    await supabase.from(table).delete().eq('id', id);
    toast.success('Borttagen');
    fetchAllData(); 
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  }

  const getStatusColor = (status: string) => {
    if (status === 'Klar') return 'bg-green-100 text-green-800 border-green-200';
    if (status === 'Pågår') return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const getSizeText = (s: number) => ['6 bitar', '8 bitar', '12 bitar', 'Större'][s] || 'Okänd';
  const getFlavorText = (f: number) => ['Choklad', 'Hallon', 'Vanilj', 'Jordgubb', 'Citron', 'Valfritt'][f] || 'Okänd';

  if (isAuthLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-gray-400 w-10 h-10" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-900">
      <Toaster position="top-center" richColors />
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold">Admin: Kökspanel</h1>
          <button onClick={handleLogout} className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors font-bold text-sm">
            <LogOut className="w-4 h-4" /> Logga ut
          </button>
        </div>

        {loading ? (
           <div className="flex justify-center pt-20"><Loader2 className="animate-spin w-10 h-10 text-gray-400" /></div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {items.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100"><p className="text-gray-500">Inga beställningar än.</p></div>
            ) : (
              items.map((item) => (
                <div key={`${item.type}-${item.id}`} className={`bg-white p-6 rounded-2xl shadow-sm border-2 transition-all ${item.uiStatus === 'Klar' ? 'border-green-100 opacity-75' : 'border-gray-100 hover:border-black/10'}`}>
                  
                  <div className="flex flex-col lg:flex-row gap-6">
                    
                    {/* 1. INFO */}
                    <div className="lg:w-1/4 border-b lg:border-b-0 lg:border-r border-gray-100 pb-4 lg:pb-0 pr-4">
                      <div className="flex items-center gap-2 mb-3">
                        {item.type === 'inquiry' ? (
                          <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-1 rounded-full font-bold uppercase flex gap-1 items-center"><Cake className="w-3 h-3"/> Förfrågan</span>
                        ) : (
                          <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-1 rounded-full font-bold uppercase flex gap-1 items-center"><ShoppingBag className="w-3 h-3"/> Order</span>
                        )}
                        <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                      
                      <h3 className="text-lg font-bold mb-1">{item.customer_name}</h3>
                      <div className="text-sm text-gray-500 mb-4">{item.phone_number}</div>

                      <div className="bg-gray-50 p-3 rounded-xl">
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Status</label>
                        <select 
                          value={item.uiStatus} 
                          onChange={(e) => handleStatusChange(item.id, item.type, e.target.value)}
                          className={`w-full p-2 rounded-lg font-bold text-sm border-2 outline-none cursor-pointer ${getStatusColor(item.uiStatus)}`}
                        >
                          <option value="Ny">🟡 Ny</option>
                          <option value="Pågår">🔵 Pågår</option>
                          <option value="Klar">🟢 Klar</option>
                        </select>
                      </div>
                    </div>

                    {/* 2. INNEHÅLL */}
                    <div className="lg:w-2/4">
                       {item.type === 'inquiry' ? (
                         <>
                           <div className="flex items-baseline gap-2 mb-2">
                             <span className="text-2xl font-black">{getSizeText(item.size)}</span>
                             <span className="text-lg text-gray-600 font-medium">{getFlavorText(item.flavor)}</span>
                           </div>
                           <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 leading-relaxed mb-3">
                              "{item.description}"
                           </div>
                           <div className="flex flex-wrap gap-2">
                              {item.decorations && <span className="bg-black text-white px-2 py-1 rounded text-xs">✨ Dekorationer</span>}
                              {item.cake_text && <span className="bg-black text-white px-2 py-1 rounded text-xs">📝 Text</span>}
                              {item.extra_filling && <span className="bg-black text-white px-2 py-1 rounded text-xs">🍓 Fyllning</span>}
                           </div>
                         </>
                       ) : (
                         <div className="space-y-3">
                           <div className="bg-gray-50 rounded-xl overflow-hidden">
                             {item.order_items?.map((prod: any, idx: number) => (
                               <div key={idx} className="flex justify-between p-3 border-b border-gray-200/50 last:border-0 text-sm">
                                 <span className="font-medium"><span className="font-bold">{prod.quantity}x</span> {prod.product_name}</span>
                                 <span className="text-gray-500">{prod.price * prod.quantity} kr</span>
                               </div>
                             ))}
                             <div className="bg-gray-100 p-3 flex justify-between items-center">
                                <span className="text-xs font-bold uppercase text-gray-500">Totalt belopp</span>
                                <span className="font-black text-lg">{item.total_price} kr</span>
                             </div>
                           </div>
                           
                           {/* HÄR SYNS ALLERGIER FÖR ORDRAR */}
                           {item.allergies && (
                             <div className="bg-red-50 p-3 rounded-xl border border-red-100 flex gap-2 items-start">
                               <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                               <div>
                                 <span className="text-[10px] font-bold text-red-600 uppercase block">Viktigt: Allergier</span>
                                 <p className="text-sm text-red-900">{item.allergies}</p>
                               </div>
                             </div>
                           )}
                         </div>
                       )}

                       {/* Visa adress vid leverans */}
                       {(item.delivery_type === 1 || item.delivery_address) && (
                         <div className="mt-3 flex items-start gap-2 text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                           <MapPin className="w-4 h-4 mt-0.5 text-yellow-600 shrink-0" />
                           <div>
                             <span className="font-bold text-yellow-800 block text-xs uppercase">Leveransadress</span>
                             <p>{item.address || item.delivery_address || <span className="italic text-gray-400">Ingen adress angiven</span>}</p>
                           </div>
                         </div>
                       )}
                    </div>

                    {/* 3. KONTAKT & KNAPPAR (Nu med Kopiera-funktion!) */}
                    <div className="lg:w-1/4 flex flex-col justify-between items-end pl-4 border-l border-gray-100">
                      <div className="flex gap-2">
                        {item.email && (
                          <button 
                            onClick={() => copyToClipboard(item.email, 'Email')}
                            title="Kopiera Email"
                            className="p-2 bg-gray-100 rounded-full hover:bg-black hover:text-white transition-colors"
                          >
                            <Mail className="w-4 h-4"/>
                          </button>
                        )}
                        {item.phone_number && (
                          <button 
                            onClick={() => copyToClipboard(item.phone_number, 'Telefonnummer')}
                            title="Kopiera Telefonnummer"
                            className="p-2 bg-gray-100 rounded-full hover:bg-black hover:text-white transition-colors"
                          >
                            <Phone className="w-4 h-4"/>
                          </button>
                        )}
                      </div>
                      <button onClick={() => handleDelete(item.id, item.type)} className="text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2">
                        <Trash2 className="w-4 h-4"/> Ta bort order
                      </button>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}