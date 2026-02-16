import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import type { AuditFields } from "../../../common/audit";

export type GroupCompanyDocument = GroupCompany & Document & AuditFields;

@Schema({ collection: "group-companies", timestamps: true })
export class GroupCompany {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  idc: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: "" })
  cloudDb: string;

  @Prop({ default: "" })
  licanceId: string;

  @Prop({ default: false })
  eInvoice: boolean;

  @Prop({ default: "" })
  vatNo: string;

  @Prop({ default: false })
  noVat: boolean;

  @Prop({ default: "" })
  exemptionReason: string;

  @Prop({ default: "" })
  description: string;
}

export const GroupCompanySchema = SchemaFactory.createForClass(GroupCompany);

GroupCompanySchema.index({ idc: 1 });
