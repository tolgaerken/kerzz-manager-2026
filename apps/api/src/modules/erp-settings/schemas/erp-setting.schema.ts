import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type ErpSettingDocument = ErpSetting & Document;

@Schema({ collection: "erp-settings", timestamps: false })
export class ErpSetting {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ required: true })
  erpId: string;

  @Prop()
  description: string;

  @Prop()
  noVatErpId: string;
}

export const ErpSettingSchema = SchemaFactory.createForClass(ErpSetting);
ErpSettingSchema.index({ key: 1 }, { unique: true });
