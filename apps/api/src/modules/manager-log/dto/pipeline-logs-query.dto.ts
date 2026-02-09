import { IsString, IsNotEmpty } from "class-validator";

export class PipelineLogsParamDto {
  @IsString()
  @IsNotEmpty()
  pipelineRef: string;
}
