import { Controller, Get, Param, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiError, clientIp } from '../common/http';
import { AirService } from './air.service';
import { ImageService } from './image.service';
import { MapService } from './map.service';
import { WeatherService } from './weather.service';

/** Гадны бодит цагийн өгөгдлийг манай серверээр дамжуулна: түлхүүрийг хөтөч рүү гаргахгүй, бүх зочин нэг кэшийг хуваалцана. */
@Controller('api')
export class LiveController {
  constructor(
    private readonly weather: WeatherService,
    private readonly air: AirService,
    private readonly map: MapService,
    private readonly images: ImageService,
  ) {}

  /** GET /api/weather: Open-Meteo. Түр тасарвал сүүлийн утгаа өгнө. */
  @Get('weather')
  async getWeather(@Res({ passthrough: true }) res: Response) {
    try {
      const w = await this.weather.current();
      res.setHeader('Cache-Control', 'public, max-age=300');
      return w;
    } catch {
      if (this.weather.last) return this.weather.last;
      throw new ApiError(502, 'weather_unavailable');
    }
  }

  /** GET /api/air: агаарын чанар (IQAir, Open-Meteo). Түр тасарвал сүүлийн утгаа өгнө. */
  @Get('air')
  async getAir(@Res({ passthrough: true }) res: Response) {
    try {
      const a = await this.air.now();
      res.setHeader('Cache-Control', 'public, max-age=120');
      return a;
    } catch {
      if (this.air.last) return this.air.last;
      throw new ApiError(502, 'air_unavailable');
    }
  }

  /** GET /api/img?w=240|1280&u=https://ulaanbaatar.mn/files/... */
  @Get('img')
  image(@Query('u') u: unknown, @Query('w') w: unknown, @Req() req: Request, @Res() res: Response) {
    return this.images.serve(res, String(u || ''), +String(w || 0) || 0, clientIp(req));
  }

  /** GET /api/map/tiles/map-info/<id> */
  @Get('map/tiles/map-info/:id')
  mapInfo(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    if (!/^[\w-]{1,64}$/.test(id)) throw new ApiError(404, 'not_found');
    return this.map.proxy(res, `tiles/map-info/${id}`, clientIp(req));
  }

  /** GET /api/map/tiles/<layerId>/<z>/<x>/<y>.pbf */
  @Get('map/tiles/:layer/:z/:x/:y')
  mapTile(@Param() p: Record<string, string>, @Req() req: Request, @Res() res: Response) {
    if (!/^[\w-]{1,64}$/.test(p.layer) || !/^\d{1,2}$/.test(p.z) || !/^\d{1,7}$/.test(p.x) || !/^\d{1,7}\.pbf$/.test(p.y)) throw new ApiError(404, 'not_found');
    return this.map.proxy(res, `tiles/${p.layer}/${p.z}/${p.x}/${p.y}`, clientIp(req));
  }
}
