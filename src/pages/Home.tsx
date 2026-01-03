import { Link } from 'react-router-dom';
import { Star, ArrowLeft, Mic, Truck, Clock, MapPin, Package, Zap, MessageSquare, Bot, Phone } from 'lucide-react';
import { useStore } from '../store';
import { ProductCard } from '../components/ProductCard';

export const Home = () => {
  const { products, openAssistant } = useStore();
  const featured = products.slice(0, 4);

  return (
    <div className="animate-fade-in pb-12">
      <div className="relative bg-neutral-950 text-white min-h-[750px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1591717366324-1a3b10298a0d?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-luminosity"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-neutral-900/30"></div>
        <div className="absolute top-20 right-20 w-96 h-96 bg-orange-600 rounded-full blur-[150px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-blue-600 rounded-full blur-[150px] opacity-10"></div>

        <div className="container mx-auto px-4 relative z-10 text-center">
           <div className="max-w-4xl mx-auto animate-fade-in-up">
              <div className="inline-flex items-center gap-2 bg-orange-600/20 border border-orange-500/50 rounded-full px-5 py-2 mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(234,88,12,0.3)] transform hover:scale-105 transition duration-500 cursor-default">
                  <Star size={16} className="text-orange-500 fill-orange-500" />
                  <span className="text-orange-400 text-xs font-bold uppercase tracking-[0.2em]">№1 Логистика</span>
              </div>
              <h1 className="text-5xl md:text-8xl font-heading font-black mb-6 uppercase leading-[0.9] tracking-tight">
                ТРАНСПОРТ<br/><span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500">ДО ВРАТА</span>
              </h1>
              <div className="h-2 w-32 bg-gradient-to-r from-orange-500 to-red-600 mx-auto mb-10 rounded-full"></div>
              <p className="text-lg md:text-2xl text-slate-300 mb-12 font-light max-w-2xl mx-auto leading-relaxed">
                Собствен транспорт и експресна доставка на строителни материали до адрес в <span className="text-white font-bold">София и областта</span>.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                 <Link to="/products" className="group relative bg-orange-600 text-white font-bold py-5 px-12 rounded-xl overflow-hidden transition-all shadow-[0_0_40px_rgba(234,88,12,0.4)] hover:shadow-[0_0_60px_rgba(234,88,12,0.6)] hover:-translate-y-1 w-full sm:w-auto text-center">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 opacity-100 group-hover:opacity-90 transition"></div>
                    <span className="relative z-10 flex items-center justify-center gap-3 text-lg uppercase tracking-wide">
                       Разгледай Каталога <ArrowLeft className="rotate-180" size={20}/>
                    </span>
                 </Link>
                 <button onClick={() => openAssistant('voice')} className="group relative bg-white/5 backdrop-blur-md border border-white/10 text-white font-bold py-5 px-10 rounded-xl hover:bg-white/10 transition-all w-full sm:w-auto">
                    <span className="flex items-center justify-center gap-3 text-lg uppercase tracking-wide">
                       <Mic size={20} className="text-orange-500 group-hover:text-white transition" /> Поръчай с Глас
                    </span>
                 </button>
              </div>
              <div className="mt-20 flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition duration-500">
                  <div className="flex items-center gap-2 text-white font-heading font-bold uppercase tracking-wider text-sm"><Truck size={24} className="text-orange-500"/> Собствен автопарк</div>
                  <div className="flex items-center gap-2 text-white font-heading font-bold uppercase tracking-wider text-sm"><Clock size={24} className="text-orange-500"/> Доставка до 24ч</div>
                  <div className="flex items-center gap-2 text-white font-heading font-bold uppercase tracking-wider text-sm"><MapPin size={24} className="text-orange-500"/> Покритие София-Град</div>
              </div>
           </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-24 relative z-20">
        <div className="grid md:grid-cols-3 gap-6">
           {[
             { icon: Truck, title: "Транспорт до Обекта", desc: "Специализиран транспорт за тежки и обемни товари до всяка точка." },
             { icon: Package, title: "Големи Наличности", desc: "Всичко необходимо за груб строеж на склад в с. Вакарел." },
             { icon: Zap, title: "Бърза Поръчка", desc: "Поръчай по телефона или през гласовия асистент само с няколко думи." }
           ].map((item, idx) => (
             <div key={idx} className="bg-white p-8 rounded-2xl shadow-2xl shadow-neutral-900/10 hover:-translate-y-2 transition duration-300 border-t-4 border-orange-500 group">
               <div className="bg-orange-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition duration-300 shadow-sm"><item.icon size={32} /></div>
               <h3 className="text-2xl font-heading font-bold mb-3 uppercase text-neutral-900">{item.title}</h3>
               <p className="text-slate-600 leading-relaxed">{item.desc}</p>
             </div>
           ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
         <div className="bg-neutral-900 rounded-3xl overflow-hidden relative shadow-2xl">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2832&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-color-dodge"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600 rounded-full blur-[120px] opacity-30"></div>
            <div className="relative z-10 grid md:grid-cols-2 gap-12 p-12 md:p-20 items-center">
               <div>
                  <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-bold text-orange-400 uppercase tracking-widest mb-6 backdrop-blur"><Bot size={14} /> НайСтрой AI 2.0</div>
                  <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-6 uppercase leading-tight">Запознайте се с <span className="text-orange-500">Иван</span><br/>Вашият личен асистент</h2>
                  <p className="text-lg text-slate-300 mb-8 leading-relaxed">Защо да губите време в търсене? Иван е нашият нов изкуствен интелект, обучен да познава целия ни каталог.</p>
                  <div className="flex flex-col sm:flex-row gap-4">
                     <button onClick={() => openAssistant('voice')} className="flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-4 px-8 rounded-xl hover:shadow-[0_0_30px_rgba(234,88,12,0.4)] transition transform hover:-translate-y-1"><Mic size={20} /> Говори с Иван</button>
                     <button onClick={() => openAssistant('chat')} className="flex items-center justify-center gap-3 bg-white/10 border border-white/20 text-white font-bold py-4 px-8 rounded-xl hover:bg-white hover:text-neutral-900 transition"><MessageSquare size={20} /> Чат с Иван</button>
                  </div>
               </div>
               <div className="hidden md:flex justify-center">
                  <div className="relative w-80 h-80">
                     <div className="absolute inset-0 bg-orange-500/20 rounded-full animate-pulse blur-xl"></div>
                     <div className="relative w-full h-full bg-gradient-to-b from-neutral-800 to-neutral-900 border border-white/10 rounded-2xl shadow-2xl p-6 flex flex-col backdrop-blur-sm transform rotate-3 hover:rotate-0 transition duration-500">
                        <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                           <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white"><Bot size={20}/></div>
                           <div>
                             <div className="font-heading font-bold text-white uppercase tracking-wider">Иван</div>
                             <div className="text-xs text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online</div>
                           </div>
                        </div>
                        <div className="space-y-3 font-mono text-xs">
                           <div className="bg-white/5 p-3 rounded-lg text-slate-300 border-l-2 border-orange-500">Здравейте! Търсите ли нещо конкретно за строежа днес?</div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
             <div>
               <span className="text-orange-500 font-bold uppercase tracking-widest text-sm block mb-1">Избрано за вас</span>
               <h2 className="text-4xl font-heading font-bold text-neutral-900 uppercase">Популярни Продукти</h2>
             </div>
             <Link to="/products" className="hidden md:flex items-center gap-2 text-neutral-900 font-bold hover:text-orange-600 transition group">Виж каталога <ArrowLeft className="rotate-180 transition group-hover:translate-x-1" size={20}/></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="text-center mt-12 md:hidden">
            <Link to="/products" className="inline-block bg-neutral-900 text-white px-8 py-3 rounded-full font-bold uppercase tracking-wide">Виж каталога</Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mb-20">
        <div className="bg-neutral-900 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600 rounded-full blur-[100px] opacity-20"></div>
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-10"></div>
           <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-6 uppercase relative z-10">Имате нужда от консултация?</h2>
           <p className="text-slate-400 max-w-2xl mx-auto mb-10 text-lg relative z-10">Нашият екип е готов да помогне с избора на материали и организацията на транспорта. Свържете се с нас директно или използвайте AI асистента Иван.</p>
           <button onClick={() => openAssistant('voice')} className="inline-flex items-center gap-2 bg-white text-neutral-900 font-bold py-4 px-12 rounded-full hover:bg-orange-500 hover:text-white transition shadow-xl relative z-10">Свържи се с нас <Phone size={20} /></button>
        </div>
      </div>
    </div>
  );
};