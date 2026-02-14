import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type SsoApiKeyDocument = SsoApiKey & Document;

@Schema({ collection: "api-keys", timestamps: false })
export class SsoApiKey {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  api_key: string;

  @Prop({ required: true })
  app_id: string;

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

export const SsoApiKeySchema = SchemaFactory.createForClass(SsoApiKey);

// Indexes for common queries
SsoApiKeySchema.index({ id: 1 });
SsoApiKeySchema.index({ app_id: 1 });
SsoApiKeySchema.index({ api_key: 1 });
