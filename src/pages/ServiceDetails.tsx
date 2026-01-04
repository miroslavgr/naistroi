import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, PhoneCall, ArrowRight, Truck, Shield, Ruler, Hammer } from 'lucide-react';
import { useStore } from '../store';
import { BGN_RATE } from '../constants';

export const ServiceDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, products, openAssistant } = useStore(); // Added openAssistant

  const service = useMemo(() => products.find(s => s.id === id), [products, id]);

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col bg-slate-50">
        <h2 className="text-2xl font-bold mb-4">Услугата не е намерена</h2>
        <button onClick={() => navigate('/services')} className="bg-neutral-900 text-white px-6 py-2 rounded-xl">
          Към Услуги
        </button>
      </div>
    );
  }

  const handleAction = () => {
    if (service.price > 0) {
        addToCart(service, 1);
    } else {
        openAssistant('voice'); // Call AI assistant when price is 0
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Hero / Header */}
      <div className="bg-neutral-900 text-white relative">
        <div className="absolute inset-0 opacity-30">
            <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-[2px]"></div>
        </div>
        
        <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
          <button onClick={() => navigate('/services')} className="flex items-center gap-2 text-slate-300 hover:text-white mb-8 transition font-bold uppercase text-xs tracking-wider">
            <ArrowLeft size={16} /> Всички Услуги
          </button>
          
          <div className="max-w-3xl">
            <div className="inline-block bg-orange-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              {service.category}
            </div>
            <h1 className="text-3xl md:text-5xl font-heading font-bold mb-6 leading-tight">
              {service.name}
            </h1>
            <p className="text-xl text-slate-200 leading-relaxed">
              {service.description}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 -mt-10 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-10 grid md:grid-cols-3 gap-10">
          
          {/* Main Details (Left 2/3) */}
          <div className="md:col-span-2 space-y-8">
            <div>
              <h3 className="text-xl font-bold mb-4 font-heading uppercase">Описание на услугата</h3>
              <p className="text-slate-600 leading-relaxed">
                Ние предлагаме професионално изпълнение на {service.name.toLowerCase()} с внимание към всеки детайл. 
                Нашият екип от опитни специалисти използва само качествени материали и доказани технологии на работа.
                Гарантираме спазване на сроковете и чистота на обекта.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-3">
                 <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><Shield size={20}/></div>
                 <div>
                   <div className="font-bold text-sm">Гаранция за качество</div>
                   <div className="text-xs text-slate-500 mt-1">Дългогодишна гаранция на извършените дейности.</div>
                 </div>
               </div>
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-3">
                 <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Ruler size={20}/></div>
                 <div>
                   <div className="font-bold text-sm">Безплатен оглед</div>
                   <div className="text-xs text-slate-500 mt-1">Посещение на място и изготвяне на индивидуална оферта.</div>
                 </div>
               </div>
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-3">
                 <div className="bg-green-100 p-2 rounded-lg text-green-600"><Truck size={20}/></div>
                 <div>
                   <div className="font-bold text-sm">Транспорт</div>
                   <div className="text-xs text-slate-500 mt-1">Осигуряваме доставка на всички необходими материали.</div>
                 </div>
               </div>
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-3">
                 <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><Hammer size={20}/></div>
                 <div>
                   <div className="font-bold text-sm">Опитен екип</div>
                   <div className="text-xs text-slate-500 mt-1">Квалифицирани майстори с дългогодишен опит.</div>
                 </div>
               </div>
            </div>
          </div>

          {/* Sidebar / CTA (Right 1/3) */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col h-fit sticky top-24">
            <h3 className="text-lg font-bold mb-6 font-heading uppercase text-center">Детайли за цена</h3>
            
            <div className="mb-8 text-center">
              {service.price > 0 ? (
                <>
                  <div className="flex flex-col items-center">
                    <div className="text-3xl font-bold text-neutral-900">
                      €{service.price.toFixed(2)}
                    </div>
                    <div className="text-xl font-bold text-slate-500 mt-1">
                      / {(service.price * BGN_RATE).toFixed(2)} лв.
                    </div>
                  </div>
                  <div className="text-sm text-slate-400 font-medium mt-2">на мярка</div>
                </>
              ) : (
                <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-lg inline-flex items-center gap-2 font-bold text-sm">
                  <PhoneCall size={16} /> Цена по договаряне
                </div>
              )}
            </div>

            <button 
              onClick={handleAction}
              className={`w-full py-4 rounded-xl font-bold uppercase flex items-center justify-center gap-2 transition shadow-lg mb-4 ${
                service.price > 0 
                  ? 'bg-neutral-900 text-white hover:bg-orange-600' 
                  : 'bg-orange-600 text-white hover:bg-orange-700'
              }`}
            >
              {service.price > 0 ? (
                <>Добави в количка <ArrowRight size={18}/></>
              ) : (
                <>Заяви Оглед <CheckCircle2 size={18}/></>
              )}
            </button>

            <p className="text-xs text-center text-slate-400">
              {service.price > 0 
                ? "Цената е с включен ДДС. Доставката се изчислява допълнително."
                : "Натиснете бутона, за да добавите заявката в количката си. Наш консултант ще се свърже с вас."}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
