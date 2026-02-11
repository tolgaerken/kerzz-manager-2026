import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export interface PaymentListItem {
  id: number;
  description: string;
  total: number;
  company: string;
  totalUsd: number;
  totalEur: number;
}

export type ContractPaymentDocument = ContractPayment & Document;

@Schema({ collection: "contract-payments", timestamps: false })
export class ContractPayment {
  _id: Types.ObjectId;

  @Prop()
  id: string;

  @Prop({ required: true })
  contractId: string;

  @Prop()
  company: string;

  @Prop()
  brand: string;

  @Prop()
  customerId: string;

  @Prop()
  licanceId: string;

  @Prop()
  invoiceNo: string;

  @Prop({ default: false })
  paid: boolean;

  @Prop()
  payDate: Date;

  @Prop()
  paymentDate: Date;

  @Prop()
  invoiceDate: Date;

  @Prop({ default: 0 })
  total: number;

  @Prop({ default: 0 })
  invoiceTotal: number;

  @Prop({ default: 0 })
  balance: number;

  @Prop({ type: [Object] })
  list: PaymentListItem[];

  @Prop({ default: false })
  yearly: boolean;

  @Prop({ default: false })
  eInvoice: boolean;

  @Prop()
  uuid: string;

  @Prop()
  ref: string;

  @Prop()
  taxNo: string;

  @Prop()
  internalFirm: string;

  @Prop({ default: 0 })
  contractNumber: number;

  @Prop()
  segment: string;

  @Prop({ default: false })
  block: boolean;

  @Prop()
  editDate: Date;

  @Prop()
  editUser: string;

  @Prop()
  companyId: string;

  @Prop()
  dueDate: Date;

  @Prop()
  onlinePaymentId: string;

  @Prop()
  onlinePaymentError: string;

  @Prop()
  otoPaymentAttempt: Date;
}

export const ContractPaymentSchema = SchemaFactory.createForClass(ContractPayment);

// Temel indexler
ContractPaymentSchema.index({ contractId: 1 });
ContractPaymentSchema.index({ payDate: -1 });

// Compound indexler - performans optimizasyonu
ContractPaymentSchema.index({ payDate: -1, contractId: 1 });
ContractPaymentSchema.index({ payDate: -1, paid: 1 });
ContractPaymentSchema.index({ contractId: 1, payDate: -1 });
