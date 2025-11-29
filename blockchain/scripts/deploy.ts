import { ethers } from "hardhat";

async function main() {
  console.log("\n🚀 TicketNFT 컨트랙트 배포 시작...\n");

  // 배포자 계정 확인
  const [deployer] = await ethers.getSigners();
  console.log("📝 배포 계정:", deployer.address);

  // 배포 전 잔액 확인
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 계정 잔액:", ethers.formatEther(balance), "MATIC");

  if (balance === 0n) {
    console.log("\n⚠️  경고: 잔액이 0입니다!");
    console.log("   Polygon Amoy Faucet에서 테스트 MATIC을 받으세요:");
    console.log("   https://faucet.polygon.technology/\n");
    return;
  }

  // 컨트랙트 배포
  console.log("\n⏳ 컨트랙트 배포 중...");
  const TicketNFT = await ethers.getContractFactory("TicketNFT");
  const ticketNFT = await TicketNFT.deploy();

  await ticketNFT.waitForDeployment();

  const contractAddress = await ticketNFT.getAddress();

  console.log("\n✅ 배포 완료!\n");
  console.log("📍 컨트랙트 주소:", contractAddress);
  console.log("👤 컨트랙트 소유자:", deployer.address);

  console.log("\n" + "=".repeat(70));
  console.log("📋 다음 단계:");
  console.log("=".repeat(70));
  console.log("\n1️⃣  backend/.env 파일을 열고 다음 줄을 수정하세요:");
  console.log(`\n    CONTRACT_ADDRESS="${contractAddress}"\n`);
  console.log("2️⃣  Polygon Amoy 탐색기에서 컨트랙트 확인:");
  console.log(`\n    https://amoy.polygonscan.com/address/${contractAddress}\n`);
  console.log("=".repeat(70) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ 배포 실패:", error);
    process.exit(1);
  });
