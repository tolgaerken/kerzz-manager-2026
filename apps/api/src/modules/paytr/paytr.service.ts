import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ConfigService } from "@nestjs/config";
import { Model } from "mongoose";
import { createHmac } from "crypto";
import {
  VirtualPosConfig,
  VirtualPosConfigDocument,
} from "./schemas/virtual-pos-config.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";

export type CompanyType =
  | "VERI"
  | "CLOUD"
  | "BTT"
  | "kerzzbv"
  | "MARKAMUTFAGI"
  | "ETYA";

export interface PayTRCardItem {
  ctoken: string;
  last_4: string;
  month: string;
  year: string;
  c_bank: string;
  require_cvv: string;
  c_name: string;
  c_brand: string;
  c_type: string;
  businessCard: string;
  initial: string;
  schema: string;
}

export interface GeneratePaymentTokenParams {
  merchantId: string;
  userIp: string;
  orderId: string;
  email: string;
  paymentAmount: string;
  paymentType: string;
  installmentCount: string;
  currency: string;
  non3d: string;
  storeKey: string;
  provisionPassword: string;
}

export interface SubmitPaymentFormParams {
  merchantId: string;
  userIp: string;
  merchantOid: string;
  email: string;
  paymentType: string;
  paymentAmount: string;
  installmentCount: string;
  non3d: string;
  currency: string;
  merchantOkUrl: string;
  merchantFailUrl: string;
  userName: string;
  userBasket: string;
  utoken: string;
  ctoken: string;
  paytrToken: string;
}

@Injectable()
export class PaytrService {
  private readonly logger = new Logger(PaytrService.name);

  private readonly paytrPaymentUrl = "https://www.paytr.com/odeme";
  private readonly paytrCardListUrl =
    "https://www.paytr.com/odeme/capi/list";
  private readonly paytrCardDeleteUrl =
    "https://www.paytr.com/odeme/capi/delete";
  private readonly paytrLinkCreateUrl =
    "https://www.paytr.com/odeme/api/link/create";

  constructor(
    @InjectModel(VirtualPosConfig.name, CONTRACT_DB_CONNECTION)
    private vposModel: Model<VirtualPosConfigDocument>,
    private configService: ConfigService
  ) {}

  /**
   * MongoDB'den Virtual POS yapilandirmasi al.
   * Sirket bazli config bulunamazsa default config doner.
   */
  async getVirtualPOSConfig(companyId: CompanyType): Promise<VirtualPosConfig> {
    let config = await this.vposModel
      .findOne({ id: companyId })
      .lean()
      .exec();

    if (!config) {
      config = await this.vposModel
        .findOne({ default: true })
        .lean()
        .exec();
    }

    if (!config) {
      throw new NotFoundException(
        `VPOS yapilandirmasi bulunamadi: ${companyId}`
      );
    }

    return config as VirtualPosConfig;
  }

  /**
   * PayTR odeme tokeni uret (HMAC-SHA256 + Base64).
   */
  generatePaymentToken(params: GeneratePaymentTokenParams): string {
    const hashStr =
      params.merchantId +
      params.userIp +
      params.orderId +
      params.email +
      params.paymentAmount +
      params.paymentType +
      params.installmentCount +
      params.currency +
      params.non3d +
      params.storeKey;

    return this.hmacSha256Base64(hashStr, params.provisionPassword);
  }

  /**
   * PayTR kart listeleme tokeni uret.
   */
  generateCardListToken(
    userToken: string,
    storeKey: string,
    provisionPassword: string
  ): string {
    const hashStr = userToken + storeKey;
    return this.hmacSha256Base64(hashStr, provisionPassword);
  }

  /**
   * PayTR kart silme tokeni uret.
   */
  generateDeleteCardToken(
    cardToken: string,
    userToken: string,
    storeKey: string,
    provisionPassword: string
  ): string {
    const hashStr = cardToken + userToken + storeKey;
    return this.hmacSha256Base64(hashStr, provisionPassword);
  }

  /**
   * PayTR link olusturma tokeni uret.
   */
  generateLinkToken(
    name: string,
    price: string,
    currency: string,
    maxInstallment: string,
    linkType: string,
    lang: string,
    email: string,
    storeKey: string,
    provisionPassword: string
  ): string {
    const hashStr =
      name + price + currency + maxInstallment + linkType + lang + email + storeKey;
    return this.hmacSha256Base64(hashStr, provisionPassword);
  }

  /**
   * PayTR'den kayitli kartlari listele.
   */
  async listCards(
    userToken: string,
    companyId: CompanyType
  ): Promise<PayTRCardItem[]> {
    const vpos = await this.getVirtualPOSConfig(companyId);
    const paytrToken = this.generateCardListToken(
      userToken,
      vpos.storeKey,
      vpos.provisionPassword
    );

    const formData = new URLSearchParams();
    formData.append("merchant_id", vpos.merchantId);
    formData.append("utoken", userToken);
    formData.append("paytr_token", paytrToken);

    const response = await fetch(this.paytrCardListUrl, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!Array.isArray(data)) {
      this.logger.error("PayTR kart listeleme hatasi", data);
      return [];
    }

    return data as PayTRCardItem[];
  }

  /**
   * PayTR'den kayitli karti sil.
   */
  async deleteCard(
    cardToken: string,
    userToken: string,
    companyId: CompanyType
  ): Promise<boolean> {
    const vpos = await this.getVirtualPOSConfig(companyId);
    const paytrToken = this.generateDeleteCardToken(
      cardToken,
      userToken,
      vpos.storeKey,
      vpos.provisionPassword
    );

    const formData = new URLSearchParams();
    formData.append("merchant_id", vpos.merchantId);
    formData.append("ctoken", cardToken);
    formData.append("utoken", userToken);
    formData.append("paytr_token", paytrToken);

    const response = await fetch(this.paytrCardDeleteUrl, {
      method: "POST",
      body: formData,
    });

    const result: any = await response.json();
    if (result.status === "success") {
      return true;
    }

    this.logger.error("PayTR kart silme hatasi", result);
    throw new Error(result.err_msg || "Kart silinemedi");
  }

  /**
   * PayTR odeme formunu gonder (recurring odeme icin).
   */
  async submitPaymentForm(params: SubmitPaymentFormParams): Promise<string> {
    const formData = new URLSearchParams();
    formData.append("merchant_id", params.merchantId);
    formData.append("user_ip", params.userIp);
    formData.append("merchant_oid", params.merchantOid);
    formData.append("email", params.email);
    formData.append("payment_type", params.paymentType);
    formData.append("payment_amount", params.paymentAmount);
    formData.append("installment_count", params.installmentCount);
    formData.append("non_3d", params.non3d);
    formData.append("currency", params.currency);
    formData.append("merchant_ok_url", params.merchantOkUrl);
    formData.append("merchant_fail_url", params.merchantFailUrl);
    formData.append("user_name", params.userName);
    formData.append("user_address", "-");
    formData.append("user_phone", "-");
    formData.append("user_basket", params.userBasket);
    formData.append("utoken", params.utoken);
    formData.append("ctoken", params.ctoken);
    formData.append("recurring", "1");
    formData.append("paytr_token", params.paytrToken);

    const response = await fetch(this.paytrPaymentUrl, {
      method: "POST",
      body: formData,
    });

    const result = await response.text();
    this.logger.log("PayTR odeme formu sonucu: " + result);
    return result;
  }

  /**
   * HMAC-SHA256 + Base64 hash uret.
   */
  private hmacSha256Base64(data: string, key: string): string {
    const hmac = createHmac("sha256", key);
    hmac.update(data);
    return hmac.digest("base64");
  }
}
