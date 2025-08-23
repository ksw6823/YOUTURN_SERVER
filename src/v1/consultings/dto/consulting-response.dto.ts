export class ConsultingResponseDto {
  success: boolean;
  consulting_id: number;
  data: {
    user_info: {
      name: string;
      funds: number;
      preferred_crop?: string;
      preferred_area?: string;
    };
    consulting_result: {
      recommended_area: string;
      recommended_crop: string;
      estimated_earnings: number;
      related_policies: string;
      fund_use_plan: string;
      roadmap: string;
      cultivation_guide: string;
    };
  };
  message: string;
}

export class LlmConsultingResponseDto {
  recommended_area: string;
  recommended_crop: string;
  estimated_earnings: number;
  related_policies: string;
  fund_use_plan: string;
  roadmap: string;
  cultivation_guide: string;
}
