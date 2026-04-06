import { expect } from "chai";
import { ethers } from "hardhat";

describe("RestaurantMembership", function () {
  it("Should deploy successfully, let merchant create membership, and customer purchase", async function () {
    const [merchant, customer] = await ethers.getSigners();
    const RestaurantMembership = await ethers.getContractFactory("RestaurantMembership");
    const restaurantMembership = await RestaurantMembership.deploy();
    await restaurantMembership.waitForDeployment();

    expect(await restaurantMembership.getAddress()).to.be.properAddress;

    // Merchant creates a membership offering
    const title = "Gold Member";
    const benefits = "Exclusive benefits";
    const price = ethers.parseEther("0.01");
    const duration = 30n * 24n * 60n * 60n;
    const maxSupply = 100n;

    const createTx = await restaurantMembership
      .connect(merchant)
      .createMembership(title, benefits, price, duration, maxSupply);
    
    await createTx.wait();

    // Verify the offering was created
    const offering = await restaurantMembership.getMembershipOffering(merchant.address, title);
    expect(offering.title).to.equal(title);
    expect(offering.price).to.equal(price);
    expect(offering.maxSupply).to.equal(maxSupply);
    expect(offering.sold).to.equal(0);
    expect(offering.isActive).to.equal(true);

    // Customer purchases the membership
    const tx = await restaurantMembership
      .connect(customer)
      .buyMembership(
        merchant.address,
        title,
        benefits,
        0, // duration is ignored (taken from offering)
        0, // price is ignored (taken from offering)
        { value: price },
      );

    const receipt = await tx.wait();
    expect(receipt.status).to.equal(1);
    expect(await restaurantMembership.ownerOf(0)).to.equal(customer.address);
    expect(
      await restaurantMembership.verifyMembership(customer.address, merchant.address),
    ).to.equal(true);

    // Verify sold count incremented
    const updatedOffering = await restaurantMembership.getMembershipOffering(merchant.address, title);
    expect(updatedOffering.sold).to.equal(1);
  });
});
