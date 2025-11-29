import { expect } from "chai";
import { ethers } from "hardhat";
import { TicketNFT } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("TicketNFT - 스캘핑 방지 테스트", function () {
  let ticketNFT: TicketNFT;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let scalper: SignerWithAddress;

  const EVENT_NAME = "BTS Concert 2025";
  const EVENT_DATE = Math.floor(Date.now() / 1000) + 86400 * 30; // 30일 후
  const TICKET_PRICE = ethers.parseEther("0.1"); // 0.1 ETH

  beforeEach(async function () {
    // 계정 설정
    [owner, user1, user2, scalper] = await ethers.getSigners();

    // 컨트랙트 배포
    const TicketNFTFactory = await ethers.getContractFactory("TicketNFT");
    ticketNFT = await TicketNFTFactory.deploy();
    await ticketNFT.waitForDeployment();
  });

  describe("📝 티켓 발행 (Minting)", function () {
    it("플랫폼(owner)이 티켓을 발행할 수 있어야 함", async function () {
      await expect(
        ticketNFT.mintTicket(user1.address, EVENT_NAME, EVENT_DATE, TICKET_PRICE)
      )
        .to.emit(ticketNFT, "TicketMinted")
        .withArgs(user1.address, 0, EVENT_NAME);

      expect(await ticketNFT.ownerOf(0)).to.equal(user1.address);
    });

    it("일반 사용자는 티켓을 발행할 수 없어야 함", async function () {
      await expect(
        ticketNFT
          .connect(user1)
          .mintTicket(user2.address, EVENT_NAME, EVENT_DATE, TICKET_PRICE)
      ).to.be.revertedWithCustomError(ticketNFT, "OwnableUnauthorizedAccount");
    });

    it("발행된 티켓 정보를 조회할 수 있어야 함", async function () {
      await ticketNFT.mintTicket(
        user1.address,
        EVENT_NAME,
        EVENT_DATE,
        TICKET_PRICE
      );

      const ticketInfo = await ticketNFT.getTicketInfo(0);
      expect(ticketInfo.eventName).to.equal(EVENT_NAME);
      expect(ticketInfo.eventDate).to.equal(EVENT_DATE);
      expect(ticketInfo.price).to.equal(TICKET_PRICE);
      expect(ticketInfo.isUsed).to.be.false;
    });
  });

  describe("🚫 P2P 전송 차단 (핵심 기능!)", function () {
    beforeEach(async function () {
      // user1에게 티켓 발행
      await ticketNFT.mintTicket(
        user1.address,
        EVENT_NAME,
        EVENT_DATE,
        TICKET_PRICE
      );
    });

    it("❌ 사용자 간 직접 전송이 차단되어야 함 (transferFrom)", async function () {
      // user1이 user2에게 직접 전송 시도 → 실패해야 함
      await expect(
        ticketNFT.connect(user1).transferFrom(user1.address, user2.address, 0)
      ).to.be.revertedWith("Direct transfer not allowed. Use refund.");
    });

    it("❌ 사용자 간 직접 전송이 차단되어야 함 (safeTransferFrom)", async function () {
      // user1이 user2에게 안전 전송 시도 → 실패해야 함
      await expect(
        ticketNFT
          .connect(user1)
          ["safeTransferFrom(address,address,uint256)"](
            user1.address,
            user2.address,
            0
          )
      ).to.be.revertedWith("Direct transfer not allowed. Use refund.");
    });

    it("❌ 스캘퍼가 웃돈을 받고 양도하려 해도 차단되어야 함", async function () {
      // 스캘퍼가 user1에게서 승인받고 scalper 주소로 전송 시도
      await ticketNFT.connect(user1).approve(scalper.address, 0);

      await expect(
        ticketNFT
          .connect(scalper)
          .transferFrom(user1.address, scalper.address, 0)
      ).to.be.revertedWith("Direct transfer not allowed. Use refund.");
    });
  });

  describe("✅ 환불 (Refund) 기능", function () {
    beforeEach(async function () {
      // user1에게 티켓 발행
      await ticketNFT.mintTicket(
        user1.address,
        EVENT_NAME,
        EVENT_DATE,
        TICKET_PRICE
      );
    });

    it("사용자가 플랫폼(owner)에게 환불할 수 있어야 함", async function () {
      // user1이 플랫폼에 환불
      await expect(
        ticketNFT.connect(user1).transferFrom(user1.address, owner.address, 0)
      )
        .to.emit(ticketNFT, "TicketRefunded")
        .withArgs(user1.address, 0);

      // 티켓이 플랫폼(owner)에게 돌아왔는지 확인
      expect(await ticketNFT.ownerOf(0)).to.equal(owner.address);
    });

    it("플랫폼이 환불받은 티켓을 다른 사용자에게 재판매할 수 있어야 함", async function () {
      // 1. user1이 환불
      await ticketNFT
        .connect(user1)
        .transferFrom(user1.address, owner.address, 0);

      // 2. 플랫폼이 user2에게 재판매
      await ticketNFT.connect(owner).transferFrom(owner.address, user2.address, 0);

      // 3. user2가 새 소유자인지 확인
      expect(await ticketNFT.ownerOf(0)).to.equal(user2.address);
    });
  });

  describe("🎫 티켓 사용 (입장 처리)", function () {
    beforeEach(async function () {
      await ticketNFT.mintTicket(
        user1.address,
        EVENT_NAME,
        EVENT_DATE,
        TICKET_PRICE
      );
    });

    it("플랫폼이 티켓을 사용 처리할 수 있어야 함", async function () {
      await expect(ticketNFT.useTicket(0))
        .to.emit(ticketNFT, "TicketUsed")
        .withArgs(0);

      const ticketInfo = await ticketNFT.getTicketInfo(0);
      expect(ticketInfo.isUsed).to.be.true;
    });

    it("이미 사용된 티켓은 재사용할 수 없어야 함", async function () {
      await ticketNFT.useTicket(0);

      await expect(ticketNFT.useTicket(0)).to.be.revertedWith(
        "Ticket already used"
      );
    });

    it("일반 사용자는 티켓을 사용 처리할 수 없어야 함", async function () {
      await expect(
        ticketNFT.connect(user1).useTicket(0)
      ).to.be.revertedWithCustomError(ticketNFT, "OwnableUnauthorizedAccount");
    });
  });

  describe("📊 시나리오 테스트", function () {
    it("전체 시나리오: 발행 → 환불 → 재판매 → 사용", async function () {
      // 1. 플랫폼이 user1에게 티켓 발행
      await ticketNFT.mintTicket(
        user1.address,
        EVENT_NAME,
        EVENT_DATE,
        TICKET_PRICE
      );
      expect(await ticketNFT.ownerOf(0)).to.equal(user1.address);

      // 2. user1이 환불
      await ticketNFT
        .connect(user1)
        .transferFrom(user1.address, owner.address, 0);
      expect(await ticketNFT.ownerOf(0)).to.equal(owner.address);

      // 3. 플랫폼이 user2에게 재판매
      await ticketNFT.connect(owner).transferFrom(owner.address, user2.address, 0);
      expect(await ticketNFT.ownerOf(0)).to.equal(user2.address);

      // 4. 공연 당일, 입장 처리
      await ticketNFT.useTicket(0);
      const ticketInfo = await ticketNFT.getTicketInfo(0);
      expect(ticketInfo.isUsed).to.be.true;
    });
  });
});
