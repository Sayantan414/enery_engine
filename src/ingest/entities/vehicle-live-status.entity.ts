import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class VehicleLiveStatus {

    @PrimaryColumn()
    vehicleId: string;

    @Column('float')
    soc: number;

    @Column('float')
    kwhDeliveredDc: number;

    @Column('float')
    batteryTemp: number;

    @Column()
    lastUpdated: Date;
}
