const { ethers } = require('ethers');

// 새 지갑 생성
const wallet = ethers.Wallet.createRandom();

console.log('\n=== 관리자 지갑 생성 완료 ===\n');
console.log('주소 (Address):', wallet.address);
console.log('개인키 (Private Key):', wallet.privateKey);
console.log('\n⚠️  개인키는 절대 공유하지 마세요!\n');
console.log('📝 .env 파일에 다음과 같이 설정하세요:');
console.log(`ADMIN_PRIVATE_KEY=${wallet.privateKey.substring(2)}`); // 0x 제거
console.log('\n💰 테스트넷 MATIC 받기:');
console.log(`   https://faucet.polygon.technology/`);
console.log(`   위 사이트에서 주소(${wallet.address})로 MATIC을 받으세요.\n`);
