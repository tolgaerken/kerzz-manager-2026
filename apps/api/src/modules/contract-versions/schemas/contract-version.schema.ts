import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type ContractVersionDocument = ContractVersion & Document;

@Schema({ collection: "contract-versions", timestamps: false })
export class ContractVersion {
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
  currency: string;

  @Prop()
  type: string;

  @Prop({ default: true })
  enabled: boolean;

  @Prop({ default: false })
  expired: boolean;

  @Prop()
  editDate: Date;

  @Prop()
  editUser: string;
}

export const ContractVersionSchema = SchemaFactory.createForClass(ContractVersion);
ContractVersionSchema.index({ contractId: 1 });
