import { create } from "zustand";
import { ethers } from "ethers";
import {
  FOODLEDGER_ADDRESS,
  FOODLEDGER_ABI,
  Role,
} from "@/contracts/FoodLedger";
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
import { mockDisputes, mockAds, mockAnnouncements } from "./mockData";

interface AppState {
  // Auth
  currentUser: User | null;
  isWalletConnected: boolean;
  walletAddress: string | null;
  onChainRole: Role;
  isLoading: boolean;
  connectWallet: () => Promise<string | null>;
  checkOnChainRole: (address: string) => Promise<Role>;
  registerOnChain: (
    role: "merchant" | "customer",
    name: string,
  ) => Promise<boolean>;
  logout: () => void;

  // On-chain data loader
  loadOnChainData: () => Promise<void>;

  // Merchant registration approval (on-chain)
  pendingMerchantRegistrations: Array<{
    id: number;
    merchant: string;
    name: string;
    status: number;
    requestedAt: number;
  }>;
  approveMerchantOnChain: (registrationId: number) => Promise<boolean>;
  rejectMerchantOnChain: (registrationId: number) => Promise<boolean>;
  loadPendingMerchants: () => Promise<void>;

  // Keep existing mock data for UI parts not yet on-chain
  merchants: Merchant[];
  approveMerchant: (id: string) => void;
  rejectMerchant: (id: string) => void;
  updateMerchant: (id: string, data: Partial<Merchant>) => void;
  registerMerchant: (
    data: Omit<Merchant, "id" | "role" | "status" | "createdAt" | "isActive">,
  ) => void;
  customers: Customer[];
  plans: MembershipPlan[];
  createPlan: (
    plan: Omit<MembershipPlan, "id" | "sold" | "createdAt">,
  ) => Promise<void>;
  togglePlan: (id: string) => Promise<void>;
  ownedMemberships: OwnedMembership[];
  purchaseMembership: (planId: string) => Promise<void>;
  ads: Ad[];
  createAd: (ad: Omit<Ad, "id" | "createdAt">) => void;
  toggleAd: (id: string) => void;
  announcements: Announcement[];
  createAnnouncement: (a: Omit<Announcement, "id" | "createdAt">) => void;
  transactions: Transaction[];
  disputes: Dispute[];
  updateDisputeStatus: (
    id: string,
    status: DisputeStatus,
    resolution?: string,
  ) => void;
}

// Helper: load pending merchant registrations from the blockchain
async function loadPendingMerchantsFromChain(): Promise<
  Array<{
    id: number;
    merchant: string;
    name: string;
    status: number;
    requestedAt: number;
  }>
> {
  const contract = await getContract();
  if (!contract) return [];

  try {
    const pendingIds = await contract.getPendingMerchantRegistrations();
    const pendingMerchants = [];

    for (const regId of pendingIds) {
      const reg = await contract.getMerchantRegistration(Number(regId));
      pendingMerchants.push({
        id: Number(regId),
        merchant: reg.merchant.toLowerCase(),
        name: reg.name,
        status: Number(reg.status),
        requestedAt: Number(reg.requestedAt),
      });
    }

    return pendingMerchants;
  } catch (err) {
    console.error("Failed to load pending merchants:", err);
    return [];
  }
}

// Helper: load all plans and purchases from the blockchain
async function loadAllPlansFromChain(): Promise<MembershipPlan[]> {
  const contract = await getContract();
  if (!contract) return [];
  const totalPlans = Number(await contract.getTotalPlans());
  const plans: MembershipPlan[] = [];
  for (let i = 0; i < totalPlans; i++) {
    const p = await contract.getPlan(i);
    const merchantUser = await contract.getUser(p.merchant);
    plans.push({
      id: `plan-${i}`,
      merchantId: p.merchant.toLowerCase(),
      merchantName: merchantUser.name || p.merchant.slice(0, 10),
      title: p.title,
      description: p.description,
      price: parseFloat(ethers.formatEther(p.priceInWei)),
      duration: Number(p.durationDays),
      benefits: p.description ? [p.description] : [],
      maxSupply: Number(p.maxSupply),
      sold: Number(p.sold),
      isActive: p.isActive,
      createdAt: new Date().toISOString(),
    });
  }
  return plans;
}

async function loadAllPurchasesFromChain(): Promise<{
  memberships: OwnedMembership[];
  transactions: Transaction[];
}> {
  const contract = await getContract();
  if (!contract) return { memberships: [], transactions: [] };
  const totalPurchases = Number(await contract.getTotalPurchases());
  const memberships: OwnedMembership[] = [];
  const transactions: Transaction[] = [];
  for (let i = 0; i < totalPurchases; i++) {
    const purchase = await contract.getPurchase(i);
    const plan = await contract.getPlan(Number(purchase.planId));
    const merchantUser = await contract.getUser(purchase.merchant);
    const merchantName = merchantUser.name || purchase.merchant.slice(0, 10);
    const amountEth = parseFloat(ethers.formatEther(purchase.amountPaid));
    memberships.push({
      id: `om-${i}`,
      planId: `plan-${Number(purchase.planId)}`,
      customerId: purchase.buyer.toLowerCase(),
      merchantId: purchase.merchant.toLowerCase(),
      merchantName,
      planTitle: plan.title,
      purchaseDate: new Date(Number(purchase.purchasedAt) * 1000).toISOString(),
      expiryDate: new Date(Number(purchase.expiresAt) * 1000).toISOString(),
      txHash: `0x${i.toString(16).padStart(64, "0")}`,
      tokenId: `${i}`,
      isValid: Date.now() / 1000 <= Number(purchase.expiresAt),
    });
    transactions.push({
      id: `tx-${i}`,
      from: purchase.buyer.toLowerCase(),
      to: purchase.merchant.toLowerCase(),
      amount: amountEth,
      txHash: `0x${i.toString(16).padStart(64, "0")}`,
      planId: `plan-${Number(purchase.planId)}`,
      planTitle: plan.title,
      timestamp: new Date(Number(purchase.purchasedAt) * 1000).toISOString(),
      status: "confirmed",
    });
  }
  return { memberships, transactions };
}

// Helper: get ethers provider and signer
function getProvider() {
  if (typeof window === "undefined") return null;
  const ethereum = (window as unknown as { ethereum?: ethers.Eip1193Provider })
    .ethereum;
  if (!ethereum) return null;
  return new ethers.BrowserProvider(ethereum);
}

async function getContract(withSigner = false) {
  const provider = getProvider();
  if (!provider) return null;
  if (withSigner) {
    const signer = await provider.getSigner();
    return new ethers.Contract(FOODLEDGER_ADDRESS, FOODLEDGER_ABI, signer);
  }
  return new ethers.Contract(FOODLEDGER_ADDRESS, FOODLEDGER_ABI, provider);
}

export const useStore = create<AppState>((set, get) => ({
  // Auth
  currentUser: null,
  isWalletConnected: false,
  walletAddress: null,
  onChainRole: Role.None,
  isLoading: false,

  // Pending merchant registrations
  pendingMerchantRegistrations: [],

  connectWallet: async () => {
    if (typeof window === "undefined") return null;
    const ethereum = (
      window as unknown as {
        ethereum?: { request: (args: { method: string }) => Promise<string[]> };
      }
    ).ethereum;

    // Wait for MetaMask injection
    if (!ethereum) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const retry = (
        window as unknown as {
          ethereum?: {
            request: (args: { method: string }) => Promise<string[]>;
          };
        }
      ).ethereum;
      if (!retry) {
        alert("MetaMask is not detected. Please install MetaMask and refresh.");
        return null;
      }
    }

    const eth = (
      window as unknown as {
        ethereum: { request: (args: { method: string }) => Promise<string[]> };
      }
    ).ethereum;

    try {
      set({ isLoading: true });
      const accounts = await eth.request({ method: "eth_requestAccounts" });
      const address = accounts[0];
      set({ isWalletConnected: true, walletAddress: address });

      // Check on-chain role
      const role = await get().checkOnChainRole(address);
      set({ onChainRole: role, isLoading: false });

      // If already registered, auto-login
      if (role !== Role.None) {
        const contract = await getContract();
        if (contract) {
          const user = await contract.getUser(address);
          const userName = user.name || `User ${address.slice(0, 6)}`;
          const roleMap: Record<number, UserRole> = {
            1: "admin",
            2: "merchant",
            3: "customer",
          };
          const userRole = roleMap[role] || "customer";

          if (userRole === "merchant") {
            set({
              currentUser: {
                id: address,
                walletAddress: address,
                role: "merchant",
                name: userName,
                businessName: userName,
                description: "",
                cuisine: "",
                location: "",
                logo: "",
                email: "",
                phone: "",
                status: "approved",
                createdAt: new Date().toISOString(),
                isActive: true,
              } as Merchant,
            });
          } else if (userRole === "customer") {
            set({
              currentUser: {
                id: address,
                walletAddress: address,
                role: "customer",
                name: userName,
                email: "",
                createdAt: new Date().toISOString(),
                isActive: true,
                ownedMemberships: [],
              } as Customer,
            });
          } else {
            set({
              currentUser: {
                id: address,
                walletAddress: address,
                role: "admin",
                name: userName,
                email: "",
                createdAt: new Date().toISOString(),
                isActive: true,
              },
            });
          }
        }
      }

      // After login, load on-chain data
      if (role !== Role.None) {
        await get().loadOnChainData();
      }

      return address;
    } catch {
      console.error("Wallet connection failed");
      set({ isLoading: false });
      return null;
    }
  },

  checkOnChainRole: async (address: string) => {
    try {
      const contract = await getContract();
      if (!contract) return Role.None;
      const user = await contract.getUser(address);
      return Number(user.role) as Role;
    } catch {
      return Role.None;
    }
  },

  registerOnChain: async (role, name) => {
    try {
      set({ isLoading: true });
      const contract = await getContract(true);
      if (!contract) return false;

      let tx;
      if (role === "merchant") {
        tx = await contract.registerAsMerchant(name);
      } else {
        tx = await contract.registerAsCustomer(name);
      }
      await tx.wait();

      // After registration, set user and load data
      const address = get().walletAddress!;
      if (role === "merchant") {
        // For merchants, they're now in pending status
        set({
          onChainRole: Role.Merchant,
          currentUser: {
            id: address,
            walletAddress: address,
            role: "merchant",
            name,
            businessName: name,
            description: "",
            cuisine: "",
            location: "",
            logo: "",
            email: "",
            phone: "",
            status: "pending",
            createdAt: new Date().toISOString(),
            isActive: true,
          } as Merchant,
          isLoading: false,
        });
        // Load pending merchants to show the new request
        await get().loadPendingMerchants();
      } else {
        set({
          onChainRole: Role.Customer,
          currentUser: {
            id: address,
            walletAddress: address,
            role: "customer",
            name,
            email: "",
            createdAt: new Date().toISOString(),
            isActive: true,
            ownedMemberships: [],
          } as Customer,
          isLoading: false,
        });
        // Load on-chain data for customers
        await get().loadOnChainData();
      }
      return true;
    } catch (err) {
      console.error("Registration failed:", err);
      set({ isLoading: false });
      return false;
    }
  },

  logout: () =>
    set({
      currentUser: null,
      isWalletConnected: false,
      walletAddress: null,
      onChainRole: Role.None,
      plans: [],
      ownedMemberships: [],
      transactions: [],
    }),

  // Load all on-chain data (plans, purchases, merchants, customers)
  loadOnChainData: async () => {
    try {
      const contract = await getContract();
      if (!contract) return;

      const [
        plans,
        { memberships, transactions },
        merchantAddrs,
        customerAddrs,
        pendingMerchants,
      ] = await Promise.all([
        loadAllPlansFromChain(),
        loadAllPurchasesFromChain(),
        contract.getAllMerchants(),
        contract.getAllCustomers(),
        loadPendingMerchantsFromChain(),
      ]);

      // Build merchant list from on-chain data
      const merchants: Merchant[] = [];
      for (const addr of merchantAddrs) {
        const u = await contract.getUser(addr);
        const lowerAddr = addr.toLowerCase();
        merchants.push({
          id: lowerAddr,
          walletAddress: lowerAddr,
          role: "merchant",
          name: u.name,
          businessName: u.name,
          description: "",
          cuisine: "",
          location: "",
          logo: "",
          email: "",
          phone: "",
          status: "approved" as MerchantStatus,
          createdAt: new Date(Number(u.registeredAt) * 1000).toISOString(),
          isActive: u.isActive,
        });
      }

      // Build customer list from on-chain data
      const customers: Customer[] = [];
      for (const addr of customerAddrs) {
        const u = await contract.getUser(addr);
        const lowerAddr = addr.toLowerCase();
        customers.push({
          id: lowerAddr,
          walletAddress: lowerAddr,
          role: "customer",
          name: u.name,
          email: "",
          createdAt: new Date(Number(u.registeredAt) * 1000).toISOString(),
          isActive: u.isActive,
          ownedMemberships: memberships
            .filter((m) => m.customerId.toLowerCase() === addr.toLowerCase())
            .map((m) => m.id),
        });
      }

      set({
        plans,
        ownedMemberships: memberships,
        transactions,
        merchants,
        customers,
        pendingMerchantRegistrations: pendingMerchants,
      });
    } catch (err) {
      console.error("Failed to load on-chain data:", err);
    }
  },

  // Load pending merchant registrations
  loadPendingMerchants: async () => {
    try {
      const pendingMerchants = await loadPendingMerchantsFromChain();
      set({ pendingMerchantRegistrations: pendingMerchants });
    } catch (err) {
      console.error("Failed to load pending merchants:", err);
    }
  },

  // Approve a merchant registration on-chain
  approveMerchantOnChain: async (registrationId: number) => {
    try {
      set({ isLoading: true });
      const contract = await getContract(true);
      if (!contract) {
        set({ isLoading: false });
        return false;
      }

      const tx = await contract.approveMerchantRegistration(registrationId);
      await tx.wait();

      // Reload pending merchants and general data
      await get().loadPendingMerchants();
      await get().loadOnChainData();

      set({ isLoading: false });
      return true;
    } catch (err) {
      console.error("Failed to approve merchant:", err);
      set({ isLoading: false });
      return false;
    }
  },

  // Reject a merchant registration on-chain
  rejectMerchantOnChain: async (registrationId: number) => {
    try {
      set({ isLoading: true });
      const contract = await getContract(true);
      if (!contract) {
        set({ isLoading: false });
        return false;
      }

      const tx = await contract.rejectMerchantRegistration(registrationId);
      await tx.wait();

      // Reload pending merchants
      await get().loadPendingMerchants();

      set({ isLoading: false });
      return true;
    } catch (err) {
      console.error("Failed to reject merchant:", err);
      set({ isLoading: false });
      return false;
    }
  },

  // === Existing mock data (unchanged) ===
  merchants: [],
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
  customers: [],
  plans: [],
  createPlan: async (plan) => {
    try {
      set({ isLoading: true });
      const contract = await getContract(true);
      if (!contract) {
        set({ isLoading: false });
        return;
      }
      const priceInWei = ethers.parseEther(plan.price.toString());
      const tx = await contract.createPlan(
        plan.title,
        plan.description,
        priceInWei,
        plan.duration,
        plan.maxSupply,
      );
      await tx.wait();
      // Reload plans from chain
      const plans = await loadAllPlansFromChain();
      set({ plans, isLoading: false });
    } catch (err) {
      console.error("Create plan failed:", err);
      set({ isLoading: false });
    }
  },
  togglePlan: async (id) => {
    try {
      const planIndex = parseInt(id.replace("plan-", ""));
      const contract = await getContract(true);
      if (!contract) return;
      const tx = await contract.togglePlan(planIndex);
      await tx.wait();
      const plans = await loadAllPlansFromChain();
      set({ plans });
    } catch (err) {
      console.error("Toggle plan failed:", err);
    }
  },
  ownedMemberships: [],
  purchaseMembership: async (planId) => {
    try {
      set({ isLoading: true });
      const state = get();
      const plan = state.plans.find((p) => p.id === planId);
      if (!plan || !state.currentUser) {
        set({ isLoading: false });
        return;
      }
      const planIndex = parseInt(planId.replace("plan-", ""));
      const contract = await getContract(true);
      if (!contract) {
        set({ isLoading: false });
        return;
      }
      const priceInWei = ethers.parseEther(plan.price.toString());
      const tx = await contract.purchaseMembership(planIndex, {
        value: priceInWei,
      });
      await tx.wait();
      // Reload all data
      const [plans, { memberships, transactions }] = await Promise.all([
        loadAllPlansFromChain(),
        loadAllPurchasesFromChain(),
      ]);
      set({
        plans,
        ownedMemberships: memberships,
        transactions,
        isLoading: false,
      });
    } catch (err) {
      console.error("Purchase failed:", err);
      alert(
        "Purchase failed. Make sure you have enough ETH and are connected to the right network.",
      );
      set({ isLoading: false });
    }
  },
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
  announcements: mockAnnouncements,
  createAnnouncement: (a) =>
    set((s) => ({
      announcements: [
        ...s.announcements,
        { ...a, id: `ann-${Date.now()}`, createdAt: new Date().toISOString() },
      ],
    })),
  transactions: [],
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
