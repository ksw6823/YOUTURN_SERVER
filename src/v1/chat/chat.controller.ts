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
  ): Promise<{
    success: boolean;
    data: ChatResponseDto;
    message: string;
  }> {
    this.logger.log(
      `채팅 요청 받음: ${chatRequest.prompt.substring(0, 100)}...`,
    );

    try {
      // JWT에서 사용자 정보 추출
      const user_id = req.user.user_id;
      chatRequest.user_id = user_id;
      
      const result = await this.chatService.sendPromptToLLM(chatRequest);

      return {
        success: true,
        data: result,
        message: 'LLM 응답을 성공적으로 받았습니다.',
      };
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
  ): Promise<{
    success: boolean;
    data: ChatResponseDto[];
    message: string;
    total: number;
  }> {
    const limitNum = parseInt(limit, 10) || 20;
    // JWT에서 사용자 정보 추출 (보안!)
    const user_id = req.user.user_id;

    this.logger.log(`내 채팅 기록 조회: user_id=${user_id}, limit=${limitNum}`);

    const chatHistory = await this.chatService.getChatHistory(user_id, limitNum);

    return {
      success: true,
      data: chatHistory,
      message: '채팅 기록을 성공적으로 조회했습니다.',
      total: chatHistory.length,
    };
  }

  /**
   * 내 특정 채팅 조회 (JWT 인증 필요)
   * GET /v1/chat/:id
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getChatById(@Param('id') id: string): Promise<{
    success: boolean;
    data: ChatResponseDto;
    message: string;
  }> {
    this.logger.log(`특정 채팅 조회: ${id}`);

    const chat = await this.chatService.getChatById(id);

    return {
      success: true,
      data: chat,
      message: '채팅을 성공적으로 조회했습니다.',
    };
  }

  /**
   * LLM 서버 상태 확인
   * GET /v1/chat/health
   */
  @Get('health/check')
  async healthCheck(): Promise<{
    success: boolean;
    message: string;
    timestamp: string;
  }> {
    this.logger.log('LLM 서버 상태 확인 요청');

    // 간단한 프롬프트로 LLM 서버 상태 확인
    try {
      const testRequest = new ChatRequestDto();
      testRequest.prompt = 'Hello';
      testRequest.model = 'gpt-oss:20b';

      await this.chatService.sendPromptToLLM(testRequest);

      return {
        success: true,
        message: 'LLM 서버가 정상적으로 작동중입니다.',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: `LLM 서버 연결 실패: ${errorMessage}`,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
