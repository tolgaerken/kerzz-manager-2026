import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type InvoiceDocument = Invoice & Document;

// Alt şemalar
@Schema({ _id: false })
export class InvoiceRow {
  @Prop({ default: "" })
  id: string;

  @Prop({ default: "" })
  code: string;

  @Prop({ default: "" })
  name: string;

  @Prop({ default: "" })
  description: string;

  @Prop({ default: 0 })
  quantity: number;

  @Prop({ default: 0 })
  unitPrice: number;

  @Prop({ default: 0 })
  discount: number;

  @Prop({ default: 0 })
  taxRate: number;

  @Prop({ default: 0 })
  taxTotal: number;

  @Prop({ default: 0 })
  total: number;

  @Prop({ default: 0 })
  grandTotal: number;

  @Prop({ default: 0 })
  stoppageAmount: number;
}

@Schema({ _id: false })
export class NotifyUser {
  @Prop({ default: "" })
  name: string;

  @Prop({ default: "" })
  email: string;

  @Prop({ default: "" })
  gsm: string;

  @Prop({ default: "" })
  smsText: string;
}

@Schema({ _id: false })
export class InvoiceNotify {
  @Prop({ default: false })
  sms: boolean;

  @Prop({ default: false })
  email: boolean;

  @Prop({ default: false })
  push: boolean;

  @Prop({ type: Date })
  sendTime: Date;

  @Prop({ type: [NotifyUser], default: [] })
  users: NotifyUser[];
}

@Schema({ collection: "global-invoices", timestamps: true })
export class Invoice {
  _id: Types.ObjectId;

  @Prop({ required: true })
  id: string;

  @Prop({ default: "" })
  contractId: string;

  @Prop({ default: "" })
  customerId: string;

  @Prop({ default: "" })
  name: string;

  @Prop({ default: "" })
  description: string;

  @Prop({ type: Date })
  dueDate: Date;

  @Prop({ default: "" })
  eCreditId: string;

  @Prop({ default: "" })
  erpId: string;

  @Prop({ default: 0 })
  grandTotal: number;

  @Prop({ type: Date })
  invoiceDate: Date;

  @Prop({ default: "" })
  invoiceNumber: string;

  @Prop({ type: [InvoiceRow], default: [] })
  invoiceRows: InvoiceRow[];

  @Prop({ default: "contract" })
  invoiceType: string; // 'contract' | 'sale' | 'eDocuments'

  @Prop({ default: "" })
  invoiceUUID: string;

  @Prop({ type: Date })
  lateFeeLastCalculationDate: Date;

  @Prop({ default: "" })
  lateFeeStatus: string; // 'PENDING' | 'COMPLETED'

  @Prop({ default: 0 })
  lateFeeTotal: number;

  @Prop({ type: Date })
  payDate: Date;

  @Prop({ default: "" })
  saleId: string;

  @Prop({ default: 0 })
  taxTotal: number;

  @Prop({ default: 0 })
  total: number;

  @Prop({ default: "" })
  internalFirm: string;

  @Prop({ default: "" })
  reference: string;

  @Prop({ type: [InvoiceNotify], default: [] })
  notify: InvoiceNotify[];

  @Prop({ type: Date })
  lastNotify: Date;

  @Prop({ default: false })
  isPaid: boolean;

  @Prop({ type: Date })
  paymentSuccessDate: Date;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

// Indexes for better query performance
InvoiceSchema.index({ invoiceNumber: 1 });
InvoiceSchema.index({ invoiceDate: 1 });
InvoiceSchema.index({ dueDate: 1 });
InvoiceSchema.index({ customerId: 1 });
InvoiceSchema.index({ contractId: 1 });
InvoiceSchema.index({ isPaid: 1 });
InvoiceSchema.index({ invoiceType: 1 });
InvoiceSchema.index({ internalFirm: 1 });
InvoiceSchema.index({ name: "text", invoiceNumber: "text", description: "text" });
