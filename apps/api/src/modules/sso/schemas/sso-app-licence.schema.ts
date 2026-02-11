import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type SsoAppLicenceDocument = SsoAppLicence & Document;

@Schema({ collection: "app-licances", timestamps: false })
export class SsoAppLicence {
  @Prop()
  id?: string;

  @Prop({ required: true })
  app_id: string;

  @Prop({ required: true })
  user_id: string;

  @Prop()
  user_name?: string;

  @Prop()
  app_name?: string;

  @Prop()
  licance_id?: string;

  @Prop()
  brand?: string;

  @Prop({ type: [String], default: [] })
  roles: string[];

  @Prop({ type: [String], default: [] })
  SelectedTagValues?: string[];

  @Prop()
  license_type?: string;

  @Prop()
  start_date?: Date;

  @Prop()
  end_date?: Date;

  @Prop({ default: true })
  is_active?: boolean;

  @Prop({ type: [String], default: [] })
  features?: string[];

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const SsoAppLicenceSchema = SchemaFactory.createForClass(SsoAppLicence);

// Indexes for common queries
SsoAppLicenceSchema.index({ app_id: 1 });
SsoAppLicenceSchema.index({ user_id: 1 });
SsoAppLicenceSchema.index({ app_id: 1, user_id: 1 });
