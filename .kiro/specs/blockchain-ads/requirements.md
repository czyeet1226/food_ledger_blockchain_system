# Requirements Document

## Introduction

This feature transitions advertisements from mock/in-memory data to on-chain storage in the FoodLedger smart contract. Merchants create ads on the blockchain, and those ads are displayed on the customer page in place of the current "Featured Deals" section. Additionally, the "Announcements" tab is removed from the merchant dashboard.

## Glossary

- **FoodLedger_Contract**: The Solidity smart contract (`FoodLedger.sol`) that manages users, membership plans, purchases, disputes, and (with this feature) advertisements on the Hardhat blockchain.
- **Ad**: A promotional record stored on-chain containing a title, description, associated merchant address, linked plan ID, and active status.
- **Merchant_Dashboard**: The merchant-facing UI with tabs for managing plans, ads, analytics, announcements, QR verification, and profile.
- **Customer_Page**: The customer-facing UI with tabs for browsing deals, memberships, payments, and reports.
- **Featured_Deals_Section**: The current UI section on the Customer_Page that displays ads from mock data. To be replaced by blockchain-sourced ads.
- **Announcements_Tab**: The current tab on the Merchant_Dashboard for creating and viewing announcements. To be removed.

## Requirements

### Requirement 1: Remove Announcements Tab from Merchant Dashboard

**User Story:** As a merchant, I want the Announcements tab removed from my dashboard, so that the interface is simplified and focused on relevant features.

#### Acceptance Criteria

1. WHEN the Merchant_Dashboard renders, THE Merchant_Dashboard SHALL NOT display an "Announcements" tab in the navigation.
2. WHEN the Merchant_Dashboard renders, THE Merchant_Dashboard SHALL retain all other existing tabs (Membership Plans, Advertisements, Analytics, QR Verification, Profile).

### Requirement 2: Store Ads On-Chain in FoodLedger Contract

**User Story:** As a merchant, I want my advertisements stored on the blockchain, so that ad data is decentralized and tamper-proof.

#### Acceptance Criteria

1. THE FoodLedger_Contract SHALL define an Ad struct containing: id (uint256), merchant address, title (string), description (string), planId (uint256), isActive (bool), and createdAt (uint256 timestamp).
2. THE FoodLedger_Contract SHALL maintain a mapping from ad ID to Ad struct and a counter for the next ad ID.
3. THE FoodLedger_Contract SHALL maintain a mapping from merchant address to an array of ad IDs created by that merchant.
4. WHEN a merchant calls the createAd function with a title, description, and planId, THE FoodLedger_Contract SHALL store a new Ad on-chain with isActive set to true and createdAt set to the current block timestamp.
5. WHEN a non-merchant account calls createAd, THE FoodLedger_Contract SHALL revert the transaction with an appropriate error.
6. WHEN a merchant calls toggleAd with an ad ID belonging to that merchant, THE FoodLedger_Contract SHALL toggle the isActive flag of that Ad.
7. WHEN a merchant calls toggleAd with an ad ID not belonging to that merchant, THE FoodLedger_Contract SHALL revert the transaction.
8. THE FoodLedger_Contract SHALL emit an AdCreated event when a new ad is created, containing the ad ID, merchant address, and title.
9. THE FoodLedger_Contract SHALL emit an AdToggled event when an ad's active status changes, containing the ad ID and new isActive value.
10. THE FoodLedger_Contract SHALL provide a getAd(uint256 adId) view function that returns the Ad struct for a given ID.
11. THE FoodLedger_Contract SHALL provide a getTotalAds() view function that returns the total number of ads created.
12. THE FoodLedger_Contract SHALL provide a getMerchantAds(address merchant) view function that returns the array of ad IDs for a given merchant.

### Requirement 3: Update Deploy Script and Frontend ABI

**User Story:** As a developer, I want the deploy script and frontend contract bindings updated, so that the new ad functions are accessible from the frontend.

#### Acceptance Criteria

1. WHEN the deploy script executes, THE deploy script SHALL deploy the updated FoodLedger_Contract with ad functionality.
2. THE FoodLedger TypeScript ABI (src/contracts/FoodLedger.ts) SHALL include ABI entries for createAd, toggleAd, getAd, getTotalAds, and getMerchantAds functions.
3. THE FoodLedger TypeScript ABI SHALL include ABI entries for AdCreated and AdToggled events.

### Requirement 4: Merchant Creates Ads via Blockchain Transaction

**User Story:** As a merchant, I want to create ads through a blockchain transaction from the UI, so that my ads are persisted on-chain.

#### Acceptance Criteria

1. WHEN a merchant submits the "Create Ad" form on the Merchant_Dashboard, THE Merchant_Dashboard SHALL send a createAd transaction to the FoodLedger_Contract with the provided title, description, and planId.
2. WHEN the createAd transaction succeeds, THE Merchant_Dashboard SHALL reload the ad list from the blockchain.
3. IF the createAd transaction fails, THEN THE Merchant_Dashboard SHALL display an error message to the merchant.
4. WHEN a merchant clicks "Deactivate" or "Activate" on an ad, THE Merchant_Dashboard SHALL send a toggleAd transaction to the FoodLedger_Contract.
5. WHEN the toggleAd transaction succeeds, THE Merchant_Dashboard SHALL reload the ad list from the blockchain.

### Requirement 5: Load and Display Blockchain Ads on Customer Page

**User Story:** As a customer, I want to see merchant advertisements loaded from the blockchain, so that I can view verified, on-chain promotions.

#### Acceptance Criteria

1. WHEN the Customer_Page loads, THE Customer_Page SHALL fetch all ads from the FoodLedger_Contract by iterating from 0 to getTotalAds().
2. THE Customer_Page SHALL display only ads where isActive is true.
3. THE Customer_Page SHALL display each active ad with its title, description, and associated merchant name.
4. THE Customer_Page SHALL NOT display the previous mock-data-based Featured_Deals_Section.

### Requirement 6: Remove Mock Ad Data from Store

**User Story:** As a developer, I want mock ad data removed from the store, so that the application relies solely on blockchain data for ads.

#### Acceptance Criteria

1. THE application store (src/store/index.ts) SHALL load ads from the FoodLedger_Contract instead of from mockData.
2. THE application store SHALL update the createAd action to call the FoodLedger_Contract createAd function.
3. THE application store SHALL update the toggleAd action to call the FoodLedger_Contract toggleAd function.
4. WHEN on-chain data is loaded, THE application store SHALL populate the ads array with data fetched from the blockchain.
