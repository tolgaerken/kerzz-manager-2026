import { IsString, IsNotEmpty, IsEnum } from "class-validator";
import { ManagerNotificationType } from "../schemas/manager-notification.schema";

export class CreateManagerNotificationDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum(["mention", "reminder"])
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
}
