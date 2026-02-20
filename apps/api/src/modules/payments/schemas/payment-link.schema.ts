import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema, Types } from "mongoose";
import type { AuditFields } from "../../../common/audit";

export type PaymentLinkDocument = PaymentLink & Document & AuditFields;

@Schema({ collection: "online-payments", timestamps: true })
export class PaymentLink {
  _id: Types.ObjectId;

  @Prop({ default: "", index: true })
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

  @Prop({ type: MongooseSchema.Types.Mixed, default: false })
  non3d: boolean | string;

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

  // --- Smarty uyumu icin eklenen alanlar ---

  @Prop({ default: "" })
  userIp: string;

  @Prop({ default: "" })
  userId: string;

  @Prop({ default: "card" })
  paymentType: string;

  @Prop({ default: "" })
  paymentAmount: string;

  @Prop({ default: "TL" })
  currency: string;

  @Prop({ default: "0" })
  installmentCount: string;

  @Prop({ default: "" })
  description: string;

  @Prop({ default: "0" })
  storeCard: string;

  @Prop({ default: "link" })
  actionType: string;

  @Prop({ default: "" })
  postUrl: string;

  @Prop({ default: "none" })
  statusCardSave: string;

  @Prop({ default: "io" })
  source: string;

  @Prop({ default: "" })
  userToken: string;

  @Prop({ default: "" })
  itemCode: string;

  @Prop({ default: "" })
  onlinePaymentId: string;

  // --- Bildirim bağlam metadata ---

  @Prop({ default: "" })
  contextType: string;

  @Prop({ default: "" })
  contextId: string;

  @Prop({ default: "" })
  contractNo: string;

  @Prop({ default: "" })
  notificationSource: string;
}

export const PaymentLinkSchema = SchemaFactory.createForClass(PaymentLink);

PaymentLinkSchema.index({ createDate: -1 });
PaymentLinkSchema.index({ customerId: 1 });
PaymentLinkSchema.index({ status: 1 });
PaymentLinkSchema.index(
  { linkId: 1 },
  { unique: true, partialFilterExpression: { linkId: { $ne: "" } } }
);
