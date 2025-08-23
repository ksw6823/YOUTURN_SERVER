import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { InformationService } from './information.service';
import { CreateInformationDto } from './dto/create-information.dto';

@Controller('v1/information')
export class InformationController {
  constructor(private readonly service: InformationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateInformationDto) {
    return this.service.create(dto);
  }
}
