const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Denial of Service", () => {
  it("After being declared the winner, Attack.sol should not allow anyone else to become the winner", async () => {
    const goodGontract = await ethers.deployContract("Good");
    await goodGontract.waitForDeployment();

    const attackContract = await ethers.deployContract("Attack", [
      goodGontract.target,
    ]);
    await attackContract.waitForDeployment();

    const [_, address1, address2] = await ethers.getSigners();

    const txn1 = await goodGontract
      .connect(address1)
      .setCurrentAuctionPrice({ value: ethers.parseEther("1") });
    await txn1.wait();

    const txn2 = await goodGontract
      .connect(address2)
      .setCurrentAuctionPrice({ value: ethers.parseEther("3") });
    await txn2.wait();

    // attack
    const txn3 = await attackContract.attack({ value: ethers.parseEther("4") });
    await txn3.wait();

    const txn4 = await goodGontract
      .connect(address1)
      .setCurrentAuctionPrice({ value: ethers.parseEther("5") });
    await txn4.wait();

    expect(await goodGontract.currentWinner()).to.equal(attackContract.target);
  });
});
