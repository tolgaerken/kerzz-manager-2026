import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type SsoApplicationDocument = SsoApplication & Document;

@Schema({ collection: "applications", timestamps: false })
export class SsoApplication {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  @Prop()
  creatorId?: string;

  @Prop()
  updaterId?: string;
}

export const SsoApplicationSchema = SchemaFactory.createForClass(SsoApplication);

// Indexes for common queries
SsoApplicationSchema.index({ id: 1 });
SsoApplicationSchema.index({ name: 1 });
SsoApplicationSchema.index({ isActive: 1 });
