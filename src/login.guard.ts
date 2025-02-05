import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { Permission } from './user/entities/permission.entity';

interface JwtUserData {
  userId: number;
  username: string;
  email: string;
  roles: string[];
  permissions: Permission[];
}

declare module 'express' {
  interface Request {
    user: JwtUserData;
  }
}

@Injectable()
export class LoginGuard implements CanActivate {
  @Inject(Reflector)
  private reflector: Reflector;

  @Inject(JwtService)
  private jwtService: JwtService;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requireLogin = this.reflector.getAllAndOverride<boolean>(
      'require-login',
      [context.getHandler(), context.getClass()],
    );

    if (!requireLogin) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();

    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException('请先登录');
    }

    const token = authorization.split(' ')[1];
    let data;

    try {
      data = this.jwtService.verify<JwtUserData>(token);
    } catch (error) {
      throw new UnauthorizedException('token已失效,请重新登录');
    }

    if (!('username' in data)) {
      throw new UnauthorizedException('header中不要使用refreshToken');
    }

    request.user = {
      userId: data.userId,
      username: data.username,
      email: data.email,
      roles: data.roles,
      permissions: data.permissions,
    };
    return true;
  }
}
