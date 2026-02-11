import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type SsoUserDocument = SsoUser & Document;

@Schema({ collection: "users", timestamps: false })
export class SsoUser {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  phone?: string;

  @Prop()
  password?: string;

  @Prop()
  resetCode?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastLoginDate?: Date;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  @Prop()
  creatorId?: string;

  @Prop()
  updaterId?: string;
}

export const SsoUserSchema = SchemaFactory.createForClass(SsoUser);

// Index on id field for faster lookups
SsoUserSchema.index({ id: 1 });
SsoUserSchema.index({ email: 1 });
SsoUserSchema.index({ phone: 1 });
