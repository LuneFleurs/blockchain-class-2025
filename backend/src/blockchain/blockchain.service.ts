import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import * as crypto from 'crypto';

// TicketNFT ABI - 필요한 함수들과 이벤트 포함
const TICKET_NFT_ABI = [
  'function mintTicket(address to, string memory eventName, uint256 eventDate, uint256 price) public returns (uint256)',
  'function transferFrom(address from, address to, uint256 tokenId) public',
  'function ownerOf(uint256 tokenId) public view returns (address)',
  'function getTicketInfo(uint256 tokenId) public view returns (tuple(string eventName, uint256 eventDate, uint256 price, bool isUsed))',
  'function useTicket(uint256 tokenId) public',
  'event TicketMinted(address indexed to, uint256 indexed tokenId, string eventName)',
  'event TicketRefunded(address indexed from, uint256 indexed tokenId)',
  'event TicketUsed(uint256 indexed tokenId)',
];

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: ethers.JsonRpcProvider;
  private adminWallet: ethers.Wallet;
  private contract: ethers.Contract;
  private encryptionKey: Buffer;

  constructor(private configService: ConfigService) {
    // RPC Provider 초기화
    const rpcUrl = this.configService.get<string>('RPC_URL');
    if (!rpcUrl) {
      throw new Error('RPC_URL is not defined in environment variables');
    }
    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    // Admin 지갑 초기화
    const adminPrivateKey = this.configService.get<string>('ADMIN_PRIVATE_KEY');
    if (!adminPrivateKey) {
      throw new Error('ADMIN_PRIVATE_KEY is not defined in environment variables');
    }
    this.adminWallet = new ethers.Wallet(adminPrivateKey, this.provider);

    // 스마트 컨트랙트 초기화
    const contractAddress = this.configService.get<string>('CONTRACT_ADDRESS');
    if (!contractAddress) {
      throw new Error('CONTRACT_ADDRESS is not defined in environment variables');
    }
    this.contract = new ethers.Contract(
      contractAddress,
      TICKET_NFT_ABI,
      this.adminWallet,
    );

    // 암호화 키 초기화 (32바이트)
    const encryptionKeyString = this.configService.get<string>('ENCRYPTION_KEY');
    if (!encryptionKeyString) {
      throw new Error('ENCRYPTION_KEY is not defined in environment variables');
    }
    this.encryptionKey = Buffer.from(encryptionKeyString, 'hex');

    this.logger.log('Blockchain Service initialized');
    this.logger.log(`Admin Wallet Address: ${this.adminWallet.address}`);
    this.logger.log(`Contract Address: ${contractAddress}`);
  }

  /**
   * 새로운 이더리움 지갑 생성
   * @returns 지갑 주소와 암호화된 개인키
   */
  createWallet(): { address: string; encryptedPrivateKey: string } {
    // 랜덤 지갑 생성
    const wallet = ethers.Wallet.createRandom();

    // 개인키 암호화 (AES-256-CBC)
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);

    let encrypted = cipher.update(wallet.privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // IV와 암호화된 데이터를 함께 저장 (IV:encrypted 형식)
    const encryptedPrivateKey = `${iv.toString('hex')}:${encrypted}`;

    this.logger.log(`New wallet created: ${wallet.address}`);

    return {
      address: wallet.address,
      encryptedPrivateKey,
    };
  }

  /**
   * 암호화된 개인키 복호화
   * @param encryptedPrivateKey 암호화된 개인키
   * @returns 복호화된 개인키
   */
  private decryptPrivateKey(encryptedPrivateKey: string): string {
    const [ivHex, encrypted] = encryptedPrivateKey.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, iv);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * NFT 티켓 발행
   * @param toAddress 티켓을 받을 사용자 주소
   * @param eventName 공연 이름
   * @param eventDate 공연 날짜 (Unix timestamp)
   * @param price 티켓 가격 (Wei 단위)
   * @returns 발행된 티켓의 Token ID와 트랜잭션 해시
   */
  async mintTicket(
    toAddress: string,
    eventName: string,
    eventDate: number,
    price: number,
  ): Promise<{ tokenId: number; txHash: string }> {
    try {
      this.logger.log(`Minting ticket for ${toAddress}...`);

      // Nonce 충돌 방지: pending 상태 포함한 최신 nonce 조회
      const nonce = await this.provider.getTransactionCount(
        this.adminWallet.address,
        'pending',
      );

      // 티켓 발행 트랜잭션 전송
      const tx = await this.contract.mintTicket(
        toAddress,
        eventName,
        eventDate,
        price,
        { nonce },
      );

      this.logger.log(`Transaction sent: ${tx.hash}`);

      // 트랜잭션이 블록에 포함될 때까지 대기
      const receipt = await tx.wait();

      this.logger.log(`Transaction confirmed in block ${receipt.blockNumber}`);

      // 이벤트 로그에서 tokenId 추출
      // TicketMinted 이벤트: event TicketMinted(address indexed to, uint256 indexed tokenId, string eventName)
      let tokenId: number | null = null;
      const contractAddress = (await this.contract.getAddress()).toLowerCase();

      // receipt의 모든 로그를 순회하면서 파싱 시도
      this.logger.debug(`Contract address: ${contractAddress}`);
      this.logger.debug(`Receipt logs count: ${receipt.logs.length}`);

      for (let i = 0; i < receipt.logs.length; i++) {
        const log = receipt.logs[i];
        this.logger.debug(`\n=== Log ${i} ===`);
        this.logger.debug(`Address: ${log.address}`);
        this.logger.debug(`Topics: ${JSON.stringify(log.topics)}`);
        this.logger.debug(`Data: ${log.data}`);

        // 컨트랙트 주소가 일치하는 로그만 처리
        if (log.address.toLowerCase() !== contractAddress) {
          this.logger.debug(`Address mismatch (expected: ${contractAddress}), skipping`);
          continue;
        }

        this.logger.debug(`Address matched! Attempting to parse...`);

        try {
          const parsed = this.contract.interface.parseLog({
            topics: log.topics as string[],
            data: log.data,
          });

          this.logger.debug(`Parsed successfully: ${parsed?.name}`);

          if (parsed && parsed.name === 'TicketMinted') {
            // indexed 파라미터는 args에 포함됨
            tokenId = Number(parsed.args[1]); // tokenId는 두 번째 파라미터
            this.logger.log(`Found TicketMinted event with tokenId: ${tokenId}`);
            break;
          }
        } catch (error) {
          this.logger.debug(`Parse failed: ${error.message}`);
          continue;
        }
      }

      if (tokenId === null) {
        // 모든 로그를 출력해서 디버깅
        this.logger.error('Failed to parse TicketMinted event from logs');
        throw new Error('Failed to find minted token ID');
      }

      this.logger.log(`Ticket minted successfully. Token ID: ${tokenId}`);

      return {
        tokenId,
        txHash: tx.hash,
      };
    } catch (error) {
      this.logger.error('Failed to mint ticket:', error);
      throw new Error(`Failed to mint ticket: ${error.message}`);
    }
  }

  /**
   * 티켓 환불 (플랫폼으로 반환)
   * @param encryptedPrivateKey 사용자의 암호화된 개인키
   * @param tokenId 환불할 티켓의 Token ID
   * @returns 트랜잭션 해시
   */
  async refundTicket(
    encryptedPrivateKey: string,
    tokenId: number,
  ): Promise<{ txHash: string }> {
    try {
      this.logger.log(`Refunding ticket ${tokenId}...`);

      // 사용자 개인키 복호화
      const userPrivateKey = this.decryptPrivateKey(encryptedPrivateKey);
      const userWallet = new ethers.Wallet(userPrivateKey, this.provider);

      // 현재 소유자 확인
      const currentOwner = await this.contract.ownerOf(tokenId);
      if (currentOwner.toLowerCase() !== userWallet.address.toLowerCase()) {
        throw new Error('User is not the owner of this ticket');
      }

      // 사용자 지갑 잔액 확인
      const userBalance = await this.provider.getBalance(userWallet.address);
      this.logger.log(`User wallet balance: ${ethers.formatEther(userBalance)} MATIC`);

      // 가스비가 부족하면 Admin이 전송
      const gasEstimate = ethers.parseEther('0.01'); // 0.01 MATIC (가스비)
      if (userBalance < gasEstimate) {
        this.logger.log('User has insufficient gas, sending gas fee from admin...');

        const gasTx = await this.adminWallet.sendTransaction({
          to: userWallet.address,
          value: gasEstimate,
        });
        await gasTx.wait();
        this.logger.log(`Gas fee sent: ${gasTx.hash}`);
      }

      // 사용자 지갑으로 컨트랙트 연결
      const contractWithUserSigner = this.contract.connect(userWallet);

      // Nonce 조회
      const nonce = await this.provider.getTransactionCount(
        userWallet.address,
        'pending',
      );

      // 플랫폼(Admin)에게 티켓 전송 (환불)
      const tx = await (contractWithUserSigner as any).transferFrom(
        userWallet.address,
        this.adminWallet.address,
        tokenId,
        { nonce },
      );

      this.logger.log(`Refund transaction sent: ${tx.hash}`);

      // 트랜잭션 확정 대기
      await tx.wait();

      this.logger.log(`Ticket ${tokenId} refunded successfully`);

      return {
        txHash: tx.hash,
      };
    } catch (error) {
      this.logger.error('Failed to refund ticket:', error);
      throw new Error(`Failed to refund ticket: ${error.message}`);
    }
  }

  /**
   * 티켓 정보 조회
   * @param tokenId 조회할 티켓의 Token ID
   * @returns 티켓 정보
   */
  async getTicketInfo(tokenId: number) {
    try {
      const info = await this.contract.getTicketInfo(tokenId);
      const owner = await this.contract.ownerOf(tokenId);

      return {
        eventName: info.eventName,
        eventDate: Number(info.eventDate),
        price: Number(info.price),
        isUsed: info.isUsed,
        owner,
      };
    } catch (error) {
      this.logger.error(`Failed to get ticket info for token ${tokenId}:`, error);
      throw new Error(`Failed to get ticket info: ${error.message}`);
    }
  }

  /**
   * 관리자 지갑 주소 반환
   */
  getAdminAddress(): string {
    return this.adminWallet.address;
  }
}
