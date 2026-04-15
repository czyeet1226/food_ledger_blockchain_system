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
import {
  saveMerchantProfile,
  getMerchantProfile,
  getAllMerchantProfiles,
  deleteMerchantProfile,
} from "@/lib/merchantDB";

interface AppState {
  // Auth
  currentUser: User | null;
  isWalletConnected: boolean;
  walletAddress: string | null;
  onChainRole: Role;
  isLoading: boolean;
  chainResetDetected: boolean;
  pollingInterval: ReturnType<typeof setInterval> | null;
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
  startMerchantApprovalPolling: (merchantAddress: string) => void;
  stopMerchantApprovalPolling: () => void;

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
  createDispute: (
    dispute: Omit<
      Dispute,
      "id" | "status" | "createdAt" | "resolution" | "resolvedAt"
    >,
  ) => void;
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
  try {
    // Use JsonRpcProvider directly to bypass MetaMask caching
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const contract = new ethers.Contract(
      FOODLEDGER_ADDRESS,
      FOODLEDGER_ABI,
      provider,
    );
    const pendingIds = await contract.getPendingMerchantRegistrations();
    console.log(
      "Pending registration IDs from chain:",
      JSON.stringify(pendingIds.map(Number)),
    );
    const pendingMerchants = [];

    for (const regId of pendingIds) {
      try {
        const reg = await contract.getMerchantRegistration(Number(regId));
        // Only include registrations that are still pending (status 0)
        if (Number(reg.status) === 0) {
          pendingMerchants.push({
            id: Number(regId),
            merchant: reg.merchant.toLowerCase(),
            name: reg.name,
            status: Number(reg.status),
            requestedAt: Number(reg.requestedAt),
          });
        }
      } catch (regErr) {
        console.error("Failed to load registration", Number(regId), regErr);
      }
    }

    return pendingMerchants;
  } catch (err) {
    console.error("Failed to load pending merchants:", err);
    return [];
  }
}

// Helper: check if a merchant address has been approved
async function checkMerchantApprovalStatus(
  merchantAddress: string,
): Promise<"pending" | "approved" | "rejected" | null> {
  try {
    // Use JsonRpcProvider directly to bypass MetaMask caching
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const contract = new ethers.Contract(
      FOODLEDGER_ADDRESS,
      FOODLEDGER_ABI,
      provider,
    );
    const pendingIds = await contract.getPendingMerchantRegistrations();

    for (const regId of pendingIds) {
      const reg = await contract.getMerchantRegistration(Number(regId));
      if (reg.merchant.toLowerCase() === merchantAddress.toLowerCase()) {
        // Status: 0 = Pending, 1 = Approved, 2 = Rejected
        const statusMap = ["pending", "approved", "rejected"];
        return statusMap[Number(reg.status)] as
          | "pending"
          | "approved"
          | "rejected";
      }
    }

    // If not in pending list, they might be already approved (in active merchants)
    const user = await contract.getUser(merchantAddress);
    if (Number(user.role) === 2) {
      // Role.Merchant = 2
      return "approved";
    }

    return null;
  } catch (err) {
    console.error("Failed to check merchant approval status:", err);
    return null;
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

async function isContractDeployed(): Promise<boolean> {
  const provider = getProvider();
  if (!provider) return false;
  const code = await provider.getCode(FOODLEDGER_ADDRESS);
  return code !== "0x";
}

async function getContract(withSigner = false) {
  const provider = getProvider();
  if (!provider) return null;

  // Check if contract still exists (catches Hardhat restart)
  const code = await provider.getCode(FOODLEDGER_ADDRESS);
  if (code === "0x") {
    console.warn(
      "Contract not found at",
      FOODLEDGER_ADDRESS,
      "— Hardhat may have been restarted. Please redeploy.",
    );
    return null;
  }

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
  chainResetDetected: false,
  pollingInterval: null,
  pendingMerchantRegistrations: [],

  connectWallet: async () => {
    if (typeof window === "undefined") return null;

    // Wait for MetaMask to inject window.ethereum (retry up to 3 seconds)
    let ethereum:
      | {
          request: (args: {
            method: string;
            params?: unknown[];
          }) => Promise<string[]>;
        }
      | undefined;
    for (let i = 0; i < 6; i++) {
      ethereum = (window as unknown as { ethereum?: typeof ethereum }).ethereum;
      if (ethereum) break;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    if (!ethereum) {
      alert("MetaMask is not detected. Please install MetaMask and refresh.");
      return null;
    }

    try {
      set({ isLoading: true });

      // Force switch to Hardhat network (chain ID 31337 = 0x7A69)
      try {
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x7A69" }],
        });
      } catch {
        // If Hardhat network not added yet, add it
        try {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x7A69",
                chainName: "Hardhat",
                rpcUrls: ["http://127.0.0.1:8545"],
                nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
              },
            ],
          });
        } catch {
          alert("Please switch to the Hardhat network in MetaMask.");
          set({ isLoading: false });
          return null;
        }
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      const address = accounts[0];
      set({ isWalletConnected: true, walletAddress: address });

      // Check if contract is still deployed (Hardhat restart detection)
      const deployed = await isContractDeployed();
      if (!deployed) {
        set({
          chainResetDetected: true,
          isLoading: false,
        });
        alert(
          "Smart contract not found on-chain. Hardhat may have been restarted.\n\n" +
            "Please redeploy your contracts:\n" +
            "cd backend && npx hardhat run scripts/deploy.ts --network localhost\n\n" +
            "Your Firebase profile data is safe — just re-register on-chain after redeploying.",
        );
        return address;
      }

      set({ chainResetDetected: false });

      // Check on-chain role
      const role = await get().checkOnChainRole(address);
      set({ onChainRole: role });

      // Detect chain reset: wallet has no on-chain role but has a Firebase profile
      // Auto re-register on-chain in the background using Firebase data
      if (role === Role.None) {
        const fbProfile = await getMerchantProfile(address);
        if (fbProfile) {
          try {
            set({ isLoading: true, chainResetDetected: true });
            console.log(
              "Chain reset detected — auto re-registering merchant:",
              fbProfile.businessName,
            );

            const contract = await getContract(true);
            if (contract) {
              // Check if there's already a pending registration on-chain
              const existingRegId =
                await contract.merchantRegistrationId(address);
              if (Number(existingRegId) === 0) {
                // No existing registration, safe to register
                const tx = await contract.registerAsMerchant(
                  fbProfile.businessName,
                );
                await tx.wait();
              }

              // Check if we got auto-approved or still pending
              const newRole = await get().checkOnChainRole(address);
              if (newRole === Role.Merchant) {
                // Already approved (shouldn't happen on fresh chain, but handle it)
                set({
                  onChainRole: Role.Merchant,
                  chainResetDetected: false,
                  currentUser: {
                    id: address,
                    walletAddress: address,
                    role: "merchant",
                    name: fbProfile.businessName,
                    businessName: fbProfile.businessName,
                    description: fbProfile.description || "",
                    cuisine: fbProfile.cuisine || "",
                    location: fbProfile.location || "",
                    logo: fbProfile.logo || "",
                    email: fbProfile.email || "",
                    phone: fbProfile.phone || "",
                    status: "approved",
                    createdAt: new Date().toISOString(),
                    isActive: true,
                  } as Merchant,
                  isLoading: false,
                });
              } else {
                // Registration is pending admin approval after chain reset
                set({
                  onChainRole: Role.None,
                  chainResetDetected: true,
                  currentUser: {
                    id: address,
                    walletAddress: address,
                    role: "merchant",
                    name: fbProfile.businessName,
                    businessName: fbProfile.businessName,
                    description: fbProfile.description || "",
                    cuisine: fbProfile.cuisine || "",
                    location: fbProfile.location || "",
                    logo: fbProfile.logo || "",
                    email: fbProfile.email || "",
                    phone: fbProfile.phone || "",
                    status: "pending",
                    createdAt: new Date().toISOString(),
                    isActive: true,
                  } as Merchant,
                  isLoading: false,
                });
              }

              // Load on-chain data
              await get().loadOnChainData();
              return address;
            }
          } catch (err) {
            console.error("Auto re-registration failed:", err);
            set({ isLoading: false });
            // Fall through to normal registration page
          }
        }
      }

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
            // Load profile from Firebase — Firebase is the source of truth for display name
            const fbProfile = await getMerchantProfile(address);
            const displayName = fbProfile?.businessName || userName;
            set({
              currentUser: {
                id: address,
                walletAddress: address,
                role: "merchant",
                name: displayName,
                businessName: displayName,
                description: fbProfile?.description || "",
                cuisine: fbProfile?.cuisine || "",
                location: fbProfile?.location || "",
                logo: fbProfile?.logo || "",
                email: fbProfile?.email || "",
                phone: fbProfile?.phone || "",
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

      set({ isLoading: false });
      return address;
    } catch {
      console.error("Wallet connection failed");
      set({ isLoading: false });
      return null;
    }
  },

  checkOnChainRole: async (address: string) => {
    try {
      // Use direct RPC to bypass MetaMask caching
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const contract = new ethers.Contract(
        FOODLEDGER_ADDRESS,
        FOODLEDGER_ABI,
        provider,
      );
      const user = await contract.getUser(address);
      const role = Number(user.role) as Role;
      console.log("checkOnChainRole:", address, "role:", role);
      return role;
    } catch (err) {
      console.error("checkOnChainRole failed:", err);
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
        set({
          onChainRole: Role.None,
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
          chainResetDetected: false,
          isLoading: false,
        });
        // Save merchant profile to Firebase
        await saveMerchantProfile(address, {
          businessName: name,
          description: "",
          cuisine: "",
          location: "",
          logo: "",
          email: "",
          phone: "",
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
      // Load on-chain data after registration
      await get().loadOnChainData();
      return true;
    } catch (err) {
      console.error("Registration failed:", err);
      // Extract revert reason if available
      const errorMessage =
        (err as { reason?: string })?.reason ||
        (err as { message?: string })?.message ||
        "Unknown error";
      console.error("Revert reason:", errorMessage);
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
      chainResetDetected: false,
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

      // Build merchant list from on-chain data, merged with Firebase profiles
      const firebaseProfiles = await getAllMerchantProfiles();
      const profileMap = new Map(
        firebaseProfiles.map((p) => [p.walletAddress.toLowerCase(), p]),
      );

      const merchants: Merchant[] = [];
      for (const addr of merchantAddrs) {
        const u = await contract.getUser(addr);
        const lowerAddr = addr.toLowerCase();
        const fbProfile = profileMap.get(lowerAddr);

        merchants.push({
          id: lowerAddr,
          walletAddress: lowerAddr,
          role: "merchant",
          name: u.name,
          businessName: fbProfile?.businessName || u.name,
          description: fbProfile?.description || "",
          cuisine: fbProfile?.cuisine || "",
          location: fbProfile?.location || "",
          logo: fbProfile?.logo || "",
          email: fbProfile?.email || "",
          phone: fbProfile?.phone || "",
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
      console.log("Approved registration ID:", registrationId);

      // Read directly from the same contract instance right after tx
      const directPending = await contract.getPendingMerchantRegistrations();
      console.log(
        "Direct read after approval:",
        JSON.stringify(directPending.map(Number)),
      );

      // Also read total registrations to verify
      const totalRegs = await contract.getTotalMerchantRegistrations();
      console.log("Total merchant registrations:", Number(totalRegs));

      // Reload pending merchants and general data
      await get().loadPendingMerchants();
      await get().loadOnChainData();

      console.log(
        "Pending after approval:",
        get().pendingMerchantRegistrations,
      );

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

      // Get the merchant address before rejecting so we can clean up Firebase
      const reg = await contract.getMerchantRegistration(registrationId);
      const merchantAddress = reg.merchant.toLowerCase();

      const tx = await contract.rejectMerchantRegistration(registrationId);
      await tx.wait();

      // Delete merchant profile from Firebase
      await deleteMerchantProfile(merchantAddress).catch(console.error);

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

  // Start listening for merchant approval (event-based for instant detection + fallback poll)
  startMerchantApprovalPolling: (merchantAddress: string) => {
    // Clear any existing listeners/polling
    get().stopMerchantApprovalPolling();

    const handleApproved = async () => {
      const state = get();
      if (state.currentUser && state.currentUser.role === "merchant") {
        set({
          onChainRole: Role.Merchant,
          currentUser: {
            ...state.currentUser,
            status: "approved" as MerchantStatus,
          } as Merchant,
        });
        await get().loadOnChainData();
      }
      get().stopMerchantApprovalPolling();
    };

    // Listen for the approval event directly from the Hardhat node
    try {
      const directProvider = new ethers.JsonRpcProvider(
        "http://127.0.0.1:8545",
      );
      const eventContract = new ethers.Contract(
        FOODLEDGER_ADDRESS,
        FOODLEDGER_ABI,
        directProvider,
      );
      eventContract.on(
        "MerchantRegistrationApproved",
        (_regId: unknown, merchant: string) => {
          if (merchant.toLowerCase() === merchantAddress.toLowerCase()) {
            console.log("Approval event received for:", merchant);
            handleApproved();
          }
        },
      );
      // Store the contract reference for cleanup
      (
        get() as unknown as { _eventContract?: ethers.Contract }
      )._eventContract = eventContract;
    } catch (err) {
      console.error("Failed to set up event listener:", err);
    }

    // Fallback poll every 5 seconds in case events are missed
    const intervalId = setInterval(async () => {
      const state = get();
      if (!state.currentUser || state.currentUser.role !== "merchant") {
        get().stopMerchantApprovalPolling();
        return;
      }
      const status = await checkMerchantApprovalStatus(merchantAddress);
      if (status === "approved") {
        handleApproved();
      }
    }, 5000);

    set({ pollingInterval: intervalId });
  },

  // Stop the polling and event listeners
  stopMerchantApprovalPolling: () => {
    const state = get();
    if (state.pollingInterval) {
      clearInterval(state.pollingInterval);
      set({ pollingInterval: null });
    }
    // Clean up event listener
    try {
      const eventContract = (
        state as unknown as { _eventContract?: ethers.Contract }
      )._eventContract;
      if (eventContract) {
        eventContract.removeAllListeners("MerchantRegistrationApproved");
        (
          state as unknown as { _eventContract?: ethers.Contract }
        )._eventContract = undefined;
      }
    } catch {
      // ignore cleanup errors
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
  updateMerchant: (id, data) => {
    // Save to Firebase
    import("@/lib/merchantDB").then(({ updateMerchantField }) => {
      updateMerchantField(id, data).catch(console.error);
    });
    set((s) => ({
      merchants: s.merchants.map((m) => (m.id === id ? { ...m, ...data } : m)),
      // Also update currentUser if it's the same merchant
      currentUser:
        s.currentUser?.id === id
          ? {
              ...s.currentUser,
              ...data,
              // Keep name in sync with businessName
              name:
                "businessName" in data
                  ? (data as { businessName: string }).businessName
                  : s.currentUser.name,
            }
          : s.currentUser,
    }));
  },
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
  disputes: (() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("disputes");
      return saved ? JSON.parse(saved) : mockDisputes;
    }
    return mockDisputes;
  })(),
  createDispute: (dispute) =>
    set((s) => {
      const newDisputes = [
        ...s.disputes,
        {
          ...dispute,
          id: `dispute-${Date.now()}`,
          status: "open" as DisputeStatus,
          createdAt: new Date().toISOString(),
        },
      ];
      // Persist to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("disputes", JSON.stringify(newDisputes));
        console.log(
          "✅ Dispute created and saved to localStorage:",
          newDisputes,
        );
      }
      return { disputes: newDisputes };
    }),
  updateDisputeStatus: (id, status, resolution) =>
    set((s) => {
      const updated = s.disputes.map((d) =>
        d.id === id
          ? {
              ...d,
              status,
              resolution: resolution || d.resolution,
              resolvedAt:
                status === "resolved" ? new Date().toISOString() : d.resolvedAt,
            }
          : d,
      );
      // Persist to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("disputes", JSON.stringify(updated));
        console.log(
          "✅ Dispute status updated and saved to localStorage",
          updated,
        );
      }
      return { disputes: updated };
    }),
}));
