import { ethers } from "hardhat";

async function main() {
  // 관리자 지갑 (배포자)
  const [admin] = await ethers.getSigners();

  // 사용자 지갑 주소
  const userAddress = "0x903Cfd0209f70B010fA940668cD02CC6C715D3a4";

  // 0.1 MATIC 전송
  const amount = ethers.parseEther("0.1");

  console.log(`Sending ${ethers.formatEther(amount)} MATIC to ${userAddress}...`);
  console.log(`From admin: ${admin.address}`);
  console.log(`Admin balance: ${ethers.formatEther(await ethers.provider.getBalance(admin.address))} MATIC`);

  const tx = await admin.sendTransaction({
    to: userAddress,
    value: amount,
  });

  await tx.wait();

  console.log(`✅ Sent! Transaction hash: ${tx.hash}`);
  console.log(`User balance: ${ethers.formatEther(await ethers.provider.getBalance(userAddress))} MATIC`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
