import { ethers } from "hardhat";

async function main() {
  const contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  console.log("Checking contract at:", contractAddress);
  
  const code = await provider.getCode(contractAddress);
  console.log("Contract code:", code === "0x" ? "NO CONTRACT FOUND" : "CONTRACT EXISTS");
  
  // Try to call getAllMembershipOfferings
  const RestaurantMembership = await ethers.getContractFactory("RestaurantMembership");
  const contract = new ethers.Contract(
    contractAddress,
    RestaurantMembership.interface,
    provider
  );

  try {
    const offerings = await contract.getAllMembershipOfferings();
    console.log("Offerings count:", offerings.length);
    if (offerings.length > 0) {
      console.log("First offering:", offerings[0]);
    }
  } catch (error: any) {
    console.error("Error calling getAllMembershipOfferings:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
