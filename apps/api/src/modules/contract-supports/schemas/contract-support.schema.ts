import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import type { AuditFields } from "../../../common/audit";

export type ContractSupportDocument = ContractSupport & Document & AuditFields;

@Schema({ collection: "contract-supports", timestamps: true })
export class ContractSupport {
  _id: Types.ObjectId;

  @Prop()
  id: string;

  @Prop({ required: true, index: true })
  contractId: string;

  @Prop()
  brand: string;

  @Prop()
  licanceId: string;

  @Prop({ default: 0 })
  price: number;

  @Prop({ default: 0 })
  old_price: number;

  @Prop({ default: "tl" })
  currency: string; // "tl" | "usd" | "eur"

  @Prop({ default: "standart" })
  type: string;

  @Prop({ default: false })
  yearly: boolean;

  @Prop({ default: true })
  enabled: boolean;

  @Prop({ default: false, index: true })
  blocked: boolean;

  @Prop({ default: false, index: true })
  expired: boolean;

  @Prop({ default: 0 })
  lastOnlineDay: number;

  @Prop({ default: 0 })
  calulatedPrice: number;

  @Prop({ type: Date })
  startDate: Date;

  @Prop({ default: false })
  activated: boolean;

  @Prop({ type: Date })
  activatedAt: Date;

  @Prop({ index: true })
  editDate: Date;

  @Prop()
  editUser: string;
}

export const ContractSupportSchema = SchemaFactory.createForClass(ContractSupport);

// Compound indexler
ContractSupportSchema.index({ contractId: 1 });
ContractSupportSchema.index({ enabled: 1, expired: 1 }); // Aktif kayıt sorguları için
ContractSupportSchema.index({ editDate: -1 }); // Zaman bazlı sıralama için
ContractSupportSchema.index({ type: 1 }); // Tip filtreleme için
ContractSupportSchema.index({ currency: 1 }); // Currency bazlı sorgular için
ContractSupportSchema.index({ yearly: 1 }); // Periyot bazlı sorgular için
