import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import type { AuditFields } from "../../../common/audit";

export type CustomerSegmentDocument = CustomerSegment & Document & AuditFields;

@Schema({ collection: "customer-segments", timestamps: true })
export class CustomerSegment {
  _id: Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, default: "" })
  description: string;

  @Prop({ type: Boolean, default: true })
  invoiceOverdueNotification: boolean;

  @Prop({ type: Boolean, default: true })
  newInvoiceNotification: boolean;

  @Prop({ type: Boolean, default: true })
  lastPaymentNotification: boolean;

  @Prop({ type: Boolean, default: true })
  balanceNotification: boolean;

  @Prop({ type: Boolean, default: true })
  annualContractExpiryNotification: boolean;

  @Prop({ type: Boolean, default: true })
  monthlyContractExpiryNotification: boolean;

  @Prop({ type: Boolean, default: false })
  canBlockCashRegister: boolean;

  @Prop({ type: Boolean, default: false })
  canBlockLicense: boolean;

  @Prop({ type: Boolean, default: true })
  enabled: boolean;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const CustomerSegmentSchema =
  SchemaFactory.createForClass(CustomerSegment);

CustomerSegmentSchema.index({ name: 1 }, { unique: true });
