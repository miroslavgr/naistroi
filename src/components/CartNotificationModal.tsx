
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useStore } from '../store';

export const CartNotificationModal = () => {
  const { showCartModal, setShowCartModal } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
      if (location.pathname === '/checkout') {
          setShowCartModal(false);
      }
  }, [location.pathname, setShowCartModal]);

  if (!showCartModal) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={() => setShowCartModal(false)}></div>
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative z-10 animate-fade-in-up border border-slate-100">
         <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
            <Check size={32} strokeWidth={3} />
         </div>
         <h3 className="text-xl font-heading font-bold text-center mb-2 uppercase">Добавено в количката!</h3>
         <p className="text-center text-slate-500 text-sm mb-8">Продуктът беше успешно добавен.</p>
         <div className="space-y-3">
            <button onClick={() => { setShowCartModal(false); navigate('/checkout'); }} className="w-full bg-neutral-900 text-white py-3 rounded-xl font-bold uppercase text-sm hover:bg-orange-600 transition shadow-lg">Към Плащане</button>
            <button onClick={() => setShowCartModal(false)} className="w-full bg-white border border-slate-200 text-slate-600 py-3 rounded-xl font-bold uppercase text-sm hover:bg-slate-50 transition">Продължи пазаруването</button>
         </div>
      </div>
    </div>
  );
};