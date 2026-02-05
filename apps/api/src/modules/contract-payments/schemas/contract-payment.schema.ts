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

  @Prop({ required: true, index: true })
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
}

export const ContractPaymentSchema = SchemaFactory.createForClass(ContractPayment);
ContractPaymentSchema.index({ contractId: 1 });
ContractPaymentSchema.index({ payDate: -1 });
