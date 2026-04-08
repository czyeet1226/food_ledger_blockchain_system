import { expect } from "chai";
import { ethers } from "hardhat";

describe("FoodLedger", function () {
  async function deploy() {
    const [admin, merchant, customer, random] = await ethers.getSigners();
    const FoodLedger = await ethers.getContractFactory("FoodLedger");
    const contract = await FoodLedger.connect(admin).deploy();

    // Register roles
    await contract.connect(merchant).registerAsMerchant("John's Kitchen");
    await contract.connect(customer).registerAsCustomer("Alice");

    return { contract, admin, merchant, customer, random };
  }

  it("Admin is set on deploy", async function () {
    const { contract, admin } = await deploy();
    const user = await contract.getUser(admin.address);
    expect(user.role).to.equal(1); // Role: None=0, Admin=1, Merchant=2, Customer=3
  });

  it("Should enforce roles on registration", async function () {
    const { contract, merchant } = await deploy();
    // Already registered, can't register again
    await expect(
      contract.connect(merchant).registerAsCustomer("Fake"),
    ).to.be.revertedWith("Already registered");
  });

  it("Only merchant can create plans", async function () {
    const { contract, customer } = await deploy();
    const price = ethers.parseEther("0.01");
    await expect(
      contract.connect(customer).createPlan("Plan", "Desc", price, 30, 100),
    ).to.be.revertedWith("Not merchant");
  });

  it("Only customer can purchase", async function () {
    const { contract, merchant } = await deploy();
    const price = ethers.parseEther("0.01");
    await contract.connect(merchant).createPlan("Gold", "VIP", price, 30, 100);
    await expect(
      contract.connect(merchant).purchaseMembership(0, { value: price }),
    ).to.be.revertedWith("Not customer");
  });

  it("Full flow: create plan → purchase → verify", async function () {
    const { contract, merchant, customer } = await deploy();
    const price = ethers.parseEther("0.05");

    // Merchant creates plan
    await contract
      .connect(merchant)
      .createPlan("Gold Plan", "Premium access", price, 30, 100);
    const plan = await contract.getPlan(0);
    expect(plan.title).to.equal("Gold Plan");
    expect(plan.merchant).to.equal(merchant.address);

    // Customer buys
    const balBefore = await ethers.provider.getBalance(merchant.address);
    await contract.connect(customer).purchaseMembership(0, { value: price });
    const balAfter = await ethers.provider.getBalance(merchant.address);
    expect(balAfter).to.be.greaterThan(balBefore);

    // Check purchase
    const purchase = await contract.getPurchase(0);
    expect(purchase.buyer).to.equal(customer.address);
    expect(purchase.merchant).to.equal(merchant.address);
    expect(purchase.amountPaid).to.equal(price);

    // Membership is valid
    expect(await contract.isMembershipValid(0)).to.be.true;

    // Plan sold count
    const updatedPlan = await contract.getPlan(0);
    expect(updatedPlan.sold).to.equal(1);
  });

  it("Should reject wrong payment amount", async function () {
    const { contract, merchant, customer } = await deploy();
    const price = ethers.parseEther("0.01");
    await contract.connect(merchant).createPlan("Plan", "Desc", price, 30, 100);
    await expect(
      contract
        .connect(customer)
        .purchaseMembership(0, { value: ethers.parseEther("0.005") }),
    ).to.be.revertedWith("Incorrect ETH amount");
  });

  it("Should reject when sold out", async function () {
    const { contract, merchant, customer } = await deploy();
    const price = ethers.parseEther("0.01");
    await contract.connect(merchant).createPlan("Plan", "Desc", price, 30, 1);
    await contract.connect(customer).purchaseMembership(0, { value: price });
    await expect(
      contract.connect(customer).purchaseMembership(0, { value: price }),
    ).to.be.revertedWith("Sold out");
  });

  it("Unregistered wallet cannot create or buy", async function () {
    const { contract, random } = await deploy();
    const price = ethers.parseEther("0.01");
    await expect(
      contract.connect(random).createPlan("Plan", "Desc", price, 30, 100),
    ).to.be.revertedWith("Not merchant");
    await expect(
      contract.connect(random).purchaseMembership(0, { value: price }),
    ).to.be.revertedWith("Not customer");
  });
});
