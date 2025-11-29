import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Contract address from .env or hardcoded
  const contractAddress = process.env.CONTRACT_ADDRESS || '0x9302127a63D4Ad198Cd6114E8ac489E158133F35';

  // 기존 이벤트 삭제 (선택사항)
  await prisma.ticket.deleteMany();
  await prisma.event.deleteMany();
  console.log('🗑️  Cleared existing events and tickets');

  // 샘플 공연 데이터
  const events = [
    {
      title: 'BTS 월드 투어 2025 - 서울',
      date: new Date('2025-06-15T19:00:00'),
      price: 150000,
      location: '잠실 종합운동장 주경기장',
      description: '전 세계를 휩쓴 K-POP의 전설 BTS가 돌아옵니다! 3년 만에 펼쳐지는 대규모 월드 투어의 시작을 서울에서 만나보세요.',
      imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
      totalTickets: 50000,
      contractAddress,
    },
    {
      title: '울트라 뮤직 페스티벌 코리아 2025',
      date: new Date('2025-07-20T14:00:00'),
      price: 220000,
      location: '올림픽공원 88잔디마당',
      description: '세계 최고의 EDM 페스티벌이 한국에 상륙! Martin Garrix, Marshmello 등 글로벌 슈퍼스타 DJ들과 함께하는 잊지 못할 여름 밤.',
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
      totalTickets: 30000,
      contractAddress,
    },
    {
      title: '아이유 콘서트 - Golden Hour',
      date: new Date('2025-05-10T19:30:00'),
      price: 132000,
      location: 'KSPO DOME (올림픽체조경기장)',
      description: '국민 가수 아이유의 특별한 콘서트. 대표곡들과 신곡 무대를 모두 만나볼 수 있는 프리미엄 공연입니다.',
      imageUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80',
      totalTickets: 15000,
      contractAddress,
    },
    {
      title: '뉴진스 팬미팅 - Bunnies Party',
      date: new Date('2025-08-05T18:00:00'),
      price: 99000,
      location: '고척 스카이돔',
      description: '뉴진스와 함께하는 특별한 팬미팅! 공연, 토크, 게임 등 다채로운 프로그램으로 팬들과 소통하는 시간을 가집니다.',
      imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
      totalTickets: 20000,
      contractAddress,
    },
    {
      title: '서울 재즈 페스티벌 2025',
      date: new Date('2025-09-15T17:00:00'),
      price: 88000,
      location: '올림픽공원 올림픽홀',
      description: '세계적인 재즈 뮤지션들이 한자리에! 3일간 펼쳐지는 프리미엄 재즈 페스티벌에서 최고의 연주를 감상하세요.',
      imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&q=80',
      totalTickets: 5000,
      contractAddress,
    },
  ];

  // 이벤트 생성
  for (const eventData of events) {
    const event = await prisma.event.create({
      data: eventData,
    });
    console.log(`✅ Created event: ${event.title}`);
  }

  console.log('🎉 Seeding completed!');
  console.log(`📊 Created ${events.length} events`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
