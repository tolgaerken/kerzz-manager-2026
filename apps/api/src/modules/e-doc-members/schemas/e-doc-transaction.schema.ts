import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type EDocTransactionDocument = EDocTransaction & Document;

@Schema({ collection: "invoice-credit-transactions", timestamps: false })
export class EDocTransaction {
  _id: Types.ObjectId;

  @Prop()
  id: string;

  @Prop({ required: true })
  erpId: string;

  @Prop({ default: 0 })
  amount: number;

  @Prop()
  transactionDate: Date;

  @Prop()
  description: string;

  @Prop()
  internalFirm: string;

  @Prop()
  licanceId: string;

  @Prop()
  note: string;

  @Prop({ default: 0 })
  totalPrice: number;

  @Prop({ default: 0 })
  unitPrice: number;

  @Prop()
  invoiceNumber: string;

  @Prop()
  invoiceUUID: string;

  @Prop()
  invoiceDate: Date;

  @Prop()
  company: string;

  @Prop()
  contractType: string;

  @Prop({ default: 0 })
  grandTotal: number;

  @Prop({ default: 0 })
  taxTotal: number;

  @Prop({ default: 0 })
  taxRate: number;

  @Prop()
  dueDate: Date;

  @Prop({ default: false })
  paid: boolean;

  @Prop()
  createDate: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const EDocTransactionSchema =
  SchemaFactory.createForClass(EDocTransaction);
EDocTransactionSchema.index({ erpId: 1 });
EDocTransactionSchema.index({ transactionDate: -1 });
