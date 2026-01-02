import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, Navigate, useParams, useLocation } from 'react-router-dom';
import { ShoppingCart, User as UserIcon, Menu, X, Package, Truck, Phone, LogOut, ArrowLeft, Check, AlertCircle, Edit, Trash2, Plus, Save, Filter, Tag, Layers, Search, MapPin, Clock, Mail, ChevronRight, Star, Mic, MessageSquare, Bot, Upload, Download, Globe, Loader2, Info, Zap, Map, Facebook, CreditCard, Banknote, Wallet, Lock, Navigation, Link as LinkIcon, FileJson, CheckCircle2 } from 'lucide-react';
import { useStore } from './store';
import { VoiceAssistant } from './components/VoiceAssistant';
import { GoogleGenAI, Type } from "@google/genai";
import { Product, CategoryItem, Order } from './types';

// Rate for Euro to BGN
const BGN_RATE = 1.95583;

// Declare Leaflet globally since it's loaded via CDN
declare const L: any;

// --- Components ---

const CartNotificationModal = () => {
  const { showCartModal, setShowCartModal } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Automatically close modal if we are on the checkout page
  useEffect(() => {
      if (location.pathname === '/checkout') {
          setShowCartModal(false);
      }
  }, [location.pathname, setShowCartModal]);

  if (!showCartModal) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
        onClick={() => setShowCartModal(false)}
      ></div>
      
      {/* Content */}
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative z-10 animate-fade-in-up border border-slate-100">
         <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
            <Check size={32} strokeWidth={3} />
         </div>
         <h3 className="text-xl font-heading font-bold text-center mb-2 uppercase">Добавено в количката!</h3>
         <p className="text-center text-slate-500 text-sm mb-8">Продуктът беше успешно добавен.</p>
         
         <div className="space-y-3">
            <button 
              onClick={() => { setShowCartModal(false); navigate('/checkout'); }}
              className="w-full bg-neutral-900 text-white py-3 rounded-xl font-bold uppercase text-sm hover:bg-orange-600 transition shadow-lg"
            >
              Към Плащане
            </button>
            <button 
              onClick={() => setShowCartModal(false)}
              className="w-full bg-white border border-slate-200 text-slate-600 py-3 rounded-xl font-bold uppercase text-sm hover:bg-slate-50 transition"
            >
              Продължи пазаруването
            </button>
         </div>
      </div>
    </div>
  );
};

const Navbar = () => {
  const { cart, user, logout, openAssistant } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const isActive = (path: string) => location.pathname === path ? 'text-orange-500' : 'text-white hover:text-orange-400';

  return (
    <nav className="glass-nav text-white sticky top-0 z-40 border-b border-white/5 bg-neutral-900/90 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold flex items-center gap-2 group">
          <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-lg transform group-hover:rotate-3 transition duration-300">
             <Package className="text-white" size={24} />
          </div>
          <div className="flex flex-col leading-none font-heading">
            <span className="text-white text-2xl tracking-tight uppercase">НайСтрой</span>
            <span className="text-orange-500 text-sm tracking-[0.2em] font-bold uppercase">Транс</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 font-medium uppercase text-sm tracking-wider">
          <Link to="/" className={`transition duration-300 ${isActive('/')}`}>Начало</Link>
          <Link to="/products" className={`transition duration-300 ${isActive('/products')}`}>Продукти</Link>
          <Link to="/contacts" className={`transition duration-300 ${isActive('/contacts')}`}>Контакти</Link>
          <button 
            onClick={(e) => { e.preventDefault(); openAssistant('voice'); }}
            className="flex items-center gap-1 text-orange-500 hover:text-white transition group"
          >
            <Bot size={18} className="group-hover:animate-bounce" /> 
            <span className="underline decoration-orange-500 underline-offset-4 font-bold">AI Асистент</span>
          </button>
          {user?.role === 'admin' && (
            <Link to="/admin" className="text-orange-500 hover:text-orange-400 border border-orange-500/30 px-3 py-1 rounded">Админ</Link>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link to="/checkout" className="relative p-2.5 bg-white/5 rounded-full hover:bg-orange-600 hover:text-white transition duration-300 group">
            <ShoppingCart size={20} className="group-hover:scale-110 transition" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-neutral-900">
                {cartCount}
              </span>
            )}
          </Link>
          
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <span className="hidden md:inline text-sm font-heading text-gray-300 uppercase">{user.name}</span>
              <button onClick={() => { logout(); navigate('/'); }} className="p-2 hover:text-red-500 transition" title="Logout">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-2 text-sm font-bold uppercase hover:text-orange-500 transition pl-2 border-l border-white/10">
              <span className="hidden md:inline">Вход</span> <UserIcon size={20} />
            </Link>
          )}

          <button className="md:hidden p-2 text-white" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-neutral-900 border-b border-white/10 transition-all duration-300 overflow-hidden shadow-2xl ${menuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-6 py-8 space-y-6 font-heading text-xl tracking-wide flex flex-col items-center text-center">
          <Link to="/" className="block py-2 w-full border-b border-white/5 hover:text-orange-500 transition" onClick={() => setMenuOpen(false)}>Начало</Link>
          <Link to="/products" className="block py-2 w-full border-b border-white/5 hover:text-orange-500 transition" onClick={() => setMenuOpen(false)}>Продукти</Link>
          <Link to="/contacts" className="block py-2 w-full border-b border-white/5 hover:text-orange-500 transition" onClick={() => setMenuOpen(false)}>Контакти</Link>
          <button onClick={() => { openAssistant('voice'); setMenuOpen(false); }} className="block py-4 w-full text-center bg-orange-600 rounded-xl text-white font-bold shadow-lg shadow-orange-900/50 mt-4">
             <Mic size={20} className="inline mr-2"/> AI Асистент
          </button>
          {user?.role === 'admin' && (
            <Link to="/admin" className="block py-2 text-orange-500 font-bold" onClick={() => setMenuOpen(false)}>Админ Панел</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-neutral-950 text-slate-400 py-16 border-t border-white/5">
    <div className="container mx-auto px-4 grid md:grid-cols-4 gap-12">
      <div className="md:col-span-1">
        <h3 className="text-white text-2xl font-heading font-bold mb-6 flex items-center gap-2 uppercase tracking-wide">
          <Package className="text-orange-500" size={24} /> НайСтрой
        </h3>
        <p className="text-sm leading-relaxed mb-6 text-slate-500">
          Професионални строителни решения. Директен внос, складови наличности и експресна доставка до вашия обект.
        </p>
        <div className="flex gap-4 items-center">
           <a href="https://www.facebook.com/profile.php?id=100085606845218" target="_blank" rel="noreferrer" className="bg-white/5 p-2 rounded hover:bg-blue-600 hover:text-white transition cursor-pointer">
              <Facebook size={20} />
           </a>
        </div>
      </div>
      
      <div>
        <h3 className="text-white text-lg font-heading font-bold mb-6 uppercase tracking-wider border-b-2 border-orange-600 w-fit pb-1">Връзки</h3>
        <ul className="space-y-3 text-sm">
          <li><Link to="/" className="hover:text-orange-500 transition">Начало</Link></li>
          <li><Link to="/products" className="hover:text-orange-500 transition">Каталог</Link></li>
          <li><Link to="/contacts" className="hover:text-orange-500 transition">Контакти</Link></li>
          <li><Link to="/login" className="hover:text-orange-500 transition">Вход за клиенти</Link></li>
        </ul>
      </div>

      <div>
        <h3 className="text-white text-lg font-heading font-bold mb-6 uppercase tracking-wider border-b-2 border-orange-600 w-fit pb-1">Контакти</h3>
        <ul className="space-y-4 text-sm">
          <li className="flex items-start gap-3">
             <MapPin className="text-orange-500 shrink-0 mt-0.5" size={16} />
             <span>с. Вакарел, Индустриална зона<br/>(10км от София)</span>
          </li>
          <li className="flex items-center gap-3">
             <Phone className="text-orange-500 shrink-0" size={16} />
             <a href="tel:+359888123456" className="hover:text-white transition">+359 888 123 456</a>
          </li>
          <li className="flex items-center gap-3">
             <Mail className="text-orange-500 shrink-0" size={16} />
             <a href="mailto:office@naistroitrans.bg" className="hover:text-white transition">office@naistroitrans.bg</a>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-white text-lg font-heading font-bold mb-6 uppercase tracking-wider border-b-2 border-orange-600 w-fit pb-1">Плащане</h3>
        <p className="text-sm text-slate-500 mb-4">
          Сигурно плащане при доставка. Приемаме карти и пари в брой.
        </p>
        <div className="flex gap-3">
           <div className="flex flex-col items-center justify-center gap-1 w-16 h-12 bg-white rounded-lg shadow-lg text-slate-800 border border-slate-200" title="Credit Card">
              <CreditCard size={18} />
              <span className="text-[9px] font-bold uppercase">Карта</span>
           </div>
           <div className="flex flex-col items-center justify-center gap-1 w-16 h-12 bg-white rounded-lg shadow-lg text-slate-800 border border-slate-200" title="Cash">
              <Banknote size={18} />
              <span className="text-[9px] font-bold uppercase">В Брой</span>
           </div>
        </div>
      </div>
    </div>
    <div className="text-center mt-16 pt-8 border-t border-white/5 text-xs text-slate-600 uppercase tracking-widest">
      &copy; 2025 НайСтрой Транс. Всички права запазени.
    </div>
  </footer>
);

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useStore();
  return (
    <div className="group bg-white rounded-2xl shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden flex flex-col h-full border border-slate-100">
      <Link to={`/product/${product.id}`} className="h-56 overflow-hidden relative bg-gray-100">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
        <div className="absolute top-3 left-3 flex gap-2">
           <span className="bg-white/90 backdrop-blur text-neutral-900 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm border border-neutral-100">
             {product.brand}
           </span>
        </div>
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
            <span className="text-white font-bold border-2 border-white px-4 py-1 uppercase tracking-widest">Изчерпан</span>
          </div>
        )}
      </Link>
      <div className="p-5 flex flex-col flex-grow relative">
        <div className="text-xs text-orange-500 font-bold uppercase tracking-widest mb-1">{product.category}</div>
        <Link to={`/product/${product.id}`} className="font-heading font-bold text-xl mb-3 text-neutral-800 leading-tight group-hover:text-orange-600 transition">
          {product.name}
        </Link>
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium">Цена</span>
            <div className="flex items-baseline gap-2">
                 <span className="text-2xl font-bold text-neutral-900 font-heading">€{product.price.toFixed(2)}</span>
                 <span className="text-sm font-bold text-slate-500">/ {(product.price * BGN_RATE).toFixed(2)} лв.</span>
            </div>
          </div>
          <button 
            onClick={(e) => { e.preventDefault(); addToCart(product); }}
            className="w-12 h-12 rounded-full bg-neutral-900 text-white flex items-center justify-center hover:bg-orange-600 transition shadow-lg hover:shadow-orange-500/30 group-active:scale-95 touch-manipulation"
            title="Добави в количка"
          >
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const { products, openAssistant } = useStore();
  const featured = products.slice(0, 4);

  return (
    <div className="animate-fade-in pb-12">
      {/* Modern High-Impact Hero Section */}
      <div className="relative bg-neutral-950 text-white min-h-[750px] flex items-center justify-center overflow-hidden">
        {/* Background Video/Image simulation */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1591717366324-1a3b10298a0d?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-luminosity"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-neutral-900/30"></div>
        
        {/* Animated Particles/Accents */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-orange-600 rounded-full blur-[150px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-blue-600 rounded-full blur-[150px] opacity-10"></div>

        <div className="container mx-auto px-4 relative z-10 text-center">
           <div className="max-w-4xl mx-auto animate-fade-in-up">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-orange-600/20 border border-orange-500/50 rounded-full px-5 py-2 mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(234,88,12,0.3)] transform hover:scale-105 transition duration-500 cursor-default">
                  <Star size={16} className="text-orange-500 fill-orange-500" />
                  <span className="text-orange-400 text-xs font-bold uppercase tracking-[0.2em]">№1 Логистика</span>
              </div>

              {/* Main Headline - Massive & Bold */}
              <h1 className="text-5xl md:text-8xl font-heading font-black mb-6 uppercase leading-[0.9] tracking-tight">
                ТРАНСПОРТ<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500">ДО ВРАТА</span>
              </h1>
              
              <div className="h-2 w-32 bg-gradient-to-r from-orange-500 to-red-600 mx-auto mb-10 rounded-full"></div>

              {/* Subheadline - Value Proposition */}
              <p className="text-lg md:text-2xl text-slate-300 mb-12 font-light max-w-2xl mx-auto leading-relaxed">
                Собствен транспорт и експресна доставка на строителни материали до адрес в <span className="text-white font-bold">София и областта</span>.
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                 <Link to="/products" className="group relative bg-orange-600 text-white font-bold py-5 px-12 rounded-xl overflow-hidden transition-all shadow-[0_0_40px_rgba(234,88,12,0.4)] hover:shadow-[0_0_60px_rgba(234,88,12,0.6)] hover:-translate-y-1 w-full sm:w-auto text-center">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 opacity-100 group-hover:opacity-90 transition"></div>
                    <span className="relative z-10 flex items-center justify-center gap-3 text-lg uppercase tracking-wide">
                       Разгледай Каталога <ArrowLeft className="rotate-180" size={20}/>
                    </span>
                 </Link>
                 
                 <button 
                   onClick={() => openAssistant('voice')}
                   className="group relative bg-white/5 backdrop-blur-md border border-white/10 text-white font-bold py-5 px-10 rounded-xl hover:bg-white/10 transition-all w-full sm:w-auto"
                 >
                    <span className="flex items-center justify-center gap-3 text-lg uppercase tracking-wide">
                       <Mic size={20} className="text-orange-500 group-hover:text-white transition" /> Поръчай с Глас
                    </span>
                 </button>
              </div>

              {/* Trust Indicators */}
              <div className="mt-20 flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition duration-500">
                  <div className="flex items-center gap-2 text-white font-heading font-bold uppercase tracking-wider text-sm">
                      <Truck size={24} className="text-orange-500"/> Собствен автопарк
                  </div>
                  <div className="flex items-center gap-2 text-white font-heading font-bold uppercase tracking-wider text-sm">
                      <Clock size={24} className="text-orange-500"/> Доставка до 24ч
                  </div>
                  <div className="flex items-center gap-2 text-white font-heading font-bold uppercase tracking-wider text-sm">
                      <MapPin size={24} className="text-orange-500"/> Покритие София-Град
                  </div>
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
               <div className="bg-orange-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition duration-300 shadow-sm">
                 <item.icon size={32} />
               </div>
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
                  <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-bold text-orange-400 uppercase tracking-widest mb-6 backdrop-blur">
                    <Bot size={14} /> НайСтрой AI 2.0
                  </div>
                  <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-6 uppercase leading-tight">
                    Запознайте се с <span className="text-orange-500">Иван</span><br/>
                    Вашият личен асистент
                  </h2>
                  <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                    Защо да губите време в търсене? Иван е нашият нов изкуствен интелект, обучен да познава целия ни каталог.
                    Можете да говорите с него или да чатите директно за наличности, цени и поръчки.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                     <button 
                       onClick={() => openAssistant('voice')}
                       className="flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-4 px-8 rounded-xl hover:shadow-[0_0_30px_rgba(234,88,12,0.4)] transition transform hover:-translate-y-1"
                     >
                       <Mic size={20} /> Говори с Иван
                     </button>
                     <button 
                       onClick={() => openAssistant('chat')}
                       className="flex items-center justify-center gap-3 bg-white/10 border border-white/20 text-white font-bold py-4 px-8 rounded-xl hover:bg-white hover:text-neutral-900 transition"
                     >
                       <MessageSquare size={20} /> Чат с Иван
                     </button>
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
                           <div className="bg-white/5 p-3 rounded-lg text-slate-300 border-l-2 border-orange-500">
                             Здравейте! Търсите ли нещо конкретно за строежа днес?
                           </div>
                           <div className="bg-orange-500/10 p-3 rounded-lg text-orange-200 self-end text-right border-r-2 border-orange-500">
                             Трябват ми 50 торби лепило Baumit.
                           </div>
                           <div className="bg-white/5 p-3 rounded-lg text-slate-300 border-l-2 border-orange-500">
                             Разбира се. Baumit FlexTop е наличен на цена 18.90€. Да добавя ли 50 бр. в количката?
                           </div>
                        </div>
                        <div className="mt-auto pt-4 flex gap-2">
                           <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full w-2/3 bg-orange-500 animate-pulse"></div>
                           </div>
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
             <Link to="/products" className="hidden md:flex items-center gap-2 text-neutral-900 font-bold hover:text-orange-600 transition group">
               Виж каталога <ArrowLeft className="rotate-180 transition group-hover:translate-x-1" size={20}/>
             </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          
          <div className="text-center mt-12 md:hidden">
            <Link to="/products" className="inline-block bg-neutral-900 text-white px-8 py-3 rounded-full font-bold uppercase tracking-wide">
              Виж каталога
            </Link>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 mb-20">
        <div className="bg-neutral-900 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600 rounded-full blur-[100px] opacity-20"></div>
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-10"></div>
           
           <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-6 uppercase relative z-10">
             Имате нужда от консултация?
           </h2>
           <p className="text-slate-400 max-w-2xl mx-auto mb-10 text-lg relative z-10">
             Нашият екип е готов да помогне с избора на материали и организацията на транспорта. 
             Свържете се с нас директно или използвайте AI асистента Иван.
           </p>
           <button 
             onClick={() => openAssistant('voice')} 
             className="inline-flex items-center gap-2 bg-white text-neutral-900 font-bold py-4 px-12 rounded-full hover:bg-orange-500 hover:text-white transition shadow-xl relative z-10"
           >
             Свържи се с нас <Phone size={20} />
           </button>
        </div>
      </div>
    </div>
  );
};
const Catalog = () => {
  const { products, categories } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState<{min: string, max: string}>({ min: '', max: '' });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const availableBrands = categories.filter(c => c.type === 'brand');
  const availableCategories = categories.filter(c => c.type === 'category');

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = selectedBrand ? p.brand === selectedBrand : true;
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    
    const price = p.price;
    const min = priceRange.min ? parseFloat(priceRange.min) : 0;
    const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
    const matchesPrice = price >= min && price <= max;

    return matchesSearch && matchesBrand && matchesCategory && matchesPrice;
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Modern Sidebar Filters */}
        <div className={`
          md:w-72 flex-shrink-0 bg-white md:bg-transparent rounded-2xl shadow-2xl md:shadow-none p-6 md:p-0 
          fixed md:static inset-0 z-50 md:z-auto transition-transform duration-300 overflow-y-auto md:overflow-visible
          ${filtersOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="flex justify-between items-center md:hidden mb-6 border-b pb-4">
            <h3 className="font-heading font-bold text-2xl uppercase">Филтри</h3>
            <button onClick={() => setFiltersOpen(false)}><X size={24}/></button>
          </div>

          <div className="space-y-8 sticky top-24">
            {/* Search */}
            <div>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Търсене на продукти..." 
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl pl-10 focus:ring-2 focus:ring-orange-500 outline-none transition shadow-sm font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search size={18} className="absolute left-3 top-3.5 text-slate-400" />
              </div>
            </div>

            {/* Category Filter - Pills */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <label className="font-bold text-xs text-slate-400 uppercase tracking-widest block mb-4 flex items-center gap-2">
                 <Layers size={14}/> Категория
              </label>
              <div className="flex flex-wrap gap-2">
                 <button 
                    onClick={() => setSelectedCategory('')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition border ${selectedCategory === '' ? 'bg-orange-500 text-white border-orange-500' : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'}`}
                 >
                    Всички
                 </button>
                 {availableCategories.map(c => (
                   <button 
                      key={c.id}
                      onClick={() => setSelectedCategory(c.name)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition border ${selectedCategory === c.name ? 'bg-orange-500 text-white border-orange-500' : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'}`}
                   >
                      {c.name}
                   </button>
                 ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <label className="font-bold text-xs text-slate-400 uppercase tracking-widest block mb-4 flex items-center gap-2">
                  <Tag size={14}/> Марка
              </label>
              <select 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 bg-slate-50 outline-none text-sm font-medium"
                value={selectedBrand}
                onChange={e => setSelectedBrand(e.target.value)}
              >
                <option value="">Всички Марки</option>
                {availableBrands.map(b => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <label className="font-bold text-xs text-slate-400 uppercase tracking-widest block mb-4">Цена (€)</label>
              <div className="flex gap-3 items-center">
                <input 
                  type="number" 
                  placeholder="0" 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-slate-50 text-center font-medium"
                  value={priceRange.min}
                  onChange={e => setPriceRange({...priceRange, min: e.target.value})}
                />
                <span className="text-slate-300 font-bold">-</span>
                <input 
                  type="number" 
                  placeholder="MAX" 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-slate-50 text-center font-medium"
                  value={priceRange.max}
                  onChange={e => setPriceRange({...priceRange, max: e.target.value})}
                />
              </div>
            </div>

            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedBrand('');
                setSelectedCategory('');
                setPriceRange({min: '', max: ''});
              }}
              className="w-full py-3 text-sm text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition font-bold flex items-center justify-center gap-2"
            >
              <X size={16} /> Изчисти филтрите
            </button>
          </div>
        </div>

        {/* Overlay for mobile filters */}
        {filtersOpen && (
          <div className="fixed inset-0 bg-neutral-900/80 backdrop-blur-sm z-40 md:hidden" onClick={() => setFiltersOpen(false)}></div>
        )}

        {/* Product Grid */}
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-heading font-bold text-neutral-900 uppercase">Каталог <span className="text-orange-500 text-2xl align-top">{filtered.length}</span></h2>
            <button 
              className="md:hidden flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-lg shadow-lg"
              onClick={() => setFiltersOpen(true)}
            >
              <Filter size={18} />
            </button>
          </div>
          
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="text-center py-32 text-slate-400 bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <Package size={64} className="mx-auto mb-6 text-slate-200" />
              <p className="text-lg">Няма намерени продукти по тези критерии.</p>
              <button 
                 onClick={() => { setSearchTerm(''); setSelectedBrand(''); setSelectedCategory(''); }}
                 className="mt-4 text-orange-600 font-bold hover:underline"
              >
                Изчисти търсенето
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductDetails = () => {
  const { id } = useParams();
  const { products, addToCart } = useStore();
  const product = products.find(p => p.id === id);

  if (!product) return <div className="container mx-auto px-4 py-20 text-center text-slate-500">Продуктът не е намерен.</div>;

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <Link to="/products" className="inline-flex items-center gap-2 text-slate-500 hover:text-orange-500 font-bold uppercase text-xs mb-8 transition">
        <ArrowLeft size={16} /> Обратно към каталога
      </Link>
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-2 gap-0 border border-slate-100">
        <div className="h-[400px] md:h-[600px] bg-slate-50 relative group overflow-hidden">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover transition duration-700 group-hover:scale-105" />
          {product.stock === 0 && (
             <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                 <span className="text-white font-bold border-2 border-white px-6 py-2 uppercase tracking-widest text-xl">Изчерпан</span>
             </div>
          )}
        </div>
        <div className="p-8 md:p-16 flex flex-col justify-center">
           <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wide">{product.category}</span>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wide">{product.brand}</span>
           </div>
           <h1 className="text-3xl md:text-5xl font-heading font-bold text-neutral-900 mb-6 leading-tight">{product.name}</h1>
           <p className="text-slate-600 text-lg leading-relaxed mb-8">{product.description}</p>
           
           <div className="flex items-baseline gap-3 mb-8 pb-8 border-b border-slate-100">
              <span className="text-4xl md:text-5xl font-heading font-bold text-neutral-900">€{product.price.toFixed(2)}</span>
              <span className="text-xl text-slate-400 font-medium">/ {(product.price * 1.95583).toFixed(2)} лв.</span>
           </div>
           
           <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => addToCart(product)}
                disabled={product.stock === 0}
                className="flex-1 bg-neutral-900 text-white py-4 rounded-xl font-bold uppercase tracking-wide hover:bg-orange-600 transition shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
              >
                <ShoppingCart size={20} className="group-hover:scale-110 transition"/> {product.stock > 0 ? 'Добави в количка' : 'Изчерпан'}
              </button>
              <div className="flex-1 border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-slate-600 font-bold py-4">
                 <CheckCircle2 size={20} className="text-green-500"/> Наличност: {product.stock} бр.
              </div>
           </div>
           
           <div className="mt-8 pt-8 border-t border-slate-50 grid grid-cols-2 gap-4 text-sm text-slate-500">
               <div className="flex items-center gap-2"><Truck size={16}/> Доставка до 24ч</div>
               <div className="flex items-center gap-2"><MapPin size={16}/> Склад: с. Вакарел</div>
               <div className="flex items-center gap-2"><CreditCard size={16}/> Сигурно плащане</div>
               <div className="flex items-center gap-2"><Phone size={16}/> Консултация</div>
           </div>
        </div>
      </div>
    </div>
  );
};

const Login = () => {
  const { login, user } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await login(email, password);
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-20 flex justify-center items-center min-h-[60vh]">
       <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-2xl border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 to-red-600"></div>
          <h2 className="text-3xl font-heading font-bold text-center mb-2 uppercase">Вход</h2>
          <p className="text-center text-slate-400 mb-8 text-sm">Влезте в своя профил за по-бързи поръчки</p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
             <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Email Адрес</label>
                <div className="relative">
                    <UserIcon size={18} className="absolute left-4 top-3.5 text-slate-400"/>
                    <input 
                      type="email" 
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition" 
                      placeholder="name@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                </div>
             </div>
             <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Парола</label>
                <div className="relative">
                    <Lock size={18} className="absolute left-4 top-3.5 text-slate-400"/>
                    <input 
                      type="password" 
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition" 
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                </div>
             </div>
             <button 
               type="submit" 
               disabled={loading}
               className="w-full bg-neutral-900 text-white py-4 rounded-xl font-bold uppercase tracking-wide hover:bg-orange-600 transition shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
             >
               {loading ? <Loader2 className="animate-spin" size={20}/> : 'Вход'}
             </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
             <p className="text-slate-500 text-sm">
                Нямате профил? <a href="#" className="text-orange-600 font-bold hover:underline">Регистрация</a>
             </p>
             <p className="text-xs text-slate-400 mt-4">
                За демо достъп: admin@demo.com (Admin) или user@demo.com
             </p>
          </div>
       </div>
    </div>
  );
};

const Contacts = () => {
  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-center mb-12 uppercase">Контакти</h1>
        
        <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-neutral-900 text-white rounded-3xl p-10 relative overflow-hidden shadow-2xl">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600 rounded-full blur-[80px] opacity-20"></div>
                 <h2 className="text-2xl font-bold mb-8 uppercase flex items-center gap-3 relative z-10"><Package className="text-orange-500"/> Централен Офис</h2>
                 
                 <ul className="space-y-6 relative z-10">
                     <li className="flex items-start gap-4">
                         <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                             <MapPin className="text-orange-500" size={20} />
                         </div>
                         <div>
                             <p className="font-bold text-sm text-slate-400 uppercase tracking-widest mb-1">Адрес</p>
                             <p className="text-lg">Индустриална Зона<br/>с. Вакарел, България</p>
                         </div>
                     </li>
                     <li className="flex items-start gap-4">
                         <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                             <Phone className="text-orange-500" size={20} />
                         </div>
                         <div>
                             <p className="font-bold text-sm text-slate-400 uppercase tracking-widest mb-1">Телефон</p>
                             <p className="text-lg">+359 888 123 456</p>
                             <p className="text-sm text-slate-500">Пон - Пет: 08:00 - 18:00</p>
                         </div>
                     </li>
                     <li className="flex items-start gap-4">
                         <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                             <Mail className="text-orange-500" size={20} />
                         </div>
                         <div>
                             <p className="font-bold text-sm text-slate-400 uppercase tracking-widest mb-1">Email</p>
                             <p className="text-lg">office@naistroitrans.bg</p>
                         </div>
                     </li>
                 </ul>
            </div>
            
            <div className="bg-white rounded-3xl p-2 shadow-2xl h-[400px] md:h-auto border border-slate-100 relative overflow-hidden group">
                 <iframe 
                   title="Map"
                   src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2936.568297787494!2d23.71444431546416!3d42.55694447917404!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40aa80b8744d0813%3A0x6295556276707833!2z0JLQsNC60LDRgNC10Ls!5e0!3m2!1sen!2sbg!4v1645000000000!5m2!1sen!2sbg" 
                   width="100%" 
                   height="100%" 
                   style={{border:0, borderRadius: '1.5rem'}} 
                   allowFullScreen 
                   loading="lazy"
                   className="grayscale group-hover:grayscale-0 transition duration-700"
                 ></iframe>
                 <div className="absolute bottom-6 left-6 bg-white px-4 py-2 rounded-lg shadow-lg text-xs font-bold uppercase tracking-wide flex items-center gap-2 pointer-events-none">
                     <Navigation size={14} className="text-orange-600"/> Локация на склада
                 </div>
            </div>
        </div>
    </div>
  );
};

const Checkout = () => {
    const { cart, checkoutFormData, setCheckoutFormData, placeOrder, updateCartQuantity, removeFromCart, lastOrder, clearLastOrder } = useStore();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    // Clear last order on mount to hide success screen if revisited
    useEffect(() => {
        // clearLastOrder is called when user navigates away usually, but we check here
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await placeOrder(checkoutFormData);
            setStep(2);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (lastOrder && step === 2) {
        return (
            <div className="container mx-auto px-4 py-20 text-center animate-fade-in">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 text-green-600 shadow-xl shadow-green-100">
                    <CheckCircle2 size={48} />
                </div>
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-neutral-900 mb-4 uppercase">Благодарим ви!</h2>
                <p className="text-xl text-slate-500 mb-2">Поръчка <span className="font-mono font-bold text-neutral-900">#{lastOrder.id.slice(-6)}</span> е приета успешно.</p>
                <p className="text-slate-400 mb-10 max-w-md mx-auto">Ще получите обаждане за потвърждение на доставката до адрес: {lastOrder.address}.</p>
                <Link 
                    to="/" 
                    onClick={clearLastOrder}
                    className="inline-block bg-neutral-900 text-white px-10 py-4 rounded-xl font-bold uppercase tracking-wide hover:bg-orange-600 transition shadow-lg"
                >
                    Обратно към началото
                </Link>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="container mx-auto px-4 py-32 text-center animate-fade-in">
                <ShoppingCart size={64} className="mx-auto mb-6 text-slate-200" />
                <h2 className="text-3xl font-heading font-bold text-slate-300 uppercase mb-6">Количката е празна</h2>
                <Link to="/products" className="text-orange-600 font-bold uppercase hover:underline">Разгледай продуктите</Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 animate-fade-in">
            <h1 className="text-4xl font-heading font-bold mb-10 uppercase">Завършване на поръчката</h1>
            
            <div className="grid md:grid-cols-2 gap-12">
                {/* Form */}
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 h-fit">
                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
                        <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold">1</div>
                        <h2 className="text-xl font-bold uppercase">Данни за доставка</h2>
                    </div>
                    
                    <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Име и Фамилия</label>
                            <input 
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition font-medium" 
                                required 
                                value={checkoutFormData.name} 
                                onChange={e => setCheckoutFormData({...checkoutFormData, name: e.target.value})}
                                placeholder="Иван Иванов"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Телефон</label>
                            <input 
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition font-medium" 
                                required 
                                value={checkoutFormData.phone} 
                                onChange={e => setCheckoutFormData({...checkoutFormData, phone: e.target.value})}
                                placeholder="0888 123 456"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Адрес за доставка</label>
                            <textarea 
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition font-medium" 
                                required 
                                rows={3}
                                value={checkoutFormData.address} 
                                onChange={e => setCheckoutFormData({...checkoutFormData, address: e.target.value})}
                                placeholder="гр. София, кв. Младост..."
                            />
                        </div>
                    </form>
                </div>
                
                {/* Summary */}
                <div className="space-y-6">
                     <div className="bg-neutral-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-600 rounded-full blur-[80px] opacity-20"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/10">
                                <div className="w-8 h-8 rounded-full bg-white text-neutral-900 flex items-center justify-center font-bold">2</div>
                                <h2 className="text-xl font-bold uppercase">Преглед</h2>
                            </div>

                            <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2 mb-8">
                                {cart.map(item => (
                                    <div key={item.id} className="flex gap-4 items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                        <div className="w-16 h-16 bg-white rounded-lg overflow-hidden shrink-0">
                                            <img src={item.image} alt="" className="w-full h-full object-cover"/>
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="font-bold text-sm leading-tight mb-1">{item.name}</h4>
                                            <div className="text-xs text-slate-400">€{item.price.toFixed(2)} / бр.</div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex items-center gap-2 bg-neutral-800 rounded-lg p-1">
                                                <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded transition">-</button>
                                                <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                                <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded transition">+</button>
                                            </div>
                                            <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-300 text-xs transition">Премахни</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2 border-t border-white/10 pt-4">
                                <div className="flex justify-between text-slate-300">
                                    <span>Междинна сума</span>
                                    <span>€{total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-300">
                                    <span>Доставка</span>
                                    <span>Безплатна</span>
                                </div>
                                <div className="flex justify-between text-2xl font-bold text-white pt-4 border-t border-white/10 mt-2">
                                    <span>Общо</span>
                                    <span>€{total.toFixed(2)}</span>
                                </div>
                                <div className="text-right text-sm text-slate-400">
                                    ~ {(total * 1.95583).toFixed(2)} лв.
                                </div>
                            </div>
                            
                            <button 
                                type="submit" 
                                form="checkout-form"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-xl font-bold uppercase tracking-wide mt-8 hover:shadow-[0_0_20px_rgba(234,88,12,0.4)] transition disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Поръчай сега'}
                            </button>
                        </div>
                     </div>
                     
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
                         <Info className="text-blue-500 shrink-0 mt-1"/>
                         <p className="text-sm text-slate-600 leading-relaxed">
                            Плащането се извършва <strong>при доставка (Наложен платеж)</strong>. Можете да платите в брой или с карта на нашия шофьор.
                         </p>
                     </div>
                </div>
            </div>
        </div>
    );
};

const Admin = () => {
    const { user, orders, products, updateOrderStatus, deleteProduct, addProduct, updateProduct, importProducts } = useStore();
    const [tab, setTab] = useState<'orders' | 'products'>('orders');
    
    // UI State for Modals
    const [isEditing, setIsEditing] = useState<Product | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    
    // --- SMART IMPORT STATE ---
    const [isImporting, setIsImporting] = useState(false);
    const [importStep, setImportStep] = useState<'input' | 'fetching' | 'review' | 'success'>('input');
    const [importUrl, setImportUrl] = useState('');
    const [foundProducts, setFoundProducts] = useState<Partial<Product>[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
    const [statusLog, setStatusLog] = useState<string[]>([]);
    
    // Form State
    const [prodForm, setProdForm] = useState<Partial<Product>>({});

    if (user?.role !== 'admin') return <Navigate to="/" />;

    const handleEditClick = (p: Product) => {
        setProdForm(p);
        setIsEditing(p);
    };

    const handleAddClick = () => {
        setProdForm({ name: '', category: '', brand: '', price: 0, stock: 0, image: '', description: '' });
        setIsAdding(true);
    };

    const handleSave = async () => {
        if (isEditing && isEditing.id) {
            await updateProduct(isEditing.id, prodForm);
            setIsEditing(null);
        } else if (isAdding) {
            // Basic validation
            if(!prodForm.name || !prodForm.price) return;
            await addProduct(prodForm as Product); 
            setIsAdding(false);
        }
    };

    const addLog = (msg: string) => setStatusLog(prev => [...prev, msg]);

    const handleSmartFetch = async () => {
        if (!importUrl) return;
        setImportStep('fetching');
        setStatusLog([]);
        addLog(`Initiating connection to ${importUrl}...`);

        try {
            // 1. Fetch via CORS Proxy
            addLog("Bypassing CORS via proxy...");
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(importUrl)}`;
            const res = await fetch(proxyUrl);
            const data = await res.json();
            
            if (!data.contents) throw new Error("No content received from proxy");
            
            const htmlContent = data.contents;
            addLog(`Received ${htmlContent.length} bytes of HTML data.`);
            
            // 2. AI Parsing
            addLog("Initializing Gemini AI for structural analysis...");
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // Truncate HTML to avoid token limits (focus on body mostly)
            const cleanHtml = htmlContent.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, "")
                                         .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gm, "")
                                         .substring(0, 100000); // Limit context

            addLog("Sending HTML structure to AI for product extraction...");
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash', // Fast model for parsing
                contents: `
                   Analyze the following HTML source code from an ecommerce site.
                   Extract a list of products found on this page.
                   For each product, identify:
                   - Name (in Bulgarian if present)
                   - Price (numeric only). IMPORTANT: If price is in BGN (лв), divide by 1.95583 to get EUR. Return the EUR value.
                   - Image URL (absolute path preferred)
                   - Category (infer from context)
                   - Brand (infer from name or context)
                   - Description (short summary)
                   
                   Return ONLY a raw JSON array. No markdown formatting.
                   JSON Format: [{"name": "...", "price": 10.5, "image": "...", "category": "...", "brand": "...", "stock": 100, "description": "..."}]
                   
                   HTML Source:
                   ${cleanHtml}
                `
            });

            let jsonStr = response.text.trim();
            // Cleanup markdown code blocks if AI adds them
            if (jsonStr.startsWith('```json')) jsonStr = jsonStr.slice(7);
            if (jsonStr.startsWith('```')) jsonStr = jsonStr.slice(3);
            if (jsonStr.endsWith('```')) jsonStr = jsonStr.slice(0, -3);
            
            const products = JSON.parse(jsonStr);
            
            if (Array.isArray(products) && products.length > 0) {
                addLog(`Successfully identified ${products.length} products!`);
                setFoundProducts(products);
                setSelectedProducts(products.map((_, i) => i)); // Select all by default
                setTimeout(() => setImportStep('review'), 1000);
            } else {
                throw new Error("AI could not identify any products structure in this HTML.");
            }

        } catch (e: any) {
            console.error(e);
            addLog(`Error: ${e.message}`);
            alert(`Import Failed: ${e.message}`);
            setImportStep('input');
        }
    };

    const finalizeImport = async () => {
        const toImport = foundProducts.filter((_, i) => selectedProducts.includes(i));
        await importProducts(toImport as Product[]);
        setImportStep('success');
    };

    return (
        <div className="container mx-auto px-4 py-12 min-h-screen">
             {/* Header & Tabs */}
             <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-4xl font-heading font-bold text-neutral-900 uppercase">Админ Панел</h1>
                <div className="flex gap-2 bg-white p-1 rounded-lg border border-slate-200">
                    <button 
                        onClick={() => setTab('orders')} 
                        className={`px-6 py-2 rounded-md font-bold uppercase text-sm transition ${tab === 'orders' ? 'bg-neutral-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        Поръчки
                    </button>
                    <button 
                        onClick={() => setTab('products')} 
                        className={`px-6 py-2 rounded-md font-bold uppercase text-sm transition ${tab === 'products' ? 'bg-neutral-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        Продукти
                    </button>
                </div>
             </div>

             {/* ORDERS TAB */}
             {tab === 'orders' && (
                <div className="space-y-4">
                    {orders.map(order => (
                        <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between gap-4">
                           <div>
                               <div className="flex items-center gap-3 mb-2">
                                   <span className="font-mono font-bold text-slate-400">#{order.id.slice(-6)}</span>
                                   <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${order.status === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                       {order.status === 'delivered' ? 'Доставена' : 'Обработва се'}
                                   </span>
                               </div>
                               <h3 className="font-bold text-lg">{order.customerName}</h3>
                               <p className="text-sm text-slate-500 mb-2">{order.phone} • {order.address}</p>
                               <div className="text-sm text-slate-600">
                                   {order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}
                               </div>
                           </div>
                           <div className="flex flex-col items-end gap-2">
                               <div className="font-bold text-xl">€{order.total.toFixed(2)}</div>
                               {order.status !== 'delivered' && (
                                   <button 
                                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                                      className="bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm font-bold uppercase hover:bg-green-600 transition"
                                   >
                                      Маркирай доставена
                                   </button>
                               )}
                           </div>
                        </div>
                    ))}
                    {orders.length === 0 && <div className="text-center text-slate-400 py-12">Няма поръчки</div>}
                </div>
             )}

             {/* PRODUCTS TAB */}
             {tab === 'products' && (
                <div>
                    <div className="flex justify-end gap-3 mb-6">
                        <button onClick={handleAddClick} className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg font-bold uppercase text-sm hover:bg-orange-700 transition shadow-lg">
                            <Plus size={16} /> Добави Продукт
                        </button>
                        <button onClick={() => { setIsImporting(true); setImportStep('input'); setImportUrl(''); }} className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-lg font-bold uppercase text-sm hover:bg-neutral-800 transition shadow-lg">
                            <Upload size={16} /> Импорт
                        </button>
                    </div>

                    <div className="grid gap-4">
                        {products.map(product => (
                            <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center gap-4">
                                <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg bg-slate-100" />
                                <div className="flex-grow text-center sm:text-left">
                                    <div className="font-bold text-neutral-900">{product.name}</div>
                                    <div className="text-sm text-slate-500">
                                        {product.category} • {product.brand} • <span className="text-orange-600 font-bold">€{product.price.toFixed(2)}</span> • Наличност: {product.stock}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEditClick(product)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition" title="Редактирай">
                                        <Edit size={20} />
                                    </button>
                                    <button onClick={() => deleteProduct(product.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Изтрий">
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
             )}

             {/* ADD / EDIT MODAL */}
             {(isAdding || isEditing) && (
                <div className="fixed inset-0 bg-neutral-900/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-heading font-bold uppercase">{isEditing ? 'Редактиране' : 'Добавяне'} на Продукт</h3>
                            <button onClick={() => { setIsAdding(false); setIsEditing(null); }}><X size={24}/></button>
                        </div>
                        <div className="space-y-4">
                            <input 
                                className="w-full p-3 border rounded-xl" 
                                placeholder="Име на продукта" 
                                value={prodForm.name || ''} 
                                onChange={e => setProdForm({...prodForm, name: e.target.value})} 
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input 
                                    className="w-full p-3 border rounded-xl" 
                                    placeholder="Категория" 
                                    value={prodForm.category || ''} 
                                    onChange={e => setProdForm({...prodForm, category: e.target.value})} 
                                />
                                <input 
                                    className="w-full p-3 border rounded-xl" 
                                    placeholder="Марка" 
                                    value={prodForm.brand || ''} 
                                    onChange={e => setProdForm({...prodForm, brand: e.target.value})} 
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input 
                                    type="number"
                                    className="w-full p-3 border rounded-xl" 
                                    placeholder="Цена (EUR)" 
                                    value={prodForm.price || ''} 
                                    onChange={e => setProdForm({...prodForm, price: parseFloat(e.target.value)})} 
                                />
                                <input 
                                    type="number"
                                    className="w-full p-3 border rounded-xl" 
                                    placeholder="Наличност" 
                                    value={prodForm.stock || ''} 
                                    onChange={e => setProdForm({...prodForm, stock: parseInt(e.target.value)})} 
                                />
                            </div>
                            <input 
                                className="w-full p-3 border rounded-xl" 
                                placeholder="URL на изображение" 
                                value={prodForm.image || ''} 
                                onChange={e => setProdForm({...prodForm, image: e.target.value})} 
                            />
                            <textarea 
                                className="w-full p-3 border rounded-xl" 
                                rows={4}
                                placeholder="Описание" 
                                value={prodForm.description || ''} 
                                onChange={e => setProdForm({...prodForm, description: e.target.value})} 
                            />
                            <button onClick={handleSave} className="w-full bg-neutral-900 text-white py-4 rounded-xl font-bold uppercase hover:bg-orange-600 transition">
                                Запази
                            </button>
                        </div>
                    </div>
                </div>
             )}

             {/* ROBUST AI IMPORT MODAL */}
             {isImporting && (
                <div className="fixed inset-0 bg-neutral-900/90 backdrop-blur-md z-[70] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-4xl p-0 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                        
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="text-xl md:text-2xl font-heading font-bold uppercase flex items-center gap-2">
                                    <Bot className="text-orange-500" /> Smart AI Importer
                                </h3>
                                <p className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wider font-bold">Import from any website URL</p>
                            </div>
                            <button onClick={() => { setIsImporting(false); }} className="p-2 hover:bg-slate-200 rounded-full transition"><X size={24}/></button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-grow overflow-y-auto p-4 md:p-8">
                            
                            {/* STAGE 1: INPUT */}
                            {importStep === 'input' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex gap-4">
                                        <Info className="text-blue-500 shrink-0" />
                                        <div className="text-sm text-blue-800">
                                            <p className="font-bold mb-1">How it works:</p>
                                            <p>Paste any URL containing products (e.g. category page). Our AI agent will visit the page, analyze the HTML structure, extract product details (Name, Price, Image), automatically convert BGN to EUR, and prepare them for import.</p>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Target URL</label>
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <div className="relative flex-grow">
                                                <LinkIcon className="absolute left-4 top-4 text-slate-400" size={20} />
                                                <input
                                                    className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-lg"
                                                    placeholder="https://www.angro.bg/..."
                                                    value={importUrl}
                                                    onChange={e => setImportUrl(e.target.value)}
                                                />
                                            </div>
                                            <button 
                                                onClick={handleSmartFetch}
                                                disabled={!importUrl}
                                                className="bg-neutral-900 text-white px-8 py-4 rounded-xl font-bold uppercase hover:bg-orange-600 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:w-auto w-full"
                                            >
                                                <Zap size={20} /> Analyze
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STAGE 2: FETCHING & ANALYZING */}
                            {importStep === 'fetching' && (
                                <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
                                    <div className="relative w-24 h-24 mb-8">
                                        <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                        <Bot className="absolute inset-0 m-auto text-neutral-900" size={32} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-neutral-900 mb-2">AI Agent is working...</h3>
                                    <div className="w-full max-w-md bg-slate-900 rounded-xl p-4 font-mono text-xs text-green-400 h-32 overflow-y-auto custom-scrollbar shadow-inner">
                                        {statusLog.map((log, i) => (
                                            <div key={i} className="mb-1">> {log}</div>
                                        ))}
                                        <div className="animate-pulse">> _</div>
                                    </div>
                                </div>
                            )}

                            {/* STAGE 3: REVIEW */}
                            {importStep === 'review' && (
                                <div className="animate-fade-in h-full flex flex-col">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-bold text-lg">Found {foundProducts.length} Products</h3>
                                        <div className="flex gap-2">
                                            <button onClick={() => setSelectedProducts(foundProducts.map((_, i) => i))} className="text-sm font-bold text-blue-600 hover:underline">Select All</button>
                                            <button onClick={() => setSelectedProducts([])} className="text-sm font-bold text-slate-500 hover:underline">Deselect All</button>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar border border-slate-100 rounded-xl p-4 bg-slate-50">
                                        {foundProducts.map((p, idx) => (
                                            <div 
                                                key={idx} 
                                                onClick={() => {
                                                    if (selectedProducts.includes(idx)) setSelectedProducts(prev => prev.filter(i => i !== idx));
                                                    else setSelectedProducts(prev => [...prev, idx]);
                                                }}
                                                className={`bg-white p-4 rounded-xl border-2 cursor-pointer transition flex flex-col sm:flex-row gap-4 items-start sm:items-center ${selectedProducts.includes(idx) ? 'border-orange-500 shadow-md' : 'border-transparent hover:border-slate-200'}`}
                                            >
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedProducts.includes(idx) ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-300'}`}>
                                                    {selectedProducts.includes(idx) && <Check size={14} strokeWidth={3} />}
                                                </div>
                                                <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                                                    {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : <Package className="w-full h-full p-4 text-slate-300" />}
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="font-bold text-neutral-900">{p.name}</div>
                                                    <div className="text-xs text-slate-500">{p.category} • {p.brand}</div>
                                                </div>
                                                <div className="text-left sm:text-right w-full sm:w-auto">
                                                    <div className="font-bold text-orange-600">€{p.price?.toFixed(2)}</div>
                                                    <div className="text-[10px] text-slate-400">Stock: {p.stock}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6 flex flex-col sm:flex-row justify-end gap-4 border-t border-slate-100 pt-6">
                                        <button onClick={() => setImportStep('input')} className="px-6 py-3 font-bold text-slate-500 hover:text-neutral-900 transition">Back</button>
                                        <button 
                                            onClick={finalizeImport}
                                            disabled={selectedProducts.length === 0}
                                            className="bg-neutral-900 text-white px-8 py-3 rounded-xl font-bold uppercase hover:bg-orange-600 transition shadow-lg disabled:opacity-50"
                                        >
                                            Import {selectedProducts.length} Products
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* STAGE 4: SUCCESS */}
                            {importStep === 'success' && (
                                <div className="text-center py-20 animate-fade-in">
                                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                                        <CheckCircle2 size={48} />
                                    </div>
                                    <h3 className="text-3xl font-heading font-bold text-neutral-900 mb-2 uppercase">Success!</h3>
                                    <p className="text-slate-500 mb-8">Successfully imported products to your catalog.</p>
                                    <button onClick={() => { setIsImporting(false); setImportStep('input'); }} className="bg-neutral-900 text-white px-8 py-3 rounded-xl font-bold uppercase hover:bg-orange-600 transition shadow-lg">
                                        Close
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
             )}
        </div>
    );
};

export const App = () => {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-neutral-900 selection:bg-orange-200 selection:text-orange-900">
        <Navbar />
        <CartNotificationModal />
        <main className="flex-grow flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Catalog />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
        <VoiceAssistant />
      </div>
    </HashRouter>
  );
};