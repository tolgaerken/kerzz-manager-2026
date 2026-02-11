import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type SsoRoleDocument = SsoRole & Document;

@Schema({ collection: "roles", timestamps: false })
export class SsoRole {
  @Prop()
  id?: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  app_id: string;

  @Prop({ default: false })
  developer: boolean;

  @Prop()
  description?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const SsoRoleSchema = SchemaFactory.createForClass(SsoRole);

// Indexes for common queries
SsoRoleSchema.index({ app_id: 1 });
SsoRoleSchema.index({ id: 1 });
SsoRoleSchema.index({ app_id: 1, name: 1 });
