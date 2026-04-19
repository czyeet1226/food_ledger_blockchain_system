# Implementation Plan: Blockchain Ads

## Overview

Migrate the advertisement system from mock data to on-chain storage in the FoodLedger smart contract. Implementation proceeds bottom-up: smart contract → ABI/deploy → store → UI components. Each step builds on the previous one so there is no orphaned code.

## Tasks

- [x] 1. Add Ad storage and functions to FoodLedger smart contract
  - [x] 1.1 Add Ad struct, storage mappings, events, and CRUD functions to `backend/contracts/FoodLedger.sol`
    - Add `Ad` struct with fields: `id`, `merchant`, `title`, `description`, `planId`, `isActive`, `createdAt`
    - Add `mapping(uint256 => Ad) public ads`, `mapping(address => uint256[]) public merchantAds`, `uint256 public nextAdId`
    - Add `AdCreated(uint256 indexed adId, address indexed merchant, string title)` event
    - Add `AdToggled(uint256 indexed adId, bool isActive)` event
    - Implement `createAd(string title, string description, uint256 planId)` with `onlyMerchant` modifier, sets `isActive = true`, `createdAt = block.timestamp`, emits `AdCreated`
    - Implement `toggleAd(uint256 adId)` with `onlyMerchant` modifier + ownership check (`require(ads[adId].merchant == msg.sender, "Not your ad")`), flips `isActive`, emits `AdToggled`
    - Implement `getAd(uint256 adId)` view function returning `Ad` struct
    - Implement `getTotalAds()` view function returning `nextAdId`
    - Implement `getMerchantAds(address merchant)` view function returning `uint256[]`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12_

  - [ ]\* 1.2 Write property test: Ad creation round-trip (Property 1)
    - **Property 1: Ad creation round-trip**
    - Using `fast-check`, generate random (title, description, planId) tuples, call `createAd` from a merchant, read back via `getAd`, assert all fields match inputs, `isActive` is true, `createdAt` is block timestamp, and `AdCreated` event is emitted
    - Add `fast-check` to `backend/package.json` devDependencies if not present
    - Create test in `backend/test/BlockchainAds.test.ts`
    - **Validates: Requirements 2.1, 2.4, 2.8**

  - [ ]\* 1.3 Write property test: Ad tracking invariants (Property 2)
    - **Property 2: Ad tracking invariants**
    - Generate a random sequence of `createAd` calls from multiple merchants, verify `getTotalAds()` equals total ads created, and `getMerchantAds(merchant)` returns exactly the correct ad IDs per merchant
    - **Validates: Requirements 2.3, 2.11**

  - [ ]\* 1.4 Write property test: Non-merchant cannot create ads (Property 3)
    - **Property 3: Non-merchant cannot create ads**
    - Generate random role assignments (admin, customer, unregistered), attempt `createAd`, assert revert
    - **Validates: Requirements 2.5**

  - [ ]\* 1.5 Write property test: Toggle flips isActive (Property 4)
    - **Property 4: Toggle flips isActive**
    - Generate random ads, toggle N times, verify final `isActive` equals `N % 2 == 0`, and `AdToggled` events are emitted with correct values
    - **Validates: Requirements 2.6, 2.9**

  - [ ]\* 1.6 Write property test: Non-owner cannot toggle ads (Property 5)
    - **Property 5: Non-owner cannot toggle ads**
    - Generate two merchants with ads, cross-toggle, assert revert
    - **Validates: Requirements 2.7**

- [x] 2. Checkpoint - Ensure smart contract compiles and tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Update deploy script and frontend ABI
  - [x] 3.1 Update the frontend ABI in `src/contracts/FoodLedger.ts`
    - Add human-readable ABI strings for `createAd`, `toggleAd`, `getAd`, `getTotalAds`, `getMerchantAds`
    - Add ABI strings for `AdCreated` and `AdToggled` events
    - _Requirements: 3.2, 3.3_

  - [x] 3.2 Verify deploy script deploys updated contract
    - The existing deploy script in `backend/scripts/deploy.ts` already deploys `FoodLedger` — no changes needed unless compilation reveals issues. Verify it compiles and deploys the updated contract.
    - _Requirements: 3.1_

- [x] 4. Update store to use on-chain ads instead of mock data
  - [x] 4.1 Add `loadAllAdsFromChain` helper and update store actions in `src/store/index.ts`
    - Add `loadAllAdsFromChain()` async helper that iterates `0..getTotalAds()`, calls `getAd(i)` for each, looks up merchant name via `getUser`, and maps chain data to frontend `Ad` type (id → `"ad-${id}"`, merchantId → lowercased, planId → `"plan-${planId}"`, createdAt → ISO string)
    - Update `createAd` action to call the contract `createAd` function with signer (extract numeric planId by stripping `"plan-"` prefix), then reload ads
    - Update `toggleAd` action to call the contract `toggleAd` function with signer (extract numeric adId by stripping `"ad-"` prefix), then reload ads
    - Add `loadAllAdsFromChain()` call to `loadOnChainData` parallel load
    - Remove `mockAds` import and replace initial `ads` value with empty array
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 4.2 Update `Ad` type in `src/types/index.ts`
    - Remove `imageUrl` field from the `Ad` interface (add `merchantName` field)
    - _Requirements: 2.1_

  - [ ]\* 4.3 Write property test: Store mapping round-trip (Property 7)
    - **Property 7: Store ad loading round-trip**
    - Generate random on-chain ad data, run through the mapping logic, verify `id` is prefixed with `"ad-"`, `merchantId` is lowercased, `planId` is prefixed with `"plan-"`, `createdAt` is converted from unix timestamp to ISO string
    - **Validates: Requirements 6.4**

- [x] 5. Update UI components
  - [x] 5.1 Remove Announcements tab from `src/components/merchant/MerchantDashboard.tsx`
    - Remove the Announcements tab object from the `tabs` array
    - Remove the `MerchantAnnouncements` import and `Bell` icon import
    - _Requirements: 1.1, 1.2_

  - [x] 5.2 Update `src/components/merchant/MerchantAds.tsx` to send blockchain transactions
    - Update `handleCreate` to call the async store `createAd` (which now sends a tx) — pass `planId` as the on-chain plan index (strip `"plan-"` prefix, parse to number)
    - Remove `imageUrl` from the `createAd` call payload
    - Add loading state during transaction submission, disable the Create button while loading
    - Add error handling — display alert if transaction fails
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 5.3 Verify `src/components/customer/BrowseDeals.tsx` displays on-chain ads correctly
    - The component already reads `ads` from the store and filters by `isActive` — no structural changes needed
    - Verify it renders title, description for active ads (merchant name display can be added if desired)
    - Remove any references to mock data or `imageUrl` if present
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]\* 5.4 Write property test: Active ad filtering (Property 6)
    - **Property 6: Active ad filtering and display**
    - Generate random ads with mixed `isActive` states, filter using the same logic as `BrowseDeals.tsx`, verify only active ads pass through and each has title, description, and merchant name
    - **Validates: Requirements 5.2, 5.3**

- [x] 6. Final checkpoint - Ensure all tests pass and app compiles
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The design uses Solidity and TypeScript — no language selection needed
- Property tests use `fast-check` library for input generation
- The existing deploy script already handles FoodLedger deployment; recompilation picks up the new Ad functions automatically
