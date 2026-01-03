import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShoppingCart, Check, MapPin, Loader2, Navigation, 
  Map, X, Truck, Package 
} from 'lucide-react';
import { useStore } from '../store';
import { BGN_RATE } from '../constants';

// Leaflet is loaded via CDN in index.html, so we declare it here
declare const L: any;

export const Checkout = () => {
  const { cart, updateCartQuantity, removeFromCart, placeOrder, checkoutFormData, setCheckoutFormData, lastOrder, clearLastOrder } = useStore();
  const navigate = useNavigate();
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  
  // Map State
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);
  const [tempLocation, setTempLocation] = useState<{lat: number, lng: number, address: string} | null>(null);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Initialize Map Logic
  useEffect(() => {
    if (showMapModal && mapRef.current && !mapInstance.current) {
        // Default to Sofia (approx center)
        const defaultLat = 42.6977;
        const defaultLng = 23.3219;

        const map = L.map(mapRef.current).setView([defaultLat, defaultLng], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        mapInstance.current = map;

        // FIX: Invalidate size after modal transition to prevent gray areas
        setTimeout(() => {
             map.invalidateSize();
        }, 200);

        // Click Handler
        map.on('click', async (e: any) => {
            const { lat, lng } = e.latlng;
            updateMapSelection(lat, lng);
        });

        // Try geolocation initially if no address set
        if (!checkoutFormData.address) {
             navigator.geolocation.getCurrentPosition((pos) => {
                 const { latitude, longitude } = pos.coords;
                 map.setView([latitude, longitude], 13);
                 updateMapSelection(latitude, longitude);
             });
        }
    }
    
    return () => {
        if (!showMapModal && mapInstance.current) {
             mapInstance.current.remove();
             mapInstance.current = null;
             markerInstance.current = null;
        }
    }
  }, [showMapModal, checkoutFormData.address]);

  const updateMapSelection = async (lat: number, lng: number) => {
      // 1. Add/Move Marker
      if (markerInstance.current) {
          markerInstance.current.setLatLng([lat, lng]);
      } else {
          markerInstance.current = L.marker([lat, lng]).addTo(mapInstance.current);
      }

      // 2. Reverse Geocode
      setLoadingLoc(true);
      try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await response.json();
          let address = `Координати: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          if (data && data.address) {
              const city = data.address.city || data.address.town || data.address.village || 'София';
              const road = data.address.road || '';
              const number = data.address.house_number || '';
              const suburb = data.address.suburb || '';
              const postcode = data.address.postcode || '';
              address = `${road} ${number}, ${suburb}, ${postcode} ${city}`;
          }
          setTempLocation({ lat, lng, address });
      } catch (e) {
          console.error(e);
          setTempLocation({ lat, lng, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` });
      } finally {
          setLoadingLoc(false);
      }
  };

  const confirmLocation = () => {
      if (tempLocation) {
          setCheckoutFormData({ ...checkoutFormData, address: tempLocation.address });
          setShowMapModal(false);
      }
  };

  // Standalone Geolocation for the Form Button
  const getFormLocation = () => {
      if (!navigator.geolocation) {
          alert("Геолокацията не се поддържа.");
          return;
      }
      setLoadingLoc(true);
      navigator.geolocation.getCurrentPosition(async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
              const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
              const data = await response.json();
              if (data && data.address) {
                   const city = data.address.city || data.address.town || data.address.village || 'София';
                   const road = data.address.road || '';
                   const number = data.address.house_number || '';
                   const suburb = data.address.suburb || '';
                   const postcode = data.address.postcode || '';
                   const address = `${road} ${number}, ${suburb}, ${postcode} ${city}`;
                   setCheckoutFormData(prev => ({ ...prev, address }));
              } else {
                   setCheckoutFormData(prev => ({ ...prev, address: `${latitude}, ${longitude}` }));
              }
          } catch(e) {
              setCheckoutFormData(prev => ({ ...prev, address: `${latitude}, ${longitude}` }));
          } finally {
              setLoadingLoc(false);
          }
      }, (err) => {
          console.error(err);
          setLoadingLoc(false);
      }, { enableHighAccuracy: true });
  }

  const getUserLocation = () => {
      if (!navigator.geolocation) {
          alert("Геолокацията не се поддържа.");
          return;
      }
      setLoadingLoc(true);
      navigator.geolocation.getCurrentPosition(
          (pos) => {
              const { latitude, longitude } = pos.coords;
              if (mapInstance.current) {
                  mapInstance.current.setView([latitude, longitude], 14);
                  updateMapSelection(latitude, longitude);
              }
              setLoadingLoc(false);
          },
          (err) => {
              console.error(err);
              alert("Не успяхме да намерим локацията ви.");
              setLoadingLoc(false);
          },
          { enableHighAccuracy: true }
      );
  };

  // If cart empty and not done, prompt to shop
  if (cart.length === 0 && !lastOrder) {
     return (
        <div className="container mx-auto px-4 py-32 text-center animate-fade-in">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-300">
            <ShoppingCart size={40} />
          </div>
          <h2 className="text-3xl font-heading font-bold text-neutral-900 mb-4 uppercase">Вашата количка е празна</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">Разгледайте нашия каталог и добавете качествени строителни материали.</p>
          <Link to="/products" className="inline-block bg-orange-600 text-white px-8 py-3 rounded-full font-bold uppercase tracking-wide hover:bg-orange-700 transition shadow-lg">
            Към магазина
          </Link>
        </div>
     )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await placeOrder(checkoutFormData);
  };

  if (lastOrder) {
    return (
      <div className="container mx-auto px-4 py-32 text-center animate-fade-in">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-100">
          <Check size={48} strokeWidth={3} />
        </div>
        <h2 className="text-4xl font-heading font-bold text-neutral-900 mb-4 uppercase">Поръчката е приета!</h2>
        <div className="bg-slate-50 inline-block px-6 py-2 rounded-lg border border-slate-200 mb-8">
           <span className="text-slate-500 font-medium mr-2">Номер на поръчка:</span>
           <span className="font-mono font-bold text-neutral-900 text-lg">#{lastOrder.id.slice(-6)}</span>
        </div>
        <p className="text-slate-600 mb-10 max-w-md mx-auto">
          Ще се свържем с вас на <strong>{lastOrder.phone}</strong> за потвърждение на доставката до адрес.
        </p>
        <button onClick={() => { clearLastOrder(); navigate('/'); }} className="inline-block bg-neutral-900 text-white px-10 py-3 rounded-full font-bold uppercase tracking-wide hover:bg-orange-600 transition">
          Обратно към началото
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <h1 className="text-4xl font-heading font-bold mb-8 text-neutral-900 uppercase">Завършване на поръчката</h1>
      
      <div className="grid lg:grid-cols-2 gap-12">
        
        {/* RIGHT COLUMN (Desktop) / TOP (Mobile) - Products List */}
        <div className="order-2 lg:order-2 h-fit">
           <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8 sticky top-24">
              <h3 className="text-xl font-heading font-bold mb-6 border-b border-slate-100 pb-4 uppercase flex justify-between items-center">
                  <span>Вашата Количка</span>
                  <span className="text-orange-500 text-lg">{cart.length} продукта</span>
              </h3>
              
              <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {cart.map(item => (
                    <div key={item.id} className="flex gap-4 items-start">
                        <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-grow">
                            <h4 className="font-bold text-sm text-neutral-900 leading-tight mb-1">{item.name}</h4>
                            <div className="text-xs text-slate-500 mb-2">€{item.price} / бр.</div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center bg-slate-100 rounded px-1">
                                    <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)} className="px-2 hover:text-orange-600 font-bold">-</button>
                                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                    <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)} className="px-2 hover:text-orange-600 font-bold">+</button>
                                </div>
                                <button onClick={() => removeFromCart(item.id)} className="text-xs text-red-400 hover:text-red-600 underline">Изтрий</button>
                            </div>
                        </div>
                        <div className="font-bold text-neutral-900">
                            €{(item.price * item.quantity).toFixed(2)}
                        </div>
                    </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between">
                      <span>Междинна сума</span>
                      <span className="font-bold">€{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                      <span>ДДС (20%)</span>
                      <span className="font-bold">Включено</span>
                  </div>
                  <div className="flex justify-between text-lg pt-2 border-t border-slate-100 mt-2 text-neutral-900">
                      <span className="font-heading font-bold uppercase">Общо за плащане</span>
                      <span className="font-heading font-bold text-orange-600">€{total.toFixed(2)}</span>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                      ≈ {(total * BGN_RATE).toFixed(2)} лв.
                  </div>
              </div>
           </div>
        </div>

        {/* LEFT COLUMN - Input Form */}
        <div className="order-1 lg:order-1">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12">
                <h2 className="text-2xl font-heading font-bold mb-8 text-neutral-900 uppercase border-b pb-4">Данни за Доставка</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Име и Фамилия</label>
                    <input 
                        required 
                        type="text" 
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition outline-none font-medium text-neutral-900"
                        value={checkoutFormData.name}
                        onChange={e => setCheckoutFormData({...checkoutFormData, name: e.target.value})}
                    />
                    </div>
                    <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Телефон</label>
                    <input 
                        required 
                        type="tel" 
                        placeholder="0888 123 456"
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition outline-none font-medium text-neutral-900"
                        value={checkoutFormData.phone}
                        onChange={e => setCheckoutFormData({...checkoutFormData, phone: e.target.value})}
                    />
                    </div>
                </div>
                
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Адрес за доставка</label>
                        <div className="flex gap-2">
                            <button 
                                type="button" 
                                onClick={getFormLocation}
                                disabled={loadingLoc}
                                className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition flex items-center gap-1 shadow-sm border border-blue-100 disabled:opacity-50"
                            >
                                {loadingLoc ? <Loader2 size={14} className="animate-spin"/> : <Navigation size={14} />} 
                                Текуща локация
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setShowMapModal(true)}
                                className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition flex items-center gap-1 shadow-sm border border-orange-100"
                            >
                                <Map size={14} /> Карта
                            </button>
                        </div>
                    </div>
                    <textarea 
                    required 
                    rows={3}
                    placeholder="кв. Витоша, ул. Иван Вазов 10, вх. А..."
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition outline-none font-medium text-neutral-900"
                    value={checkoutFormData.address}
                    onChange={e => setCheckoutFormData({...checkoutFormData, address: e.target.value})}
                    />
                    <p className="text-xs text-orange-500 mt-2 font-medium flex items-center gap-1">
                    <Truck size={12}/> Доставяме само в София и областта
                    </p>
                </div>

                <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 flex items-start gap-4">
                    <div className="bg-orange-100 p-2 rounded-lg text-orange-600 shrink-0">
                    <Package size={24} />
                    </div>
                    <div>
                    <h4 className="font-heading font-bold text-neutral-900 uppercase mb-1">Плащане при доставка</h4>
                    <p className="text-sm text-slate-600">Заплащате цялата сума на шофьора при получаване на стоката. Можете да платите в брой или с карта.</p>
                    </div>
                </div>

                <button type="submit" className="w-full bg-gradient-to-r from-neutral-900 to-neutral-800 text-white py-4 rounded-xl font-bold uppercase tracking-wider hover:from-orange-600 hover:to-red-600 transition shadow-xl transform hover:-translate-y-1">
                    Завърши Поръчката
                </button>
                </form>
            </div>
        </div>
      </div>

      {/* Interactive Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 bg-neutral-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in-up flex flex-col max-h-[90vh]">
                <div className="bg-neutral-900 p-4 flex justify-between items-center text-white shrink-0">
                    <h3 className="font-heading font-bold uppercase flex items-center gap-2"><MapPin size={20} className="text-orange-500"/> Изберете Локация</h3>
                    <button onClick={() => setShowMapModal(false)}><X size={20}/></button>
                </div>
                
                {/* Real Interactive Map Container */}
                <div className="relative flex-grow h-[400px]">
                      <div ref={mapRef} className="absolute inset-0 z-10" />
                      <button 
                          onClick={getUserLocation}
                          disabled={loadingLoc}
                          className="absolute bottom-4 right-4 z-[9999] bg-white text-neutral-900 p-3 rounded-full shadow-2xl border-2 border-orange-100 hover:bg-orange-50 hover:scale-105 transition active:scale-95"
                          title="Намери ме"
                      >
                          {loadingLoc ? <Loader2 size={24} className="animate-spin text-orange-600" /> : <Navigation size={24} className="text-blue-600 fill-blue-600" />}
                      </button>
                </div>

                {/* Confirmation Footer */}
                <div className="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
                   <div className="mb-4">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Избран Адрес:</label>
                       <div className="bg-white p-3 rounded-xl border border-slate-200 text-sm font-medium text-neutral-900 min-h-[3rem] flex items-center">
                           {loadingLoc ? <span className="flex items-center gap-2 text-slate-400"><Loader2 size={16} className="animate-spin"/> Зареждане...</span> : (tempLocation?.address || "Кликнете върху картата за да изберете адрес")}
                       </div>
                   </div>
                   <div className="flex gap-3">
                       <button 
                           onClick={() => setShowMapModal(false)} 
                           className="flex-1 py-3 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-white transition"
                       >
                           Отказ
                       </button>
                       <button 
                           onClick={confirmLocation}
                           disabled={!tempLocation || loadingLoc}
                           className="flex-1 py-3 rounded-xl bg-neutral-900 text-white font-bold hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                       >
                           Потвърди Адреса
                       </button>
                   </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};