import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  Invoice,
  InvoiceDocument,
} from "../invoices/schemas/invoice.schema";
import {
  Contract,
  ContractDocument,
} from "../contracts/schemas/contract.schema";
import {
  Customer,
  CustomerDocument,
} from "../customers/schemas/customer.schema";
import {
  ContractUser,
  ContractUserDocument,
} from "../contract-users/schemas/contract-user.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { NotificationSettingsService } from "../notification-settings";
import {
  NotificationDispatchService,
  DispatchNotificationDto,
} from "../notification-dispatch";
import { NotificationTemplatesService } from "../notification-templates";
import { PaymentsService } from "../payments/payments.service";
import {
  buildInvoiceTemplateData,
  buildContractTemplateData,
  formatDate,
  normalizePhone,
  normalizeEmail,
} from "./notification-data.helper";
import {
  calculateRemainingDays,
  getMonthBoundaries,
} from "../contracts/utils/contract-date.utils";
import {
  InvoiceQueueQueryDto,
  ContractQueueQueryDto,
  ManualSendDto,
  QueueInvoiceItemDto,
  QueueContractItemDto,
  QueueCustomerDto,
  QueueContactDto,
  PaginatedQueueInvoicesResponseDto,
  PaginatedQueueContractsResponseDto,
  QueueStatsResponseDto,
  ManualSendResponseDto,
  ManualSendResultItemDto,
} from "./dto";

@Injectable()
export class NotificationQueueService {
  private readonly logger = new Logger(NotificationQueueService.name);
  private readonly paymentBaseUrl: string;

  constructor(
    @InjectModel(Invoice.name, CONTRACT_DB_CONNECTION)
    private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Contract.name, CONTRACT_DB_CONNECTION)
    private contractModel: Model<ContractDocument>,
    @InjectModel(Customer.name, CONTRACT_DB_CONNECTION)
    private customerModel: Model<CustomerDocument>,
    @InjectModel(ContractUser.name, CONTRACT_DB_CONNECTION)
    private contractUserModel: Model<ContractUserDocument>,
    private settingsService: NotificationSettingsService,
    private dispatchService: NotificationDispatchService,
    private templatesService: NotificationTemplatesService,
    private paymentsService: PaymentsService,
    private configService: ConfigService
  ) {
    this.paymentBaseUrl =
      this.configService.get<string>("PAYMENT_BASE_URL") ||
      "https://pay-kerzz.cloudlabs.com.tr";
  }

  /**
   * Fatura icin odeme linki olusturur veya fallback URL dondurur.
   */
  private async createPaymentLinkForInvoice(
    invoice: Invoice,
    customer: { name?: string; companyName?: string; email?: string; phone?: string }
  ): Promise<string> {
    try {
      if (!customer.email || !invoice.grandTotal || invoice.grandTotal <= 0) {
        return `${this.paymentBaseUrl}/odeme/${invoice.id}`;
      }

      const result = await this.paymentsService.createPaymentLink({
        amount: invoice.grandTotal,
        email: customer.email,
        name: customer.name || "",
        customerName: customer.companyName || customer.name || "",
        customerId: invoice.customerId || "",
        companyId: "VERI",
        invoiceNo: invoice.invoiceNumber || "",
        staffName: "Kerzz Bildirim",
        canRecurring: true,
      });

      return result.url;
    } catch (error) {
      this.logger.warn(
        `Fatura icin odeme linki olusturulamadi (${invoice.invoiceNumber}): ${error}`
      );
      return `${this.paymentBaseUrl}/odeme/${invoice.id}`;
    }
  }

  /**
   * Bildirim bekleyen faturalari musteri bilgileriyle listeler
   */
  async getPendingInvoices(
    query: InvoiceQueueQueryDto
  ): Promise<PaginatedQueueInvoicesResponseDto> {
    const { type = "all", overdueDaysMin, overdueDaysMax, search, page = 1, limit = 50 } = query;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Geriye dönük tarama limitini ayarlardan al
    const settings = await this.settingsService.getSettings();
    const lookbackDays = settings.invoiceLookbackDays ?? 90;
    const lookbackDate = new Date(today);
    lookbackDate.setDate(lookbackDate.getDate() - lookbackDays);

    const filter: Record<string, unknown> = {
      isPaid: false,
    };

    if (type === "due") {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      filter.dueDate = { $gte: today, $lt: tomorrow };
    } else if (type === "overdue") {
      const dueDateRange: { $gte?: Date; $lt?: Date; $lte?: Date } = { $lt: today };
      // Lookback limiti: overdueDaysMax veya lookbackDays'den hangisi daha kısıtlayıcıysa onu kullan
      if (overdueDaysMax != null) {
        const maxDate = new Date(today);
        maxDate.setDate(maxDate.getDate() - overdueDaysMax);
        maxDate.setHours(23, 59, 59, 999);
        dueDateRange.$gte = maxDate > lookbackDate ? maxDate : lookbackDate;
      } else {
        dueDateRange.$gte = lookbackDate;
      }
      if (overdueDaysMin != null) {
        const minDate = new Date(today);
        minDate.setDate(minDate.getDate() - overdueDaysMin);
        minDate.setHours(0, 0, 0, 0);
        dueDateRange.$lte = minDate;
      }
      filter.dueDate = dueDateRange;
    } else {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      filter.$or = [
        { dueDate: { $gte: today, $lt: tomorrow } },
        { dueDate: { $gte: lookbackDate, $lt: today } },
      ];
    }

    if (search) {
      filter.$and = filter.$and || [];
      (filter.$and as unknown[]).push({
        $or: [
          { invoiceNumber: { $regex: search, $options: "i" } },
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      });
    }

    const skip = (page - 1) * limit;
    const [invoices, total] = await Promise.all([
      this.invoiceModel
        .find(filter)
        .sort({ dueDate: 1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.invoiceModel.countDocuments(filter).exec(),
    ]);

    const customerIds = [...new Set(invoices.map((i) => i.customerId).filter(Boolean))] as string[];
    const invoiceIds = invoices.map((i) => i.id).filter(Boolean) as string[];
    const [customers, contractUsersMap, sentConditionsMap] = await Promise.all([
      this.customerModel.find({ id: { $in: customerIds } }).lean().exec(),
      this.getContractUsersForCustomer(customerIds),
      this.dispatchService.getDistinctTemplateCodesForInvoices(invoiceIds),
    ]);
    const customerMap = new Map(customers.map((c) => [c.id, c]));

    const data: QueueInvoiceItemDto[] = invoices.map((inv) => {
      const due = inv.dueDate ? new Date(inv.dueDate) : null;
      due?.setHours(0, 0, 0, 0);
      const overdueDays = due && due < today ? Math.floor((today.getTime() - due.getTime()) / (24 * 60 * 60 * 1000)) : 0;
      const status: "due" | "overdue" = overdueDays > 0 ? "overdue" : "due";
      const customer = inv.customerId ? customerMap.get(inv.customerId) : null;
      const contractUsers = inv.customerId ? (contractUsersMap.get(inv.customerId) ?? []) : [];
      const contacts = this.buildContactList(customer ?? null, contractUsers);
      const notifyHistory = (Array.isArray(inv.notify) ? inv.notify : []).map((n) => ({
        sms: !!n.sms,
        email: !!n.email,
        sendTime: n.sendTime ? formatDate(n.sendTime) : null,
        users: (Array.isArray(n.users) ? n.users : []).map((u) => ({
          name: u.name || "",
          email: u.email || "",
          phone: u.gsm || "",
        })),
      }));

      return {
        _id: (inv as { _id: { toString: () => string } })._id.toString(),
        id: inv.id,
        invoiceNumber: inv.invoiceNumber || "",
        grandTotal: inv.grandTotal ?? 0,
        dueDate: inv.dueDate ? formatDate(inv.dueDate) : "",
        overdueDays,
        status,
        lastNotify: inv.lastNotify ? formatDate(inv.lastNotify) : null,
        notifyCount: notifyHistory.length,
        notifyHistory,
        sentConditions: sentConditionsMap.get(inv.id) ?? [],
        customer: this.mapCustomer(customer ?? null, contacts),
      };
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Ayarlardaki contractExpiryDays esik gunlerinin isabet ettigi ay icindeki
   * kontratlari musteri bilgileriyle listeler.
   * Ornegin [30, 15, 7] ise bugunden itibaren 30, 15 veya 7 gun sonraki tarihin
   * ayina denk gelen kontratlar dondurulur.
   */
  async getPendingContracts(
    query: ContractQueueQueryDto
  ): Promise<PaginatedQueueContractsResponseDto> {
    const { search, page = 1, limit = 50 } = query;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Ayarlardan esik gunlerini al (orn: [30, 15, 7])
    const settings = await this.settingsService.getSettings();
    const expiryDays = settings.contractExpiryDays ?? [30, 15, 7];

    // Her esik gunu icin ay araligi olustur
    const dateRanges = expiryDays.map((days) => {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + days);
      const { monthStart, monthEnd } = getMonthBoundaries(targetDate);
      return { endDate: { $gte: monthStart, $lte: monthEnd } };
    });

    const filter: Record<string, unknown> = {
      noEndDate: false,
      noNotification: false,
      $or: dateRanges,
    };

    if (search) {
      // search varsa $or zaten kullanildigindan $and ile birlestir
      filter.$and = [
        { $or: dateRanges },
        {
          $or: [
            { company: { $regex: search, $options: "i" } },
            { brand: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ],
        },
      ];
      delete filter.$or;
    }

    const skip = (page - 1) * limit;
    const [contracts, total] = await Promise.all([
      this.contractModel
        .find(filter)
        .sort({ endDate: 1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.contractModel.countDocuments(filter).exec(),
    ]);

    const customerIds = [...new Set(contracts.map((c) => c.customerId).filter(Boolean))] as string[];
    // ContractUser.contractId = Contract.id (UUID) — NOT Contract.contractId (iş kodu)
    const contractInternalIds = contracts.map((c) => c.id).filter((id): id is string => !!id);

    const [customers, allContractUsers, sentConditionsMap] = await Promise.all([
      this.customerModel.find({ id: { $in: customerIds } }).lean().exec(),
      contractInternalIds.length > 0
        ? this.contractUserModel.find({ contractId: { $in: contractInternalIds } }).lean().exec()
        : Promise.resolve([]),
      this.dispatchService.getDistinctTemplateCodesForContracts(contractInternalIds),
    ]);
    const customerMap = new Map(customers.map((c) => [c.id, c]));

    // contract.id (UUID) → kullanıcılar haritası
    const contractUsersMap = new Map<string, { name?: string; email?: string; gsm?: string; role?: string }[]>();
    for (const cu of allContractUsers) {
      if (!contractUsersMap.has(cu.contractId)) contractUsersMap.set(cu.contractId, []);
      contractUsersMap.get(cu.contractId)!.push({ name: cu.name, email: cu.email, gsm: cu.gsm, role: cu.role });
    }

    const data: QueueContractItemDto[] = contracts.map((cont) => {
      const endDate = cont.endDate ? new Date(cont.endDate) : null;
      const remainingDays = calculateRemainingDays(endDate, today);
      const customer = cont.customerId ? customerMap.get(cont.customerId) : null;
      const contractUsers = cont.id ? (contractUsersMap.get(cont.id) ?? []) : [];
      const contacts = this.buildContactList(customer ?? null, contractUsers);
      return {
        _id: (cont as { _id: { toString: () => string } })._id.toString(),
        id: cont.id,
        contractId: cont.contractId || "",
        company: cont.company || "",
        brand: cont.brand || "",
        endDate: cont.endDate ? formatDate(cont.endDate) : "",
        remainingDays,
        sentConditions: sentConditionsMap.get(cont.id) ?? [],
        customer: this.mapCustomer(customer ?? null, contacts),
      };
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Ozet istatistikler
   * Kontrat sayisi ayarlardaki contractExpiryDays esik gunlerine gore hesaplanir.
   */
  async getStats(): Promise<QueueStatsResponseDto> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Ayarlardan esik gunlerini al
    const settings = await this.settingsService.getSettings();
    const expiryDays = settings.contractExpiryDays ?? [30, 15, 7];

    // Her esik gunu icin ay araligi olustur
    const dateRanges = expiryDays.map((days) => {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + days);
      const { monthStart, monthEnd } = getMonthBoundaries(targetDate);
      return { endDate: { $gte: monthStart, $lte: monthEnd } };
    });

    // Geriye dönük tarama limiti
    const lookbackDays = settings.invoiceLookbackDays ?? 90;
    const lookbackDate = new Date(today);
    lookbackDate.setDate(lookbackDate.getDate() - lookbackDays);

    const [dueInvoices, overdueInvoices, pendingContracts] = await Promise.all([
      this.invoiceModel.countDocuments({
        isPaid: false,
        dueDate: { $gte: today, $lt: tomorrow },
      }).exec(),
      this.invoiceModel.countDocuments({
        isPaid: false,
        dueDate: { $gte: lookbackDate, $lt: today },
      }).exec(),
      this.contractModel.countDocuments({
        noEndDate: false,
        noNotification: false,
        $or: dateRanges,
      }).exec(),
    ]);

    return {
      dueInvoices,
      overdueInvoices,
      pendingInvoices: dueInvoices + overdueInvoices,
      pendingContracts,
    };
  }

  /**
   * Secilen kayitlar icin manuel bildirim gonderir
   */
  async sendManualNotification(dto: ManualSendDto): Promise<ManualSendResponseDto> {
    const results: ManualSendResultItemDto[] = [];
    let sent = 0;
    let failed = 0;

    for (const item of dto.items) {
      const outcome = item.type === "invoice"
        ? await this.sendForInvoice(item.id, dto.channels)
        : await this.sendForContract(item.id, dto.channels);
      for (const r of outcome) {
        results.push(r);
        if (r.success) sent++;
        else failed++;
      }
    }

    return { sent, failed, results };
  }

  private async sendForInvoice(
    invoiceId: string,
    channels: ("email" | "sms")[]
  ): Promise<ManualSendResultItemDto[]> {
    const invoice = await this.invoiceModel.findOne({ id: invoiceId }).lean().exec();
    if (!invoice || !invoice.customerId) {
      return channels.map((ch) => ({
        type: "invoice" as const,
        id: invoiceId,
        channel: ch,
        success: false,
        error: "Fatura veya müşteri bulunamadı",
      }));
    }

    const customer = await this.customerModel.findOne({ id: invoice.customerId }).lean().exec();
    if (!customer) {
      return channels.map((ch) => ({
        type: "invoice" as const,
        id: invoiceId,
        channel: ch,
        success: false,
        error: "Müşteri bulunamadı",
      }));
    }

    const contractUsersMap = await this.getContractUsersForCustomer([invoice.customerId]);
    const contractUsers = contractUsersMap.get(invoice.customerId) ?? [];
    const contacts = this.buildContactList(customer, contractUsers);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = invoice.dueDate ? new Date(invoice.dueDate) : null;
    due?.setHours(0, 0, 0, 0);
    const overdueDays = due && due < today
      ? Math.floor((today.getTime() - due.getTime()) / (24 * 60 * 60 * 1000))
      : 0;
    const templateCodeBase = overdueDays > 0
      ? overdueDays <= 3
        ? "invoice-overdue-3"
        : "invoice-overdue-5"
      : "invoice-due";

    const paymentLinkUrl = await this.createPaymentLinkForInvoice(invoice, customer);
    const templateData = buildInvoiceTemplateData(invoice, customer, paymentLinkUrl, overdueDays > 0 ? overdueDays : undefined);
    const notifications: DispatchNotificationDto[] = [];

    if (channels.includes("email")) {
      const emailContacts = contacts.filter((c) => c.email);
      const uniqueEmails = new Set<string>();
      
      for (const contact of emailContacts) {
        if (uniqueEmails.has(contact.email)) continue;
        uniqueEmails.add(contact.email);
        
        notifications.push({
          templateCode: `${templateCodeBase}-email`,
          channel: "email",
          recipient: { email: contact.email, name: contact.name },
          contextType: "invoice",
          contextId: invoice.id,
          customerId: invoice.customerId,
          invoiceId: invoice.id,
          templateData,
        });
      }
    }
    if (channels.includes("sms")) {
      const smsContacts = contacts.filter((c) => c.phone);
      const uniquePhones = new Set<string>();
      
      for (const contact of smsContacts) {
        if (uniquePhones.has(contact.phone)) continue;
        uniquePhones.add(contact.phone);
        
        notifications.push({
          templateCode: `${templateCodeBase}-sms`,
          channel: "sms",
          recipient: { phone: contact.phone, name: contact.name },
          contextType: "invoice",
          contextId: invoice.id,
          customerId: invoice.customerId,
          invoiceId: invoice.id,
          templateData,
        });
      }
    }

    if (notifications.length === 0) {
      return channels.map((ch) => ({
        type: "invoice" as const,
        id: invoiceId,
        channel: ch,
        success: false,
        error: ch === "email"
          ? "Hiçbir ilgili kişinin e-posta adresi yok"
          : "Hiçbir ilgili kişinin telefon numarası yok",
      }));
    }

    const dispatchResults = await this.dispatchService.dispatchBulk(notifications);
    const dispatchOutcome: ManualSendResultItemDto[] = dispatchResults.map((r, idx) => {
      const n = notifications[idx];
      const ch = n?.channel ?? (r.channel as "email" | "sms");
      return {
        type: "invoice" as const,
        id: invoiceId,
        channel: ch,
        recipient: ch === "email" ? n?.recipient?.email : n?.recipient?.phone,
        success: r.success,
        error: r.error,
      };
    });

    if (dispatchOutcome.some((o) => o.success)) {
      const notifiedUsers = contacts
        .filter((c) => c.email || c.phone)
        .map((c) => ({ name: c.name || "", email: c.email || "", gsm: c.phone || "", smsText: "" }));
      await this.invoiceModel.updateOne(
        { id: invoiceId },
        {
          $set: { lastNotify: new Date() },
          $push: {
            notify: {
              sms: channels.includes("sms"),
              email: channels.includes("email"),
              push: false,
              sendTime: new Date(),
              users: notifiedUsers,
            },
          },
        }
      );
    }

    return dispatchOutcome;
  }

  private async sendForContract(
    contractId: string,
    channels: ("email" | "sms")[]
  ): Promise<ManualSendResultItemDto[]> {
    const contract = await this.contractModel.findOne({ id: contractId }).lean().exec();
    if (!contract || !contract.customerId) {
      return channels.map((ch) => ({
        type: "contract" as const,
        id: contractId,
        channel: ch,
        success: false,
        error: "Kontrat veya müşteri bulunamadı",
      }));
    }

    if (contract.noNotification === true) {
      return channels.map((ch) => ({
        type: "contract" as const,
        id: contractId,
        channel: ch,
        success: false,
        error: "Bu kontrat için bildirimler devre dışı",
      }));
    }

    const customer = await this.customerModel.findOne({ id: contract.customerId }).lean().exec();
    if (!customer) {
      return channels.map((ch) => ({
        type: "contract" as const,
        id: contractId,
        channel: ch,
        success: false,
        error: "Müşteri bulunamadı",
      }));
    }

    const contractUsers = contract.id
      ? await this.getContractUsersForContract(contract.id)
      : [];
    const contacts = this.buildContactList(customer, contractUsers);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = contract.endDate ? new Date(contract.endDate) : null;
    const remainingDays = calculateRemainingDays(endDate, today);

    const templateData = buildContractTemplateData(contract, customer, remainingDays);
    const notifications: DispatchNotificationDto[] = [];

    if (channels.includes("email")) {
      const emailContacts = contacts.filter((c) => c.email);
      const uniqueEmails = new Set<string>();
      
      for (const contact of emailContacts) {
        if (uniqueEmails.has(contact.email)) continue;
        uniqueEmails.add(contact.email);
        
        notifications.push({
          templateCode: "contract-expiry-email",
          channel: "email",
          recipient: { email: contact.email, name: contact.name },
          contextType: "contract",
          contextId: contract.id,
          customerId: contract.customerId,
          contractId: contract.id,
          templateData,
        });
      }
    }
    if (channels.includes("sms")) {
      const smsContacts = contacts.filter((c) => c.phone);
      const uniquePhones = new Set<string>();
      
      for (const contact of smsContacts) {
        if (uniquePhones.has(contact.phone)) continue;
        uniquePhones.add(contact.phone);
        
        notifications.push({
          templateCode: "contract-expiry-sms",
          channel: "sms",
          recipient: { phone: contact.phone, name: contact.name },
          contextType: "contract",
          contextId: contract.id,
          customerId: contract.customerId,
          contractId: contract.id,
          templateData,
        });
      }
    }

    if (notifications.length === 0) {
      return channels.map((ch) => ({
        type: "contract" as const,
        id: contractId,
        channel: ch,
        success: false,
        error: ch === "email"
          ? "Hiçbir ilgili kişinin e-posta adresi yok"
          : "Hiçbir ilgili kişinin telefon numarası yok",
      }));
    }

    const dispatchResults = await this.dispatchService.dispatchBulk(notifications);
    return dispatchResults.map((r, idx) => {
      const n = notifications[idx];
      const ch = n?.channel ?? (r.channel as "email" | "sms");
      return {
        type: "contract" as const,
        id: contractId,
        channel: ch,
        recipient: ch === "email" ? n?.recipient?.email : n?.recipient?.phone,
        success: r.success,
        error: r.error,
      };
    });
  }

  /**
   * Gerçek fatura/kontrat verileriyle template önizlemesi oluşturur
   */
  async previewNotification(
    type: "invoice" | "contract",
    id: string,
    channel: "email" | "sms"
  ): Promise<{
    subject?: string;
    body: string;
    templateCode: string;
    recipient: { name: string; email: string; phone: string };
  }> {
    if (type === "invoice") {
      return this.previewInvoice(id, channel);
    }
    return this.previewContract(id, channel);
  }

  private async previewInvoice(
    invoiceId: string,
    channel: "email" | "sms"
  ) {
    const invoice = await this.invoiceModel.findOne({ id: invoiceId }).lean().exec();
    if (!invoice || !invoice.customerId) {
      throw new Error("Fatura bulunamadı");
    }
    const customer = await this.customerModel.findOne({ id: invoice.customerId }).lean().exec();
    if (!customer) {
      throw new Error("Müşteri bulunamadı");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = invoice.dueDate ? new Date(invoice.dueDate) : null;
    due?.setHours(0, 0, 0, 0);
    const overdueDays =
      due && due < today
        ? Math.floor((today.getTime() - due.getTime()) / (24 * 60 * 60 * 1000))
        : 0;

    const templateCodeBase =
      overdueDays > 0
        ? overdueDays <= 3
          ? "invoice-overdue-3"
          : "invoice-overdue-5"
        : "invoice-due";

    const templateCode = `${templateCodeBase}-${channel}`;
    const paymentLinkUrl = await this.createPaymentLinkForInvoice(invoice, customer);
    const templateData = buildInvoiceTemplateData(invoice, customer, paymentLinkUrl, overdueDays > 0 ? overdueDays : undefined);

    const rendered = await this.templatesService.renderTemplate(
      templateCode,
      templateData
    );

    return {
      subject: rendered.subject,
      body: rendered.body,
      templateCode,
      recipient: {
        name: customer.name ?? "",
        email: customer.email ?? "",
        phone: customer.phone ?? "",
      },
    };
  }

  private async previewContract(
    contractId: string,
    channel: "email" | "sms"
  ) {
    const contract = await this.contractModel.findOne({ id: contractId }).lean().exec();
    if (!contract || !contract.customerId) {
      throw new Error("Kontrat bulunamadı");
    }
    const customer = await this.customerModel.findOne({ id: contract.customerId }).lean().exec();
    if (!customer) {
      throw new Error("Müşteri bulunamadı");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = contract.endDate ? new Date(contract.endDate) : null;
    const remainingDays = calculateRemainingDays(endDate, today);

    const templateCode = `contract-expiry-${channel}`;
    const templateData = buildContractTemplateData(contract, customer, remainingDays);

    const rendered = await this.templatesService.renderTemplate(
      templateCode,
      templateData
    );

    return {
      subject: rendered.subject,
      body: rendered.body,
      templateCode,
      recipient: {
        name: customer.name ?? "",
        email: customer.email ?? "",
        phone: customer.phone ?? "",
      },
    };
  }

  /**
   * Müşteri iletişim bilgilerini kontrat kullanıcılarıyla birleştirir, mükerrerleri temizler.
   * Karşılaştırma normalize edilmiş email ve telefon üzerinden yapılır.
   */
  private buildContactList(
    customer: { name?: string; companyName?: string; email?: string; phone?: string } | null,
    contractUsers: { name?: string; email?: string; gsm?: string; role?: string }[]
  ): QueueContactDto[] {
    const contacts: QueueContactDto[] = [];
    // Mükerrer: hem email hem telefon aynı olan gerçek kopyaları temizle.
    // Sadece email veya sadece telefon eşleşmesi yeterli değil — farklı kişiler
    // aynı şirket telefonunu paylaşabilir.
    const seenKeys = new Set<string>();

    const addContact = (
      name: string,
      email: string,
      phone: string,
      role: string
    ) => {
      const normEmail = normalizeEmail(email);
      const normPhone = normalizePhone(phone);

      if (!normEmail && !normPhone) return;

      const key = `${normEmail}|${normPhone}`;
      if (seenKeys.has(key)) return;
      seenKeys.add(key);

      contacts.push({ name, email: normEmail, phone: normPhone, role });
    };

    if (customer) {
      addContact(
        customer.name ?? "",
        customer.email ?? "",
        customer.phone ?? "",
        "primary"
      );
    }

    for (const cu of contractUsers) {
      addContact(
        cu.name ?? "",
        cu.email ?? "",
        cu.gsm ?? "",
        cu.role ?? ""
      );
    }

    return contacts;
  }

  /**
   * Bir müşterinin tüm kontratlarına ait kontrat kullanıcılarını getirir.
   * customerId → Contract.contractId → ContractUser.contractId zinciri
   */
  private async getContractUsersForCustomer(
    customerIds: string[]
  ): Promise<Map<string, { name?: string; email?: string; gsm?: string; role?: string }[]>> {
    if (customerIds.length === 0) return new Map();

    // ContractUser.contractId = Contract.id (UUID) — NOT Contract.contractId (iş kodu)
    const contracts = await this.contractModel
      .find({ customerId: { $in: customerIds } }, { customerId: 1, id: 1 })
      .lean()
      .exec();

    const contractInternalIds = contracts
      .map((c) => c.id)
      .filter((id): id is string => !!id);

    const contractUsers = contractInternalIds.length > 0
      ? await this.contractUserModel
          .find({ contractId: { $in: contractInternalIds } })
          .lean()
          .exec()
      : [];

    // contract.id → customerId haritası
    const contractToCustomer = new Map<string, string>();
    for (const c of contracts) {
      if (c.id && c.customerId) {
        contractToCustomer.set(c.id, c.customerId);
      }
    }

    // customerId → contractUsers haritası
    const result = new Map<string, { name?: string; email?: string; gsm?: string; role?: string }[]>();
    for (const cu of contractUsers) {
      const cid = contractToCustomer.get(cu.contractId);
      if (!cid) continue;
      if (!result.has(cid)) result.set(cid, []);
      result.get(cid)!.push({ name: cu.name, email: cu.email, gsm: cu.gsm, role: cu.role });
    }

    return result;
  }

  /**
   * Bir kontrattaki kontrat kullanıcılarını getirir.
   * contract.contractId üzerinden sorgu yapılır.
   */
  private async getContractUsersForContract(
    contractId: string
  ): Promise<{ name?: string; email?: string; gsm?: string; role?: string }[]> {
    if (!contractId) return [];
    return this.contractUserModel
      .find({ contractId })
      .lean()
      .exec();
  }

  private mapCustomer(
    customer: { id: string; name?: string; companyName?: string; email?: string; phone?: string } | null,
    contacts: QueueContactDto[] = []
  ): QueueCustomerDto {
    if (!customer) {
      return { id: "", name: "", companyName: "", email: "", phone: "", contacts: [] };
    }
    return {
      id: customer.id,
      name: customer.name ?? "",
      companyName: customer.companyName ?? "",
      email: normalizeEmail(customer.email),
      phone: normalizePhone(customer.phone),
      contacts,
    };
  }
}
