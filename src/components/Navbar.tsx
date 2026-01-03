import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Package, Bot, ShoppingCart, LogOut, User as UserIcon, Menu, X, Mic } from 'lucide-react';
import { useStore } from '../store';

export const Navbar = () => {
  const { cart, user, logout, openAssistant } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const isActive = (path: string) => location.pathname === path ? 'text-orange-500' : 'text-white hover:text-orange-400';

  return (
    <nav className="glass-nav text-white sticky top-0 z-40 border-b border-white/5 bg-neutral-900/90 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold flex items-center gap-2 group">
          <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-lg transform group-hover:rotate-3 transition duration-300">
             <Package className="text-white" size={24} />
          </div>
          <div className="flex flex-col leading-none font-heading">
            <span className="text-white text-2xl tracking-tight uppercase">НайСтрой</span>
            <span className="text-orange-500 text-sm tracking-[0.2em] font-bold uppercase">Транс</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8 font-medium uppercase text-sm tracking-wider">
          <Link to="/" className={`transition duration-300 ${isActive('/')}`}>Начало</Link>
          <Link to="/products" className={`transition duration-300 ${isActive('/products')}`}>Продукти</Link>
          <Link to="/contacts" className={`transition duration-300 ${isActive('/contacts')}`}>Контакти</Link>
          <button onClick={(e) => { e.preventDefault(); openAssistant('voice'); }} className="flex items-center gap-1 text-orange-500 hover:text-white transition group">
            <Bot size={18} className="group-hover:animate-bounce" /> 
            <span className="underline decoration-orange-500 underline-offset-4 font-bold">AI Асистент</span>
          </button>
          {user?.role === 'admin' && (
            <Link to="/admin" className="text-orange-500 hover:text-orange-400 border border-orange-500/30 px-3 py-1 rounded">Админ</Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Link to="/checkout" className="relative p-2.5 bg-white/5 rounded-full hover:bg-orange-600 hover:text-white transition duration-300 group">
            <ShoppingCart size={20} className="group-hover:scale-110 transition" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-neutral-900">{cartCount}</span>
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