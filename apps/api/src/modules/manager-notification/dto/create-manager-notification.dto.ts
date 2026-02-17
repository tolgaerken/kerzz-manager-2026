import { IsString, IsNotEmpty, IsEnum, IsOptional } from "class-validator";
import { ManagerNotificationType } from "../schemas/manager-notification.schema";

export class CreateManagerNotificationDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum(["mention", "reminder", "stale"])
  type: ManagerNotificationType;

  @IsString()
  @IsNotEmpty()
  logId: string;

  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsString()
  @IsNotEmpty()
  contextType: string;

  @IsString()
  @IsNotEmpty()
  contextId: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  pipelineRef?: string;

  @IsString()
  @IsOptional()
  customerName?: string;

  @IsString()
  @IsOptional()
  contextLabel?: string;
}
