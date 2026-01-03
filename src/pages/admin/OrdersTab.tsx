import React, { useState } from 'react';
import { Layers } from 'lucide-react';
import { useStore } from '../../store';
import { Order } from '../../types';
import { OrderDetailsModal } from '../../components/OrderDetailsModal';

export const OrdersTab = () => {
    const { orders, updateOrderStatus } = useStore();
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    return (
        <div className="space-y-4">
            {orders?.map(order => (
                <div 
                   key={order.id} 
                   onClick={() => setSelectedOrder(order)}
                   className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between gap-4 cursor-pointer hover:shadow-md transition group"
                >
                   <div>
                       <div className="flex items-center gap-3 mb-2">
                           <span className="font-mono font-bold text-slate-400 group-hover:text-orange-500 transition">#{order.id.slice(-6)}</span>
                           <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${order.status === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                               {order.status === 'delivered' ? 'Доставена' : 'Обработва се'}
                           </span>
                       </div>
                       <h3 className="font-bold text-lg">{order.customerName || 'Неизвестен клиент'}</h3>
                       <p className="text-sm text-slate-500 mb-2">{order.phone} • {order.address}</p>
                       <div className="text-xs text-slate-400 mt-2 flex items-center gap-1"><Layers size={12}/> {order.items?.length || 0} артикула</div>
                   </div>
                   
                   <div className="flex flex-col items-end gap-2 justify-center">
                       <div className="font-bold text-xl">€{order.total.toFixed(2)}</div>
                       {order.status !== 'delivered' && (
                           <button 
                              onClick={(e) => {
                                  e.stopPropagation(); 
                                  updateOrderStatus(order.id, 'delivered');
                              }}
                              className="bg-neutral-900 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-green-600 transition"
                           >
                              Маркирай доставена
                           </button>
                       )}
                   </div>
                </div>
            ))}
            {(!orders || orders.length === 0) && <div className="text-center text-slate-400 py-12">Няма поръчки</div>}
            {selectedOrder && <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
        </div>
    );
};