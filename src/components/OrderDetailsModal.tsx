import { X, User as UserIcon, MapPin, Package } from 'lucide-react';
import { Order } from '../types';

export const OrderDetailsModal = ({ order, onClose }: { order: Order, onClose: () => void }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative z-10 animate-fade-in-up flex flex-col">
         
         <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50 sticky top-0">
            <div>
               <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-heading font-bold uppercase">Поръчка #{order.id}</h3>
                  <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${order.status === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                      {order.status === 'delivered' ? 'Доставена' : 'Обработва се'}
                  </span>
               </div>
               <p className="text-slate-500 text-sm">{new Date(order.date).toLocaleString('bg-BG')}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition"><X size={24}/></button>
         </div>

         <div className="p-8 space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                   <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><UserIcon size={14}/> Клиент</div>
                   <div className="font-bold text-lg">{order.customerName}</div>
                   <div className="text-slate-500">{order.phone}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                   <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><MapPin size={14}/> Доставка до</div>
                   <div className="text-neutral-900 leading-relaxed">{order.address}</div>
                </div>
            </div>

            <div>
               <h4 className="font-bold uppercase text-sm text-slate-400 tracking-widest mb-4 border-b border-slate-100 pb-2">Продукти ({order.items.length})</h4>
               <div className="space-y-3">
                  {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 py-2">
                          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-300"><Package size={20} /></div>
                          <div className="flex-grow">
                             <div className="font-bold text-neutral-900">{item.name}</div>
                             <div className="text-xs text-slate-500">Код: {item.id}</div>
                          </div>
                          <div className="text-right">
                             <div className="font-bold">x{item.quantity}</div>
                             <div className="text-slate-500 text-sm">€{Number(item.price).toFixed(2)}</div>
                          </div>
                      </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center sticky bottom-0">
             <div className="text-sm text-slate-500">Начин на плащане: <span className="font-bold text-neutral-900">Наложен платеж</span></div>
             <div className="text-right">
                <div className="text-xs text-slate-400 uppercase font-bold">Обща стойност</div>
                <div className="text-3xl font-heading font-bold text-neutral-900">€{order.total.toFixed(2)}</div>
             </div>
         </div>
      </div>
    </div>
  );
};