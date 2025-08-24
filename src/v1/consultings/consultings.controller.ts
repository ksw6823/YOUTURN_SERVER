import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  Param,
  Delete,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { ConsultingsService } from './consultings.service';
import { CreateConsultingDto } from './dto/create-consulting.dto';
import { GenerateConsultingDto } from './dto/generate-consulting.dto';

@Controller('v1/consultings')
export class ConsultingsController {
  private readonly logger = new Logger(ConsultingsController.name);

  constructor(private readonly consultingsService: ConsultingsService) {}

  /**
   * 🚀 NEW: 자동 컨설팅 생성 (LLM 연동)
   * POST /v1/consultings/generate
   */
  @Post('generate')
  @HttpCode(HttpStatus.OK)
  async generateConsulting(@Body(ValidationPipe) dto: GenerateConsultingDto) {
    this.logger.log(`컨설팅 생성 요청: information_id=${dto.information_id}`);

    try {
      const result = await this.consultingsService.generateConsulting(
        dto.information_id,
      );
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`컨설팅 생성 실패: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * 컨설팅 조회
   * GET /v1/consultings/:id
   */
  @Get(':id')
  async getConsulting(@Param('id') id: string) {
    this.logger.log(`컨설팅 조회 요청: consulting_id=${id}`);

    const consulting_id = parseInt(id, 10);
    return this.consultingsService.getConsulting(consulting_id);
  }

  /**
   * 사용자별 컨설팅 목록 조회
   * GET /v1/consultings/user/:user_id
   */
  @Get('user/:user_id')
  async getConsultingsByUser(@Param('user_id') user_id: string) {
    this.logger.log(`사용자별 컨설팅 목록 조회: user_id=${user_id}`);

    const userId = parseInt(user_id, 10);
    return this.consultingsService.getConsultingsByUser(userId);
  }



  /**
   * 컨설팅 삭제
   * DELETE /v1/consultings/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteConsulting(@Param('id') id: string) {
    this.logger.log(`컨설팅 삭제 요청: consulting_id=${id}`);

    const consulting_id = parseInt(id, 10);
    await this.consultingsService.deleteConsulting(consulting_id);
  }

  /**
   * 컨설팅 재추천 (통합)
   * POST /v1/consultings/:id/regenerate
   */
  @Post(':id/regenerate')
  @HttpCode(HttpStatus.OK)
  async regenerateConsulting(
    @Param('id') id: string,
    @Body() body: { additional_requirements?: string },
  ) {
    this.logger.log(`컨설팅 재추천 요청: consulting_id=${id}`);

    const consulting_id = parseInt(id, 10);
    return this.consultingsService.regenerateConsulting(
      consulting_id,
      body.additional_requirements,
    );
  }

  /**
   * 수동 컨설팅 생성 (기존 방식 - 백업용)
   * POST /v1/consultings
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateConsultingDto) {
    this.logger.log(`수동 컨설팅 생성: information_id=${dto.information_id}`);
    return this.consultingsService.create(dto);
  }
}
