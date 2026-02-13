import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class VehicleTelemetry {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    vehicleId: string;

    @Column('float')
    soc: number;

    @Column('float')
    kwhDeliveredDc: number;

    @Column('float')
    batteryTemp: number;

    @Column()
    timestamp: Date;
}
