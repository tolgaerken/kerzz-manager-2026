import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type EftPosModelDocument = EftPosModel & Document;

@Schema({ collection: "eft-pos-models", timestamps: true })
export class EftPosModel {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: "" })
  brand: string;

  @Prop({ default: true })
  active: boolean;

  @Prop({ default: 0 })
  sortOrder: number;

  @Prop({ type: Date })
  editDate: Date;

  @Prop({ default: "" })
  editUser: string;
}

export const EftPosModelSchema = SchemaFactory.createForClass(EftPosModel);

// Indexes
EftPosModelSchema.index({ id: 1 });
EftPosModelSchema.index({ active: 1 });
EftPosModelSchema.index({ sortOrder: 1 });
EftPosModelSchema.index({ brand: 1 });
