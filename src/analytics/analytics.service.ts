import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MeterTelemetry } from 'src/ingest/entities/meter-telemetry.entity';
import { VehicleMeterMapping } from 'src/ingest/entities/vehicle-meter-mapping.entity';
import { VehicleTelemetry } from 'src/ingest/entities/vehicle-telemetry.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AnalyticsService {
    constructor(
        @InjectRepository(VehicleTelemetry)
        private vehicleRepo: Repository<VehicleTelemetry>,

        @InjectRepository(MeterTelemetry)
        private meterRepo: Repository<MeterTelemetry>,

        @InjectRepository(VehicleMeterMapping)
        private mappingRepo: Repository<VehicleMeterMapping>,
    ) { }

    async getPerformance(vehicleId: string) {

        const since = new Date();
        since.setHours(since.getHours() - 24);

        // 1️⃣ Get mapped meterId
        const mapping = await this.mappingRepo.findOne({
            where: { vehicleId },
        });

        if (!mapping) {
            throw new NotFoundException('Vehicle-Meter mapping not found');
        }

        const meterId = mapping.meterId;

        // 2️⃣ Aggregate Vehicle (DC)
        const vehicleStats = await this.vehicleRepo
            .createQueryBuilder('v')
            .select('COALESCE(SUM(v.kwhDeliveredDc),0)', 'totalDc')
            .addSelect('COALESCE(AVG(v.batteryTemp),0)', 'avgTemp')
            .where('v.vehicleId = :vehicleId', { vehicleId })
            .andWhere('v.timestamp >= :since', { since })
            .getRawOne();

        // 3️⃣ Aggregate Meter (AC)
        const meterStats = await this.meterRepo
            .createQueryBuilder('m')
            .select('COALESCE(SUM(m.kwhConsumedAc),0)', 'totalAc')
            .where('m.meterId = :meterId', { meterId })
            .andWhere('m.timestamp >= :since', { since })
            .getRawOne();

        const totalDc = Number(vehicleStats.totalDc);
        const totalAc = Number(meterStats.totalAc);
        const avgTemp = Number(vehicleStats.avgTemp);

        const efficiency = totalAc > 0
            ? Number((totalDc / totalAc).toFixed(2))
            : 0;

        return {
            vehicleId,
            last24Hours: {
                totalAc,
                totalDc,
                efficiency,
                avgBatteryTemp: avgTemp,
            },
        };
    }
}
