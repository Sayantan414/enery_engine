import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
    @Get()
    root() {
        return {
            service: 'High-Scale Energy Ingestion Engine',
            status: 'running',
            timestamp: new Date(),
        };
    }
}
