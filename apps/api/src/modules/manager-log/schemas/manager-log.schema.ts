import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type ManagerLogDocument = ManagerLog & Document;

@Schema({ _id: false })
export class ManagerLogMention {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userName: string;
}

@Schema({ _id: false })
export class ManagerLogReference {
  @Prop({ required: true })
  type: string; // "contract" | "license" | ...

  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  label: string;
}

@Schema({ _id: false })
export class ManagerLogReminder {
  @Prop({ required: true })
  date: Date;

  @Prop({ default: false })
  completed: boolean;
}

@Schema({ collection: "manager-logs", timestamps: true })
export class ManagerLog {
  _id: Types.ObjectId;

  @Prop()
  id: string;

  @Prop({ required: true, index: true })
  customerId: string;

  @Prop({ required: true, index: true })
  contextType: string; // "contract" | "license" | ...

  @Prop({ required: true, index: true })
  contextId: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: [ManagerLogMention], default: [] })
  mentions: ManagerLogMention[];

  @Prop({ type: [ManagerLogReference], default: [] })
  references: ManagerLogReference[];

  @Prop({ type: ManagerLogReminder, default: null })
  reminder: ManagerLogReminder | null;

  @Prop({ required: true })
  authorId: string;

  @Prop({ required: true })
  authorName: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ManagerLogSchema = SchemaFactory.createForClass(ManagerLog);

// Compound index for efficient queries by context
ManagerLogSchema.index({ customerId: 1, contextType: 1, contextId: 1 });

// Index for finding logs where a user is mentioned
ManagerLogSchema.index({ "mentions.userId": 1 });

// Index for reminder queries (finding pending reminders)
ManagerLogSchema.index({ "reminder.date": 1, "reminder.completed": 1 });
