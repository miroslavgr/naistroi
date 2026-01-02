import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, User, Order, CategoryItem, CheckoutFormData } from './types';

// ==========================================
// CONFIGURATION
// ==========================================
// Set to true to use PHP/MySQL Backend. 
// Set to false to use High-Fidelity LocalStorage Simulation.
const USE_BACKEND = true; 

const API_BASE = 'http://localhost:8888/api'; // Adjust to your PHP server address

// Helper to simulate network latency (PHP processing time)
const mockNetworkDelay = (ms = 600) => new Promise(resolve => setTimeout(resolve, ms));

// ==========================================
// MOCK DATA (Fallback/Seed)
// ==========================================
const MOCK_CATEGORIES: CategoryItem[] = [
  { id: '1', name: 'Сухи Смеси', type: 'category' },
  { id: '2', name: 'Изолация', type: 'category' },
  { id: '3', name: 'Гипсокартон', type: 'category' },
  { id: '4', name: 'Груб Строеж', type: 'category' },
  { id: '5', name: 'Покриви', type: 'category' },
  { id: '6', name: 'Инструменти', type: 'category' },
  { id: '10', name: 'Knauf', type: 'brand' },
  { id: '11', name: 'Baumit', type: 'brand' },
  { id: '12', name: 'Wienerberger', type: 'brand' },
  { id: '13', name: 'Ytong', type: 'brand' },
  { id: '14', name: 'Ceresit', type: 'brand' },
  { id: '15', name: 'Bramac', type: 'brand' },
  { id: '16', name: 'Makita', type: 'brand' },
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Гипсова мазилка Knauf MP75 - 30кг',
    category: 'Сухи Смеси',
    brand: 'Knauf',
    price: 8.50,
    stock: 150,
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=500',
    description: 'Машинна гипсова мазилка за вътрешно приложение. Идеална за гладки повърхности.'
  },
  {
    id: '4',
    name: 'Лепило за плочки Baumit FlexTop',
    category: 'Сухи Смеси',
    brand: 'Baumit',
    price: 18.90,
    stock: 80,
    image: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=500',
    description: 'Гъвкаво лепило клас C2TE S1. За керамика, гранитогрес и естествен камък.'
  },
  {
    id: '101',
    name: 'Лепило за плочки Ceresit CM 11 Plus - 25кг',
    category: 'Сухи Смеси',
    brand: 'Ceresit',
    price: 12.40,
    stock: 200,
    image: 'https://images.unsplash.com/photo-1632759811807-7201c905333f?auto=format&fit=crop&q=80&w=500',
    description: 'Лепило за керамични плочки на закрито и открито. Водоустойчиво и мразоустойчиво.'
  },
  {
    id: '2',
    name: 'Каменна вата Fibran - 5см',
    category: 'Изолация',
    brand: 'Generic',
    price: 12.20,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1595846519845-68e298c2edd8?auto=format&fit=crop&q=80&w=500',
    description: 'Висококачествена каменна вата за топло и звукоизолация на стени и тавани.'
  },
  {
    id: '5',
    name: 'Тухла Wienerberger Porotherm 25 N+F',
    category: 'Груб Строеж',
    brand: 'Wienerberger',
    price: 1.80,
    stock: 2000,
    image: 'https://images.unsplash.com/photo-1628186742517-57529452b414?auto=format&fit=crop&q=80&w=500',
    description: 'Керамични блокове с вертикални кухини за носещи стени. Нут и перо система.'
  },
  {
    id: '106',
    name: 'Цимент Holcim Extra - 25кг',
    category: 'Груб Строеж',
    brand: 'Generic',
    price: 5.80,
    stock: 300,
    image: 'https://images.unsplash.com/photo-1518709414768-a88986a455b1?auto=format&fit=crop&q=80&w=500',
    description: 'Високоякостен портландцимент за бетон, замазки и мазилки.'
  },
  {
    id: '3',
    name: 'Винтоверт Makita DDF485Z',
    category: 'Инструменти',
    brand: 'Makita',
    price: 145.00,
    stock: 10,
    image: 'https://images.unsplash.com/photo-1622045239108-72aa489081e7?auto=format&fit=crop&q=80&w=500',
    description: 'Професионален акумулаторен винтоверт. Безчетков мотор, лек и мощен.'
  }
];

// ==========================================
// STORE IMPLEMENTATION
// ==========================================

interface AppContextType {
  user: User | null;
  products: Product[];
  categories: CategoryItem[];
  cart: CartItem[];
  orders: Order[];
  
  // Checkout State (Shared with AI)
  checkoutFormData: CheckoutFormData;
  setCheckoutFormData: React.Dispatch<React.SetStateAction<CheckoutFormData>>;
  lastOrder: Order | null;
  clearLastOrder: () => void;

  // UI State
  showCartModal: boolean;
  setShowCartModal: (show: boolean) => void;

  // Assistant State
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
  
  // Assistant State
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantMode, setAssistantMode] = useState<'voice' | 'chat'>('voice');

  // Load initial data
  useEffect(() => {
    // Seed LocalStorage if empty (This acts as "Importing SQL Dump")
    if (!USE_BACKEND) {
        if (!localStorage.getItem('sofia_products')) {
            localStorage.setItem('sofia_products', JSON.stringify(MOCK_PRODUCTS));
        }
        if (!localStorage.getItem('sofia_categories')) {
            localStorage.setItem('sofia_categories', JSON.stringify(MOCK_CATEGORIES));
        }
    }

    fetchProducts();
    fetchCategories();
    fetchOrders();

    // Check for saved session in localStorage
    const savedUser = localStorage.getItem('sofia_user');
    if (savedUser) {
        const u = JSON.parse(savedUser);
        setUser(u);
        setCheckoutFormData(prev => ({...prev, name: u.name}));
    }
  }, []);

  // --- DATA FETCHING (GET) ---

  const fetchProducts = async () => {
    if (USE_BACKEND) {
      try {
        const res = await fetch(`${API_BASE}/products.php`);
        const data = await res.json();
        if(Array.isArray(data)) {
            setProducts(data.map((p: any) => ({
              ...p, id: String(p.id), price: Number(p.price), stock: Number(p.stock), category: p.category_name, brand: p.brand_name
            })));
        }
      } catch (e) { console.error("Backend Error:", e); }
    } else {
      // SIMULATION: Read from "Database"
      const stored = localStorage.getItem('sofia_products');
      if (stored) setProducts(JSON.parse(stored));
      else setProducts(MOCK_PRODUCTS);
    }
  };

  const fetchCategories = async () => {
    if (USE_BACKEND) {
      try {
        const res = await fetch(`${API_BASE}/categories.php`);
        const data = await res.json();
        if(Array.isArray(data)) {
            setCategories(data.map((c: any) => ({...c, id: String(c.id)})));
        }
      } catch (e) { console.error("Backend Error:", e); }
    } else {
      // SIMULATION
      const stored = localStorage.getItem('sofia_categories');
      if (stored) setCategories(JSON.parse(stored));
      else setCategories(MOCK_CATEGORIES);
    }
  };

  const fetchOrders = async () => {
   if (USE_BACKEND) {
      try {
        const res = await fetch(`${API_BASE}/orders.php`);
        const data = await res.json();
        if(Array.isArray(data)) {
            // FIX: Map database fields (snake_case) to frontend types (camelCase)
            setOrders(data.map((o: any) => ({
                ...o, 
                id: String(o.id), 
                total: Number(o.total),
                customerName: o.customer_name, // Map DB column to Frontend key
                date: o.created_at,            // Map DB column to Frontend key
                items: o.items || []           // Allow items from DB
            })));
        }
      } catch (e) { console.error("Backend Error:", e); }
    } else {
      // SIMULATION
      const storedOrders = localStorage.getItem('sofia_orders');
      if (storedOrders) setOrders(JSON.parse(storedOrders));
      else setOrders([]);
    }
  };

  // --- ASSISTANT ---
  const openAssistant = (mode: 'voice' | 'chat' = 'voice') => {
    setAssistantMode(mode);
    setIsAssistantOpen(true);
  };
  
  const closeAssistant = () => setIsAssistantOpen(false);
  const toggleAssistant = () => setIsAssistantOpen(prev => !prev);

  // --- AUTH ---

  const login = async (email: string, password: string) => {
    // Simulate API Login Delay
    if (!USE_BACKEND) await mockNetworkDelay(800); 

    // Determine role (Simple check for demo purposes)
    const role = email.includes('admin') ? 'admin' : 'user';
    const name = email.split('@')[0]; // Extract name from email for demo

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
      // Simulate API Register
      if (!USE_BACKEND) await mockNetworkDelay(1000);

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
    // Trigger UI Modal
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

  // --- ORDERS (TRANSACTIONS) ---

  const clearLastOrder = () => setLastOrder(null);

  const placeOrder = async (details: { name: string; phone: string; address: string }) => {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    if (USE_BACKEND) {
      const res = await fetch(`${API_BASE}/orders.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: details.name,
          phone: details.phone,
          address: details.address,
          items: cart,
          total
        })
      });
      const result = await res.json();
      const newOrder: Order = {
          id: result.id ? result.id.toString() : Date.now().toString(),
          customerName: details.name,
          phone: details.phone,
          address: details.address,
          items: [...cart],
          total: total,
          status: 'pending',
          date: new Date().toISOString(),
          paymentMethod: 'cash_on_delivery'
      };
      clearCart();
      setCheckoutFormData({ name: user?.name || '', phone: '', address: '' });
      setLastOrder(newOrder);
      return newOrder;
    } else {
      // SIMULATION: Transaction
      await mockNetworkDelay(1000); // Simulate processing payment/saving to DB

      const newOrder: Order = {
        id: Date.now().toString(),
        customerName: details.name,
        phone: details.phone,
        address: details.address,
        items: [...cart],
        total: total,
        status: 'pending',
        date: new Date().toISOString(),
        paymentMethod: 'cash_on_delivery'
      };
      
      // Read Latest DB State
      const currentOrders = JSON.parse(localStorage.getItem('sofia_orders') || '[]');
      const updatedOrders = [newOrder, ...currentOrders];
      
      // Write DB
      localStorage.setItem('sofia_orders', JSON.stringify(updatedOrders));
      
      // Update UI
      setOrders(updatedOrders);
      clearCart();
      setCheckoutFormData({ name: user?.name || '', phone: '', address: '' });
      setLastOrder(newOrder); // This triggers success screen
      return newOrder;
    }
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    if (USE_BACKEND) {
      await fetch(`${API_BASE}/orders.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      fetchOrders();
    } else {
      // SIMULATION: Transaction
      await mockNetworkDelay(500);

      const currentOrders = JSON.parse(localStorage.getItem('sofia_orders') || '[]');
      const updated = currentOrders.map((o: Order) => o.id === id ? { ...o, status } : o);
      
      localStorage.setItem('sofia_orders', JSON.stringify(updated));
      setOrders(updated);
    }
  };

  // --- PRODUCT MANAGEMENT (ADMIN TRANSACTIONS) ---

  const addProduct = async (product: Product) => {
    if (USE_BACKEND) {
      await fetch(`${API_BASE}/products.php`, {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(product)
      });
      fetchProducts();
    } else {
      // SIMULATION
      await mockNetworkDelay(600);
      
      const currentProducts = JSON.parse(localStorage.getItem('sofia_products') || '[]');
      const newProduct = { ...product, id: Date.now().toString() };
      const updated = [...currentProducts, newProduct];
      
      localStorage.setItem('sofia_products', JSON.stringify(updated));
      setProducts(updated);
    }
  };

  const importProducts = async (newProducts: Product[]) => {
    if (USE_BACKEND) {
     // 1. Extract unique names from the import list
        const uniqueCats = [...new Set(newProducts.map(p => p.category).filter(Boolean))];
        const uniqueBrands = [...new Set(newProducts.map(p => p.brand).filter(Boolean))];

        // 2. Get currently existing names from Store state
        const existingCatNames = categories.filter(c => c.type === 'category').map(c => c.name);
        const existingBrandNames = categories.filter(c => c.type === 'brand').map(c => c.name);

        // 3. Create missing CATEGORIES
        for (const catName of uniqueCats) {
            if (!existingCatNames.includes(catName)) {
                console.log(`Auto-creating category: ${catName}`);
                await addCategory({ id: '', name: catName, type: 'category' });
            }
        }

        // 4. Create missing BRANDS
        for (const brandName of uniqueBrands) {
            if (!existingBrandNames.includes(brandName)) {
                console.log(`Auto-creating brand: ${brandName}`);
                await addCategory({ id: '', name: brandName, type: 'brand' });
            }
        }
        // --- FIX END ---

        // 5. Add the products
        for(const p of newProducts) {
             await addProduct(p);
        }
        
        // 6. Refresh data to show new filters immediately
        await fetchCategories();
        await fetchProducts();
    } else {
        // SIMULATION
        await mockNetworkDelay(1500); // Bulk import takes longer

        const currentProducts = JSON.parse(localStorage.getItem('sofia_products') || '[]');
        const updated = [...currentProducts, ...newProducts];
        
        localStorage.setItem('sofia_products', JSON.stringify(updated));
        setProducts(updated);
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    if (USE_BACKEND) {
      await fetch(`${API_BASE}/products.php`, {
        method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({...updates, id})
      });
      fetchProducts();
    } else {
       // SIMULATION
       await mockNetworkDelay(500);

       const currentProducts = JSON.parse(localStorage.getItem('sofia_products') || '[]');
       const updated = currentProducts.map((p: Product) => p.id === id ? { ...p, ...updates } : p);
       
       localStorage.setItem('sofia_products', JSON.stringify(updated));
       setProducts(updated);
    }
  };

  const deleteProduct = async (id: string) => {
    if (USE_BACKEND) {
      await fetch(`${API_BASE}/products.php?id=${id}`, { method: 'DELETE' });
      fetchProducts();
    } else {
       // SIMULATION
       await mockNetworkDelay(400);

       const currentProducts = JSON.parse(localStorage.getItem('sofia_products') || '[]');
       const updated = currentProducts.filter((p: Product) => p.id !== id);
       
       localStorage.setItem('sofia_products', JSON.stringify(updated));
       setProducts(updated);
    }
  };

  const addCategory = async (item: CategoryItem) => {
    if (USE_BACKEND) {
      await fetch(`${API_BASE}/categories.php`, {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(item)
      });
      fetchCategories();
    } else {
       // SIMULATION
       await mockNetworkDelay(400);

       const currentCats = JSON.parse(localStorage.getItem('sofia_categories') || '[]');
       const newItem = { ...item, id: Date.now().toString() };
       const updated = [...currentCats, newItem];
       
       localStorage.setItem('sofia_categories', JSON.stringify(updated));
       setCategories(updated);
    }
  };

  const deleteCategory = async (id: string) => {
    if (USE_BACKEND) {
      await fetch(`${API_BASE}/categories.php?id=${id}`, { method: 'DELETE' });
      fetchCategories();
    } else {
       // SIMULATION
       await mockNetworkDelay(400);

       const currentCats = JSON.parse(localStorage.getItem('sofia_categories') || '[]');
       const updated = currentCats.filter((c: CategoryItem) => c.id !== id);
       
       localStorage.setItem('sofia_categories', JSON.stringify(updated));
       setCategories(updated);
    }
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