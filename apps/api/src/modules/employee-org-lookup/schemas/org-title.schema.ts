import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type OrgTitleDocument = OrgTitle & Document;

/**
 * Organizasyon Ünvan Şeması
 * Çalışan profillerinde kullanılacak ünvan ön tanımları
 */
@Schema({ collection: "org_titles", timestamps: true })
export class OrgTitle {
  _id: Types.ObjectId;

  /** Ünvan kodu (unique) */
  @Prop({ required: true, unique: true, index: true })
  code: string;

  /** Ünvan adı */
  @Prop({ required: true })
  name: string;

  /** Aktif/Pasif durumu */
  @Prop({ default: true, index: true })
  isActive: boolean;

  /** Açıklama (opsiyonel) */
  @Prop({ default: "" })
  description: string;

  /** Sıralama önceliği */
  @Prop({ default: 0 })
  sortOrder: number;

  /** Oluşturulma tarihi */
  createdAt: Date;

  /** Güncellenme tarihi */
  updatedAt: Date;
}

export const OrgTitleSchema = SchemaFactory.createForClass(OrgTitle);

// Text search index
OrgTitleSchema.index({ code: "text", name: "text" });
