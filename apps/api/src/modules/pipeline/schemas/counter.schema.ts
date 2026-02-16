import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import type { AuditFields } from "../../../common/audit";

export type CounterDocument = Counter & Document & AuditFields;

@Schema({ collection: "counters", timestamps: true })
export class Counter {
  @Prop({ type: String, required: true, unique: true })
  _id: string;

  @Prop({ type: Number, default: 0 })
  seq: number;
}

export const CounterSchema = SchemaFactory.createForClass(Counter);
