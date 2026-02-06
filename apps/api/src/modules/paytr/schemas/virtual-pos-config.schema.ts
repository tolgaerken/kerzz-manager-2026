import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type VirtualPosConfigDocument = VirtualPosConfig & Document;

@Schema({ collection: "master-pass-vpos", timestamps: false })
export class VirtualPosConfig {
  _id: Types.ObjectId;

  @Prop({ required: true })
  id: string;

  @Prop({ default: "" })
  name: string;

  @Prop({ default: "" })
  bankICA: string;

  @Prop({ default: "" })
  curCode: string;

  @Prop({ required: true })
  merchantId: string;

  @Prop({ default: "" })
  terminalId: string;

  @Prop({ default: "" })
  merchantMail: string;

  @Prop({ default: "" })
  terminalUserId: string;

  @Prop({ default: "" })
  provisionUserId: string;

  @Prop({ required: true })
  provisionPassword: string;

  @Prop({ required: true })
  storeKey: string;

  @Prop({ default: "" })
  posNetId: string;

  @Prop({ default: false })
  default: boolean;
}

export const VirtualPosConfigSchema =
  SchemaFactory.createForClass(VirtualPosConfig);
