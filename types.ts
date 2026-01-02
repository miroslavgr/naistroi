export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  image: string;
  description: string;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'delivered' | 'cancelled';
  date: string;
  paymentMethod: 'cash_on_delivery';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: 'user' | 'admin';
}

export interface CategoryItem {
  id: string;
  name: string;
  type: 'category' | 'brand';
}

export interface CheckoutFormData {
  name: string;
  phone: string;
  address: string;
}

export enum Page {
  HOME = 'HOME',
  CATALOG = 'CATALOG',
  PRODUCT = 'PRODUCT',
  CART = 'CART',
  CHECKOUT = 'CHECKOUT',
  LOGIN = 'LOGIN',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  ADMIN_PRODUCTS = 'ADMIN_PRODUCTS',
  ADMIN_ORDERS = 'ADMIN_ORDERS',
}

// Audio Types
export interface AudioBlob {
  data: string;
  mimeType: string;
}