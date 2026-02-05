import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type ContractItemDocument = ContractItem & Document;

@Schema({ collection: "contract-items", timestamps: false })
export class ContractItem {
  _id: Types.ObjectId;

  @Prop()
  id: string;

  @Prop({ required: true, index: true })
  contractId: string;

  @Prop()
  itemId: string;

  @Prop()
  description: string;

  @Prop({ default: 0 })
  price: number;

  @Prop({ default: 0 })
  old_price: number;

  @Prop({ default: 1 })
  qty: number;

  @Prop({ default: false })
  qtyDynamic: boolean;

  @Prop({ default: "tl" })
  currency: string;

  @Prop({ default: false })
  yearly: boolean;

  @Prop({ default: true })
  enabled: boolean;

  @Prop({ default: false })
  expired: boolean;

  @Prop()
  erpId: string;

  @Prop()
  editDate: Date;

  @Prop()
  editUser: string;
}

export const ContractItemSchema = SchemaFactory.createForClass(ContractItem);
ContractItemSchema.index({ contractId: 1 });
