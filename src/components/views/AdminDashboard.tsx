'use client';

import { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Package, Phone, Mail, MapPin, Home, CheckCircle2, Clock, AlertCircle, Cake, X } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { CakeInquiry, WorkFlowStatus } from '@/types';

// --- TYPER ---
const ItemTypes = { CARD: 'card' };

// Mappar Backend Enum (1,2,3) till Frontend Status Strängar
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

// --- KOMPONENTER (Ersätter shadcn/ui för att slippa skapa 20 filer) ---

function Badge({ children, className, variant = 'default' }: any) {
  const base = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  const variants: any = {
    default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground",
  };
  // Vi använder enkla klasser om varianten inte matchar din theme-config perfekt än
  const style = className?.includes('bg-') ? className : `${base} ${variants[variant] || variants.default} ${className || ''}`;
  return <div className={style}>{children}</div>;
}

function Card({ children, className }: any) {
  return <div className={`rounded-xl border bg-card text-card-foreground shadow-sm ${className}`}>{children}</div>;
}

// --- MODAL KOMPONENT (Ersätter Dialog) ---
function OrderDetailModal({ item, isOpen, onClose }: any) {
  if (!isOpen || !item) return null;

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
           <Badge className="bg-purple-600 text-white">TÅRTA</Badge>
           <span className="text-xs text-gray-500">{new Date(item.inquiryDate).toLocaleString()}</span>
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
            </div>
          </div>

          {/* Detaljer */}
          <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
            <h3 className="text-sm font-bold text-purple-900 mb-3 uppercase tracking-wide">Beställning</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white/60 p-3 rounded-xl">
                <p className="text-xs text-purple-700 font-medium mb-1">Storlek</p>
                <p className="text-sm font-bold text-gray-900">{["6 bitar", "8 bitar", "12 bitar", "Större"][item.size]}</p>
              </div>
              <div className="bg-white/60 p-3 rounded-xl">
                <p className="text-xs text-purple-700 font-medium mb-1">Smak</p>
                <p className="text-sm font-bold text-gray-900">{["Choklad", "Hallon", "Vanilj", "Jordgubb", "Citron", "Special"][item.flavor]}</p>
              </div>
            </div>
            
            <div className="bg-white/60 p-3 rounded-xl mb-4">
              <p className="text-xs text-purple-700 font-medium mb-1">Beskrivning</p>
              <p className="text-sm text-gray-700 leading-relaxed italic">"{item.description}"</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {item.decorations && <Badge className="bg-white text-purple-700 border border-purple-200">✨ Dekorationer</Badge>}
              {item.cakeText && <Badge className="bg-white text-purple-700 border border-purple-200">📝 Text på tårta</Badge>}
              {item.extraFilling && <Badge className="bg-white text-purple-700 border border-purple-200">🍓 Extra fyllning</Badge>}
            </div>
          </div>
        </div>

        <button onClick={onClose} className="w-full mt-6 bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors">
          Stäng
        </button>
      </div>
    </div>
  );
}

// --- DRAGGABLE CARD ---
function DraggableCard({ item, onMove, onClick }: any) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CARD,
    item: { id: item.id, currentStatus: mapStatusToText(item.workFlowStatus) },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  // Ref-hantering för TypeScript
  const dragRef = (element: HTMLDivElement) => {
    drag(element);
  };

  return (
    <div ref={dragRef} style={{ opacity: isDragging ? 0.5 : 1 }} onClick={onClick} className="cursor-pointer touch-none mb-3">
      <Card className="border-2 border-transparent hover:border-primary/10 hover:shadow-lg transition-all duration-200 bg-white">
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-2">
                <Cake className="w-4 h-4 text-purple-600" />
                <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-0 text-[10px] px-2">TÅRTA</Badge>
              </div>
              <h3 className="font-bold text-sm truncate">{item.customerName}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{new Date(item.inquiryDate).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex gap-1.5 flex-wrap">
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-md text-gray-600 font-medium">
                {["6 bit", "8 bit", "12 bit", "Stor"][item.size]}
              </span>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-md text-gray-600 font-medium">
                {["Choklad", "Hallon", "Vanilj", "Jordgubb", "Citron", "Special"][item.flavor]}
              </span>
            </div>
            {item.description && (
              <p className="text-xs text-gray-500 line-clamp-2 italic bg-gray-50 p-2 rounded-lg">
                "{item.description}"
              </p>
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
    drop: (item: { id: string; currentStatus: string }) => {
      if (item.currentStatus !== status) {
        onDrop(item.id, mapTextToStatus(status));
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  // Ref-hantering
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
  const [orders, setOrders] = useState<CakeInquiry[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<CakeInquiry | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // HÄMTA DATA (Backend Integration)
  useEffect(() => {
    const fetchData = async () => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:7147/api/v1';
            const res = await fetch(`${baseUrl}/admin/data`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            setOrders(data.cakeInquiries); // Vi hämtar tårtor från backend
        } catch {
            toast.error("Kunde inte hämta data");
        }
    };
    fetchData();
  }, []);

  // HANTERA DROP (Uppdatera status i Backend)
  const handleDrop = async (id: string, newStatus: number) => {
    // 1. Optimistisk uppdatering i UI
    const oldOrders = [...orders];
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, workFlowStatus: newStatus } : o));

    const statusNames = { 1: 'Att Göra', 2: 'Pågår', 3: 'Klar' };
    
    // 2. Skicka till Backend
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:7147/api/v1';
        await fetch(`${baseUrl}/admin/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, newStatus })
        });
        toast.success(`Flyttad till ${statusNames[newStatus as 1|2|3]}`);
    } catch {
        setOrders(oldOrders); // Rulla tillbaka
        toast.error("Kunde inte spara ändringen");
    }
  };

  // Filtrera
  const pendingOrders = orders.filter((o) => o.workFlowStatus === WorkFlowStatus.Pending);
  const inProgressOrders = orders.filter((o) => o.workFlowStatus === WorkFlowStatus.InProgress);
  const completedOrders = orders.filter((o) => o.workFlowStatus === WorkFlowStatus.Completed);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50/50 p-6 font-sans">
        <Toaster position="top-right" richColors />
        
        {/* HEADER */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Café 45 Admin</h1>
                <p className="text-sm text-gray-500">Kökshantering</p>
            </div>
            <div className="bg-primary/5 text-primary px-4 py-2 rounded-full text-sm font-bold">
                Totalt: {orders.length} beställningar
            </div>
        </div>

        {/* BOARD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Column
            status="pending"
            title="Att Göra"
            items={pendingOrders}
            onDrop={handleDrop}
            onCardClick={(item: any) => { setSelectedOrder(item); setIsDetailOpen(true); }}
            accentColor="border-red-200 bg-red-50 text-red-700"
            icon={<AlertCircle className="w-5 h-5" />}
          />
          <Column
            status="inProgress"
            title="Pågår"
            items={inProgressOrders}
            onDrop={handleDrop}
            onCardClick={(item: any) => { setSelectedOrder(item); setIsDetailOpen(true); }}
            accentColor="border-yellow-200 bg-yellow-50 text-yellow-700"
            icon={<Clock className="w-5 h-5" />}
          />
          <Column
            status="completed"
            title="Klar"
            items={completedOrders}
            onDrop={handleDrop}
            onCardClick={(item: any) => { setSelectedOrder(item); setIsDetailOpen(true); }}
            accentColor="border-green-200 bg-green-50 text-green-700"
            icon={<CheckCircle2 className="w-5 h-5" />}
          />
        </div>

        {/* MODAL */}
        <OrderDetailModal
          item={selectedOrder}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
        />
      </div>
    </DndProvider>
  );
}