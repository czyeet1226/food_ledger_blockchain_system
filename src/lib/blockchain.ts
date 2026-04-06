import { ethers } from "ethers";
import type { MembershipPlan } from "@/types";
import { restaurantMembershipAbi } from "./restaurantMembershipAbi";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_RESTAURANT_MEMBERSHIP_CONTRACT_ADDRESS;
const LOCALHOST_CHAIN_ID = "0x7a69"; // 31337 in hex

function getProvider() {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    throw new Error("MetaMask is required to access the blockchain.");
  }

  return new ethers.BrowserProvider((window as any).ethereum);
}

async function switchToLocalhost() {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    throw new Error("MetaMask is required.");
  }

  try {
    // Try to switch to localhost
    await (window as any).ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: LOCALHOST_CHAIN_ID }],
    });
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await (window as any).ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: LOCALHOST_CHAIN_ID,
              chainName: "Hardhat Localhost",
              rpcUrls: ["http://127.0.0.1:8545"],
              nativeCurrency: {
                name: "ETH",
                symbol: "ETH",
                decimals: 18,
              },
            },
          ],
        });
      } catch (addError) {
        throw new Error("Failed to add Localhost network to MetaMask");
      }
    } else {
      throw switchError;
    }
  }
}

function getContract(signer: ethers.Signer) {
  if (!CONTRACT_ADDRESS) {
    throw new Error(
      "Restaurant membership contract address is not configured. Set NEXT_PUBLIC_RESTAURANT_MEMBERSHIP_CONTRACT_ADDRESS.",
    );
  }

  return new ethers.Contract(CONTRACT_ADDRESS, restaurantMembershipAbi, signer);
}

export interface PurchaseResult {
  txHash: string;
  tokenId: string;
  expiryDate: string;
}

export async function purchaseMembershipOnChain(
  plan: MembershipPlan,
  vendorAddress: string,
): Promise<PurchaseResult> {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    throw new Error("MetaMask is required for transactions. Please install MetaMask and try again.");
  }

  // Switch to localhost network first
  console.log("Switching to Localhost 8545 network...");
  await switchToLocalhost();
  console.log("✅ Connected to Localhost 8545");

  // Wait a moment for network switch to complete
  await new Promise(resolve => setTimeout(resolve, 500));

  // Get provider and signer from MetaMask
  const provider = getProvider();
  const signer = await provider.getSigner();
  const userAddress = await signer.getAddress();

  console.log("Purchase details:");
  console.log("  Signer address:", userAddress);
  console.log("  Vendor address:", vendorAddress);
  console.log("  Plan price:", plan.price, "ETH");

  // Check wallet balance directly from localhost RPC (not MetaMask)
  const localhostProvider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const balance = await localhostProvider.getBalance(userAddress);
  console.log("  Wallet balance (from localhost):", ethers.formatEther(balance), "ETH");

  const price = ethers.parseEther(plan.price.toString());
  const durationSeconds = BigInt(plan.duration) * BigInt(24 * 60 * 60);

  if (balance < price) {
    console.error("Insufficient balance details:");
    console.error("  Required:", ethers.formatEther(price), "ETH");
    console.error("  Available:", ethers.formatEther(balance), "ETH");
    console.error("  Account:", userAddress);
    throw new Error(`Insufficient wallet balance. You have ${ethers.formatEther(balance)} ETH but need ${plan.price} ETH.\n\n⚠️ Make sure:\n1. You imported the customer account (0x90F79bf...)\n2. MetaMask shows "Localhost 8545" network\n3. MetaMask shows the correct account is active\n\nIf balance still shows 0, reimport the account with private key:\n0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6`);
  }

  console.log("Calling buyMembership...");
  const contract = getContract(signer);
  const tx = await contract.buyMembership(
    vendorAddress,
    plan.title,
    plan.benefits.join(", "),
    durationSeconds,
    price,
    { value: price },
  );

  console.log("Transaction sent:", tx.hash);
  const receipt = await tx.wait();
  console.log("Transaction confirmed:", receipt?.hash);

  let parsed = null;

  for (const log of receipt!.logs) {
    try {
      parsed = contract.interface.parseLog(log);
      break;
    } catch {
      continue;
    }
  }

  const tokenId = parsed?.args.tokenId?.toString() ?? `${Date.now()}`;

  return {
    txHash: receipt!.transactionHash,
    tokenId,
    expiryDate: new Date(Date.now() + Number(durationSeconds) * 1000).toISOString(),
  };
}

export async function createMembershipOnChain(
  title: string,
  benefits: string,
  price: number,
  duration: number,
  maxSupply: number,
): Promise<string> {
  const provider = getProvider();
  const signer = await provider.getSigner();
  const contract = getContract(signer);

  const priceWei = ethers.parseEther(price.toString());
  const tx = await contract.createMembership(title, benefits, priceWei, duration, maxSupply);
  const receipt = await tx.wait();
  return receipt.transactionHash;
}

export async function fetchMembershipsFromBlockchain(): Promise<MembershipPlan[]> {
  if (!CONTRACT_ADDRESS) {
    console.error("Contract address not configured");
    return [];
  }

  try {
    // Always use the local RPC provider for read operations
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    console.log("Contract address:", CONTRACT_ADDRESS);
    console.log("Provider URL:", provider._getConnection());

    // Verify contract exists
    const code = await provider.getCode(CONTRACT_ADDRESS);
    console.log("Contract code exists:", code !== "0x", "Length:", code.length);

    if (code === "0x") {
      console.error("No contract code at address:", CONTRACT_ADDRESS);
      return [];
    }

    // Create read-only contract instance using ethers' AbiCoder for manual parsing
    const abiInterface = new ethers.Interface([
      "function getAllMembershipOfferings() view returns (tuple(address vendor, string title, string benefits, uint256 price, uint256 duration, uint256 maxSupply, uint256 sold, bool isActive, uint256 createdAt)[])"
    ]);

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      abiInterface,
      provider
    );

    console.log("Calling getAllMembershipOfferings...");
    const offerings = await contract.getAllMembershipOfferings();
    
    console.log("Raw offerings:", offerings);
    console.log("Offerings length:", offerings.length);
    
    const plans: MembershipPlan[] = offerings.map((offering: any, index: number) => ({
      id: `plan-${offering.vendor}-${offering.title}-${index}`,
      merchantId: offering.vendor,
      merchantName: offering.vendor.slice(0, 6) + "..." + offering.vendor.slice(-4),
      title: offering.title,
      description: offering.benefits,
      price: parseFloat(ethers.formatEther(offering.price)),
      duration: Number(offering.duration),
      benefits: offering.benefits.split(", "),
      maxSupply: Number(offering.maxSupply),
      sold: Number(offering.sold),
      isActive: offering.isActive,
      createdAt: new Date(Number(offering.createdAt) * 1000).toISOString(),
      tokenId: `${offering.vendor}-${offering.title}`,
    }));

    return plans;
  } catch (error) {
    console.error("Failed to fetch memberships from blockchain:", error);
    return [];
  }
}

export async function fetchOwnedMembershipsFromBlockchain(customerAddress: string) {
  if (!CONTRACT_ADDRESS) {
    console.error("Contract address not configured");
    return [];
  }

  try {
    // Use the local RPC provider for read operations
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    const abiInterface = new ethers.Interface([
      "function getOwnedMemberships(address customer) view returns (tuple(uint256 tokenId, address vendor, string membershipType, string benefits, uint256 expiry, bool isValid)[])"
    ]);

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      abiInterface,
      provider
    );

    console.log("Fetching owned memberships for:", customerAddress);
    const ownedMemberships = await contract.getOwnedMemberships(customerAddress);

    console.log("Raw owned memberships:", ownedMemberships);

    // Transform blockchain data to OwnedMembership format
    const memberships = ownedMemberships.map((membership: any) => ({
      id: `om-${membership.tokenId}`,
      planId: `plan-${membership.vendor}-${membership.membershipType}`,
      customerId: customerAddress,
      merchantId: membership.vendor,
      merchantName: membership.vendor.slice(0, 6) + "..." + membership.vendor.slice(-4),
      planTitle: membership.membershipType,
      purchaseDate: new Date().toISOString(), // Not available from blockchain
      expiryDate: new Date(Number(membership.expiry) * 1000).toISOString(),
      txHash: "", // Not available from blockchain
      tokenId: membership.tokenId.toString(),
      isValid: membership.isValid,
    }));

    return memberships;
  } catch (error) {
    console.error("Failed to fetch owned memberships from blockchain:", error);
    return [];
  }
}
