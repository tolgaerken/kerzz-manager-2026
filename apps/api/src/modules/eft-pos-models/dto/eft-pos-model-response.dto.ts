export class EftPosModelResponseDto {
  _id: string;
  id: string;
  name: string;
  brand: string;
  active: boolean;
  sortOrder: number;
  editDate?: Date;
  editUser?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class EftPosModelsListResponseDto {
  data: EftPosModelResponseDto[];
  total: number;
}
