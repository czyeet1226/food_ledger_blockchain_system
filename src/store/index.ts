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
  purchaseMembershipOnChain,
  createMembershipOnChain,
  fetchMembershipsFromBlockchain,
  fetchOwnedMembershipsFromBlockchain,
} from "@/lib/blockchain";

interface AppState {
  // Auth
  currentUser: User | null;
  isWalletConnected: boolean;
  walletAddress: string | null;
  accountChangeListener: ((accounts: string[]) => void) | null;
  chainChangeListener: ((chainId: string) => void) | null;
  connectWallet: () => Promise<string | null>;
  disconnectWallet: () => void;
  loginWithRole: (role: UserRole, walletAddress: string) => void;
  login: (role: UserRole) => void;
  logout: () => void;

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
  createPlan: (plan: Omit<MembershipPlan, "id" | "sold" | "createdAt">) => Promise<void>;
  togglePlan: (id: string) => void;
  loadPlansFromBlockchain: () => Promise<void>;

  // Owned Memberships
  ownedMemberships: OwnedMembership[];
  purchaseMembership: (planId: string) => Promise<void>;
  loadOwnedMembershipsFromBlockchain: () => Promise<void>;

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

export const useStore = create<AppState>((set, get) => ({
  // Auth
  currentUser: null,
  isWalletConnected: false,
  walletAddress: null,
  accountChangeListener: null,
  chainChangeListener: null,

  connectWallet: async () => {
    if (typeof window === "undefined") return null;

    // Wait a bit for MetaMask to inject window.ethereum
    let ethereum = (
      window as unknown as {
        ethereum?: {
          request: (args: { method: string }) => Promise<string[]>,
          on: (event: string, handler: (...args: any[]) => void) => void,
          removeListener: (event: string, handler: (...args: any[]) => void) => void,
        };
      }
    ).ethereum;
    if (!ethereum) {
      // MetaMask may not have injected yet, wait and retry
      await new Promise((resolve) => setTimeout(resolve, 500));
      ethereum = (
        window as unknown as {
          ethereum?: {
            request: (args: { method: string }) => Promise<string[]>,
            on: (event: string, handler: (...args: any[]) => void) => void,
            removeListener: (event: string, handler: (...args: any[]) => void) => void,
          };
        }
      ).ethereum;
    }

    if (!ethereum) {
      alert(
        "MetaMask is not detected. Please make sure the MetaMask extension is installed and enabled, then refresh the page.",
      );
      return null;
    }

    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      const address = accounts[0];
      set({ isWalletConnected: true, walletAddress: address });

      // Remove existing listeners if any
      const currentAccountListener = get().accountChangeListener;
      const currentChainListener = get().chainChangeListener;
      if (currentAccountListener) {
        ethereum.removeListener('accountsChanged', currentAccountListener);
      }
      if (currentChainListener) {
        ethereum.removeListener('chainChanged', currentChainListener);
      }

      // Listen for account changes
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          get().disconnectWallet();
        } else if (accounts[0] !== get().walletAddress) {
          // User switched accounts
          const newAddress = accounts[0];
          set({ walletAddress: newAddress });

          // If there's a current user, log them out since they're on a different account
          const currentUser = get().currentUser;
          if (currentUser) {
            alert(`Account switched to ${newAddress.slice(0, 6)}...${newAddress.slice(-4)}. You have been logged out for security.`);
            get().logout();
          }
        }
      };

      // Listen for network changes
      const handleChainChanged = (chainId: string) => {
        // When network changes, reload the page to ensure contract addresses are correct
        alert(`Network changed to chain ID: ${chainId}. Reloading page...`);
        window.location.reload();
      };

      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);

      set({ accountChangeListener: handleAccountsChanged, chainChangeListener: handleChainChanged });

      return address;
    } catch {
      console.error("User rejected wallet connection");
      return null;
    }
  },

  disconnectWallet: () => {
    const state = get();
    const ethereum = (
      window as unknown as {
        ethereum?: {
          request: (args: { method: string }) => Promise<string[]>,
          on: (event: string, handler: (...args: any[]) => void) => void,
          removeListener: (event: string, handler: (...args: any[]) => void) => void,
        };
      }
    ).ethereum;
    if (state.accountChangeListener && ethereum) {
      ethereum.removeListener('accountsChanged', state.accountChangeListener);
    }
    if (state.chainChangeListener && ethereum) {
      ethereum.removeListener('chainChanged', state.chainChangeListener);
    }
    set({ isWalletConnected: false, walletAddress: null, currentUser: null, accountChangeListener: null, chainChangeListener: null });
  },

  loginWithRole: (role, walletAddress) => {
    const shortAddr = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
    if (role === "admin") {
      set({
        currentUser: {
          id: "admin-1",
          walletAddress,
          role: "admin",
          name: "Platform Admin",
          email: "admin@foodledger.io",
          createdAt: new Date().toISOString(),
          isActive: true,
        },
      });
    } else if (role === "merchant") {
      const merchant: Merchant = {
        id: "merchant-1",
        walletAddress,
        role: "merchant",
        name: `Merchant ${shortAddr}`,
        businessName: "My Restaurant",
        description: "Farm-to-table dining experience",
        cuisine: "International",
        location: "123 Main St",
        logo: "",
        email: "merchant@foodledger.io",
        phone: "+1-555-0100",
        status: "approved",
        createdAt: new Date().toISOString(),
        isActive: true,
      };
      set({ currentUser: merchant });
    } else {
      const customer: Customer = {
        id: "customer-1",
        walletAddress,
        role: "customer",
        name: `User ${shortAddr}`,
        email: "customer@foodledger.io",
        createdAt: new Date().toISOString(),
        isActive: true,
        ownedMemberships: [],
      };
      set({ currentUser: customer });
    }
  },

  login: (role) => {
    const state = get();
    if (state.walletAddress) {
      state.loginWithRole(role, state.walletAddress);
    }
  },

  logout: () => {
    get().disconnectWallet();
  },

  // Merchants
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

  // Customers
  customers: [],

  // Plans
  plans: [],
  createPlan: async (plan) => {
    const state = get();

    if (state.currentUser?.role === "merchant") {
      try {
        await createMembershipOnChain(
          plan.title,
          plan.benefits.join(", "),
          plan.price,
          plan.duration,
          plan.maxSupply
        );
      } catch (error) {
        console.error("Failed to create membership on-chain", error);
      }
    }

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
    }));
  },
  togglePlan: (id) =>
    set((s) => ({
      plans: s.plans.map((p) =>
        p.id === id ? { ...p, isActive: !p.isActive } : p,
      ),
    })),

  loadPlansFromBlockchain: async () => {
    try {
      const blockchainPlans = await fetchMembershipsFromBlockchain();
      set({ plans: blockchainPlans });
    } catch (error) {
      console.error("Failed to load plans from blockchain:", error);
      // No fallback - plans will be empty if blockchain fetch fails
      set({ plans: [] });
    }
  },

  // Owned Memberships
  ownedMemberships: [],
  purchaseMembership: async (planId) => {
    const state = get();
    const plan = state.plans.find((p) => p.id === planId);
    if (!plan || !state.currentUser || state.currentUser.role !== "customer") return;

    // merchantId is the vendor wallet address from blockchain
    const merchantWalletAddress = plan.merchantId;

    try {
      const receipt = await purchaseMembershipOnChain(plan, merchantWalletAddress);
      const now = new Date();
      const om: OwnedMembership = {
        id: `om-${Date.now()}`,
        planId,
        customerId: state.currentUser.id,
        merchantId: plan.merchantId,
        merchantName: plan.merchantName,
        planTitle: plan.title,
        purchaseDate: now.toISOString(),
        expiryDate: receipt.expiryDate,
        txHash: receipt.txHash,
        tokenId: receipt.tokenId,
        isValid: true,
      };
      const tx: Transaction = {
        id: `tx-${Date.now()}`,
        from: state.currentUser.walletAddress,
        to: merchantWalletAddress,
        amount: plan.price,
        txHash: receipt.txHash,
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
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error || "Unknown error");
      console.error("Blockchain purchase failed:", error);
      alert(
        `Unable to complete purchase on the blockchain: ${message}. Check your wallet, network, and contract address.`,
      );
    }
  },

  loadOwnedMembershipsFromBlockchain: async () => {
    const state = get();
    if (!state.currentUser || !state.currentUser.walletAddress) {
      console.log("No current user or wallet address");
      return;
    }

    try {
      const blockchainMemberships = await fetchOwnedMembershipsFromBlockchain(
        state.currentUser.walletAddress,
      );
      set({ ownedMemberships: blockchainMemberships });
    } catch (error) {
      console.error("Failed to load owned memberships from blockchain:", error);
    }
  },

  // Ads
  ads: [],
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
  announcements: [],
  createAnnouncement: (a) =>
    set((s) => ({
      announcements: [
        ...s.announcements,
        { ...a, id: `ann-${Date.now()}`, createdAt: new Date().toISOString() },
      ],
    })),

  // Transactions
  transactions: [],

  // Disputes
  disputes: [],
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
