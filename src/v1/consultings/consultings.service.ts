import {
  Injectable,
  NotFoundException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { Consulting } from './entities/consulting.entity';
import { Information } from '../information/entities/information.entity';
import { User } from '../auth/entities/user.entity';
import { CreateConsultingDto } from './dto/create-consulting.dto';

@Injectable()
export class ConsultingsService {
  private readonly logger = new Logger(ConsultingsService.name);
  private readonly LLM_SERVER_URL: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Consulting)
    private readonly consultingRepo: Repository<Consulting>,
    @InjectRepository(Information)
    private readonly diRepo: Repository<Information>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly httpService: HttpService,
  ) {
    const llmUrl = this.configService.get<string>('LLM_SERVER_URL');
    if (!llmUrl) {
      throw new Error('LLM_SERVER_URL 환경변수 설정이 필요합니다.');
    }
    this.LLM_SERVER_URL = llmUrl;
  }

  /**
   * 수동 컨설팅 생성 (기존 방식 - 백업용)
   */
  async create(dto: CreateConsultingDto) {
    const information = await this.diRepo.findOne({
      where: { information_id: dto.information_id },
    });
    if (!information)
      throw new NotFoundException(
        'Information not found for given information_id',
      );

    const consulting = this.consultingRepo.create({
      information_id: information,
      content: dto.content,
      created_at: new Date(),
    });
    const saved = await this.consultingRepo.save(consulting);

    return { consulting_id: saved.consulting_id };
  }

  /**
   * 🚀 NEW: dictionary-information 기반 자동 컨설팅 생성 (LLM 연동)
   */
  async generateConsulting(information_id: number) {
    this.logger.log(`컨설팅 생성 시작: information_id=${information_id}`);

    // 1. 사전 정보 조회
    const dictionaryInfo = await this.diRepo.findOne({ 
      where: { information_id },
      relations: ['user'],
    });
    
    if (!dictionaryInfo) {
      throw new NotFoundException(
        'dictionary_information not found for given information_id',
      );
    }

    try {
      // 2. LLM에 컨설팅 요청
      const llmResponse = await this.requestConsultingFromLLM(dictionaryInfo);
      
      // 3. LLM 응답을 처리해서 컨설팅 정보 생성
      const consultingData = this.processLLMResponse(
        llmResponse,
        dictionaryInfo.information_id,
      );
      
      // 4. 컨설팅 정보 저장
      const consulting = this.consultingRepo.create({
        information_id: dictionaryInfo,
        content: consultingData || '컨설팅 생성 중 오류가 발생했습니다.',
        created_at: new Date(),
      });
      
      const savedConsulting = await this.consultingRepo.save(consulting);
      
      this.logger.log(
        `컨설팅 생성 완료: consulting_id=${savedConsulting.consulting_id}`,
      );
      
      return {
        consulting_id: savedConsulting.consulting_id,
        user_info: {
          budget: dictionaryInfo.budget,
          preferred_crops: dictionaryInfo.preferred_crops,
          preferred_region: dictionaryInfo.preferred_region,
          farming_experience: dictionaryInfo.farming_experience,
        },
        consulting_result: consultingData,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`컨설팅 생성 실패: ${errorMessage}`);
      throw new InternalServerErrorException(
        '컨설팅 생성 중 오류가 발생했습니다.',
      );
    }
  }

  /**
   * LLM 서버에 컨설팅 요청
   */
  private async requestConsultingFromLLM(
    dictionaryInfo: Information,
  ): Promise<string> {
    const prompt = this.buildConsultingPrompt(dictionaryInfo);
    
    this.logger.log('LLM 서버에 컨설팅 요청 전송');
    
    try {
      const requestBody = {
        model: 'gpt-oss:20b',
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7, // 적절한 창의성 유지
          top_p: 0.9,
          stop: ['\n\n\n\n'], // 과도한 줄바꿈 방지
        },
      };

      // 인코딩 디버깅
      this.logger.log(`프롬프트 길이: ${prompt.length}자`);
      this.logger.log(`프롬프트 미리보기: ${prompt.substring(0, 100)}...`);
      this.logger.log(`JSON 크기: ${JSON.stringify(requestBody).length} bytes`);

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.LLM_SERVER_URL}/api/generate`,
          requestBody,
          {
          timeout: 60000, // 60초 타임아웃
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

      const responseData = response.data as { response: string };
      return responseData.response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`LLM 서버 호출 실패: ${errorMessage}`);
      throw new Error(`LLM 서버 통신 실패: ${errorMessage}`);
    }
  }

  /**
   * 컨설팅 프롬프트 생성 (마크다운 형식 지정)
   */
  private buildConsultingPrompt(info: Information): string {
    const currentDate = new Date().toLocaleDateString('ko-KR');

    return `당신은 전문적인 농업 컨설턴트입니다. 다음 농업 희망자의 정보를 분석하여 맞춤형 농업 컨설팅을 제공해주세요.

【분석 대상자 정보】
- 성별: ${info.gender}
- 보유 자금: ${info.budget?.toLocaleString()}원
- 가족 구성원: ${info.family_member}
- 농업 경험: ${info.farming_experience || 0}년
- 선호 작물: ${info.preferred_crops || '미지정'}
- 선호 지역: ${info.preferred_region || '미지정'}
- 주소: ${info.address}

【컨설팅 요구사항】
위 정보를 바탕으로 반드시 아래 형식에 맞춰 상세한 컨설팅 보고서를 작성해주세요:

# 농업 컨설팅 결과

- 분석일시: ${currentDate}
- 컨설팅 ID: [자동생성됨]

## 1. 추천 지역

- 추천 근거: (입력값에 근거한 구체적 이유)
- 기후 조건: (온도, 강수량, 일조시간 등)
- 농업 환경: (토양 조건, 수리시설, 농협 지원)
- 생활 인프라: (가족 구성원에 따른 병원, 학교 등 시설)

## 2. 추천 작물

- 추천 근거: (입력값에 근거한 구체적 이유)
- 재배 난이도: (상/중/하)
- 예상 수익: (구체적인 금액)
- 작물 특징: (상세 설명)

## 3. 관련 정책 및 지원금

- 지원사업1: (간단한 설명, 신청기간, 링크)
- 지원사업2: (간단한 설명, 신청기간, 링크)
- 지원사업3: (간단한 설명, 신청기간, 링크)

## 4. 자금 활용 방안

- 총 금액: ${info.budget?.toLocaleString()}원
- 농지 구입/임차: (금액 및 설명)
- 농기계/시설: (금액 및 설명)
- 주거비: (금액 및 설명)
- 운영자금: (금액 및 설명)
- 기타 비용: (금액 및 설명)

## 5. 귀농 로드맵

- 총 기간: (예상 기간)
- 준비 단계: (귀농 교육, 농지 답사 및 계약, 지원금 신청, 주거지 확보, 농기계 구입)
- 정착 단계: (이주, 농협 가입, 농사 시작)
- 안정 단계: (수확 및 판매, 다음 농사 계획, 수익성 평가 및 계획 수정)

## 6. 가이드

- 재배 가이드: (파종 시기, 수확 시기, 농사 방법)
- 초보자 팁: (노하우, 교육 프로그램 추천)
- 주의사항: (기후, 시장, 기술 등에 대한 각종 리스크)
- 추가 정보: (유튜브 또는 사이트)

주의사항:
1. 반드시 위 형식을 정확히 따라주세요
2. 각 항목은 구체적이고 실용적인 내용으로 작성하세요
3. 보유 자금과 경험을 고려한 현실적인 조언을 제공하세요
4. 마크다운 형식을 정확히 지켜주세요
5. 각 섹션은 상세하고 도움이 되는 정보를 포함해주세요

답변:`;
  }

  /**
   * LLM 응답을 마크다운 형태로 처리
   */
  private processLLMResponse(
    llmResponse: string,
    consultingId: number,
  ): string {
    this.logger.log('LLM 응답 처리 시작');

    try {
      // 컨설팅 ID 자동 삽입
      const processedResponse = llmResponse.replace(
        '[자동생성됨]',
        `CONSULTING-${consultingId.toString().padStart(6, '0')}`,
      );

      // 마크다운 형식 검증 및 정리
      if (this.isValidMarkdownFormat(processedResponse)) {
        return processedResponse.trim();
      } else {
        // 형식이 맞지 않으면 기본 템플릿 사용
        return this.generateDefaultConsultingReport(consultingId);
      }
    } catch (error) {
      this.logger.warn(
        `LLM 응답 처리 실패: ${error instanceof Error ? error.message : 'Unknown error'}, 기본 템플릿 사용`,
      );
      return this.generateDefaultConsultingReport(consultingId);
    }
  }

  /**
   * 마크다운 형식 검증
   */
  private isValidMarkdownFormat(content: string): boolean {
    const requiredSections = [
      '# 농업 컨설팅 결과',
      '## 1. 추천 지역',
      '## 2. 추천 작물',
      '## 3. 관련 정책 및 지원금',
      '## 4. 자금 활용 방안',
      '## 5. 귀농 로드맵',
      '## 6. 가이드',
    ];

    return requiredSections.every((section) => content.includes(section));
  }

  /**
   * 기본 컨설팅 보고서 생성
   */
  private generateDefaultConsultingReport(consultingId: number): string {
    const currentDate = new Date().toLocaleDateString('ko-KR');

    return `# 농업 컨설팅 결과

- 분석일시: ${currentDate}
- 컨설팅 ID: CONSULTING-${consultingId.toString().padStart(6, '0')}

## 1. 추천 지역

- 추천 근거: 입력하신 정보를 바탕으로 분석이 필요합니다.
- 기후 조건: 상세 분석이 필요합니다.
- 농업 환경: 추가 조사가 필요합니다.
- 생활 인프라: 가족 구성원에 맞는 시설 조사가 필요합니다.

## 2. 추천 작물

- 추천 근거: 경험과 자금을 고려한 분석이 필요합니다.
- 재배 난이도: 중
- 예상 수익: 상세 분석 필요
- 작물 특징: 추가 정보 수집이 필요합니다.

## 3. 관련 정책 및 지원금

- 지원사업1: 관련 정책 조사가 필요합니다.
- 지원사업2: 신청 가능한 지원금 확인이 필요합니다.
- 지원사업3: 추가 지원 프로그램 조사가 필요합니다.

## 4. 자금 활용 방안

- 총 금액: 입력하신 예산 기준
- 농지 구입/임차: 상세 계획 수립 필요
- 농기계/시설: 필요 장비 조사 필요
- 주거비: 지역별 주거비 조사 필요
- 운영자금: 운영비 계획 수립 필요
- 기타 비용: 예비비 계획 필요

## 5. 귀농 로드맵

- 총 기간: 개인별 상황에 따라 조정 필요
- 준비 단계: 체계적인 준비 계획 수립 필요
- 정착 단계: 단계별 실행 계획 필요
- 안정 단계: 장기적 안정화 방안 필요

## 6. 가이드

- 재배 가이드: 작물별 상세 가이드 제공 예정
- 초보자 팁: 전문가 상담 권장
- 주의사항: 리스크 관리 방안 수립 필요
- 추가 정보: 관련 자료 제공 예정

※ 더 상세한 컨설팅을 위해서는 추가 정보가 필요합니다.`;
  }

  /**
   * 재분석용 프롬프트 생성
   */
  private buildReanalysisPrompt(
    info: Information,
    previousResult: string,
    additionalRequirements?: string,
  ): string {
    const basePrompt = this.buildConsultingPrompt(info);

    const reanalysisSection = `

【이전 컨설팅 결과】
${previousResult}

【추가 요구사항】
${additionalRequirements || '사용자가 더 나은 대안을 원합니다.'}

【재분석 지시사항】
위의 이전 컨설팅 결과를 참고하되, 추가 요구사항을 반영하여 더 나은 컨설팅을 제공해주세요.
이전 결과와 다른 관점이나 대안을 제시하되, 사용자의 기본 정보(자금, 경험 등)는 동일하게 고려해주세요.
반드시 동일한 마크다운 형식을 유지해주세요.
각 섹션은 상세하고 실용적인 내용으로 작성해주세요.

답변:`;

    return basePrompt + reanalysisSection;
  }

  /**
   * 재분석용 LLM 요청
   */
  private async requestReanalysisFromLLM(prompt: string): Promise<string> {
    try {
      const requestBody = {
        model: 'gpt-oss:20b',
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7, // 적절한 창의성 유지
          top_p: 0.9,
          stop: ['\n\n\n\n'], // 과도한 줄바꿈 방지
        },
      };

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.LLM_SERVER_URL}/api/generate`,
          requestBody,
          {
            timeout: 60000, // 60초 타임아웃
            headers: {
              'Content-Type': 'application/json',
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

      const responseData = response.data as { response: string };
      return responseData.response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`재분석 LLM 서버 호출 실패: ${errorMessage}`);
      throw new Error(`재분석 LLM 서버 통신 실패: ${errorMessage}`);
    }
  }

  /**
   * 컨설팅 조회
   */
  async getConsulting(consulting_id: number) {
    const consulting = await this.consultingRepo.findOne({
      where: { consulting_id: consulting_id },
      relations: ['information_id', 'information_id.user'],
    });
    
    if (!consulting) {
      throw new NotFoundException('컨설팅 정보를 찾을 수 없습니다.');
    }
    
    return {
      consulting_id: consulting.consulting_id,
      user_info: {
        budget: consulting.information_id.budget,
        preferred_crops: consulting.information_id.preferred_crops,
        preferred_region: consulting.information_id.preferred_region,
        farming_experience: consulting.information_id.farming_experience,
      },
      consulting_result: consulting.content,
    };
  }



  /**
   * 사용자별 컨설팅 목록 조회 (컨설팅 기록 화면용)
   */
  async getConsultingsByUser(user_id: number) {
    const consultings = await this.consultingRepo.find({
      where: { information_id: { user: { user_id } } },
      relations: ['information_id'],
      order: { created_at: 'DESC' },
    });

    return consultings.map(consulting => ({
      consulting_id: consulting.consulting_id,
      title: '컨설팅 요약',
      created_at: consulting.created_at,
      preferred_crops: consulting.information_id.preferred_crops,
      preferred_region: consulting.information_id.preferred_region,
    }));
  }

  /**
   * 컨설팅 삭제
   */
  async deleteConsulting(consulting_id: number) {
    const consulting = await this.consultingRepo.findOne({
      where: { consulting_id: consulting_id },
    });

    if (!consulting) {
      throw new NotFoundException('컨설팅 정보를 찾을 수 없습니다.');
    }

    await this.consultingRepo.remove(consulting);
    this.logger.log(`컨설팅 삭제 완료: consulting_id=${consulting_id}`);
  }

  /**
   * 컨설팅 재추천 (통합된 메서드)
   */
  async regenerateConsulting(
    consulting_id: number,
    additionalRequirements?: string,
  ) {
    this.logger.log(`컨설팅 재추천 시작: consulting_id=${consulting_id}`);

    // 1. 기존 컨설팅 조회
    const existingConsulting = await this.consultingRepo.findOne({
      where: { consulting_id: consulting_id },
      relations: ['information_id', 'information_id.user'],
    });

    if (!existingConsulting) {
      throw new NotFoundException('컨설팅 정보를 찾을 수 없습니다.');
    }

    try {
      // 2. 이전 결과 백업
      const originalResult = existingConsulting.content;

      // 3. 재분석용 프롬프트 생성
      const reanalysisPrompt = this.buildReanalysisPrompt(
        existingConsulting.information_id,
        existingConsulting.content,
        additionalRequirements,
      );

      // 4. LLM에 재분석 요청
      const llmResponse = await this.requestReanalysisFromLLM(reanalysisPrompt);

      // 5. LLM 응답 처리
      const newConsultingData = this.processLLMResponse(
        llmResponse,
        consulting_id,
      );

      // 6. 기존 컨설팅 업데이트
      existingConsulting.content = newConsultingData;
      existingConsulting.updated_at = new Date();

      const updatedConsulting =
        await this.consultingRepo.save(existingConsulting);

      this.logger.log(`컨설팅 재추천 완료: consulting_id=${consulting_id}`);

      return {
        consulting_id: updatedConsulting.consulting_id,
        user_info: {
          budget: existingConsulting.information_id.budget,
          preferred_crops: existingConsulting.information_id.preferred_crops,
          preferred_region: existingConsulting.information_id.preferred_region,
          farming_experience: existingConsulting.information_id.farming_experience,
        },
        previous_result: originalResult,
        new_result: newConsultingData,
        additional_requirements: additionalRequirements || null,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`컨설팅 재추천 실패: ${errorMessage}`);
      throw new InternalServerErrorException(
        '컨설팅 재추천 중 오류가 발생했습니다.',
      );
    }
  }
}
