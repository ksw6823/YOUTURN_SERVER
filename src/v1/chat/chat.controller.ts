import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  Logger,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatResponseDto } from './dto/chat-response.dto';

@Controller('v1/chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  /**
   * LLM에 프롬프트 전송하고 응답받기 (JWT 인증 필요)
   * POST /v1/chat/send
   */
  @Post('send')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async sendPrompt(
    @Body(ValidationPipe) chatRequest: ChatRequestDto,
    @Request() req: any,
  ): Promise<ChatResponseDto> {
    this.logger.log(
      `채팅 요청 받음: ${chatRequest.prompt.substring(0, 100)}...`,
    );

    try {
      // JWT에서 사용자 정보 추출
      const user_id = req.user.user_id;
      chatRequest.user_id = user_id;
      
      return await this.chatService.sendPromptToLLM(chatRequest);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`채팅 요청 처리 실패: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * 내 채팅 기록 조회 (JWT 인증 필요)
   * GET /v1/chat/history?limit=20
   */
  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getChatHistory(
    @Query('limit') limit: string = '20',
    @Request() req: any,
  ): Promise<ChatResponseDto[]> {
    const limitNum = parseInt(limit, 10) || 20;
    // JWT에서 사용자 정보 추출 (보안!)
    const user_id = req.user.user_id;

    this.logger.log(`내 채팅 기록 조회: user_id=${user_id}, limit=${limitNum}`);

    return await this.chatService.getChatHistory(user_id, limitNum);
  }

  /**
   * 내 특정 채팅 조회 (JWT 인증 필요)
   * GET /v1/chat/:id
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getChatById(@Param('id') id: string): Promise<ChatResponseDto> {
    this.logger.log(`특정 채팅 조회: ${id}`);

    return await this.chatService.getChatById(id);
  }

  /**
   * LLM 서버 상태 확인
   * GET /v1/chat/health
   */
  @Get('health/check')
  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
  }> {
    this.logger.log('LLM 서버 상태 확인 요청');

    // 간단한 프롬프트로 LLM 서버 상태 확인
    try {
      const testRequest = new ChatRequestDto();
      testRequest.prompt = '안녕하세요. 간단히 "OK"라고 답변해주세요.';
      testRequest.model = 'gpt-oss:20b';

      await this.chatService.sendPromptToLLM(testRequest);

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
