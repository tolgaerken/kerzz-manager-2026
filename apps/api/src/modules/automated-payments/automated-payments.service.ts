import {
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model, SortOrder, Types } from "mongoose";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import {
  PaymentUserToken,
  PaymentUserTokenDocument,
} from "./schemas/payment-user-token.schema";
import {
  PaymentLink,
  PaymentLinkDocument,
} from "../payments/schemas/payment-link.schema";
import {
  ContractPayment,
  ContractPaymentDocument,
} from "../contract-payments/schemas/contract-payment.schema";
import { PaytrService, CompanyType, PayTRCardItem } from "../paytr";
import { AutoPaymentQueryDto } from "./dto/auto-payment-query.dto";
import { CollectPaymentDto } from "./dto/collect-payment.dto";
import {
  PaginatedAutoPaymentTokensResponseDto,
  CollectPaymentResponseDto,
  CardItemDto,
} from "./dto/auto-payment-response.dto";

@Injectable()
export class AutomatedPaymentsService {
  private readonly logger = new Logger(AutomatedPaymentsService.name);
  private readonly callbackUrl: string;
  private readonly successUrl: string;
  private readonly failUrl: string;

  constructor(
    @InjectModel(PaymentUserToken.name, CONTRACT_DB_CONNECTION)
    private tokenModel: Model<PaymentUserTokenDocument>,
    @InjectModel(PaymentLink.name, CONTRACT_DB_CONNECTION)
    private paymentLinkModel: Model<PaymentLinkDocument>,
    @InjectModel(ContractPayment.name, CONTRACT_DB_CONNECTION)
    private contractPaymentModel: Model<ContractPaymentDocument>,
    private paytrService: PaytrService,
    private configService: ConfigService
  ) {
    this.callbackUrl =
      this.configService.get<string>("PAYTR_CALLBACK_URL") ||
      "https://smarty.kerzz.com:4004/api/payment/paymentCallback";
    this.successUrl =
      this.configService.get<string>("PAYTR_SUCCESS_URL") ||
      "https://smarty.kerzz.com:4004/api/payment/successPayment";
    this.failUrl =
      this.configService.get<string>("PAYTR_FAIL_URL") ||
      "https://smarty.kerzz.com:4004/api/payment/errorPayment";
  }

  /**
   * Otomatik odeme tokenlarini listele.
   */
  async findAllTokens(
    query: AutoPaymentQueryDto
  ): Promise<PaginatedAutoPaymentTokensResponseDto> {
    const {
      page = 1,
      limit = 50,
      search,
      companyId,
      sortField = "createDate",
      sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {};

    if (companyId) filter.companyId = companyId;

    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: "i" } },
        { customerId: { $regex: search, $options: "i" } },
        { erpId: { $regex: search, $options: "i" } },
      ];
    }

    const sort: Record<string, SortOrder> = {};
    sort[sortField] = sortOrder === "asc" ? 1 : -1;

    const [docs, total] = await Promise.all([
      this.tokenModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.tokenModel.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    const data = docs.map((doc: any) => ({
      _id: doc._id?.toString() ?? "",
      id: doc.id ?? "",
      customerId: doc.customerId ?? "",
      email: doc.email ?? "",
      erpId: doc.erpId ?? "",
      companyId: doc.companyId ?? "",
      userToken: doc.userToken ?? "",
      sourceId: doc.sourceId ?? "",
      source: doc.source ?? "io",
      userId: doc.userId ?? "",
      createDate: doc.createDate,
    }));

    return { data, pagination: { page, limit, total, totalPages } };
  }

  /**
   * Kayitli karttan otomatik tahsilat yap.
   * Smarty'deki createAutoPayment mantigi birebir tasinmistir.
   */
  async collectPayment(
    dto: CollectPaymentDto
  ): Promise<CollectPaymentResponseDto> {
    // 1. Musteri tokeni al
    const userToken = await this.tokenModel
      .findOne({ customerId: dto.customerId })
      .sort({ createDate: -1 })
      .lean()
      .exec();

    if (!userToken) {
      throw new NotFoundException(
        `Kullanici tokeni bulunamadi: ${dto.customerId}`
      );
    }

    const tokenDoc = userToken as any;
    const companyId = (tokenDoc.companyId || "VERI") as CompanyType;

    // 2. VPOS config al
    const vpos = await this.paytrService.getVirtualPOSConfig(companyId);

    // 3. PayTR kart listeleme
    const cards = await this.paytrService.listCards(
      tokenDoc.userToken,
      companyId
    );

    if (!cards || cards.length === 0) {
      throw new NotFoundException("Kayitli kart bulunamadi");
    }

    // Son karti sec
    const card = cards[cards.length - 1];

    // 4. Kaynak odeme bilgisini al
    const sourcePayment = await this.paymentLinkModel
      .findOne({
        $or: [
          { id: tokenDoc.sourceId },
          { linkId: tokenDoc.sourceId },
        ],
      })
      .lean()
      .exec();

    if (!sourcePayment) {
      throw new NotFoundException(
        `Kaynak odeme bilgisi bulunamadi: ${tokenDoc.sourceId}`
      );
    }

    const src = sourcePayment as any;

    // 5. Yeni odeme kaydi olustur
    const orderId = new Types.ObjectId().toString();
    const paymentAmount = this.roundNumber(dto.amount).toFixed(2);
    const description =
      dto.description || `Pay-TR(Otomatik) - ${src.brand || ""}`;

    // 6. PayTR token uret
    const paytrToken = this.paytrService.generatePaymentToken({
      merchantId: vpos.merchantId,
      userIp: src.userIp || "127.0.0.1",
      orderId,
      email: src.email || "",
      paymentAmount,
      paymentType: "card",
      installmentCount: "0",
      currency: "TL",
      non3d: "1",
      storeKey: vpos.storeKey,
      provisionPassword: vpos.provisionPassword,
    });

    // 7. DB'ye kaydet
    await this.paymentLinkModel.create({
      id: orderId,
      linkId: "",
      amount: dto.amount,
      canRecurring: false,
      createDate: new Date(),
      customerId: dto.customerId,
      description,
      installment: 0,
      non3d: true,
      paytrToken,
      status: "waiting",
      statusCardSave: "none",
      storeCard: "0",
      actionType: "recurring",
      email: src.email || "",
      companyId: src.companyId || "",
      currency: "TL",
      customerName: src.customerName || "",
      brand: src.brand || "",
      erpId: src.erpId || "",
      gsm: src.gsm || "",
      name: src.name || "",
      userIp: src.userIp || "127.0.0.1",
      staffId: src.staffId || "",
      staffName: src.staffName || "",
      merchantId: vpos.merchantId,
    } as any);

    // 8. PayTR odeme formunu gonder
    const basket = [[description, paymentAmount, "1"]];

    await this.paytrService.submitPaymentForm({
      merchantId: vpos.merchantId,
      userIp: src.userIp || "127.0.0.1",
      merchantOid: orderId,
      email: src.email || "",
      paymentType: "card",
      paymentAmount,
      installmentCount: "0",
      non3d: "1",
      currency: "TL",
      merchantOkUrl: this.successUrl,
      merchantFailUrl: this.failUrl,
      userName: card.c_name || src.name || "",
      userBasket: JSON.stringify(basket),
      utoken: tokenDoc.userToken,
      ctoken: card.ctoken,
      paytrToken,
    });

    // 9. Odeme plani guncellemesi (varsa)
    if (dto.paymentPlanId) {
      await this.contractPaymentModel
        .updateOne(
          { _id: new Types.ObjectId(dto.paymentPlanId) },
          {
            $set: {
              onlinePaymentId: orderId,
              otoPaymentAttempt: new Date(),
            },
          }
        )
        .exec();
    }

    return {
      success: true,
      paymentId: orderId,
      amount: dto.amount,
      message: `${dto.amount} TL tahsilat baslatildi`,
    };
  }

  /**
   * Musteri icin kayitli kartlari getir.
   */
  async getCustomerCards(customerId: string): Promise<CardItemDto[]> {
    const token = await this.tokenModel
      .findOne({ customerId })
      .sort({ createDate: -1 })
      .lean()
      .exec();

    if (!token) {
      return [];
    }

    const tokenDoc = token as any;
    const companyId = (tokenDoc.companyId || "VERI") as CompanyType;
    const cards = await this.paytrService.listCards(
      tokenDoc.userToken,
      companyId
    );

    return cards.map((c) => ({
      ctoken: c.ctoken,
      last_4: c.last_4,
      month: c.month,
      year: c.year,
      c_bank: c.c_bank,
      require_cvv: c.require_cvv,
      c_name: c.c_name,
      c_brand: c.c_brand,
      c_type: c.c_type,
    }));
  }

  /**
   * Token sil.
   */
  async deleteToken(id: string): Promise<void> {
    const result = await this.tokenModel
      .deleteOne({
        $or: [
          { id },
          ...(Types.ObjectId.isValid(id) && id.length === 24
            ? [{ _id: new Types.ObjectId(id) }]
            : []),
        ],
      })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Token bulunamadi: ${id}`);
    }
  }

  /**
   * Kayitli karti sil.
   */
  async deleteCard(
    customerId: string,
    ctoken: string
  ): Promise<boolean> {
    const token = await this.tokenModel
      .findOne({ customerId })
      .sort({ createDate: -1 })
      .lean()
      .exec();

    if (!token) {
      throw new NotFoundException(
        `Kullanici tokeni bulunamadi: ${customerId}`
      );
    }

    const tokenDoc = token as any;
    const companyId = (tokenDoc.companyId || "VERI") as CompanyType;

    return this.paytrService.deleteCard(
      ctoken,
      tokenDoc.userToken,
      companyId
    );
  }

  /**
   * Musteri odeme planlarini getir.
   */
  async getPaymentPlans(erpId: string) {
    const plans = await this.contractPaymentModel
      .find({
        companyId: erpId,
        invoiceNo: { $ne: "" },
      })
      .sort({ payDate: -1 })
      .lean()
      .exec();

    return plans.map((doc: any) => ({
      _id: doc._id?.toString() ?? "",
      id: doc.id ?? "",
      contractId: doc.contractId ?? "",
      company: doc.company ?? "",
      brand: doc.brand ?? "",
      customerId: doc.customerId ?? "",
      invoiceNo: doc.invoiceNo ?? "",
      paid: doc.paid ?? false,
      payDate: doc.payDate,
      paymentDate: doc.paymentDate,
      invoiceDate: doc.invoiceDate,
      total: doc.total ?? 0,
      invoiceTotal: doc.invoiceTotal ?? 0,
      balance: doc.balance ?? 0,
      dueDate: doc.dueDate,
      onlinePaymentId: doc.onlinePaymentId ?? "",
      onlinePaymentError: doc.onlinePaymentError ?? "",
      otoPaymentAttempt: doc.otoPaymentAttempt,
    }));
  }

  // ── Private Helpers ──────────────────────────────────────────────

  private roundNumber(num: number): number {
    return Math.round(num * 100) / 100;
  }
}
