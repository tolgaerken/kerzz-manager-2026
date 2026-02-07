import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type BankTransactionDocument = BankTransaction & Document;

@Schema({ collection: "bank-transactions", timestamps: false })
export class BankTransaction {
  _id: Types.ObjectId;

  @Prop({ index: true })
  id: string;

  @Prop()
  accountId: string;

  @Prop()
  name: string;

  @Prop()
  dc: string;

  @Prop()
  code: string;

  @Prop({ default: 0 })
  amount: number;

  @Prop({ default: 0 })
  balance: number;

  @Prop()
  description: string;

  @Prop({ index: true })
  businessDate: Date;

  @Prop()
  createDate: Date;

  @Prop()
  opponentId: string;

  @Prop()
  opponentIban: string;

  @Prop()
  sourceId: string;

  @Prop()
  source: string;

  @Prop({ index: true })
  bankAccId: string;

  @Prop()
  bankAccName: string;

  @Prop()
  bankId: string;

  @Prop()
  bankName: string;

  @Prop({ default: "waiting", index: true })
  erpStatus: string;

  @Prop()
  erpMessage: string;

  @Prop()
  erpGlAccountCode: string;

  @Prop()
  erpAccountCode: string;
}

export const BankTransactionSchema = SchemaFactory.createForClass(BankTransaction);
BankTransactionSchema.index({ businessDate: -1 });
BankTransactionSchema.index({ bankAccId: 1, businessDate: -1 });
