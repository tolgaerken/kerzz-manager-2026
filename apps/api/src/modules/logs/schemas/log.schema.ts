import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type LogDocument = Log & Document;

@Schema({ _id: false })
export class LogMention {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userName: string;
}

@Schema({ _id: false })
export class LogReference {
  @Prop({ required: true })
  type: string; // "contract" | "license" | ...

  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  label: string;
}

@Schema({ _id: false })
export class LogReminder {
  @Prop({ required: true })
  date: Date;

  @Prop({ default: false })
  completed: boolean;
}

@Schema({ collection: "logs", timestamps: true })
export class Log {
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

  @Prop({ type: [LogMention], default: [] })
  mentions: LogMention[];

  @Prop({ type: [LogReference], default: [] })
  references: LogReference[];

  @Prop({ type: LogReminder, default: null })
  reminder: LogReminder | null;

  @Prop({ required: true })
  authorId: string;

  @Prop({ required: true })
  authorName: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const LogSchema = SchemaFactory.createForClass(Log);

// Compound index for efficient queries by context
LogSchema.index({ customerId: 1, contextType: 1, contextId: 1 });

// Index for finding logs where a user is mentioned
LogSchema.index({ "mentions.userId": 1 });

// Index for reminder queries (finding pending reminders)
LogSchema.index({ "reminder.date": 1, "reminder.completed": 1 });
