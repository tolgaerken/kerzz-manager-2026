import { plainToInstance } from "class-transformer";
import { IsEnum, IsNumber, IsString, validateSync } from "class-validator";

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

  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_EXPIRES_IN: string = "7d";

  @IsString()
  NETSIS_SOCKET_URL: string;
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
