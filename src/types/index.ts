// ===== User Roles =====
export type UserRole = "admin" | "merchant" | "customer";

export interface User {
  id: string;
  walletAddress: string;
  role: UserRole;
  name: string;
  email: string;
  createdAt: string;
  isActive: boolean;
}

// ===== Merchant =====
export type MerchantStatus = "pending" | "approved" | "rejected";

export interface Merchant extends User {
  role: "merchant";
  businessName: string;
  description: string;
  cuisine: string;
  location: string;
  logo: string;
  status: MerchantStatus;
  phone: string;
}

// ===== Customer =====
export interface Customer extends User {
  role: "customer";
  ownedMemberships: string[];
}

// ===== Membership Plan =====
export interface MembershipPlan {
  id: string;
  merchantId: string;
  merchantName: string;
  title: string;
  description: string;
  price: number; // in ETH
  duration: number; // days
  benefits: string[];
  maxSupply: number;
  sold: number;
  isActive: boolean;
  createdAt: string;
  tokenId?: string;
}

// ===== Purchased Membership =====
export interface OwnedMembership {
  id: string;
  planId: string;
  customerId: string;
  merchantId: string;
  merchantName: string;
  planTitle: string;
  purchaseDate: string;
  expiryDate: string;
  txHash: string;
  tokenId: string;
  isValid: boolean;
}

// ===== Advertisement =====
export interface Ad {
  id: string;
  merchantId: string;
  title: string;
  description: string;
  imageUrl: string;
  planId: string;
  isActive: boolean;
  createdAt: string;
}

// ===== Announcement =====
export interface Announcement {
  id: string;
  merchantId: string;
  merchantName: string;
  title: string;
  content: string;
  createdAt: string;
}

// ===== Transaction =====
export interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  txHash: string;
  planId: string;
  planTitle: string;
  timestamp: string;
  status: "confirmed" | "pending" | "failed";
}

// ===== Dispute =====
export type DisputeStatus = "open" | "investigating" | "resolved" | "dismissed";

export interface Dispute {
  id: string;
  customerId: string;
  merchantId: string;
  customerName: string;
  merchantName: string;
  subject: string;
  description: string;
  txHash: string;
  status: DisputeStatus;
  resolution?: string;
  createdAt: string;
  resolvedAt?: string;
}

// ===== Analytics =====
export interface PlatformAnalytics {
  totalUsers: number;
  totalMerchants: number;
  totalCustomers: number;
  totalTransactions: number;
  totalRevenue: number;
  pendingApprovals: number;
  activeDisputes: number;
  monthlyData: { month: string; revenue: number; transactions: number }[];
}

export interface MerchantAnalytics {
  totalSales: number;
  totalRevenue: number;
  activeMemberships: number;
  totalCustomers: number;
  planPerformance: { planTitle: string; sold: number; revenue: number }[];
  monthlySales: { month: string; sales: number; revenue: number }[];
}
