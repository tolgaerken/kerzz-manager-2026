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

  @Prop({ default: false, index: true })
  expired: boolean;

  @Prop({ default: false })
  eftPosActive: boolean;

  @Prop({ default: false })
  folioClose: boolean;

  @Prop({ index: true })
  editDate: Date;

  @Prop()
  editUser: string;
}

export const ContractCashRegisterSchema = SchemaFactory.createForClass(ContractCashRegister);

// Compound indexler
ContractCashRegisterSchema.index({ contractId: 1 });
ContractCashRegisterSchema.index({ enabled: 1, expired: 1 }); // Aktif kayıt sorguları için
ContractCashRegisterSchema.index({ editDate: -1 }); // Zaman bazlı sıralama için
ContractCashRegisterSchema.index({ type: 1 }); // Tür filtreleme için
ContractCashRegisterSchema.index({ model: 1 }); // Model dağılımı için
ContractCashRegisterSchema.index({ currency: 1 }); // Currency bazlı sorgular için
