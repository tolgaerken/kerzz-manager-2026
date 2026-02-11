import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type SsoRolePermissionDocument = SsoRolePermission & Document;

@Schema({ collection: "role-permissions", timestamps: false })
export class SsoRolePermission {
  @Prop()
  id?: string;

  @Prop({ required: true })
  role_id: string;

  @Prop({ required: true })
  permission_id: string;

  @Prop()
  role_name?: string;

  @Prop()
  permission?: string;

  @Prop()
  group?: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const SsoRolePermissionSchema = SchemaFactory.createForClass(SsoRolePermission);

// Indexes for common queries
SsoRolePermissionSchema.index({ role_id: 1 });
SsoRolePermissionSchema.index({ permission_id: 1 });
