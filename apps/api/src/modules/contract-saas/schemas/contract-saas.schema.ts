import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type ContractSaasDocument = ContractSaas & Document;

@Schema({ collection: "contract-saas", timestamps: false })
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

  @Prop({ default: false })
  expired: boolean;

  @Prop({ default: false })
  blocked: boolean;

  @Prop()
  productId: string;

  @Prop({ default: 0 })
  total: number;

  @Prop()
  editDate: Date;

  @Prop()
  editUser: string;
}

export const ContractSaasSchema = SchemaFactory.createForClass(ContractSaas);
ContractSaasSchema.index({ contractId: 1 });
