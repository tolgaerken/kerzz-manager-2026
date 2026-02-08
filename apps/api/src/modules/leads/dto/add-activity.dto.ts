import { IsString, IsOptional, IsIn } from "class-validator";

export class AddActivityDto {
  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  userName?: string;

  @IsString()
  @IsOptional()
  @IsIn(["note", "call", "email", "meeting"])
  type?: string = "note";
}
