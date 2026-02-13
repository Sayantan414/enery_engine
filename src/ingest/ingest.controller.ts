import { Controller, Post, Body } from '@nestjs/common';
import { IngestService } from './ingest.service';

@Controller('v1/ingest')

export class IngestController {
    constructor(private readonly ingestService: IngestService) { }

    @Post()
    ingest(@Body() body: any) {
        return this.ingestService.process(body);
    }
}
