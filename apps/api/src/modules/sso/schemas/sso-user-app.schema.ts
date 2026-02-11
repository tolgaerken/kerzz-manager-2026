import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type SsoUserAppDocument = SsoUserApp & Document;

@Schema({ collection: "user-apps", timestamps: false })
export class SsoUserApp {
  @Prop()
  id?: string;

  @Prop({ required: true })
  app_id: string;

  @Prop({ required: true })
  user_id: string;

  @Prop({ required: true })
  user_name: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  assignedDate?: Date;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const SsoUserAppSchema = SchemaFactory.createForClass(SsoUserApp);

// Indexes for common queries
SsoUserAppSchema.index({ app_id: 1 });
SsoUserAppSchema.index({ user_id: 1 });
SsoUserAppSchema.index({ app_id: 1, user_id: 1 });
