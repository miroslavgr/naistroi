import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../store';
import { OrdersTab } from './admin/OrdersTab';
import { ProductsTab } from './admin/ProductsTab';
import { CategoriesTab } from './admin/CategoriesTab';
import { AttributesTab } from './admin/AttributesTab';
import { GalleryTab } from './admin/GalleryTab'; // <--- IMPORT

export const Admin = () => {
    const { user } = useStore();
    const [tab, setTab] = useState<'orders' | 'products' | 'categories' | 'attributes' | 'gallery'>('orders');

    if (user?.role !== 'admin') return <Navigate to="/" />;

    return (
        <div className="container mx-auto px-4 py-12 min-h-screen">
             <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-4xl font-heading font-bold text-neutral-900 uppercase">Админ Панел</h1>
                <div className="flex gap-2 bg-white p-1 rounded-lg border border-slate-200 overflow-x-auto max-w-full">
                    <button onClick={() => setTab('orders')} className={`px-4 py-2 rounded-md font-bold uppercase text-sm whitespace-nowrap transition ${tab === 'orders' ? 'bg-neutral-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Поръчки</button>
                    <button onClick={() => setTab('products')} className={`px-4 py-2 rounded-md font-bold uppercase text-sm whitespace-nowrap transition ${tab === 'products' ? 'bg-neutral-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Продукти</button>
                    <button onClick={() => setTab('categories')} className={`px-4 py-2 rounded-md font-bold uppercase text-sm whitespace-nowrap transition ${tab === 'categories' ? 'bg-neutral-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Структура</button>
                    <button onClick={() => setTab('attributes')} className={`px-4 py-2 rounded-md font-bold uppercase text-sm whitespace-nowrap transition ${tab === 'attributes' ? 'bg-neutral-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Атрибути</button>
                    <button onClick={() => setTab('gallery')} className={`px-4 py-2 rounded-md font-bold uppercase text-sm whitespace-nowrap transition ${tab === 'gallery' ? 'bg-neutral-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Галерия</button>
                </div>
             </div>

             {tab === 'orders' && <OrdersTab />}
             {tab === 'products' && <ProductsTab />}
             {tab === 'categories' && <CategoriesTab />}
             {tab === 'attributes' && <AttributesTab />}
             {tab === 'gallery' && <GalleryTab />} 
        </div>
    );
};