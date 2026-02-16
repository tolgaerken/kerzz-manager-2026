import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import type { AuditFields } from "../../../common/audit";

export type FeedbackDocument = Feedback & Document & AuditFields;

export type FeedbackStatus = "open" | "in_progress" | "completed" | "rejected";
export type FeedbackPriority = "low" | "medium" | "high" | "urgent";

@Schema({ collection: "feedbacks", timestamps: true })
export class Feedback {
  _id: Types.ObjectId;

  @Prop({ required: true, index: true })
  id: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], default: [] })
  screenshots: string[];

  @Prop({ default: "medium", index: true })
  priority: FeedbackPriority;

  @Prop({ default: "open", index: true })
  status: FeedbackStatus;

  @Prop({ required: true, index: true })
  createdBy: string;

  @Prop({ required: true })
  createdByName: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
FeedbackSchema.index({ createdAt: -1 });
