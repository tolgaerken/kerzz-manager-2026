import { PartialType } from "@nestjs/mapped-types";
import { CreateEftPosModelDto } from "./create-eft-pos-model.dto";

export class UpdateEftPosModelDto extends PartialType(CreateEftPosModelDto) {}
