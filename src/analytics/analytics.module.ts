import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeterTelemetry } from 'src/ingest/entities/meter-telemetry.entity';
import { VehicleTelemetry } from 'src/ingest/entities/vehicle-telemetry.entity';
import { VehicleMeterMapping } from 'src/ingest/entities/vehicle-meter-mapping.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    VehicleTelemetry,
    MeterTelemetry,
    VehicleMeterMapping
  ]),],
  controllers: [AnalyticsController],
  providers: [AnalyticsService]
})
export class AnalyticsModule { }
