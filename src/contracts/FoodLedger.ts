// Contract address - update this after each deploy
export const FOODLEDGER_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Role enum matching the contract
export enum Role {
  None = 0,
  Admin = 1,
  Merchant = 2,
  Customer = 3,
}

// Merchant Status enum
export enum MerchantStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
}

export const FOODLEDGER_ABI = [
  "function getUser(address _addr) view returns (tuple(uint8 role, string name, bool isActive, uint256 registeredAt))",
  "function getMyRole() view returns (uint8)",
  "function registerAsMerchant(string _name)",
  "function registerAsCustomer(string _name)",
  "function registerAdmin(address _addr, string _name)",
  "function approveMerchantRegistration(uint256 _regId)",
  "function rejectMerchantRegistration(uint256 _regId)",
  "function getMerchantRegistration(uint256 _regId) view returns (tuple(address merchant, string name, uint8 status, uint256 requestedAt, uint256 reviewedAt))",
  "function getPendingMerchantRegistrations() view returns (uint256[])",
  "function getPendingMerchantRegistrationsCount() view returns (uint256)",
  "function getTotalMerchantRegistrations() view returns (uint256)",
  "function merchantRegistrationId(address) view returns (uint256)",
  "function createPlan(string _title, string _description, uint256 _priceInWei, uint256 _durationDays, uint256 _maxSupply)",
  "function purchaseMembership(uint256 _planId) payable",
  "function togglePlan(uint256 _planId)",
  "function getPlan(uint256 _planId) view returns (tuple(uint256 id, address merchant, string title, string description, uint256 priceInWei, uint256 durationDays, uint256 maxSupply, uint256 sold, bool isActive))",
  "function getPurchase(uint256 _purchaseId) view returns (tuple(uint256 id, uint256 planId, address buyer, address merchant, uint256 amountPaid, uint256 purchasedAt, uint256 expiresAt))",
  "function getBuyerPurchases(address _buyer) view returns (uint256[])",
  "function getMerchantPurchases(address _merchant) view returns (uint256[])",
  "function getMerchantPlans(address _merchant) view returns (uint256[])",
  "function getAllMerchants() view returns (address[])",
  "function getAllCustomers() view returns (address[])",
  "function getTotalPlans() view returns (uint256)",
  "function getTotalPurchases() view returns (uint256)",
  "function isMembershipValid(uint256 _purchaseId) view returns (bool)",
  "function owner() view returns (address)",
  "event PlanCreated(uint256 indexed planId, address indexed merchant, string title, uint256 priceInWei)",
  "event MembershipPurchased(uint256 indexed purchaseId, uint256 indexed planId, address indexed buyer, address merchant, uint256 amountPaid)",
  "event UserRegistered(address indexed user, uint8 role, string name)",
  "event PlanToggled(uint256 indexed planId, bool isActive)",
  "event MerchantRegistrationRequested(uint256 indexed registrationId, address indexed merchant, string name)",
  "event MerchantRegistrationApproved(uint256 indexed registrationId, address indexed merchant)",
  "event MerchantRegistrationRejected(uint256 indexed registrationId, address indexed merchant)",
] as const;
