import { Controller, Get } from '@nestjs/common';
import { Database } from './database/database';

@Controller('api')
export class HealthController {
  constructor(private readonly db: Database) {}

  /** GET /api/health: Docker-ийн healthcheck */
  @Get('health')
  health() {
    return { ok: true, db: this.db.kind };
  }
}
