import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Truck } from 'lucide-react';
import { useStore } from '../store';
import { BGN_RATE } from '../constants';

export const ProductDetails = () => {
  const { id } = useParams();
  const { products, addToCart } = useStore();
  const product = products.find(p => p.id === id);
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-700">Продуктът не е намерен</h2>
        <Link to="/products" className="text-orange-600 hover:underline mt-4 inline-block">Обратно към каталога</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-orange-600 mb-8 transition font-medium">
        <ArrowLeft size={20} className="mr-2" /> Назад към каталога
      </button>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="h-[400px] md:h-auto bg-gray-100 relative group overflow-hidden">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover transition duration-700 group-hover:scale-105" />
          </div>

          <div className="p-8 md:p-16 flex flex-col justify-center">
            <div className="flex gap-3 mb-6">
               <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wider">{product.category}</span>
               <span className="bg-neutral-900 text-white text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wider">{product.brand}</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-neutral-900 mb-4 leading-tight">{product.name}</h1>
            
            <div className="text-5xl font-heading font-bold text-orange-600 mb-2">
              €{product.price.toFixed(2)}
              <span className="text-lg text-slate-400 font-normal ml-2">/ бр.</span>
            </div>
             <div className="text-xl text-slate-500 font-bold mb-8">≈ {(product.price * BGN_RATE).toFixed(2)} лв.</div>

            <div className="flex items-center gap-2 mb-8 p-3 bg-slate-50 rounded-lg w-fit">
              {product.stock > 0 ? (
                <span className="flex items-center text-green-600 text-sm font-bold uppercase tracking-wide">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div> Наличен ({product.stock} бр.)
                </span>
              ) : (
                <span className="flex items-center text-red-500 text-sm font-bold uppercase tracking-wide">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div> Изчерпан
                </span>
              )}
            </div>

            <p className="text-slate-600 leading-relaxed mb-10 text-lg">{product.description}</p>

            <div className="border-t border-slate-100 pt-10 mt-auto">
              <div className="flex flex-col sm:flex-row gap-5">
                <div className="flex items-center bg-slate-100 rounded-full p-1 w-fit">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-neutral-900 hover:bg-orange-100 transition">-</button>
                  <span className="w-16 text-center font-bold text-lg">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-neutral-900 hover:bg-orange-100 transition">+</button>
                </div>
                
                <button onClick={() => { addToCart(product, qty); setQty(1); }} className="flex-1 bg-gradient-to-r from-neutral-900 to-neutral-800 text-white px-8 py-4 rounded-full font-bold uppercase tracking-wider hover:from-orange-600 hover:to-red-600 transition shadow-lg flex items-center justify-center gap-3 transform active:scale-95 touch-manipulation">
                  <ShoppingCart size={20} /> Добави в количка
                </button>
              </div>
            </div>
            
            <div className="mt-8 flex items-center gap-3 text-sm text-slate-500">
               <Truck size={18} className="text-orange-500" /><span>Доставка до 24 часа за София</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};