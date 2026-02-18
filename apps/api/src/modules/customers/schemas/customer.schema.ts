import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import type { AuditFields } from "../../../common/audit";

export type CustomerDocument = Customer & Document & AuditFields;

@Schema({ _id: false })
export class CustomerAddress {
  @Prop({ default: "" })
  address: string;

  @Prop({ default: 0 })
  cityId: number;

  @Prop({ default: "" })
  city: string;

  @Prop({ default: 0 })
  townId: number;

  @Prop({ default: "" })
  town: string;

  @Prop({ default: 0 })
  districtId: number;

  @Prop({ default: "" })
  district: string;

  @Prop({ default: "" })
  countryId: string;

  @Prop({ default: "" })
  country: string;
}

@Schema({ collection: "customers", timestamps: true })
export class Customer {
  _id: Types.ObjectId;

  @Prop({ type: String, default: "customer", index: true })
  type: string; // "prospect" | "customer"

  @Prop({ type: String, index: true })
  id: string;

  @Prop({ type: String, index: true })
  erpId: string;

  @Prop({ type: String })
  taxNo: string;

  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  brand: string;

  @Prop({ type: CustomerAddress, default: () => ({}) })
  address: CustomerAddress;

  @Prop({ type: String })
  phone: string;

  @Prop({ type: String })
  email: string;

  @Prop({ type: String, default: "" })
  taxOffice: string;

  @Prop({ type: Boolean, default: true })
  enabled: boolean;

  @Prop({ type: String, default: null })
  segmentId: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

// Index for taxNo (frequently queried)
CustomerSchema.index({ taxNo: 1 });
CustomerSchema.index({ name: 1 });
CustomerSchema.index({ brand: 1 });
CustomerSchema.index({ segmentId: 1 });
