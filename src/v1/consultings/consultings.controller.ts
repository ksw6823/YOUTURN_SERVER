import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ConsultingsService } from './consultings.service';
import { CreateConsultingDto } from './dto/create-consulting.dto';

@Controller('v1/consultings')
export class ConsultingsController {
  constructor(private readonly consultingsService: ConsultingsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateConsultingDto) {
    return this.consultingsService.create(dto);
  }
}


