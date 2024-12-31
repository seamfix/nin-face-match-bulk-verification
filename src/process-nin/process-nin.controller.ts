import { Body, Controller, Post, Response } from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import { IBody } from './process-nin.dto';
import { ProcessNinService } from './process-nin.service';

@Controller('process')
export class ProcessNinController {
  constructor(private readonly processNinService: ProcessNinService) {}
  @Post()
  async processNin(@Body() body: IBody, @Response() res: ExpressResponse) {
    const response =
      await this.processNinService.initiateBulkRecordProcessing(body);
    if (response?.code === 0) {
      res.status(200).json({ ...response });
    } else {
      res.status(500).json({ ...response });
    }
  }
}
