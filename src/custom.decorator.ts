import {
  SetMetadata,
  CustomDecorator,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';

export const REQUIRE_LOGIN_KEY = 'require-login';
export const REQUIRE_PERMISSION_KEY = 'require-permission';

export const RequireLogin = (): CustomDecorator =>
  SetMetadata(REQUIRE_LOGIN_KEY, true);

export const RequirePermission = (...permissions: string[]): CustomDecorator =>
  SetMetadata(REQUIRE_PERMISSION_KEY, permissions);

export const UserInfo = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();

    if (!request.user) {
      return null;
    }

    return data ? request.user[data] : request.user;
  },
);
