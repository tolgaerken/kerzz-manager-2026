import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ _id: false })
export class LeadActivity {
  @Prop({ type: String, default: "" })
  description: string;

  @Prop({ type: String, default: "" })
  userId: string;

  @Prop({ type: String, default: "" })
  userName: string;

  @Prop({ type: Date, default: () => new Date() })
  date: Date;

  @Prop({ type: String, default: "note" })
  type: string; // note, call, email, meeting
}

@Schema({ _id: false })
export class LeadLossInfo {
  @Prop({ type: String, default: "" })
  reason: string; // price, competitor, timing, no-budget, no-response, other

  @Prop({ type: String, default: "" })
  competitor?: string;

  @Prop({ type: String, default: "" })
  notes?: string;

  @Prop({ type: Date })
  lostAt?: Date;

  @Prop({ type: String, default: "" })
  lostBy?: string;
}

@Schema({ _id: false })
export class LeadStageHistory {
  @Prop({ type: String, default: "" })
  fromStatus: string;

  @Prop({ type: String, default: "" })
  toStatus: string;

  @Prop({ type: String, default: "" })
  changedBy: string;

  @Prop({ type: Date, default: () => new Date() })
  changedAt: Date;

  @Prop({ type: Number, default: 0 })
  durationInStage: number;
}

export type LeadDocument = Lead & Document;

@Schema({ collection: "leads", timestamps: true })
export class Lead {
  _id: Types.ObjectId;

  @Prop({ type: String, unique: true, index: true })
  pipelineRef: string;

  // Opsiyonel müşteri bağlantısı
  @Prop({ type: String, default: "" })
  customerId: string;

  // Gömülü iletişim bilgileri
  @Prop({ type: String, default: "" })
  contactName: string;

  @Prop({ type: String, default: "" })
  contactPhone: string;

  @Prop({ type: String, default: "" })
  contactEmail: string;

  @Prop({ type: String, default: "" })
  companyName: string;

  // Lead detayları
  @Prop({ type: String, default: "" })
  source: string;

  @Prop({ type: String, default: "" })
  assignedUserId: string;

  @Prop({ type: String, default: "" })
  assignedUserName: string;

  @Prop({
    type: String,
    default: "new",
    enum: ["new", "contacted", "qualified", "unqualified", "converted", "lost"],
    index: true,
  })
  status: string;

  @Prop({
    type: String,
    default: "medium",
    enum: ["low", "medium", "high", "urgent"],
  })
  priority: string;

  @Prop({ type: String, default: "" })
  notes: string;

  @Prop({ type: Number, default: 0 })
  estimatedValue: number;

  @Prop({ type: String, default: "tl" })
  currency: string;

  @Prop({ type: Date })
  expectedCloseDate: Date;

  @Prop({ type: [String], default: [] })
  labels: string[];

  @Prop({ type: [LeadActivity], default: [] })
  activities: LeadActivity[];

  @Prop({ type: LeadLossInfo, default: () => ({}) })
  lossInfo: LeadLossInfo;

  @Prop({ type: [LeadStageHistory], default: [] })
  stageHistory: LeadStageHistory[];

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);

LeadSchema.index({ status: 1 });
LeadSchema.index({ assignedUserId: 1 });
LeadSchema.index({ pipelineRef: 1 });
LeadSchema.index({ contactName: "text", companyName: "text", contactEmail: "text" });
