import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import type { AuditFields } from "../../../common/audit";

export type ContractUserDocument = ContractUser & Document & AuditFields;

@Schema({ collection: "contract-users", timestamps: true })
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
