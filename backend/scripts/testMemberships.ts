import { ethers } from "hardhat";

async function main() {
  const [merchant1, merchant2, merchant3, customer] = await ethers.getSigners();

  console.log("🚀 Deploying RestaurantMembership contract...");
  const RestaurantMembership = await ethers.getContractFactory("RestaurantMembership");
  const contract = await RestaurantMembership.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log(`✅ Contract deployed to: ${contractAddress}\n`);

  // Create memberships from different merchants
  console.log("📝 Creating test membership offerings...\n");

  // Merchant 1: John's Kitchen
  console.log("👨‍🍳 Merchant 1 (John's Kitchen):");
  let tx = await contract.connect(merchant1).createMembership(
    "Gold Member",
    "10% off all meals, Free birthday dessert, Priority seating",
    ethers.parseEther("0.05"),
    365,
    100
  );
  await tx.wait();
  console.log("  ✓ Created 'Gold Member' plan (0.05 ETH, 365 days, max 100)");

  tx = await contract.connect(merchant1).createMembership(
    "Silver Member",
    "5% off all meals, Monthly newsletter",
    ethers.parseEther("0.02"),
    180,
    200
  );
  await tx.wait();
  console.log("  ✓ Created 'Silver Member' plan (0.02 ETH, 180 days, max 200)\n");

  // Merchant 2: Sakura Sushi
  console.log("🍣 Merchant 2 (Sakura Sushi):");
  tx = await contract.connect(merchant2).createMembership(
    "Sushi Lover",
    "Unlimited miso soup, 15% off sushi platters, Chef's special access",
    ethers.parseEther("0.08"),
    365,
    50
  );
  await tx.wait();
  console.log("  ✓ Created 'Sushi Lover' plan (0.08 ETH, 365 days, max 50)");

  tx = await contract.connect(merchant2).createMembership(
    "Sake Club",
    "Free sake with every dinner, Happy hour pricing all day",
    ethers.parseEther("0.03"),
    90,
    150
  );
  await tx.wait();
  console.log("  ✓ Created 'Sake Club' plan (0.03 ETH, 90 days, max 150)\n");

  // Merchant 3: Bella Italia
  console.log("🍝 Merchant 3 (Bella Italia):");
  tx = await contract.connect(merchant3).createMembership(
    "Pasta Lover",
    "Free appetizer with pasta dish, 20% off wine",
    ethers.parseEther("0.04"),
    180,
    75
  );
  await tx.wait();
  console.log("  ✓ Created 'Pasta Lover' plan (0.04 ETH, 180 days, max 75)\n");

  // Fetch all memberships
  console.log("📊 Fetching all membership offerings...\n");
  const allOfferings = await contract.getAllMembershipOfferings();
  
  console.log(`Total memberships created: ${allOfferings.length}\n`);

  allOfferings.forEach((offering: any, index: number) => {
    console.log(`[${index + 1}] ${offering.title}`);
    console.log(`    Vendor: ${offering.vendor}`);
    console.log(`    Price: ${ethers.formatEther(offering.price)} ETH`);
    console.log(`    Duration: ${offering.duration} days`);
    console.log(`    Max Supply: ${offering.maxSupply}`);
    console.log(`    Active: ${offering.isActive}`);
    console.log(`    Sold: ${offering.sold}`);
    console.log(`    Benefits: ${offering.benefits}\n`);
  });

  // Test a purchase
  console.log("💳 Testing a membership purchase...");
  const goldMemberOffering = allOfferings[0];
  tx = await contract.connect(customer).buyMembership(
    goldMemberOffering.vendor,
    goldMemberOffering.title,
    goldMemberOffering.benefits,
    goldMemberOffering.duration,
    goldMemberOffering.price,
    { value: goldMemberOffering.price }
  );
  await tx.wait();
  console.log(`✓ Customer purchased '${goldMemberOffering.title}' from merchant ${goldMemberOffering.vendor.slice(0, 6)}...\n`);

  // Fetch offerings again to see updated sold count
  console.log("📊 Updated membership offerings (note 'sold' count):\n");
  const updatedOfferings = await contract.getAllMembershipOfferings();
  updatedOfferings.forEach((offering: any, index: number) => {
    console.log(`[${index + 1}] ${offering.title} - Sold: ${offering.sold}/${offering.maxSupply}`);
  });

  console.log("\n" + "=".repeat(60));
  console.log("🎉 Test setup complete!");
  console.log("=".repeat(60));
  console.log(`\nContract Address: ${contractAddress}`);
  console.log(`Merchant 1: ${merchant1.address}`);
  console.log(`Merchant 2: ${merchant2.address}`);
  console.log(`Merchant 3: ${merchant3.address}`);
  console.log(`Customer: ${customer.address}`);
  console.log("\n📝 Update your .env file with:");
  console.log(`NEXT_PUBLIC_RESTAURANT_MEMBERSHIP_CONTRACT_ADDRESS=${contractAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
