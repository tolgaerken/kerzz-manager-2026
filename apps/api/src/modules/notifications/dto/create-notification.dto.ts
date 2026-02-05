import { IsString, IsNotEmpty, IsEnum } from "class-validator";
import { NotificationType } from "../schemas/notification.schema";

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum(["mention", "reminder"])
  type: NotificationType;

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
