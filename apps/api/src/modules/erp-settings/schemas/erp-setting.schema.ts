import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import type { AuditFields } from "../../../common/audit";

export type ErpSettingDocument = ErpSetting & Document & AuditFields;

@Schema({ collection: "erp-settings", timestamps: true })
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
