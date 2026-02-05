import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  ValidateNested,
  IsDate,
  IsBoolean,
} from "class-validator";
import { Type } from "class-transformer";

export class LogMentionDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  userName: string;
}

export class LogReferenceDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  label: string;
}

export class LogReminderDto {
  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}

export class CreateLogDto {
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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LogMentionDto)
  @IsOptional()
  mentions?: LogMentionDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LogReferenceDto)
  @IsOptional()
  references?: LogReferenceDto[];

  @ValidateNested()
  @Type(() => LogReminderDto)
  @IsOptional()
  reminder?: LogReminderDto;

  @IsString()
  @IsNotEmpty()
  authorId: string;

  @IsString()
  @IsNotEmpty()
  authorName: string;
}
