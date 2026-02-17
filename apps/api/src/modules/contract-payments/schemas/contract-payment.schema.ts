import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types, Connection } from "mongoose";
import type { AuditFields } from "../../../common/audit";
import { invoiceSyncPlugin } from "../../../common/plugins";

/** Fatura satır kategorisi */
export type PaymentListItemCategory = "eftpos" | "support" | "version" | "item" | "saas";

export interface PaymentListItem {
  id: number;
  description: string;
  total: number;
  company: string;
  totalUsd: number;
  totalEur: number;
  /** Kaynak kalem ID'si (contract-saas, contract-cash-registers vb. id alanı) */
  sourceItemId?: string;
  /** Kalem kategorisi */
  category?: PaymentListItemCategory;
}

export type ContractPaymentDocument = ContractPayment & Document & AuditFields;

@Schema({ collection: "contract-payments", timestamps: true })
export class ContractPayment {
  _id: Types.ObjectId;

  @Prop()
  id: string;

  @Prop({ required: true })
  contractId: string;

  @Prop()
  company: string;

  @Prop()
  brand: string;

  @Prop()
  customerId: string;

  @Prop()
  licanceId: string;

  @Prop()
  invoiceNo: string;

  @Prop({ default: false })
  paid: boolean;

  @Prop()
  payDate: Date;

  @Prop()
  paymentDate: Date;

  @Prop()
  invoiceDate: Date;

  @Prop({ default: 0 })
  total: number;

  @Prop({ default: 0 })
  invoiceTotal: number;

  @Prop({ default: 0 })
  balance: number;

  @Prop({ type: [Object] })
  list: PaymentListItem[];

  @Prop({ default: false })
  yearly: boolean;

  @Prop({ default: false })
  eInvoice: boolean;

  @Prop()
  uuid: string;

  @Prop()
  ref: string;

  @Prop()
  taxNo: string;

  @Prop()
  internalFirm: string;

  @Prop({ default: 0 })
  contractNumber: number;

  @Prop()
  segment: string;

  @Prop({ default: false })
  block: boolean;

  @Prop({ default: "regular" })
  type: string; // "regular" | "prorated"

  @Prop()
  proratedDays: number;

  @Prop()
  proratedStartDate: Date;

  @Prop()
  sourceItemId: string; // Prorated plani olusturan kalemin id'si

  @Prop()
  editDate: Date;

  @Prop()
  editUser: string;

  @Prop()
  companyId: string;

  @Prop()
  dueDate: Date;

  @Prop()
  onlinePaymentId: string;

  @Prop()
  onlinePaymentError: string;

  @Prop()
  otoPaymentAttempt: Date;
}

export const ContractPaymentSchema = SchemaFactory.createForClass(ContractPayment);

// Temel indexler
ContractPaymentSchema.index({ contractId: 1 });
ContractPaymentSchema.index({ payDate: -1 });

// Compound indexler - performans optimizasyonu
ContractPaymentSchema.index({ payDate: -1, contractId: 1 });
ContractPaymentSchema.index({ payDate: -1, paid: 1 });
ContractPaymentSchema.index({ contractId: 1, payDate: -1 });
ContractPaymentSchema.index({ type: 1, invoiceNo: 1 }); // Kıst fatura cron sorgusu için
ContractPaymentSchema.index({ sourceItemId: 1, type: 1, invoiceNo: 1 }); // Kaynak kalem silme sorgusu için

// ─────────────────────────────────────────────────────────────────────────────
// Invoice-ContractPayment Senkronizasyon Plugin
// paid değiştiğinde Invoice.isPaid otomatik güncellenir
// ─────────────────────────────────────────────────────────────────────────────
let contractPaymentConnection: Connection | null = null;

/**
 * ContractPayment schema için connection'ı set eder.
 * Module initialization sırasında çağrılmalı.
 */
export function setContractPaymentConnection(connection: Connection): void {
  contractPaymentConnection = connection;
}

// Plugin'i uygula (connection lazy loading ile)
ContractPaymentSchema.plugin(invoiceSyncPlugin, {
  isInvoiceSchema: false,
  getConnection: () => {
    if (!contractPaymentConnection) {
      throw new Error(
        "[InvoiceSyncPlugin] Connection not initialized. Call setContractPaymentConnection() first."
      );
    }
    return contractPaymentConnection;
  },
});
