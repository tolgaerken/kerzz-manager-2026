import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type PipelinePaymentDocument = PipelinePayment & Document;

@Schema({ collection: "pipeline-payments", timestamps: true })
export class PipelinePayment {
  _id: Types.ObjectId;

  @Prop({ type: String, required: true, index: true })
  parentId: string;

  @Prop({ type: String, required: true, enum: ["offer", "sale"], index: true })
  parentType: string;

  @Prop({ type: String })
  pipelineRef: string;

  @Prop({ type: Number, default: 0 })
  amount: number;

  @Prop({ type: String, default: "tl" })
  currency: string;

  @Prop({ type: Date })
  paymentDate: Date;

  @Prop({ type: String, default: "" })
  method: string;

  @Prop({ type: String, default: "" })
  description: string;

  @Prop({ type: Boolean, default: false })
  isPaid: boolean;

  @Prop({ type: String, default: "" })
  invoiceNo: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const PipelinePaymentSchema =
  SchemaFactory.createForClass(PipelinePayment);

PipelinePaymentSchema.index({ parentId: 1, parentType: 1 });
PipelinePaymentSchema.index({ pipelineRef: 1 });
