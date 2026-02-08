import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type CityTrDocument = CityTr & Document;

@Schema({ collection: "cities_tr" })
export class CityTr {
  @Prop()
  id: number;

  @Prop()
  name: string;
}

export const CityTrSchema = SchemaFactory.createForClass(CityTr);
