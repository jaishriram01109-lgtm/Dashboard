export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'returned' | 'cancelled';
export type PaymentMethod = 'razorpay' | 'upi' | 'card' | 'cod' | 'netbanking' | 'emi';
export type CustomerStatus = 'vip' | 'regular' | 'inactive';
export type UserRole = 'super_admin' | 'store_manager' | 'inventory_manager' | 'support_agent' | 'analyst';

export interface OrderItem {
  name: string;
  size: string;
  qty: number;
  price: number;
  color?: string;
}

export interface Order {
  id: string;
  customer: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  payment: PaymentMethod;
  date: string;
  tracking: string | null;
  courier: string | null;
  address?: string;
  notes?: string;
  gst?: number;
  shipping?: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  totalOrders: number;
  totalSpent: number;
  joinDate: string;
  lastOrder: string;
  status: CustomerStatus;
  loyaltyPoints: number;
  avatar?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  collection?: string;
  price: number;
  mrp: number;
  costPrice: number;
  stock: number;
  images: string[];
  rating: number;
  reviews: number;
  status: 'active' | 'draft' | 'archived';
  badge?: string;
  description?: string;
  tags?: string[];
  variants?: ProductVariant[];
  gstRate?: number;
  hsnCode?: string;
  lowStockThreshold?: number;
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  options: { [key: string]: string };
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface AuditLog {
  id: number;
  timestamp: string;
  user: string;
  userId: number;
  role: UserRole;
  action: string;
  details: string;
  ip: string;
  device: string;
  success: boolean;
}

export interface Notification {
  id: number;
  type: 'order' | 'stock' | 'customer' | 'payment' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface DiscountCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrder: number;
  usageCount: number;
  usageLimit: number;
  expiry: string;
  status: 'active' | 'expired' | 'disabled';
}

export interface AdminUser {
  id: number;
  email: string;
  passwordHash: string;
  role: UserRole;
  name: string;
  avatar: string;
  twoFAEnabled: boolean;
  twoFASecret: string;
}

export interface LoginAttemptData {
  attempts: number;
  lastAttempt: number;
  lockedUntil: number | null;
}
