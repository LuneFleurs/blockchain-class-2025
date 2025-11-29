import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private blockchainService: BlockchainService,
  ) {}

  /**
   * 회원가입
   * 1. 이메일 중복 확인
   * 2. 비밀번호 해싱 (credentials 로그인인 경우)
   * 3. 블록체인 지갑 생성
   * 4. 사용자 DB 저장
   */
  async register(registerDto: RegisterDto) {
    const { email, password, provider = 'credentials' } = registerDto;

    // 이메일 중복 확인
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Google OAuth의 경우, 기존 유저면 로그인 처리
      if (provider === 'google') {
        const token = this.jwtService.sign({
          sub: existingUser.id,
          email: existingUser.email,
        });

        return {
          user: {
            id: existingUser.id,
            email: existingUser.email,
            walletAddress: existingUser.walletAddress,
            provider: existingUser.provider,
            createdAt: existingUser.createdAt,
          },
          accessToken: token,
        };
      }

      throw new ConflictException('Email already exists');
    }

    // 비밀번호 해싱 (credentials 로그인인 경우)
    let hashedPassword: string | null = null;
    if (provider === 'credentials' && password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // 블록체인 지갑 생성
    const wallet = this.blockchainService.createWallet();

    // 사용자 생성
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        provider,
        walletAddress: wallet.address,
        encryptedPrivateKey: wallet.encryptedPrivateKey,
      },
      select: {
        id: true,
        email: true,
        walletAddress: true,
        provider: true,
        createdAt: true,
      },
    });

    // JWT 토큰 발급
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return {
      user,
      accessToken: token,
    };
  }

  /**
   * 로그인
   * 1. 이메일로 사용자 조회
   * 2. 비밀번호 검증
   * 3. JWT 토큰 발급
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 사용자 조회
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 비밀번호 검증
    if (!user.password || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // JWT 토큰 발급
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        walletAddress: user.walletAddress,
        provider: user.provider,
      },
      accessToken: token,
    };
  }

  /**
   * JWT 토큰으로 사용자 조회
   */
  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        walletAddress: true,
        provider: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
