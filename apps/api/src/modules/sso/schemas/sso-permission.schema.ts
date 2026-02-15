import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type SsoPermissionDocument = SsoPermission & Document;

@Schema({ collection: "permissions", timestamps: false })
export class SsoPermission {
  @Prop()
  id?: string;

  @Prop({ required: true })
  app_id: string;

  @Prop({ required: true })
  group: string;

  @Prop({ required: true })
  permission: string;

  @Prop()
  parentId?: string;

  @Prop()
  description?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const SsoPermissionSchema = SchemaFactory.createForClass(SsoPermission);

// Indexes for common queries
SsoPermissionSchema.index({ app_id: 1 });
SsoPermissionSchema.index({ id: 1 });
SsoPermissionSchema.index({ app_id: 1, group: 1 });
SsoPermissionSchema.index({ app_id: 1, permission: 1 }, { unique: true });
