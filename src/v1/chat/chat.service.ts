import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { Chat } from './entities/chat.entity';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatResponseDto, LlmServerResponseDto } from './dto/chat-response.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly LLM_SERVER_URL: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
  ) {
    const llmUrl = this.configService.get<string>('LLM_SERVER_URL');
    if (!llmUrl) {
      throw new Error('LLM_SERVER_URL 환경변수 설정이 필요합니다.');
    }
    this.LLM_SERVER_URL = llmUrl;
  }

  /**
   * LLM 서버에 프롬프트를 전송하고 응답을 받아 DB에 저장
   */
  async sendPromptToLLM(chatRequest: ChatRequestDto): Promise<ChatResponseDto> {
    const startTime = Date.now();

    // 초기 Chat 엔티티 생성
    const chat = this.chatRepository.create({
      prompt: chatRequest.prompt,
      model: chatRequest.model || 'gpt-oss:20b',
      user: chatRequest.user_id ? { user_id: chatRequest.user_id } : undefined,
      status: 'pending',
      response: '',
      responseTime: 0,
    });

    const savedChat = await this.chatRepository.save(chat);
    this.logger.log(
      `Chat 요청 시작: ${savedChat.id}, 프롬프트: ${chatRequest.prompt.substring(0, 100)}...`,
    );

    try {
      // LLM 서버에 요청 전송
      const llmResponse = await this.callLlmServer(
        chatRequest.prompt,
        chatRequest.model,
      );

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // 성공시 DB 업데이트
      savedChat.response = llmResponse.response;
      savedChat.status = 'completed';
      savedChat.responseTime = responseTime;

      const updatedChat = await this.chatRepository.save(savedChat);

      this.logger.log(
        `Chat 응답 완료: ${updatedChat.id}, 응답 시간: ${responseTime}ms`,
      );

      return new ChatResponseDto({
        id: updatedChat.id,
        prompt: updatedChat.prompt,
        response: updatedChat.response,
        model: updatedChat.model,
        status: updatedChat.status,
        responseTime: updatedChat.responseTime,
        createdAt: updatedChat.createdAt,
      });
    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // 실패시 DB 업데이트
      savedChat.status = 'failed';
      savedChat.responseTime = responseTime;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      savedChat.response = `Error: ${errorMessage}`;
      await this.chatRepository.save(savedChat);

      this.logger.error(
        `Chat 요청 실패: ${savedChat.id}, 에러: ${errorMessage}`,
      );
      throw new InternalServerErrorException(
        'LLM 서버 통신 중 오류가 발생했습니다.',
      );
    }
  }

  /**
   * LLM 서버(Ollama)에 실제 HTTP 요청 전송
   */
  private async callLlmServer(
    prompt: string,
    model: string = 'gpt-oss:20b',
  ): Promise<LlmServerResponseDto> {
    try {
      // 간결한 답변을 위한 프롬프트 지시사항 추가 (마크다운 형식 방지)
      const enhancedPrompt = `${prompt}

응답시 다음 사항을 필수로 준수해주세요: 300자 이내로 간결하게 답변하고, 핵심 내용만 포함하여 명확하게 설명하며, 불필요한 반복이나 장황한 설명은 피하고, 마크다운 형식(#, *, - 등)을 사용하지 말고 일반 텍스트로만 답변해주세요.`;

      const requestBody = {
        model: model,
        prompt: enhancedPrompt,
        stream: false,
      };

      this.logger.log(`LLM 서버 요청: ${this.LLM_SERVER_URL}/api/generate`);
      this.logger.log(`프롬프트 길이: ${enhancedPrompt.length}자`);
      this.logger.log(`모델: ${requestBody.model}`);

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.LLM_SERVER_URL}/api/generate`,
          requestBody,
          {
            timeout: 30000, // 30초 타임아웃
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'Accept-Charset': 'utf-8',
            },
          },
        ),
      );

      if (
        !response.data ||
        typeof response.data !== 'object' ||
        !('response' in response.data)
      ) {
        throw new Error('LLM 서버에서 유효하지 않은 응답을 받았습니다.');
      }

      return response.data as LlmServerResponseDto;
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error) {
        const errorCode = (error as { code: string }).code;
        if (errorCode === 'ENOTFOUND') {
          throw new Error(
            'LLM 서버에 연결할 수 없습니다. 서버 주소를 확인해주세요.',
          );
        }
        if (errorCode === 'ETIMEDOUT') {
          throw new Error('LLM 서버 응답 시간이 초과되었습니다.');
        }
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`LLM 서버 호출 실패: ${errorMessage}`);
      throw new Error(`LLM 서버 통신 실패: ${errorMessage}`);
    }
  }

  /**
   * 특정 사용자의 채팅 기록 조회
   */
  async getChatHistory(
    user_id: number,
    limit: number = 20,
  ): Promise<ChatResponseDto[]> {
    const chats = await this.chatRepository.find({
      where: { user: { user_id } },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['user'],
    });

    return chats.map((chat) => new ChatResponseDto(chat));
  }

  /**
   * 특정 채팅 조회
   */
  async getChatById(id: string): Promise<ChatResponseDto> {
    const chat = await this.chatRepository.findOne({ where: { id } });

    if (!chat) {
      throw new BadRequestException('채팅을 찾을 수 없습니다.');
    }

    return new ChatResponseDto(chat);
  }
}
