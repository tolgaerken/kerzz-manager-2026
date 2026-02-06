import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type PaymentLinkDocument = PaymentLink & Document;

@Schema({ collection: "online-payments", timestamps: false })
export class PaymentLink {
  _id: Types.ObjectId;

  @Prop({ required: true, index: true })
  linkId: string;

  @Prop({ default: "" })
  staffName: string;

  @Prop({ default: "" })
  staffId: string;

  @Prop({ default: "" })
  brand: string;

  @Prop({ default: "" })
  customerId: string;

  @Prop({ default: "" })
  erpId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: false })
  canRecurring: boolean;

  @Prop({ type: Date })
  validty?: Date;

  @Prop({ default: "" })
  companyId: string;

  @Prop({ default: "" })
  email: string;

  @Prop({ default: "" })
  name: string;

  @Prop({ default: "" })
  gsm: string;

  @Prop({ default: "" })
  customerName: string;

  @Prop({ default: 1 })
  installment: number;

  @Prop({ default: "" })
  cardType: string;

  @Prop({ default: false })
  non3d: boolean;

  @Prop({ default: "" })
  invoiceNo: string;

  @Prop({ default: "" })
  status: string;

  @Prop({ default: "" })
  statusMessage: string;

  @Prop({ type: Date })
  createDate: Date;

  @Prop({ type: Date })
  lastEditDate: Date;

  @Prop({ default: "" })
  paytrToken: string;

  @Prop({ default: "" })
  merchantId: string;

  @Prop({ default: "" })
  id: string;
}

export const PaymentLinkSchema = SchemaFactory.createForClass(PaymentLink);

PaymentLinkSchema.index({ createDate: -1 });
PaymentLinkSchema.index({ customerId: 1 });
PaymentLinkSchema.index({ status: 1 });
PaymentLinkSchema.index({ linkId: 1 }, { unique: true });
