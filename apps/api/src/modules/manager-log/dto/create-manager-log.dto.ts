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

export class ManagerLogMentionDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  userName: string;
}

export class ManagerLogReferenceDto {
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

export class ManagerLogReminderDto {
  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}

export class CreateManagerLogDto {
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
  @IsOptional()
  pipelineRef?: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ManagerLogMentionDto)
  @IsOptional()
  mentions?: ManagerLogMentionDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ManagerLogReferenceDto)
  @IsOptional()
  references?: ManagerLogReferenceDto[];

  @ValidateNested()
  @Type(() => ManagerLogReminderDto)
  @IsOptional()
  reminder?: ManagerLogReminderDto;

  @IsString()
  @IsNotEmpty()
  authorId: string;

  @IsString()
  @IsNotEmpty()
  authorName: string;
}
