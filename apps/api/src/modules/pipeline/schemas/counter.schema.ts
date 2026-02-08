import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type CounterDocument = Counter & Document;

@Schema({ collection: "counters" })
export class Counter {
  @Prop({ type: String, required: true, unique: true })
  _id: string;

  @Prop({ type: Number, default: 0 })
  seq: number;
}

export const CounterSchema = SchemaFactory.createForClass(Counter);
