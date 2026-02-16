import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import type { AuditFields } from "../../../common/audit";

export type ContractVersionDocument = ContractVersion & Document & AuditFields;

@Schema({ collection: "contract-versions", timestamps: true })
export class ContractVersion {
  _id: Types.ObjectId;

  @Prop()
  id: string;

  @Prop({ required: true, index: true })
  contractId: string;

  @Prop()
  brand: string;

  @Prop()
  licanceId: string;

  @Prop({ default: 0 })
  price: number;

  @Prop({ default: 0 })
  old_price: number;

  @Prop({ default: "tl" })
  currency: string;

  @Prop()
  type: string;

  @Prop({ default: true })
  enabled: boolean;

  @Prop({ default: false })
  expired: boolean;

  @Prop({ type: Date })
  startDate: Date;

  @Prop({ default: false })
  activated: boolean;

  @Prop({ type: Date })
  activatedAt: Date;

  @Prop()
  editDate: Date;

  @Prop()
  editUser: string;
}

export const ContractVersionSchema = SchemaFactory.createForClass(ContractVersion);
ContractVersionSchema.index({ contractId: 1 });
