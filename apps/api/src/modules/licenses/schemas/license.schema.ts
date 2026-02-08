import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type LicenseDocument = License & Document;

// Alt şemalar
@Schema({ _id: false })
export class Address {
  @Prop({ default: "" })
  address: string;

  @Prop({ default: 0 })
  cityId: number;

  @Prop({ default: "" })
  city: string;

  @Prop({ default: 0 })
  townId: number;

  @Prop({ default: "" })
  town: string;

  @Prop({ default: 0 })
  districtId: number;

  @Prop({ default: "" })
  district: string;

  @Prop({ default: "" })
  countryId: string;

  @Prop({ default: "" })
  country: string;
}

@Schema({ _id: false })
export class Person {
  @Prop({ required: true })
  id: string;

  @Prop({ default: "" })
  name: string;

  @Prop({ default: "" })
  role: string;

  @Prop({ default: "" })
  email: string;

  @Prop({ default: "" })
  gsm: string;
}

@Schema({ _id: false })
export class LicenseItem {
  @Prop({ required: true })
  id: string;

  @Prop({ default: "" })
  moduleId: string;

  @Prop({ default: "" })
  name: string;

  @Prop({ default: 0 })
  qty: number;

  @Prop({ type: [Object], default: [] })
  subItems: any[];
}

@Schema({ _id: false })
export class OrwiStore {
  @Prop({ default: "" })
  id: string;

  @Prop({ default: "" })
  name: string;

  @Prop({ default: "" })
  cloudId: string;
}

@Schema({ collection: "licenses", timestamps: true })
export class License {
  _id: Types.ObjectId;

  @Prop({ required: true })
  id: string;

  @Prop({ default: 0 })
  no: number;

  @Prop({ type: Date })
  creation: Date;

  @Prop({ default: "" })
  customerId: string;

  @Prop({ default: "" })
  customerName: string;

  @Prop({ default: "" })
  brandName: string;

  @Prop({ type: Address, default: () => ({}) })
  address: Address;

  @Prop({ default: "" })
  phone: string;

  @Prop({ default: "" })
  email: string;

  @Prop({ default: "" })
  chainId: string;

  @Prop({ default: "" })
  resellerId: string;

  @Prop({ type: [Person], default: [] })
  persons: Person[];

  @Prop({ default: "" })
  person: string;

  @Prop({ default: false })
  block: boolean;

  @Prop({ default: "" })
  blockMessage: string;

  @Prop({ default: false })
  isOpen: boolean;

  @Prop({ default: false })
  active: boolean;

  @Prop({ type: [LicenseItem], default: [] })
  saasItems: LicenseItem[];

  @Prop({ type: [LicenseItem], default: [] })
  licenseItems: LicenseItem[];

  @Prop({ default: 0 })
  licenseId: number;

  @Prop({ type: Date })
  lastOnline: Date;

  @Prop({ default: "" })
  lastIp: string;

  @Prop({ default: "" })
  lastVersion: string;

  @Prop({ default: 0 })
  assetCode: number;

  @Prop({ default: false })
  hasRenty: boolean;

  @Prop({ default: false })
  hasLicense: boolean;

  @Prop({ default: false })
  haveContract: boolean;

  @Prop({ default: false })
  hasBoss: boolean;

  @Prop({ type: Boolean, default: null })
  hasEftPos: boolean | null;

  @Prop({ default: "kerzz-pos" })
  type: string; // 'kerzz-pos' | 'orwi-pos' | 'kerzz-cloud'

  @Prop({ default: "" })
  currentVersion: string;

  @Prop({ type: OrwiStore, default: () => ({}) })
  orwiStore: OrwiStore;

  @Prop({ default: "" })
  SearchItem: string;

  @Prop({ default: "single" })
  companyType: string; // 'chain' | 'single' | 'belediye' | 'unv'

  @Prop({ default: "" })
  kitchenType: string;

  @Prop({ default: "" })
  category: string;
}

export const LicenseSchema = SchemaFactory.createForClass(License);

// Indexes for better query performance
LicenseSchema.index({ licenseId: 1 });
LicenseSchema.index({ type: 1 });
LicenseSchema.index({ companyType: 1 });
LicenseSchema.index({ active: 1 });
LicenseSchema.index({ block: 1 });
LicenseSchema.index({ customerId: 1 });
LicenseSchema.index({ brandName: "text", customerName: "text", SearchItem: "text" });
