import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type ContractDocument = Contract & Document;

@Schema({ collection: "contracts", timestamps: false })
export class Contract {
  _id: Types.ObjectId;

  @Prop()
  id: string;

  @Prop({ default: false })
  blockedLicance: boolean;

  @Prop()
  brand: string;

  @Prop({ default: 0 })
  cashRegisterTotal: number;

  @Prop()
  cashRegister_description: string;

  @Prop()
  company: string;

  @Prop({ default: "future" })
  contractFlow: string; // "future" | "past" - Fatura kesim zamanlaması (future: ay başı/peşinat, past: ay sonu/vadeli)

  @Prop()
  contractId: string;

  @Prop()
  createdAt: Date;

  @Prop()
  creatorId: string;

  @Prop()
  customerId: string;

  @Prop()
  description: string;

  @Prop()
  editDate: Date;

  @Prop()
  editUser: string;

  @Prop({ default: false })
  enabled: boolean;

  @Prop()
  endDate: Date;

  @Prop({ default: 0 })
  erpBalance: number;

  @Prop({ default: false })
  hasLog: boolean;

  @Prop()
  incrasePeriod: string;

  @Prop()
  incrasePeriood: string;

  @Prop({ default: 0 })
  incraseRate: number;

  @Prop()
  incraseRateType: string;

  @Prop()
  internalFirm: string;

  @Prop({ default: false })
  isExtendable: boolean;

  @Prop({ default: true })
  isActive: boolean; // Kontrat aktif mi? (eskiye uyumluluk için default true)

  @Prop({ default: false })
  isFree: boolean;

  @Prop({ default: 0 })
  itemsTotal: number;

  @Prop()
  items_description: string;

  @Prop({ default: 0 })
  lateFee: number;

  @Prop()
  lateFeeType: string;

  @Prop({ default: 0 })
  latePayment: number;

  @Prop({ default: 0 })
  licanceStatus: number;

  @Prop({ default: 0 })
  maturity: number;

  @Prop()
  no: number;

  @Prop({ default: true })
  noEndDate: boolean;

  @Prop({ default: false })
  noNotification: boolean;

  @Prop({ default: false })
  noVat: boolean;

  @Prop({ default: 0 })
  notify: number;

  @Prop({ default: false })
  onlineCheck: boolean;

  @Prop()
  parentContract: string;

  @Prop({ default: 0 })
  parentTotal: number;

  @Prop({ default: 0 })
  paymentLength: number;

  @Prop({ default: 0 })
  saasTotal: number;

  @Prop()
  saas_description: string;

  @Prop()
  startDate: Date;

  @Prop({ default: 0 })
  supportTotal: number;

  @Prop()
  support_description: string;

  @Prop({ default: 0 })
  total: number;

  @Prop()
  updatedAt: Date;

  @Prop({ default: 0 })
  versionTotal: number;

  @Prop()
  version_description: string;

  @Prop({ default: false })
  yearly: boolean;

  @Prop({ default: 0 })
  yearlyTotal: number;

  @Prop({ type: [Object] })
  monthlyPayments: Array<{
    year: string;
    month: string;
    invoice: boolean;
    payment: boolean;
    payDate: Date;
  }>;

  @Prop({ default: 0 })
  oldCashRegisterTotal: number;

  @Prop({ default: 0 })
  oldItemsTotal: number;

  @Prop()
  oldSaasTotal: number;

  @Prop({ default: 0 })
  oldSupportTotal: number;

  @Prop()
  oldTotal: number;

  @Prop({ default: 0 })
  oldVersionTotal: number;
}

export const ContractSchema = SchemaFactory.createForClass(Contract);

// Indexes for better query performance
ContractSchema.index({ contractFlow: 1 });
ContractSchema.index({ yearly: 1 });
ContractSchema.index({ startDate: 1 });
ContractSchema.index({ endDate: 1 });
ContractSchema.index({ brand: "text", company: "text" });

// contractId + tarih aralığı sorguları için compound index
// (getActiveLicenseIds, hasActiveContract gibi sorgularda kullanılır)
ContractSchema.index({ contractId: 1, startDate: 1, endDate: 1 });
// customerId bazlı sorgular için
ContractSchema.index({ customerId: 1 });
