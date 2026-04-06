import { ethers } from "ethers";

const abiJson = [
  {
    inputs: [
      { internalType: "string", name: "title", type: "string" },
      { internalType: "string", name: "benefits", type: "string" },
      { internalType: "uint256", name: "price", type: "uint256" },
      { internalType: "uint256", name: "duration", type: "uint256" },
      { internalType: "uint256", name: "maxSupply", type: "uint256" },
    ],
    name: "createMembership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "title", type: "string" },
      { internalType: "uint256", name: "price", type: "uint256" },
      { internalType: "bool", name: "isActive", type: "bool" },
    ],
    name: "updateMembership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "vendor", type: "address" }],
    name: "getVendorMemberships",
    outputs: [{ internalType: "string[]", name: "", type: "string[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "vendor", type: "address" },
      { internalType: "string", name: "title", type: "string" },
    ],
    name: "getMembershipOffering",
    outputs: [
      {
        components: [
          { internalType: "string", name: "title", type: "string" },
          { internalType: "string", name: "benefits", type: "string" },
          { internalType: "uint256", name: "price", type: "uint256" },
          { internalType: "uint256", name: "duration", type: "uint256" },
          { internalType: "uint256", name: "maxSupply", type: "uint256" },
          { internalType: "uint256", name: "sold", type: "uint256" },
          { internalType: "bool", name: "isActive", type: "bool" },
          { internalType: "uint256", name: "createdAt", type: "uint256" },
        ],
        internalType: "struct RestaurantMembership.MembershipOffering",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllVendors",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllMembershipOfferings",
    outputs: [
      {
        components: [
          { internalType: "address", name: "vendor", type: "address" },
          { internalType: "string", name: "title", type: "string" },
          { internalType: "string", name: "benefits", type: "string" },
          { internalType: "uint256", name: "price", type: "uint256" },
          { internalType: "uint256", name: "duration", type: "uint256" },
          { internalType: "uint256", name: "maxSupply", type: "uint256" },
          { internalType: "uint256", name: "sold", type: "uint256" },
          { internalType: "bool", name: "isActive", type: "bool" },
          { internalType: "uint256", name: "createdAt", type: "uint256" },
        ],
        internalType: "struct RestaurantMembership.MembershipOfferingWithVendor[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "vendor", type: "address" },
      { internalType: "string", name: "membershipType", type: "string" },
      { internalType: "string", name: "benefits", type: "string" },
      { internalType: "uint256", name: "duration", type: "uint256" },
      { internalType: "uint256", name: "price", type: "uint256" },
    ],
    name: "buyMembership",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "user", type: "address" },
      { internalType: "address", name: "vendor", type: "address" },
    ],
    name: "verifyMembership",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "customer", type: "address" }],
    name: "getOwnedMemberships",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "tokenId", type: "uint256" },
          { internalType: "address", name: "vendor", type: "address" },
          { internalType: "string", name: "membershipType", type: "string" },
          { internalType: "string", name: "benefits", type: "string" },
          { internalType: "uint256", name: "expiry", type: "uint256" },
          { internalType: "bool", name: "isValid", type: "bool" },
        ],
        internalType: "struct RestaurantMembership.OwnedMembershipInfo[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export const restaurantMembershipAbi = abiJson as const;
