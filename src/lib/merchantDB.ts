import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  collection,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

export interface MerchantProfile {
  walletAddress: string;
  businessName: string;
  description: string;
  cuisine: string;
  location: string;
  logo: string;
  email: string;
  phone: string;
  updatedAt: string;
}

// Save or update merchant profile (keyed by wallet address)
export async function saveMerchantProfile(
  walletAddress: string,
  profile: Omit<MerchantProfile, "walletAddress" | "updatedAt">,
) {
  const key = walletAddress.toLowerCase();
  await setDoc(doc(db, "merchants", key), {
    walletAddress: key,
    ...profile,
    updatedAt: new Date().toISOString(),
  });
}

// Get a single merchant profile
export async function getMerchantProfile(
  walletAddress: string,
): Promise<MerchantProfile | null> {
  const snap = await getDoc(doc(db, "merchants", walletAddress.toLowerCase()));
  return snap.exists() ? (snap.data() as MerchantProfile) : null;
}

// Get all merchant profiles
export async function getAllMerchantProfiles(): Promise<MerchantProfile[]> {
  const snapshot = await getDocs(collection(db, "merchants"));
  return snapshot.docs.map((d) => d.data() as MerchantProfile);
}

// Partial update (e.g. just update description or logo)
export async function updateMerchantField(
  walletAddress: string,
  fields: Partial<MerchantProfile>,
) {
  const key = walletAddress.toLowerCase();
  await updateDoc(doc(db, "merchants", key), {
    ...fields,
    updatedAt: new Date().toISOString(),
  });
}

// Delete merchant profile (used when registration is rejected)
export async function deleteMerchantProfile(
  walletAddress: string,
): Promise<void> {
  const key = walletAddress.toLowerCase();
  await deleteDoc(doc(db, "merchants", key));
}
