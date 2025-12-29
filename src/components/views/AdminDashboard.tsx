'use client';

import { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Package, Phone, Mail, MapPin, Home, CheckCircle2, Clock, AlertCircle, Cake, Utensils, X, ShoppingBag } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { CakeInquiry, WorkFlowStatus } from '@/types';
import { supabase } from '@/lib/supabase';


// --- TYPER & UTILS ---
const ItemTypes = { CARD: 'card' };

// Utökat interface för att hantera BÅDE Inquiry och Order
interface DashboardItem {
  id: string;
  type: 'inquiry' | 'order';
  workFlowStatus: WorkFlowStatus;
  customerName: string;
  phoneNumber: string;
  email: string;
  date: string;

  // Inquiry Specifika
  details?: {
    size: number;
    flavor: number;
    description: string;
    decorations: boolean;
    cakeText: boolean;
    extraFilling: boolean;
  };

  // Order Specifika
  items?: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
  totalAmount?: number;
  paymentStatus?: string;
  deliveryType?: number;
}

const mapStatusToText = (s: number) => {
  if (s === WorkFlowStatus.Pending) return 'pending';
  if (s === WorkFlowStatus.InProgress) return 'inProgress';
  return 'completed';
};

const mapTextToStatus = (s: string) => {
  if (s === 'pending') return WorkFlowStatus.Pending;
  if (s === 'inProgress') return WorkFlowStatus.InProgress;
  return WorkFlowStatus.Completed;
};

// --- KOMPONENTER ---

function Badge({ children, className, variant = 'default' }: any) {
  const base = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  const variants: any = {
    default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground",
  };
  const style = className?.includes('bg-') ? className : `${base} ${variants[variant] || variants.default} ${className || ''}`;
  return <div className={style}>{children}</div>;
}

function Card({ children, className }: any) {
  return <div className={`rounded-xl border bg-card text-card-foreground shadow-sm ${className}`}>{children}</div>;
}

// --- MODAL ---
function OrderDetailModal({ item, isOpen, onClose }: { item: DashboardItem | null, isOpen: boolean, onClose: () => void }) {
  if (!isOpen || !item) return null;

  const isOrder = item.type === 'order';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 p-6 relative">
        <button onClick={onClose} className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 transition-colors">
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="flex items-center justify-between mb-2 pr-8">
          <h2 className="text-2xl font-bold truncate">{item.customerName}</h2>
        </div>

        <div className="flex items-center gap-2 mb-6">
          {isOrder ? (
            <Badge className="bg-blue-600 text-white">ORDER ({item.paymentStatus})</Badge>
          ) : (
            <Badge className="bg-purple-600 text-white">FÖRFRÅGAN</Badge>
          )}
          <span className="text-xs text-gray-500">{new Date(item.date).toLocaleString()}</span>
        </div>

        <div className="space-y-6">
          {/* Kontakt */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Kontakt</h3>
            <div className="space-y-2">
              <a href={`tel:${item.phoneNumber}`} className="flex items-center gap-3 text-sm text-gray-600 hover:text-black transition-colors">
                <div className="bg-white p-2 rounded-full shadow-sm"><Phone className="w-4 h-4" /></div>
                {item.phoneNumber}
              </a>
              <a href={`mailto:${item.email}`} className="flex items-center gap-3 text-sm text-gray-600 hover:text-black transition-colors">
                <div className="bg-white p-2 rounded-full shadow-sm"><Mail className="w-4 h-4" /></div>
                {item.email || 'Ingen e-post'}
              </a>
              {isOrder && item.deliveryType === 1 && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="bg-white p-2 rounded-full shadow-sm"><MapPin className="w-4 h-4" /></div>
                  <span>Hemleverans</span>
                </div>
              )}
            </div>
          </div>

          {/* Detaljer */}
          {!isOrder && item.details ? (
            // --- INQUIRY VIEW ---
            <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
              <h3 className="text-sm font-bold text-purple-900 mb-3 uppercase tracking-wide">Tårtförfrågan</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white/60 p-3 rounded-xl">
                  <p className="text-xs text-purple-700 font-medium mb-1">Storlek</p>
                  <p className="text-sm font-bold text-gray-900">{["6 bitar", "8 bitar", "12 bitar", "Större"][item.details.size]}</p>
                </div>
                <div className="bg-white/60 p-3 rounded-xl">
                  <p className="text-xs text-purple-700 font-medium mb-1">Smak</p>
                  <p className="text-sm font-bold text-gray-900">{["Choklad", "Hallon", "Vanilj", "Jordgubb", "Citron", "Special"][item.details.flavor]}</p>
                </div>
              </div>

              <div className="bg-white/60 p-3 rounded-xl mb-4">
                <p className="text-xs text-purple-700 font-medium mb-1">Beskrivning</p>
                <p className="text-sm text-gray-700 leading-relaxed italic">"{item.details.description}"</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {item.details.decorations && <Badge className="bg-white text-purple-700 border border-purple-200">✨ Dekorationer</Badge>}
                {item.details.cakeText && <Badge className="bg-white text-purple-700 border border-purple-200">📝 Text på tårta</Badge>}
                {item.details.extraFilling && <Badge className="bg-white text-purple-700 border border-purple-200">🍓 Extra fyllning</Badge>}
              </div>
            </div>
          ) : (
            // --- ORDER VIEW ---
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
              <h3 className="text-sm font-bold text-blue-900 mb-3 uppercase tracking-wide">Produkter</h3>
              <div className="space-y-2 mb-4">
                {item.items?.map((prod, idx) => (
                  <div key={idx} className="bg-white/60 p-3 rounded-xl flex justify-between items-center">
                    <span className="font-bold text-gray-900">{prod.quantity}x {prod.productName}</span>
                    <span className="text-sm text-blue-800">{prod.unitPrice} kr</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center border-t border-blue-200 pt-3">
                <span className="font-bold text-blue-900">Totalt</span>
                <span className="font-bold text-xl text-blue-900">{item.totalAmount} kr</span>
              </div>
            </div>
          )}
        </div>

        <button onClick={onClose} className="w-full mt-6 bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors">
          Stäng
        </button>
      </div>
    </div>
  );
}

// --- DRAGGABLE CARD ---
function DraggableCard({ item, onMove, onClick }: { item: DashboardItem, onMove: any, onClick: any }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CARD,
    item: { id: item.id, currentStatus: mapStatusToText(item.workFlowStatus), type: item.type }, // Skicka med type här för säkerhets skull
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const dragRef = (element: HTMLDivElement) => {
    drag(element);
  };

  const isOrder = item.type === 'order';

  return (
    <div ref={dragRef} style={{ opacity: isDragging ? 0.5 : 1 }} onClick={onClick} className="cursor-pointer touch-none mb-3">
      <Card className="border-2 border-transparent hover:border-primary/10 hover:shadow-lg transition-all duration-200 bg-white">
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-2">
                {isOrder ? (
                  <>
                    <ShoppingBag className="w-4 h-4 text-blue-600" />
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 text-[10px] px-2">ORDER</Badge>
                  </>
                ) : (
                  <>
                    <Cake className="w-4 h-4 text-purple-600" />
                    <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-0 text-[10px] px-2">FÖRFRÅGAN</Badge>
                  </>
                )}
              </div>
              <h3 className="font-bold text-sm truncate">{item.customerName}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{new Date(item.date).toLocaleDateString()}</p>
            </div>
            {isOrder && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${item.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {item.paymentStatus === 'Paid' ? 'BETAD' : item.paymentStatus}
              </span>
            )}
          </div>

          <div className="space-y-2">
            {!isOrder && item.details ? (
              <div className="flex gap-1.5 flex-wrap">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-md text-gray-600 font-medium">
                  {["6 bit", "8 bit", "12 bit", "Stor"][item.details.size]}
                </span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-md text-gray-600 font-medium">
                  {["Choklad", "Hallon", "Vanilj", "Jordgubb", "Citron", "Special"][item.details.flavor]}
                </span>
              </div>
            ) : item.items && (
              <div className="flex flex-col gap-1">
                {item.items.slice(0, 2).map((i, idx) => (
                  <div key={idx} className="text-xs bg-gray-50 px-2 py-1 rounded-md text-gray-700 flex justify-between">
                    <span>{i.quantity}x {i.productName}</span>
                  </div>
                ))}
                {item.items.length > 2 && <span className="text-[10px] text-gray-400 pl-1">+ {item.items.length - 2} till...</span>}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

// --- COLUMN ---
function Column({ status, title, items, onDrop, accentColor, icon, onCardClick }: any) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,
    drop: (item: { id: string; currentStatus: string, type: string }) => {
      // NOTE: Här måste vi veta om det är en inquiry eller order för att anropa rätt endpoint om logiken skiljer sig, 
      // men just nu uppdaterar vi bara WorkFlowStatus via samma endpoint eller en generell one.
      // Egentligen anropas /admin/status vilket bara tar ID och uppdaterar repository.
      // Men vi har separata repositories.
      // Lösning: Vi måste uppdatera `handleDrop` att skicka med typen.

      if (item.currentStatus !== status) {
        onDrop(item.id, mapTextToStatus(status), item.type);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const dropRef = (element: HTMLDivElement) => {
    drop(element);
  };

  return (
    <div ref={dropRef} className={`flex-1 transition-all duration-200 rounded-2xl ${isOver ? 'bg-gray-100/80 ring-2 ring-primary/20' : ''}`}>
      <div className="sticky top-0 z-10 pb-3 bg-gray-50/0">
        <div className={`flex items-center gap-2 p-3 rounded-xl border ${accentColor} bg-white shadow-sm mb-2`}>
          {icon}
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold truncate">{title}</h2>
            <p className="text-xs text-gray-500">{items.length} st</p>
          </div>
        </div>
      </div>
      <div className="min-h-[500px]">
        {items.length === 0 && (
          <div className="text-center py-12 px-4 text-gray-300 border-2 border-dashed border-gray-200 rounded-xl">
            <div className="text-2xl mb-2 opacity-50">📭</div>
            <p className="text-xs font-medium">Inga ordrar här</p>
          </div>
        )}
        {items.map((item: any) => (
          <DraggableCard key={item.id} item={item} onMove={onDrop} onClick={() => onCardClick(item)} />
        ))}
      </div>
    </div>
  );
}

// --- MAIN DASHBOARD ---
export default function AdminDashboard() {
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<DashboardItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // HÄMTA DATA & REALTIME
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: inquiriesData, error: inquiryError } = await supabase
          .from('cake_inquiries')
          .select('*');
        if (inquiryError) throw inquiryError;

        const inquiries: DashboardItem[] = (inquiriesData || []).map((i: any) => ({
          id: i.id,
          type: 'inquiry',
          workFlowStatus: i.workflow_status,
          customerName: i.customer_name,
          phoneNumber: i.phone_number,
          email: i.email || '',
          date: i.created_at,
          details: {
            size: i.size,
            flavor: i.flavor,
            description: i.description,
            decorations: i.decorations,
            cakeText: i.cake_text,
            extraFilling: i.extra_filling
          }
        }));

        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*, order_items(*)');
        if (ordersError) throw ordersError;

        const orders: DashboardItem[] = (ordersData || []).map((o: any) => ({
          id: o.id,
          type: 'order',
          workFlowStatus: o.workflow_status,
          customerName: o.customer_name,
          phoneNumber: o.phone_number,
          email: o.email || '',
          date: o.created_at,
          items: o.order_items?.map((item: any) => ({
            productName: item.product_name,
            quantity: item.quantity,
            unitPrice: item.unit_price
          })),
          totalAmount: o.total_amount,
          paymentStatus: o.payment_status,
          deliveryType: o.delivery_type
        }));

        setItems([...inquiries, ...orders]);
      } catch (e) {
        console.error(e);
        toast.error("Kunde inte hämta data");
      }
    };

    fetchData();

    const channel = supabase
      .channel('admin_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cake_inquiries' }, () => fetchData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // HANTERA DROP
  const handleDrop = async (id: string, newStatus: number, type: 'inquiry' | 'order') => {
    // 1. UI Update
    const oldItems = [...items];
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, workFlowStatus: newStatus } : item));

    const statusNames = { 1: 'Att Göra', 2: 'Pågår', 3: 'Klar' };

    // 2. Backend Update
    try {
      const table = type === 'order' ? 'orders' : 'cake_inquiries';
      const { error } = await supabase
        .from(table)
        .update({ workflow_status: newStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Flyttad till ${statusNames[newStatus as 1 | 2 | 3]}`);
    } catch {
      setItems(oldItems);
      toast.error("Kunde inte spara ändringen");
    }
  };

  const pendingItems = items.filter((i) => i.workFlowStatus === WorkFlowStatus.Pending);
  const inProgressItems = items.filter((i) => i.workFlowStatus === WorkFlowStatus.InProgress);
  const completedItems = items.filter((i) => i.workFlowStatus === WorkFlowStatus.Completed);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50/50 p-6 font-sans">
        <Toaster position="top-right" richColors />

        {/* HEADER */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Café 45 Admin</h1>
            <p className="text-sm text-gray-500">Kökshantering - Orderöversikt</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" /> Ordrar: {items.filter(i => i.type === 'order').length}
            </div>
            <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
              <Cake className="w-4 h-4" /> Förfrågningar: {items.filter(i => i.type === 'inquiry').length}
            </div>
          </div>
        </div>

        {/* BOARD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Column
            status="pending"
            title="Att Göra"
            items={pendingItems}
            onDrop={handleDrop}
            onCardClick={(item: any) => { setSelectedItem(item); setIsDetailOpen(true); }}
            accentColor="border-red-200 bg-red-50 text-red-700"
            icon={<AlertCircle className="w-5 h-5" />}
          />
          <Column
            status="inProgress"
            title="Pågår"
            items={inProgressItems}
            onDrop={handleDrop}
            onCardClick={(item: any) => { setSelectedItem(item); setIsDetailOpen(true); }}
            accentColor="border-yellow-200 bg-yellow-50 text-yellow-700"
            icon={<Clock className="w-5 h-5" />}
          />
          <Column
            status="completed"
            title="Klar"
            items={completedItems}
            onDrop={handleDrop}
            onCardClick={(item: any) => { setSelectedItem(item); setIsDetailOpen(true); }}
            accentColor="border-green-200 bg-green-50 text-green-700"
            icon={<CheckCircle2 className="w-5 h-5" />}
          />
        </div>

        <OrderDetailModal
          item={selectedItem}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
        />
      </div>
    </DndProvider>
  );
}