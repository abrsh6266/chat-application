import { 
    Injectable, 
    ConflictException, 
    UnauthorizedException,
    NotFoundException 
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { PrismaService } from '../prisma/prisma.service';
  import { RegisterDto } from './dto/register.dto';
  import { LoginDto } from './dto/login.dto';
  import * as bcrypt from 'bcrypt';
  
  @Injectable()
  export class AuthService {
    constructor(
      private readonly prisma: PrismaService,
      private readonly jwtService: JwtService,
    ) {}
  
    async register(registerDto: RegisterDto) {
      const { username, password } = registerDto;
  
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { username },
      });
  
      if (existingUser) {
        throw new ConflictException('Username already exists');
      }
  
      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      try {
        // Create new user
        const user = await this.prisma.user.create({
          data: {
            username,
            password: hashedPassword,
          },
        });
  
        // Generate JWT token
        const payload = { 
          sub: user.id, 
          username: user.username 
        };
        const access_token = this.jwtService.sign(payload);
  
        return {
          user: {
            id: user.id,
            username: user.username,
            createdAt: user.createdAt,
          },
          access_token,
        };
      } catch (error) {
        throw new ConflictException('Failed to create user');
      }
    }
  
    async login(loginDto: LoginDto) {
      const { username, password } = loginDto;
  
      // Find user by username
      const user = await this.prisma.user.findUnique({
        where: { username },
      });
  
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
  
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
  
      // Generate JWT token
      const payload = { 
        sub: user.id, 
        username: user.username 
      };
      const access_token = this.jwtService.sign(payload);
  
      return {
        user: {
          id: user.id,
          username: user.username,
          createdAt: user.createdAt,
        },
        access_token,
      };
    }
  
    async findUserById(userId: string) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          createdAt: true,
          updatedAt: true,
        },
      });
  
      if (!user) {
        throw new NotFoundException('User not found');
      }
  
      return user;
    }
  
    async validateUser(userId: string) {
      return this.findUserById(userId);
    }
  }