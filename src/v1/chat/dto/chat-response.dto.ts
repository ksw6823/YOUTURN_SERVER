export class ChatResponseDto {
  id: string;
  prompt: string;
  response: string;
  model: string;
  status: string;
  responseTime: number;
  createdAt: Date;

  constructor(partial: Partial<ChatResponseDto>) {
    Object.assign(this, partial);
  }
}

export class LlmServerResponseDto {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}
