import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type EDocMemberDocument = EDocMember & Document;

@Schema({ collection: "digital-invoice-schedule", timestamps: true })
export class EDocMember {
  _id: Types.ObjectId;

  @Prop({ index: true })
  id: string;

  @Prop({ required: true, index: true })
  erpId: string;

  @Prop()
  licanceId: string;

  @Prop()
  internalFirm: string;

  @Prop({ default: true })
  active: boolean;

  @Prop({ default: false })
  syncErp: boolean;

  @Prop({ default: false })
  syncInbound: boolean;

  @Prop()
  desc: string;

  @Prop()
  taxNumber: string;

  @Prop({ default: "pay-as-you-go" })
  contractType: string;

  @Prop({ default: 0 })
  creditPrice: number;

  @Prop({ default: 0 })
  totalPurchasedCredits: number;

  @Prop({ default: 0 })
  creditBalance: number;

  @Prop({ default: false })
  contract: boolean;

  @Prop()
  editDate: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const EDocMemberSchema = SchemaFactory.createForClass(EDocMember);
EDocMemberSchema.index({ erpId: 1 });
EDocMemberSchema.index({ internalFirm: 1 });
EDocMemberSchema.index({ active: 1 });
