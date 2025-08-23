export class ApiResponseDto<T = any> {
  success: boolean;
  data?: T;
  message: string;
  timestamp?: string;
  statusCode?: number;

  constructor(success: boolean, message: string, data?: T, statusCode?: number) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
    this.statusCode = statusCode;
  }

  static success<T>(data: T, message = 'Success'): ApiResponseDto<T> {
    return new ApiResponseDto(true, message, data, 200);
  }

  static error(message: string, statusCode = 500): ApiResponseDto {
    return new ApiResponseDto(false, message, undefined, statusCode);
  }
}
