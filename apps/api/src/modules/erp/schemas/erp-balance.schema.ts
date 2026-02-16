import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import type { AuditFields } from "../../../common/audit";

export type ErpBalanceDocument = ErpBalance & Document & AuditFields;

@Schema({ collection: "erp-balances", timestamps: true })
export class ErpBalance {
  _id: Types.ObjectId;

  @Prop({ required: true })
  CariKodu: string;

  @Prop({ default: "" })
  CariUnvan: string;

  @Prop({ default: 0 })
  CariBakiye: number;

  @Prop({ default: 0 })
  CariVade: number;

  @Prop({ default: 0 })
  Bugun: number;

  @Prop({ default: 0 })
  ToplamGecikme: number;

  @Prop({ default: 0 })
  VadesiGelmemis: number;

  @Prop({ default: 0 })
  Limiti: number;

  @Prop({ default: 0 })
  GECIKMEGUN: number;

  @Prop({ default: "" })
  GrupKodu: string;

  @Prop({ default: "" })
  TcKimlik: string;

  @Prop({ default: "" })
  VergiN: string;

  @Prop({ default: "" })
  EkAcik1: string;

  @Prop({ required: true })
  internalFirm: string;

  @Prop({ type: Date, default: Date.now })
  fetchedAt: Date;
}

export const ErpBalanceSchema = SchemaFactory.createForClass(ErpBalance);

ErpBalanceSchema.index({ CariKodu: 1, internalFirm: 1 }, { unique: true });
ErpBalanceSchema.index({ internalFirm: 1 });
ErpBalanceSchema.index({ CariUnvan: "text" });
