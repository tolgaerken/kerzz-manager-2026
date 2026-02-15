import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type OrgLocationDocument = OrgLocation & Document;

/**
 * Organizasyon Lokasyon Şeması
 * Çalışan profillerinde kullanılacak lokasyon/şube ön tanımları
 */
@Schema({ collection: "org_locations", timestamps: true })
export class OrgLocation {
  _id: Types.ObjectId;

  /** Lokasyon adı (unique) */
  @Prop({ required: true, unique: true, index: true })
  name: string;

  /** Aktif/Pasif durumu */
  @Prop({ default: true, index: true })
  isActive: boolean;

  /** Adres bilgisi (opsiyonel) */
  @Prop({ default: "" })
  address: string;

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

export const OrgLocationSchema = SchemaFactory.createForClass(OrgLocation);

// Text search index
OrgLocationSchema.index({ name: "text" });
