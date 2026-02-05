import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type ContractUserDocument = ContractUser & Document;

@Schema({ collection: "contract-users", timestamps: false })
export class ContractUser {
  _id: Types.ObjectId;

  @Prop()
  id: string;

  @Prop({ required: true, index: true })
  contractId: string;

  @Prop()
  email: string;

  @Prop()
  gsm: string;

  @Prop()
  name: string;

  @Prop()
  role: string; // "account" | "it" | "management" | "other"

  @Prop()
  editDate: Date;

  @Prop()
  editUser: string;
}

export const ContractUserSchema = SchemaFactory.createForClass(ContractUser);

// Index for faster queries by contractId
ContractUserSchema.index({ contractId: 1 });
