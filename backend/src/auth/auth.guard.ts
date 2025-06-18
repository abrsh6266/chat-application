import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { Request } from 'express';
  
  @Injectable()
  export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);      
      if (!token) {        
        throw new UnauthorizedException('Access token is required');
      }
      
      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
        });
        
        console.log('AuthGuard - JWT payload:', payload);
        
        // Attach the payload to the request object so we can access it in route handlers
        request['user'] = payload;
        console.log('AuthGuard - User attached to request:', request['user']);
      } catch (error) {
        console.log('AuthGuard - JWT verification failed:', error.message);
        throw new UnauthorizedException('Invalid or expired token');
      }
      
      return true;
    }
  
    private extractTokenFromHeader(request: Request): string | undefined {
      const [type, token] = request.headers.authorization?.split(' ') ?? [];
      return type === 'Bearer' ? token : undefined;
    }
  }