import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { DictionaryInformationService } from './dictionary-information.service';
import { CreateDictionaryInformationDto } from './dto/create-dictionary-information.dto';

@Controller('v1/dictionary-information')
export class DictionaryInformationController {
  constructor(private readonly service: DictionaryInformationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateDictionaryInformationDto) {
    return this.service.create(dto);
  }
}


