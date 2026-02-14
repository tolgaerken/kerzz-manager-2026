import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type SsoLicenseDocument = SsoLicense & Document;

/**
 * License schema for kerzz-contract database
 * This is a read-only schema - licenses are managed elsewhere
 */
@Schema({ collection: "licenses", timestamps: false })
export class SsoLicense {
  @Prop({ required: true })
  id: string;

  @Prop()
  licanceId?: string;

  @Prop()
  brand?: string;

  @Prop()
  companyName?: string;

  @Prop()
  taxNumber?: string;

  @Prop()
  taxOffice?: string;

  @Prop()
  address?: string;

  @Prop()
  city?: string;

  @Prop()
  district?: string;

  @Prop()
  phone?: string;

  @Prop()
  email?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  startDate?: Date;

  @Prop()
  endDate?: Date;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const SsoLicenseSchema = SchemaFactory.createForClass(SsoLicense);

// Indexes for common queries
SsoLicenseSchema.index({ id: 1 });
SsoLicenseSchema.index({ licanceId: 1 });
SsoLicenseSchema.index({ brand: 1 });
SsoLicenseSchema.index({ isActive: 1 });
