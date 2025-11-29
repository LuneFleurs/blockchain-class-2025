const { ethers } = require("hardhat");

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("PRIVATE_KEY not found in .env");
    process.exit(1);
  }

  const wallet = new ethers.Wallet(privateKey);
  console.log("\n=== Admin Wallet Info ===");
  console.log("Address:", wallet.address);
  console.log("\nFaucet URL:");
  console.log("https://faucet.polygon.technology/");
  console.log("\nBlockchain Explorer:");
  console.log(`https://amoy.polygonscan.com/address/${wallet.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
