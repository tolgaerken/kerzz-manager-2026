import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type InflationRateDocument = InflationRate & Document;

@Schema({ collection: "inflations", timestamps: true })
export class InflationRate {
  _id: Types.ObjectId;

  @Prop({ required: true, index: true })
  id: string;

  @Prop({ default: "tr", index: true })
  country: string;

  @Prop({ required: true, index: true })
  year: number;

  @Prop({ required: true, index: true })
  month: number;

  @Prop({ required: true })
  date: Date;

  @Prop({ default: 0 })
  consumer: number;

  @Prop({ default: 0 })
  producer: number;

  @Prop({ default: 0 })
  average: number;

  @Prop({ default: 0 })
  monthlyConsumer: number;

  @Prop({ default: 0 })
  monthlyProducer: number;

  @Prop({ default: 0 })
  monthlyAverage: number;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const InflationRateSchema = SchemaFactory.createForClass(InflationRate);
InflationRateSchema.index({ year: -1, month: -1 });
