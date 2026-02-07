export enum UserRole {
  ADMIN = 'admin',
  INTERNAL_USER = 'internal',
  CUSTOMER = 'customer'
}

export enum SubscriptionStatus {
  DRAFT = 'Draft',
  QUOTATION = 'Quotation',
  CONFIRMED = 'Confirmed',
  ACTIVE = 'Active',
  CLOSED = 'Closed'
}

export enum InvoiceStatus {
  DRAFT = 'Draft',
  CONFIRMED = 'Confirmed',
  PAID = 'Paid',
  OVERDUE = 'Overdue',
  CANCELLED = 'Cancelled'
}

export enum PaymentStatus {
  SUCCEEDED = 'succeeded',
  PENDING = 'pending',
  FAILED = 'failed'
}

// Database Interfaces

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  type: string;
  sales_price: number;
  cost_price: number;
  supports_recurring: boolean;
  is_deleted: boolean;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  attribute: string;
  value: string;
  extra_price: number;
  created_at: string;
}

export interface RecurringPlan {
  id: string;
  name: string;
  price: number;
  billing_period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  min_quantity: number;
  start_date?: string;
  end_date?: string;
  auto_close: boolean;
  pausable: boolean;
  renewable: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  subscription_number: string;
  customer_id: string;
  plan_id?: string;
  start_date: string;
  end_date?: string;
  status: SubscriptionStatus;
  created_at: string;
  // Joins
  plans?: RecurringPlan;
  items?: SubscriptionItem[];
}

export interface SubscriptionItem {
  id: string;
  subscription_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  tax_amount: number;
  amount: number;
  created_at: string;
  // Joins
  products?: Product;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  subscription_id?: string;
  customer_id: string;
  issue_date: string;
  due_date?: string;
  subtotal: number;
  tax_total: number;
  discount_total: number;
  total_amount: number;
  paid_amount: number;
  balance: number;
  status: InvoiceStatus;
  created_at: string;
  // Joins
  items?: InvoiceItem[];
  subscriptions?: Subscription;
  profiles?: { full_name: string }; // Assuming profiles might exist or joined via users
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  created_at: string;
}

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  status: PaymentStatus;
  reference_id?: string;
  created_at: string;
  // Joins
  invoices?: Invoice;
}

export interface Discount {
  id: string;
  name: string;
  type: 'fixed' | 'percentage';
  value: number;
  min_purchase: number;
  min_quantity: number;
  start_date: string;
  end_date?: string;
  usage_limit?: number;
  applies_to: 'product' | 'subscription';
  created_at: string;
}

export interface Tax {
  id: string;
  name: string;
  percentage: number;
  type: string;
  created_at: string;
}
