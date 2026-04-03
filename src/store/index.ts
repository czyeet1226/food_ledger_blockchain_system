import { create } from "zustand";
import type {
  User,
  Merchant,
  Customer,
  MembershipPlan,
  OwnedMembership,
  Ad,
  Announcement,
  Transaction,
  Dispute,
  UserRole,
  MerchantStatus,
  DisputeStatus,
} from "@/types";
import {
  mockMerchants,
  mockPlans,
  mockTransactions,
  mockDisputes,
  mockAds,
  mockAnnouncements,
  mockCustomers,
  mockOwnedMemberships,
} from "./mockData";

interface AppState {
  // Auth
  currentUser: User | null;
  isWalletConnected: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
  connectWallet: () => void;

  // Merchants
  merchants: Merchant[];
  approveMerchant: (id: string) => void;
  rejectMerchant: (id: string) => void;
  updateMerchant: (id: string, data: Partial<Merchant>) => void;
  registerMerchant: (
    data: Omit<Merchant, "id" | "role" | "status" | "createdAt" | "isActive">,
  ) => void;

  // Customers
  customers: Customer[];

  // Plans
  plans: MembershipPlan[];
  createPlan: (plan: Omit<MembershipPlan, "id" | "sold" | "createdAt">) => void;
  togglePlan: (id: string) => void;

  // Owned Memberships
  ownedMemberships: OwnedMembership[];
  purchaseMembership: (planId: string) => void;

  // Ads
  ads: Ad[];
  createAd: (ad: Omit<Ad, "id" | "createdAt">) => void;
  toggleAd: (id: string) => void;

  // Announcements
  announcements: Announcement[];
  createAnnouncement: (a: Omit<Announcement, "id" | "createdAt">) => void;

  // Transactions
  transactions: Transaction[];

  // Disputes
  disputes: Dispute[];
  updateDisputeStatus: (
    id: string,
    status: DisputeStatus,
    resolution?: string,
  ) => void;
}

const adminUser: User = {
  id: "admin-1",
  walletAddress: "0xADMIN...1234",
  role: "admin",
  name: "Platform Admin",
  email: "admin@foodledger.io",
  createdAt: "2025-01-01",
  isActive: true,
};

const merchantUser: Merchant = {
  id: "merchant-1",
  walletAddress: "0xMERCH...5678",
  role: "merchant",
  name: "John's Kitchen",
  businessName: "John's Kitchen",
  description: "Farm-to-table dining experience",
  cuisine: "American",
  location: "123 Main St, New York",
  logo: "",
  email: "john@kitchen.com",
  phone: "+1-555-0100",
  status: "approved",
  createdAt: "2025-02-01",
  isActive: true,
};

const customerUser: Customer = {
  id: "customer-1",
  walletAddress: "0xCUST...9012",
  role: "customer",
  name: "Alice Smith",
  email: "alice@email.com",
  createdAt: "2025-03-01",
  isActive: true,
  ownedMemberships: ["om-1", "om-2"],
};

export const useStore = create<AppState>((set, get) => ({
  // Auth
  currentUser: null,
  isWalletConnected: false,
  login: (role) => {
    const user =
      role === "admin"
        ? adminUser
        : role === "merchant"
          ? merchantUser
          : customerUser;
    set({ currentUser: user, isWalletConnected: true });
  },
  logout: () => set({ currentUser: null, isWalletConnected: false }),
  connectWallet: () => set({ isWalletConnected: true }),

  // Merchants
  merchants: mockMerchants,
  approveMerchant: (id) =>
    set((s) => ({
      merchants: s.merchants.map((m) =>
        m.id === id ? { ...m, status: "approved" as MerchantStatus } : m,
      ),
    })),
  rejectMerchant: (id) =>
    set((s) => ({
      merchants: s.merchants.map((m) =>
        m.id === id ? { ...m, status: "rejected" as MerchantStatus } : m,
      ),
    })),
  updateMerchant: (id, data) =>
    set((s) => ({
      merchants: s.merchants.map((m) => (m.id === id ? { ...m, ...data } : m)),
    })),
  registerMerchant: (data) =>
    set((s) => ({
      merchants: [
        ...s.merchants,
        {
          ...data,
          id: `merchant-${Date.now()}`,
          role: "merchant" as const,
          status: "pending" as MerchantStatus,
          createdAt: new Date().toISOString(),
          isActive: true,
        },
      ],
    })),

  // Customers
  customers: mockCustomers,

  // Plans
  plans: mockPlans,
  createPlan: (plan) =>
    set((s) => ({
      plans: [
        ...s.plans,
        {
          ...plan,
          id: `plan-${Date.now()}`,
          sold: 0,
          createdAt: new Date().toISOString(),
        },
      ],
    })),
  togglePlan: (id) =>
    set((s) => ({
      plans: s.plans.map((p) =>
        p.id === id ? { ...p, isActive: !p.isActive } : p,
      ),
    })),

  // Owned Memberships
  ownedMemberships: mockOwnedMemberships,
  purchaseMembership: (planId) => {
    const state = get();
    const plan = state.plans.find((p) => p.id === planId);
    if (!plan || !state.currentUser) return;
    const now = new Date();
    const expiry = new Date(now.getTime() + plan.duration * 86400000);
    const om: OwnedMembership = {
      id: `om-${Date.now()}`,
      planId,
      customerId: state.currentUser.id,
      merchantId: plan.merchantId,
      merchantName: plan.merchantName,
      planTitle: plan.title,
      purchaseDate: now.toISOString(),
      expiryDate: expiry.toISOString(),
      txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
      tokenId: `${Date.now()}`,
      isValid: true,
    };
    const tx: Transaction = {
      id: `tx-${Date.now()}`,
      from: state.currentUser.walletAddress,
      to: plan.merchantId,
      amount: plan.price,
      txHash: om.txHash,
      planId,
      planTitle: plan.title,
      timestamp: now.toISOString(),
      status: "confirmed",
    };
    set((s) => ({
      ownedMemberships: [...s.ownedMemberships, om],
      transactions: [...s.transactions, tx],
      plans: s.plans.map((p) =>
        p.id === planId ? { ...p, sold: p.sold + 1 } : p,
      ),
    }));
  },

  // Ads
  ads: mockAds,
  createAd: (ad) =>
    set((s) => ({
      ads: [
        ...s.ads,
        { ...ad, id: `ad-${Date.now()}`, createdAt: new Date().toISOString() },
      ],
    })),
  toggleAd: (id) =>
    set((s) => ({
      ads: s.ads.map((a) =>
        a.id === id ? { ...a, isActive: !a.isActive } : a,
      ),
    })),

  // Announcements
  announcements: mockAnnouncements,
  createAnnouncement: (a) =>
    set((s) => ({
      announcements: [
        ...s.announcements,
        { ...a, id: `ann-${Date.now()}`, createdAt: new Date().toISOString() },
      ],
    })),

  // Transactions
  transactions: mockTransactions,

  // Disputes
  disputes: mockDisputes,
  updateDisputeStatus: (id, status, resolution) =>
    set((s) => ({
      disputes: s.disputes.map((d) =>
        d.id === id
          ? {
              ...d,
              status,
              resolution: resolution || d.resolution,
              resolvedAt:
                status === "resolved" ? new Date().toISOString() : d.resolvedAt,
            }
          : d,
      ),
    })),
}));
