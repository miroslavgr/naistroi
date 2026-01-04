import { Link } from 'react-router-dom';
import { Package, Facebook, MapPin, Phone, Mail, CreditCard, Banknote } from 'lucide-react';

export const Footer = () => (
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
          <li className="flex items-start gap-3"><MapPin className="text-orange-500 shrink-0 mt-0.5" size={16} /><span>с. Нови Хан, Индустриална зона</span></li>
          <li className="flex items-center gap-3"><Phone className="text-orange-500 shrink-0" size={16} /><a href="tel:+359884045444" className="hover:text-white transition">0884 045 444</a></li>
          <li className="flex items-center gap-3"><Mail className="text-orange-500 shrink-0" size={16} /><a href="mailto:office@naistroitrans.bg" className="hover:text-white transition">office@naistroitrans.bg</a></li>
        </ul>
      </div>

      <div>
        <h3 className="text-white text-lg font-heading font-bold mb-6 uppercase tracking-wider border-b-2 border-orange-600 w-fit pb-1">Плащане</h3>
        <p className="text-sm text-slate-500 mb-4">Сигурно плащане при доставка. Приемаме карти и пари в брой.</p>
        <div className="flex gap-3">
           <div className="flex flex-col items-center justify-center gap-1 w-16 h-12 bg-white rounded-lg shadow-lg text-slate-800 border border-slate-200" title="Credit Card"><CreditCard size={18} /><span className="text-[9px] font-bold uppercase">Карта</span></div>
           <div className="flex flex-col items-center justify-center gap-1 w-16 h-12 bg-white rounded-lg shadow-lg text-slate-800 border border-slate-200" title="Cash"><Banknote size={18} /><span className="text-[9px] font-bold uppercase">В Брой</span></div>
        </div>
      </div>
    </div>
    <div className="text-center mt-16 pt-8 border-t border-white/5 text-xs text-slate-600 uppercase tracking-widest">&copy; 2025 НайСтрой Транс. Всички права запазени.</div>
  </footer>
);