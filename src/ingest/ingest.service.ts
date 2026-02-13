import { Injectable } from '@nestjs/common';
import { VehicleTelemetry } from './entities/vehicle-telemetry.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MeterTelemetry } from './entities/meter-telemetry.entity';
import { MeterLiveStatus } from './entities/meter-live-status.entity';
import { VehicleLiveStatus } from './entities/vehicle-live-status.entity';

@Injectable()
export class IngestService {

    constructor(
        @InjectRepository(VehicleTelemetry)
        private vehicleRepo: Repository<VehicleTelemetry>,

        @InjectRepository(MeterTelemetry)
        private meterRepo: Repository<MeterTelemetry>,

        @InjectRepository(VehicleLiveStatus)
        private vehicleLiveRepo: Repository<VehicleLiveStatus>,

        @InjectRepository(MeterLiveStatus)
        private meterLiveRepo: Repository<MeterLiveStatus>,

    ) { }

    async process(body: any) {

        // VEHICLE STREAM
        if (body.vehicleId) {

            // Insert into history (append only)
            await this.vehicleRepo.save({
                vehicleId: body.vehicleId,
                soc: body.soc,
                kwhDeliveredDc: body.kwhDeliveredDc,
                batteryTemp: body.batteryTemp,
                timestamp: new Date(body.timestamp),
            });

            // Upsert into live table (hot storage)
            await this.vehicleLiveRepo.save({
                vehicleId: body.vehicleId,
                soc: body.soc,
                kwhDeliveredDc: body.kwhDeliveredDc,
                batteryTemp: body.batteryTemp,
                lastUpdated: new Date(),
            });

            return { message: 'Vehicle history + live updated' };
        }

        // METER STREAM
        if (body.meterId) {

            // Insert into history
            await this.meterRepo.save({
                meterId: body.meterId,
                kwhConsumedAc: body.kwhConsumedAc,
                voltage: body.voltage,
                timestamp: new Date(body.timestamp),
            });

            // Upsert into live table
            await this.meterLiveRepo.save({
                meterId: body.meterId,
                kwhConsumedAc: body.kwhConsumedAc,
                voltage: body.voltage,
                lastUpdated: new Date(),
            });

            return { message: 'Meter history + live updated' };
        }

        return { message: 'Invalid payload' };
    }

}
