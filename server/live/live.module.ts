import { Module } from '@nestjs/common';
import { AirService } from './air.service';
import { ImageService } from './image.service';
import { LiveController } from './live.controller';
import { MapService } from './map.service';
import { WeatherService } from './weather.service';

/** Газрын зураг (hamuga.mn), зураг жижигрүүлэх, агаарын чанар (IQAir, Open-Meteo), цаг агаар (Open-Meteo) */
@Module({
  controllers: [LiveController],
  providers: [WeatherService, AirService, MapService, ImageService],
})
export class LiveModule {}
