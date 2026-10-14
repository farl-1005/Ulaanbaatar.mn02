import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { ApiError } from '../common/http';
import { AuthService } from './auth.service';

/** Зөвхөн нэвтэрсэн admin: @UseGuards(AdminGuard) */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    if (await this.auth.isAdmin(ctx.switchToHttp().getRequest<Request>())) return true;
    throw new ApiError(401, 'unauthorized');
  }
}
