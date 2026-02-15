import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type OrgDepartmentDocument = OrgDepartment & Document;

/**
 * Organizasyon Departman Şeması
 * Çalışan profillerinde kullanılacak departman ön tanımları
 */
@Schema({ collection: "org_departments", timestamps: true })
export class OrgDepartment {
  _id: Types.ObjectId;

  /** Departman kodu (unique) */
  @Prop({ required: true, unique: true, index: true })
  code: string;

  /** Departman adı */
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

export const OrgDepartmentSchema = SchemaFactory.createForClass(OrgDepartment);

// Text search index
OrgDepartmentSchema.index({ code: "text", name: "text" });
