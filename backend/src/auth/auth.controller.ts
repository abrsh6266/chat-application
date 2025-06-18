import { 
    Controller, 
    Post, 
    Body, 
    HttpCode, 
    HttpStatus,
    UseGuards,
    Get,
    Request
  } from '@nestjs/common';
  import { AuthService } from './auth.service';
  import { RegisterDto } from './dto/register.dto';
  import { LoginDto } from './dto/login.dto';
  import { AuthGuard } from './auth.guard';
  
  @Controller('auth')
  export class AuthController {
    constructor(private readonly authService: AuthService) {}
  
    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
      const result = await this.authService.register(registerDto);
      return {
        message: 'User registered successfully',
        user: {
          id: result.user.id,
          username: result.user.username,
          createdAt: result.user.createdAt
        },
        access_token: result.access_token
      };
    }
  
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto) {
      const result = await this.authService.login(loginDto);
      return {
        message: 'Login successful',
        user: {
          id: result.user.id,
          username: result.user.username,
          createdAt: result.user.createdAt
        },
        access_token: result.access_token
      };
    }
  
    @UseGuards(AuthGuard)
    @Get('profile')
    async getProfile(@Request() req) {
      const user = await this.authService.findUserById(req.user.sub);
      return {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    }
  
    @UseGuards(AuthGuard)
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout() {
      // In a more advanced setup, you might want to blacklist the JWT token
      // For now, we'll just return a success message
      return {
        message: 'Logout successful'
      };
    }
  }