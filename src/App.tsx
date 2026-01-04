import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartNotificationModal } from './components/CartNotificationModal';
import { VoiceAssistant } from './components/VoiceAssistant';

import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import { ProductDetails } from './pages/ProductDetails';
import { Checkout } from './pages/Checkout';
import { Login } from './pages/Login';
import { Contacts } from './pages/Contacts';
import { Admin } from './pages/Admin';
import { Services } from './pages/Services';
import { ServiceDetails } from './pages/ServiceDetails';

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
            <Route path="/services" element={<Services />} />
            <Route path="/service/:id" element={<ServiceDetails />} />
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