import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import type { AuditFields } from "../../../common/audit";

export type ContractSaasDocument = ContractSaas & Document & AuditFields;

@Schema({ collection: "contract-saas", timestamps: true })
export class ContractSaas {
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
  description: string;

  @Prop({ default: 0 })
  price: number;

  @Prop({ default: 0 })
  old_price: number;

  @Prop({ default: 1 })
  qty: number;

  @Prop({ default: "tl" })
  currency: string;

  @Prop({ default: false })
  yearly: boolean;

  @Prop({ default: true })
  enabled: boolean;

  @Prop({ default: false, index: true })
  expired: boolean;

  @Prop({ default: false, index: true })
  blocked: boolean;

  @Prop({ index: true })
  productId: string;

  @Prop({ default: 0 })
  total: number;

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

export const ContractSaasSchema = SchemaFactory.createForClass(ContractSaas);

// Compound indexler
ContractSaasSchema.index({ contractId: 1 });
ContractSaasSchema.index({ enabled: 1, expired: 1 }); // Aktif kayıt sorguları için
ContractSaasSchema.index({ editDate: -1 }); // Zaman bazlı sıralama için
ContractSaasSchema.index({ currency: 1 }); // Currency bazlı sorgular için
ContractSaasSchema.index({ yearly: 1 }); // Periyot bazlı sorgular için
ContractSaasSchema.index({ productId: 1 }); // Ürün dağılımı için
