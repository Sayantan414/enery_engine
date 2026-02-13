import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class MeterLiveStatus {

    @PrimaryColumn()
    meterId: string;

    @Column('float')
    kwhConsumedAc: number;

    @Column('float')
    voltage: number;

    @Column()
    lastUpdated: Date;
}
