import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type CustomerDocument = Customer & Document;

@Schema({ collection: "customers", timestamps: true })
export class Customer {
  _id: Types.ObjectId;

  @Prop({ type: String, index: true })
  id: string;

  @Prop({ type: String })
  taxNo: string;

  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  companyName: string;

  @Prop({ type: String })
  address: string;

  @Prop({ type: String })
  city: string;

  @Prop({ type: String })
  district: string;

  @Prop({ type: String })
  phone: string;

  @Prop({ type: String })
  email: string;

  @Prop({ type: Boolean, default: true })
  enabled: boolean;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

// Index for taxNo (frequently queried)
CustomerSchema.index({ taxNo: 1 });
CustomerSchema.index({ name: 1 });
CustomerSchema.index({ companyName: 1 });
