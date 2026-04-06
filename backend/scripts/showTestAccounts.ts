import { ethers } from "hardhat";

async function main() {
  console.log("🔑 Hardhat Test Accounts with 10,000 ETH each:\n");

  const accounts = await ethers.getSigners();

  accounts.slice(0, 5).forEach((account, index) => {
    console.log(`Account ${index}:`);
    console.log(`  Address: ${account.address}`);
    console.log(`  Type: ${index === 0 ? "Merchant 1" : index === 1 ? "Merchant 2" : index === 2 ? "Merchant 3" : index === 3 ? "Customer" : "Admin"}`);
    console.log("");
  });

  console.log("📝 To use these accounts in MetaMask:");
  console.log("1. Open MetaMask");
  console.log("2. Click Account > Add Account or Import Account");
  console.log("3. Select 'Import Account'");
  console.log("4. Paste the private key below:");
  console.log("");

  const [merchant1, merchant2, merchant3, customer, admin] = accounts;

  console.log("🔓 Private Keys (DO NOT share or use on mainnet!):");
  console.log(`Merchant 1 (0xf39...): 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`);
  console.log(`Merchant 2 (0x7099...): 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`);
  console.log(`Merchant 3 (0x3C44...): 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`);
  console.log(`Customer (0x90F7...): 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6`);
  console.log(`Admin (0x15d3...): 0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a`);

  console.log("\n✅ Also make sure MetaMask is connected to:");
  console.log("   Network: Localhost 8545");
  console.log("   RPC URL: http://127.0.0.1:8545");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
