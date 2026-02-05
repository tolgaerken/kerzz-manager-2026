import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type ContractCashRegisterDocument = ContractCashRegister & Document;

@Schema({ collection: "cash-registers", timestamps: false })
export class ContractCashRegister {
  _id: Types.ObjectId;

  @Prop()
  id: string;

  @Prop({ required: true, index: true })
  contractId: string;

  @Prop()
  brand: string;

  @Prop()
  licanceId: string;

  @Prop()
  legalId: string;

  @Prop()
  model: string; // "ingenico-ide" | "ingenico-iwe" | "pavo-un20" | "pavo-n86" | "vera" | "hugin"

  @Prop({ default: "gmp" })
  type: string; // "tsm" | "gmp"

  @Prop({ default: 0 })
  price: number;

  @Prop({ default: 0 })
  old_price: number;

  @Prop({ default: "tl" })
  currency: string;

  @Prop({ default: false })
  yearly: boolean;

  @Prop({ default: true })
  enabled: boolean;

  @Prop({ default: false })
  expired: boolean;

  @Prop({ default: false })
  eftPosActive: boolean;

  @Prop({ default: false })
  folioClose: boolean;

  @Prop()
  editDate: Date;

  @Prop()
  editUser: string;
}

export const ContractCashRegisterSchema = SchemaFactory.createForClass(ContractCashRegister);
ContractCashRegisterSchema.index({ contractId: 1 });
