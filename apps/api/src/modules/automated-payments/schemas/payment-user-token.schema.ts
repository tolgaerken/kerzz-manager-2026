import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import type { AuditFields } from "../../../common/audit";

export type PaymentUserTokenDocument = PaymentUserToken & Document & AuditFields;

@Schema({ collection: "online-payment-tokens", timestamps: true })
export class PaymentUserToken {
  _id: Types.ObjectId;

  @Prop({ required: true })
  id: string;

  @Prop({ type: Date, default: () => new Date() })
  createDate: Date;

  @Prop({ default: "" })
  email: string;

  @Prop({ default: "" })
  erpId: string;

  @Prop({ default: "", index: true })
  customerId: string;

  @Prop({ required: true })
  userToken: string;

  @Prop({ default: "VERI" })
  companyId: string;

  @Prop({ default: "" })
  userIp: string;

  @Prop({ default: "" })
  sourceId: string;

  @Prop({ default: "io" })
  source: string;

  @Prop({ default: "", index: true })
  userId: string;
}

export const PaymentUserTokenSchema =
  SchemaFactory.createForClass(PaymentUserToken);

PaymentUserTokenSchema.index({ createDate: -1 });
