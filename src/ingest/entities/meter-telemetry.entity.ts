import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class MeterTelemetry {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    meterId: string;

    @Column('float')
    kwhConsumedAc: number;

    @Column('float')
    voltage: number;

    @Column()
    timestamp: Date;
}
