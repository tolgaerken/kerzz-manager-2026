import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type DistrictTrDocument = DistrictTr & Document;

@Schema({ collection: "district_tr" })
export class DistrictTr {
  @Prop()
  id: number;

  @Prop()
  city_id: number;

  @Prop()
  town: string;

  @Prop()
  county: string;

  @Prop()
  zipcode: string;
}

export const DistrictTrSchema = SchemaFactory.createForClass(DistrictTr);

DistrictTrSchema.index({ city_id: 1 });
