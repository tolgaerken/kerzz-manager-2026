import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type ContractSupportDocument = ContractSupport & Document;

@Schema({ collection: "contract-supports", timestamps: false })
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

  @Prop({ default: false })
  blocked: boolean;

  @Prop({ default: false })
  expired: boolean;

  @Prop({ default: 0 })
  lastOnlineDay: number;

  @Prop({ default: 0 })
  calulatedPrice: number;

  @Prop()
  editDate: Date;

  @Prop()
  editUser: string;
}

export const ContractSupportSchema = SchemaFactory.createForClass(ContractSupport);
ContractSupportSchema.index({ contractId: 1 });
