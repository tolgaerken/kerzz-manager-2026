import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type ContractDocumentDocument = ContractDocument & Document;

@Schema({ collection: "contract-documents", timestamps: false })
export class ContractDocument {
  _id: Types.ObjectId;

  @Prop()
  id: string;

  @Prop({ required: true, index: true })
  contractId: string;

  @Prop()
  description: string;

  @Prop()
  filename: string; // URL

  @Prop()
  type: string; // "contract" | "offer" | "invoice" etc.

  @Prop()
  documentDate: Date;

  @Prop()
  userId: string;

  @Prop()
  saleId: string;

  @Prop()
  offerId: string;

  @Prop()
  customerId: string;

  @Prop()
  licanceId: string;

  @Prop()
  documentVersion: string;

  @Prop()
  editDate: Date;

  @Prop()
  editUser: string;
}

export const ContractDocumentSchema = SchemaFactory.createForClass(ContractDocument);
ContractDocumentSchema.index({ contractId: 1 });
