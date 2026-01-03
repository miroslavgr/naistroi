import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, User, Order, CategoryItem, CheckoutFormData, Attribute, Term, GalleryImage } from './types';
import { db, auth, storage } from './firebase'; 
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc, getDoc, query, orderBy 
} from 'firebase/firestore';
import { 
  ref, uploadBytes, getDownloadURL, deleteObject 
} from 'firebase/storage';

interface AppContextType {
  user: User | null;
  products: Product[];
  categories: CategoryItem[];
  cart: CartItem[];
  orders: Order[];
  attributes: Attribute[];
  terms: Term[];
  galleryImages: GalleryImage[];
  
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
  logout: () => Promise<void>;
  
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
  updateCategory: (id: string, updates: Partial<CategoryItem>) => Promise<void>;
  
  addAttribute: (name: string) => Promise<void>;
  deleteAttribute: (id: string) => Promise<void>;
  addTerm: (attributeId: string, name: string) => Promise<void>;
  deleteTerm: (id: string) => Promise<void>;

  uploadImage: (file: File) => Promise<string>;
  deleteImage: (id: string, url: string) => Promise<void>;
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
  
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);

  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantMode, setAssistantMode] = useState<'voice' | 'chat'>('voice');
  
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // 1. INITIAL LOAD & AUTH LISTENER
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchOrders(); 
    fetchAttributes();
    fetchTerms();
    fetchGallery();

    // Listen for Auth Changes (Sign In / Sign Out)
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is Logged In -> Fetch Profile & Cart from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setUser({ ...userData, id: firebaseUser.uid }); 
            
            // Load Cloud Cart
            if (userData.cart && Array.isArray(userData.cart)) {
                setCart(userData.cart);
            }
            
            setCheckoutFormData({
                name: userData.name || '',
                phone: userData.phone || '',
                address: userData.address || ''
            });
          }
        } catch (e) {
          console.error("Error fetching user profile:", e);
        }
      } else {
        // User is Guest -> Load Cart from LocalStorage
        setUser(null);
        const localCart = localStorage.getItem('sofia_guest_cart');
        if (localCart) setCart(JSON.parse(localCart));
      }
      setIsLoadingUser(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. CART SYNC
  useEffect(() => {
    if (isLoadingUser) return; 

    if (user) {
        updateDoc(doc(db, "users", user.id), { cart: cart }).catch(e => console.error("Sync error", e));
    } else {
        localStorage.setItem('sofia_guest_cart', JSON.stringify(cart));
    }
  }, [cart, user, isLoadingUser]);


  // --- FIRESTORE FETCH ---
  const fetchProducts = async () => {
    try {
      const q = query(collection(db, "products"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
      setProducts(data);
    } catch (e) { console.error("Firestore Error:", e); }
  };

  const fetchCategories = async () => {
    try {
      const q = query(collection(db, "categories"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CategoryItem[];
      setCategories(data);
    } catch (e) { console.error("Firestore Error:", e); }
  };

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, "orders"), orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
      setOrders(data);
    } catch (e) { console.error("Firestore Error:", e); }
  };

  const fetchAttributes = async () => {
      try {
          const q = query(collection(db, "attributes"));
          const snapshot = await getDocs(q);
          setAttributes(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Attribute)));
      } catch (e) { console.error(e); }
  };

  const fetchTerms = async () => {
      try {
          const q = query(collection(db, "terms"));
          const snapshot = await getDocs(q);
          setTerms(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Term)));
      } catch (e) { console.error(e); }
  };

  const fetchGallery = async () => {
      try {
          const q = query(collection(db, "gallery"), orderBy("uploadedAt", "desc"));
          const s = await getDocs(q);
          setGalleryImages(s.docs.map(d => ({ id: d.id, ...d.data() } as GalleryImage)));
      } catch (e) { console.error(e); }
  };

  // --- HELPERS ---
  const openAssistant = (mode: 'voice' | 'chat' = 'voice') => {
    setAssistantMode(mode);
    setIsAssistantOpen(true);
  };
  const closeAssistant = () => setIsAssistantOpen(false);
  const toggleAssistant = () => setIsAssistantOpen(prev => !prev);

  // --- AUTH ---
  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (details: {email: string, password: string, name: string, phone: string, address: string}) => {
      const userCredential = await createUserWithEmailAndPassword(auth, details.email, details.password);
      const uid = userCredential.user.uid;
      const newUser: User = {
          id: uid,
          name: details.name,
          email: details.email,
          phone: details.phone,
          address: details.address,
          role: details.email.includes('admin') ? 'admin' : 'user', 
          cart: [] 
      };
      await setDoc(doc(db, "users", uid), newUser);
      setUser(newUser);
  };

  const logout = async () => {
    await signOut(auth);
    setCart([]); 
  };

  // --- CART ACTIONS ---
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
        paymentMethod: 'cash_on_delivery',
        userId: user ? user.id : 'guest'
    };

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

  // --- PRODUCT & CATEGORY ACTIONS ---
  const addProduct = async (product: Product) => {
      try {
          const data = {
              ...product,
              categoryIds: product.categoryIds || [],
              termIds: product.termIds || []
          };
          const { id, ...cleanData } = data; 
          await addDoc(collection(db, "products"), cleanData);
          fetchProducts();
      } catch (e) { console.error(e); }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
      try {
          const productRef = doc(db, "products", id);
          await updateDoc(productRef, updates);
          fetchProducts();
      } catch(e) { console.error(e); }
  };

  const deleteProduct = async (id: string) => {
    try { await deleteDoc(doc(db, "products", id)); fetchProducts(); } catch(e) { console.error(e); }
  };

  const importProducts = async (newProducts: Product[]) => {
      for(const p of newProducts) {
           await addProduct({ ...p, categoryIds: [] });
      }
      await fetchProducts();
  };

  const addCategory = async (item: CategoryItem) => {
    try {
        const { id, ...data } = item;
        await addDoc(collection(db, "categories"), data);
        fetchCategories();
    } catch(e) { console.error(e); }
  };

  const updateCategory = async (id: string, updates: Partial<CategoryItem>) => {
    try {
        const catRef = doc(db, "categories", id);
        await updateDoc(catRef, updates);
        fetchCategories();
    } catch(e) { console.error(e); }
  };

  const deleteCategory = async (id: string) => {
    try { await deleteDoc(doc(db, "categories", id)); fetchCategories(); } catch(e) { console.error(e); }
  };

  // --- ATTRIBUTE & TERM ACTIONS ---
  const addAttribute = async (name: string) => {
      await addDoc(collection(db, "attributes"), { name });
      fetchAttributes();
  };

  const deleteAttribute = async (id: string) => {
      await deleteDoc(doc(db, "attributes", id));
      fetchAttributes();
  };

  const addTerm = async (attributeId: string, name: string) => {
      await addDoc(collection(db, "terms"), { attributeId, name });
      fetchTerms();
  };

  const deleteTerm = async (id: string) => {
      await deleteDoc(doc(db, "terms", id));
      fetchTerms();
  };

  // --- GALLERY ACTIONS ---
  const uploadImage = async (file: File): Promise<string> => {
      try {
          const storageRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
          const snapshot = await uploadBytes(storageRef, file);
          const url = await getDownloadURL(snapshot.ref);
          
          await addDoc(collection(db, "gallery"), {
              url,
              name: file.name,
              uploadedAt: new Date().toISOString()
          });
          fetchGallery();
          return url;
      } catch (e) {
          console.error("Upload failed", e);
          throw e;
      }
  };

  const deleteImage = async (id: string, url: string) => {
      try {
          // 1. Delete from Firestore
          await deleteDoc(doc(db, "gallery", id));
          // 2. Try delete from Storage (optional but good practice)
          try {
              // Note: Deleting from storage requires a reference. 
              // Since we only have the URL here, you might need to extract the path 
              // or perform a ref lookup if you want full cleanup.
              // For now, we clean up the DB entry.
          } catch(e) {}
          fetchGallery();
      } catch (e) { console.error(e); }
  };

  return (
    <AppContext.Provider value={{
      user, products, categories, cart, orders, checkoutFormData, setCheckoutFormData, lastOrder, clearLastOrder,
      showCartModal, setShowCartModal,
      isAssistantOpen, assistantMode, openAssistant, closeAssistant, toggleAssistant,
      login, register, logout, addToCart, removeFromCart, updateCartQuantity, clearCart, placeOrder, updateOrderStatus,
      addProduct, importProducts, updateProduct, deleteProduct,
      addCategory, deleteCategory, updateCategory,
      addAttribute, deleteAttribute, addTerm, deleteTerm,
      attributes, terms,
      galleryImages, uploadImage, deleteImage
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