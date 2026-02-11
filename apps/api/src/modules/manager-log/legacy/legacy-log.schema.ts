import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import type { LegacyLogType } from "./legacy-log.types";

export type LegacyLogDocument = LegacyLog & Document;
const LEGACY_LOG_TYPE_VALUES: LegacyLogType[] = [
  "contract",
  "licence",
  "account",
  "customer",
  "sale",
  "payment",
  "invoice",
  "setup",
  "e-invoice",
];

@Schema({ collection: "logs", timestamps: false, strict: false })
export class LegacyLog {
  _id: Types.ObjectId;

  @Prop()
  id?: string;

  @Prop({ required: true })
  log: string;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: String, default: "" })
  userId: string;

  @Prop({ type: String, default: "" })
  userName: string;

  @Prop({ type: Array, default: [] })
  notifyUsers?: Array<{ id: string; name: string }>;

  @Prop({ type: Boolean, default: false })
  resolved?: boolean;

  @Prop()
  accountId?: string;

  @Prop()
  customerId?: string;

  @Prop()
  licenceId?: string;

  @Prop()
  contractId?: string;

  @Prop()
  saleId?: string;

  @Prop({ type: String, enum: LEGACY_LOG_TYPE_VALUES, required: false })
  logType?: LegacyLogType;
}

export const LegacyLogSchema = SchemaFactory.createForClass(LegacyLog);
