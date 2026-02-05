import { IsString, IsOptional, IsNumber, Min, IsBoolean } from "class-validator";
import { Type, Transform } from "class-transformer";

export class NotificationQueryDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @Transform(({ value }) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  })
  @IsBoolean()
  @IsOptional()
  read?: boolean;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number = 20;
}
