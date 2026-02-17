import { plainToInstance } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString, validateSync } from "class-validator";

enum Environment {
  Development = "development",
  Production = "production",
  Test = "test"
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  PORT: number = 3000;

  @IsString()
  MONGODB_URI: string;

  @IsString()
  MONGODB_CONTRACT_URI: string;

  @IsString()
  MONGODB_CONTRACT_DB: string;

  // SSO Database - Optional (falls back to MONGODB_URI)
  @IsOptional()
  @IsString()
  MONGODB_SSO_URI?: string;

  @IsOptional()
  @IsString()
  MONGODB_SSO_DB?: string = "sso-db";

  // Application ID for SSO filtering
  @IsOptional()
  @IsString()
  APP_ID?: string = "kerzz-manager";

  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_EXPIRES_IN: string = "7d";

  @IsString()
  NETSIS_SOCKET_URL: string;

  @IsString()
  INVOICE_SERVICE_URL: string = "https://invoice-service.kerzz.com:4260";

  @IsString()
  INVOICE_SERVICE_API_KEY: string;

  // Payment Base URL - Odeme linkleri icin
  @IsOptional()
  @IsString()
  PAYMENT_BASE_URL?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  // Sadece zorunlu alanlari dogrula, tum .env degiskenlerini koru
  // (SMTP, SMS, PAYMENT_BASE_URL vb. opsiyonel alanlar icin)
  return { ...config, ...validatedConfig };
}
