import { ethers } from "ethers";
import { restaurantMembershipAbi } from "@/lib/restaurantMembershipAbi";

export default function DebugPage() {
  const testConnection = async () => {
    const contractAddress = process.env.NEXT_PUBLIC_RESTAURANT_MEMBERSHIP_CONTRACT_ADDRESS;
    console.log("Contract Address:", contractAddress);
    console.log("ABI:", restaurantMembershipAbi);

    try {
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const code = await provider.getCode(contractAddress!);
      console.log("Contract code exists:", code !== "0x");

      if (code === "0x") {
        console.error("No contract code at this address!");
        return;
      }

      const contract = new ethers.Contract(contractAddress!, restaurantMembershipAbi as any, provider);
      console.log("Contract instance created");
      console.log("Contract functions:", Object.keys(contract));

      const offerings = await contract.getAllMembershipOfferings();
      console.log("Offerings:", offerings);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="p-8">
      <h1>Debug Blockchain Connection</h1>
      <button onClick={testConnection} className="bg-blue-500 text-white p-2 rounded">
        Test Connection
      </button>
    </div>
  );
}
