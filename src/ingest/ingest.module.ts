import { Module } from '@nestjs/common';
import { IngestController } from './ingest.controller';
import { IngestService } from './ingest.service';
import { VehicleTelemetry } from './entities/vehicle-telemetry.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeterTelemetry } from './entities/meter-telemetry.entity';
import { MeterLiveStatus } from './entities/meter-live-status.entity';
import { VehicleLiveStatus } from './entities/vehicle-live-status.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VehicleTelemetry, MeterTelemetry, VehicleLiveStatus,
    MeterLiveStatus,])],
  controllers: [IngestController],
  providers: [IngestService],
})
export class IngestModule { }
