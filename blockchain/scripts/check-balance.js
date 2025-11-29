const { ethers } = require('ethers');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function checkBalance() {
  const provider = new ethers.JsonRpcProvider('https://rpc-amoy.polygon.technology');
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log('\n💰 지갑 잔액 확인\n');
  console.log('주소:', wallet.address);

  const balance = await provider.getBalance(wallet.address);
  const balanceInMatic = ethers.formatEther(balance);

  console.log('잔액:', balanceInMatic, 'MATIC');

  if (balance === 0n) {
    console.log('\n⚠️  잔액이 0입니다!');
    console.log('\n📝 다음 단계:');
    console.log('   1. https://faucet.polygon.technology/ 접속');
    console.log('   2. "Polygon Amoy" 선택');
    console.log(`   3. 지갑 주소 입력: ${wallet.address}`);
    console.log('   4. Submit 클릭 (약 1~2분 소요)\n');
  } else {
    console.log('\n✅ 배포 가능합니다!\n');
  }
}

checkBalance().catch(console.error);
