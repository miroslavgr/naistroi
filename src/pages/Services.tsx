import React, { useEffect, useState, useMemo } from 'react';
import { 
  Hammer, Shield, Truck, Ruler, 
  Construction, ArrowRight, CheckCircle2, PhoneCall 
} from 'lucide-react';
import { useStore } from '../store';
import { Product } from '../types';
import { useNavigate } from 'react-router-dom';
import { BGN_RATE } from '../constants';

export const Services = () => {
  const { addToCart, products, openAssistant } = useStore();
  const navigate = useNavigate();
  const [services, setServices] = useState<Product[]>([]);

  useEffect(() => {
    // Filter by type 'service' or if the legacy category matches a service keyword (fallback)
    const filtered = products.filter(p => {
        // If 'type' is explicitly set to 'product', EXCLUDE it.
        if (p.type === 'product') return false;

        // If 'type' is explicitly 'service', INCLUDE it.
        if (p.type === 'service') return true;
        
        // Fallback for legacy data without 'type' field:
        // Include if legacy 'category' string matches a service keyword
        const serviceKeywords = ['услуги', 'ремонти', 'монтажи', 'под наем', 'сигурност', 'строителство'];
        return serviceKeywords.some(k => p.category?.toLowerCase().includes(k));
    });
    setServices(filtered);
  }, [products]);

  const handleAddService = (e: React.MouseEvent, service: Product) => {
    e.stopPropagation(); // Prevent card click
    addToCart(service, 1);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Hero Section */}
      <div className="bg-neutral-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center"></div>
        <div className="container mx-auto px-4 py-20 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-heading font-bold uppercase mb-4 tracking-tight">Строителни Услуги</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Професионални решения за вашия дом и бизнес. От основите до покрива - ние сме насреща.
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="container mx-auto px-4 py-16">
        {services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div 
                key={service.id} 
                onClick={() => navigate(`/product/${service.id}`)}
                className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full cursor-pointer"
              >
                {/* Fixed Aspect Ratio Container */}
                <div className="aspect-[4/3] w-full relative bg-white overflow-hidden">
                  <div className="absolute inset-0 bg-neutral-900/10 group-hover:bg-neutral-900/0 transition-colors z-10 pointer-events-none"></div>
                  <img 
                    src={service.image} 
                    alt={service.name} 
                    className="w-full h-full object-cover transition duration-700 transform group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 z-20 bg-neutral-900/90 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                     {service.category || 'Услуга'}
                   </div>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-heading font-bold text-neutral-900 mb-3 group-hover:text-orange-600 transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-slate-600 text-sm mb-6 flex-grow leading-relaxed line-clamp-3">
                    {service.description}
                  </p>
                  
                  <div className="pt-4 border-t border-slate-100 mt-auto">
                    <div className="flex items-center justify-between">
                      <div>
                        {service.price > 0 ? (
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-400 font-bold uppercase">Цена</span>
                            <div className="flex items-baseline gap-2">
                              <span className="text-xl font-bold text-neutral-900">
                                €{service.price.toFixed(2)}
                              </span>
                              <span className="text-sm font-bold text-slate-500">
                                / {(service.price * BGN_RATE).toFixed(2)} лв.
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">на мярка</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-orange-600 font-bold">
                            <CheckCircle2 size={18} />
                            <span>Цена по договаряне</span>
                          </div>
                        )}
                      </div>
                      
                      <button 
                        onClick={(e) => handleAddService(e, service)}
                        className={`px-4 py-3 rounded-xl font-bold text-sm uppercase flex items-center gap-2 transition shadow-lg relative z-30 ${
                          service.price > 0 
                            ? 'bg-neutral-900 text-white hover:bg-orange-600' 
                            : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        }`}
                      >
                        {service.price > 0 ? (
                          <>Добави <ArrowRight size={16}/></>
                        ) : (
                          <>Заяви <PhoneCall size={16}/></>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
             <Construction size={64} className="mx-auto text-slate-300 mb-4" />
             <h3 className="text-2xl font-bold text-slate-400">Няма намерени услуги</h3>
             <p className="text-slate-400 mt-2">Моля, проверете отново по-късно.</p>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="container mx-auto px-4 pb-16">
        <div className="bg-orange-600 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 opacity-10">
            <Construction size={400} />
          </div>
          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Нуждаете се от консултация?</h2>
              <p className="text-orange-100 text-lg mb-8">
                За сложни обекти, цялостни ремонти и нестандартни решения, нашите инженери са на разположение за безплатен оглед и изготвяне на оферта.
              </p>
              <div className="flex flex-wrap gap-4">
                <button onClick={() => openAssistant('voice')} className="bg-white text-orange-600 px-6 py-3 rounded-xl font-bold uppercase hover:bg-neutral-100 transition shadow-lg flex items-center gap-2">
                  <PhoneCall size={20} /> Обади се сега (AI)
                </button>
                <button onClick={() => navigate('/contacts')} className="bg-orange-700 text-white px-6 py-3 rounded-xl font-bold uppercase hover:bg-orange-800 transition shadow-lg border border-orange-500">
                  Контакти
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-orange-100">
               <div className="bg-orange-700/50 p-4 rounded-xl backdrop-blur-sm">
                 <Truck className="mb-2 text-white" size={24}/>
                 <div className="font-bold text-white">Транспорт</div>
                 <div className="text-xs">Собствен транспорт до всяка точка</div>
               </div>
               <div className="bg-orange-700/50 p-4 rounded-xl backdrop-blur-sm">
                 <Shield className="mb-2 text-white" size={24}/>
                 <div className="font-bold text-white">Гаранция</div>
                 <div className="text-xs">Договор и гаранция за качество</div>
               </div>
               <div className="bg-orange-700/50 p-4 rounded-xl backdrop-blur-sm">
                 <Ruler className="mb-2 text-white" size={24}/>
                 <div className="font-bold text-white">Огледи</div>
                 <div className="text-xs">Безплатен оглед и замерване</div>
               </div>
               <div className="bg-orange-700/50 p-4 rounded-xl backdrop-blur-sm">
                 <Hammer className="mb-2 text-white" size={24}/>
                 <div className="font-bold text-white">Опит</div>
                 <div className="text-xs">Над 15 години в бранша</div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
