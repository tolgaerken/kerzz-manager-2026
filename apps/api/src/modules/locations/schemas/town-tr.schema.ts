import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type TownTrDocument = TownTr & Document;

@Schema({ collection: "towns_tr" })
export class TownTr {
  @Prop()
  id: number;

  @Prop()
  cityId: number;

  @Prop()
  code: number;

  @Prop()
  name: string;
}

export const TownTrSchema = SchemaFactory.createForClass(TownTr);

TownTrSchema.index({ cityId: 1 });
