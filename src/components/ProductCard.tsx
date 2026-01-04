import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useStore } from '../store';
import { Product } from '../types';
import { BGN_RATE } from '../constants';

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useStore();
  return (
    <div className="group bg-white rounded-2xl shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden flex flex-col h-full border border-slate-100">
      {/* Aspect Ratio Container for Image */}
      <Link to={`/product/${product.id}`} className="aspect-[4/3] w-full overflow-hidden relative bg-white block">
        <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-contain transition duration-700 group-hover:scale-105" 
        />
        <div className="absolute top-3 left-3 flex gap-2">
           <span className="bg-white/90 backdrop-blur text-neutral-900 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm border border-neutral-100">{product.brand}</span>
        </div>
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
            <span className="text-white font-bold border-2 border-white px-4 py-1 uppercase tracking-widest">Изчерпан</span>
          </div>
        )}
      </Link>
      
      <div className="p-5 flex flex-col flex-grow relative">
        <div className="text-xs text-orange-500 font-bold uppercase tracking-widest mb-1">{product.category}</div>
        <Link to={`/product/${product.id}`} className="font-heading font-bold text-xl mb-3 text-neutral-800 leading-tight group-hover:text-orange-600 transition">{product.name}</Link>
        
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium">Цена</span>
            <div className="flex items-baseline gap-2">
                 {product.price > 0 ? (
                    <>
                        <span className="text-2xl font-bold text-neutral-900 font-heading">€{product.price.toFixed(2)}</span>
                        <span className="text-sm font-bold text-slate-500">/ {(product.price * BGN_RATE).toFixed(2)} лв.</span>
                    </>
                 ) : (
                    <span className="text-lg font-bold text-orange-600 font-heading">Цена по договаряне</span>
                 )}
            </div>
          </div>
          
          {product.price > 0 && (
             <button onClick={(e) => { e.preventDefault(); addToCart(product); }} className="w-12 h-12 rounded-full bg-neutral-900 text-white flex items-center justify-center hover:bg-orange-600 transition shadow-lg hover:shadow-orange-500/30 group-active:scale-95 touch-manipulation" title="Добави в количка">
               <ShoppingCart size={20} />
             </button>
          )}
        </div>
      </div>
    </div>
  );
};