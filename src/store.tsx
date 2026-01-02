import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, User, Order, CategoryItem, CheckoutFormData } from './types';
import { db } from './firebase'; 
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from 'firebase/firestore';

// ==========================================
// STORE IMPLEMENTATION (FIREBASE VERSION)
// ==========================================

interface AppContextType {
  user: User | null;
  products: Product[];
  categories: CategoryItem[];
  cart: CartItem[];
  orders: Order[];
  
  checkoutFormData: CheckoutFormData;
  setCheckoutFormData: React.Dispatch<React.SetStateAction<CheckoutFormData>>;
  lastOrder: Order | null;
  clearLastOrder: () => void;

  showCartModal: boolean;
  setShowCartModal: (show: boolean) => void;

  isAssistantOpen: boolean;
  assistantMode: 'voice' | 'chat';
  openAssistant: (mode?: 'voice' | 'chat') => void;
  closeAssistant: () => void;
  toggleAssistant: () => void;

  login: (email: string, password: string) => Promise<void>;
  register: (details: {email: string, password: string, name: string, phone: string, address: string}) => Promise<void>;
  logout: () => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  placeOrder: (details: { name: string; phone: string; address: string }) => Promise<Order>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  importProducts: (products: Product[]) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCategory: (item: CategoryItem) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [checkoutFormData, setCheckoutFormData] = useState<CheckoutFormData>({ name: '', phone: '', address: '' });
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [showCartModal, setShowCartModal] = useState(false);
  
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantMode, setAssistantMode] = useState<'voice' | 'chat'>('voice');

  // Initial Load
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchOrders();

    const savedUser = localStorage.getItem('sofia_user');
    if (savedUser) {
        const u = JSON.parse(savedUser);
        setUser(u);
        setCheckoutFormData(prev => ({...prev, name: u.name}));
    }
  }, []);

  // --- FIRESTORE ACTIONS ---

  const fetchProducts = async () => {
    try {
      const q = query(collection(db, "products"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(data);
    } catch (e) { console.error("Firestore Error:", e); }
  };

  const fetchCategories = async () => {
    try {
      const q = query(collection(db, "categories"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CategoryItem[];
      setCategories(data);
    } catch (e) { console.error("Firestore Error:", e); }
  };

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, "orders"), orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(data);
    } catch (e) { console.error("Firestore Error:", e); }
  };

  // --- HELPERS & AUTH ---

  const openAssistant = (mode: 'voice' | 'chat' = 'voice') => {
    setAssistantMode(mode);
    setIsAssistantOpen(true);
  };
  const closeAssistant = () => setIsAssistantOpen(false);
  const toggleAssistant = () => setIsAssistantOpen(prev => !prev);

  const login = async (email: string, password: string) => {
    // Simple mock auth for now
    const role = email.includes('admin') ? 'admin' : 'user';
    const name = email.split('@')[0];
    const fakeUser: User = { 
        id: Date.now().toString(), 
        name: name.charAt(0).toUpperCase() + name.slice(1), 
        email, 
        role 
    };
    setUser(fakeUser);
    setCheckoutFormData(prev => ({...prev, name: fakeUser.name}));
    localStorage.setItem('sofia_user', JSON.stringify(fakeUser));
    if(role === 'admin') fetchOrders(); 
  };

  const register = async (details: {email: string, password: string, name: string, phone: string, address: string}) => {
      const fakeUser: User = {
          id: Date.now().toString(),
          name: details.name,
          email: details.email,
          phone: details.phone,
          address: details.address,
          role: 'user'
      };
      setUser(fakeUser);
      setCheckoutFormData({ name: details.name, phone: details.phone, address: details.address });
      localStorage.setItem('sofia_user', JSON.stringify(fakeUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sofia_user');
  };

  // --- CART ---

  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + quantity } : p);
      }
      return [...prev, { ...product, quantity }];
    });
    setShowCartModal(true);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(p => p.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(p => p.id === productId ? { ...p, quantity } : p));
  };

  const clearCart = () => setCart([]);

  // --- ORDERS ---

  const clearLastOrder = () => setLastOrder(null);

  const placeOrder = async (details: { name: string; phone: string; address: string }) => {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    const newOrderData = {
        customerName: details.name,
        phone: details.phone,
        address: details.address,
        items: cart,
        total: total,
        status: 'pending',
        date: new Date().toISOString(),
        paymentMethod: 'cash_on_delivery'
    };

    // Save to Firestore
    try {
        const docRef = await addDoc(collection(db, "orders"), newOrderData);
        const newOrder = { ...newOrderData, id: docRef.id } as Order;
        
        clearCart();
        setCheckoutFormData({ name: user?.name || '', phone: '', address: '' });
        setLastOrder(newOrder);
        return newOrder;
    } catch (e) {
        console.error("Error placing order:", e);
        throw e;
    }
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    try {
        const orderRef = doc(db, "orders", id);
        await updateDoc(orderRef, { status });
        fetchOrders(); 
    } catch (e) { console.error(e); }
  };

  // --- PRODUCT MANAGEMENT ---

  const addProduct = async (product: Product) => {
    try {
        // Remove ID so Firestore generates a new one
        const { id, ...data } = product; 
        await addDoc(collection(db, "products"), data);
        fetchProducts();
    } catch (e) { console.error(e); }
  };

  const importProducts = async (newProducts: Product[]) => {
      // 1. Create missing Categories/Brands
      const uniqueCats = [...new Set(newProducts.map(p => p.category).filter(Boolean))];
      const uniqueBrands = [...new Set(newProducts.map(p => p.brand).filter(Boolean))];
      
      const existingCatNames = categories.filter(c => c.type === 'category').map(c => c.name);
      const existingBrandNames = categories.filter(c => c.type === 'brand').map(c => c.name);

      for (const catName of uniqueCats) {
          if (!existingCatNames.includes(catName)) {
              await addCategory({ id: '', name: catName, type: 'category' });
          }
      }
      for (const brandName of uniqueBrands) {
          if (!existingBrandNames.includes(brandName)) {
              await addCategory({ id: '', name: brandName, type: 'brand' });
          }
      }

      // 2. Add Products
      for(const p of newProducts) {
           await addProduct(p);
      }
      
      // 3. Refresh
      await fetchCategories();
      await fetchProducts();
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
        const productRef = doc(db, "products", id);
        await updateDoc(productRef, updates);
        fetchProducts();
    } catch(e) { console.error(e); }
  };

  const deleteProduct = async (id: string) => {
    try {
        await deleteDoc(doc(db, "products", id));
        fetchProducts();
    } catch(e) { console.error(e); }
  };

  const addCategory = async (item: CategoryItem) => {
    try {
        const { id, ...data } = item;
        await addDoc(collection(db, "categories"), data);
        fetchCategories();
    } catch(e) { console.error(e); }
  };

  const deleteCategory = async (id: string) => {
    try {
        await deleteDoc(doc(db, "categories", id));
        fetchCategories();
    } catch(e) { console.error(e); }
  };

  return (
    <AppContext.Provider value={{
      user, products, categories, cart, orders, checkoutFormData, setCheckoutFormData, lastOrder, clearLastOrder,
      showCartModal, setShowCartModal,
      isAssistantOpen, assistantMode, openAssistant, closeAssistant, toggleAssistant,
      login, register, logout, addToCart, removeFromCart, updateCartQuantity, clearCart, placeOrder, updateOrderStatus,
      addProduct, importProducts, updateProduct, deleteProduct,
      addCategory, deleteCategory
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useStore must be used within AppProvider");
  return context;
};