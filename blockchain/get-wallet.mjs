import { Wallet } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  console.error("PRIVATE_KEY not found in .env");
  process.exit(1);
}

const wallet = new Wallet(privateKey);

console.log("\n🔑 Admin Wallet Address:");
console.log(wallet.address);
console.log("\n💰 Get POL (MATIC) from Faucet:");
console.log("👉 https://faucet.polygon.technology/");
console.log("\n🔍 Check Balance:");
console.log(`👉 https://amoy.polygonscan.com/address/${wallet.address}`);
console.log("\n");
