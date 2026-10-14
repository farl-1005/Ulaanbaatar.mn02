import { Controller, Get, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { EventsService } from './events.service';

@Controller('api')
export class EventsController {
  constructor(private readonly events: EventsService) {}

  /** GET /api/events: хөтөч EventSource-оор холбогдоно */
  @Get('events')
  subscribe(@Req() req: Request, @Res() res: Response) {
    this.events.subscribe(req, res);
  }
}
