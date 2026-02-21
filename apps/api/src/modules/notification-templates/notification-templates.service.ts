import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import * as Handlebars from "handlebars";
import {
  NotificationTemplate,
  NotificationTemplateDocument,
} from "./schemas/notification-template.schema";
import {
  CreateNotificationTemplateDto,
  UpdateNotificationTemplateDto,
  NotificationTemplateQueryDto,
  NotificationTemplateResponseDto,
  PaginatedNotificationTemplatesResponseDto,
  RenderTemplateResponseDto,
  SendTestEmailResponseDto,
} from "./dto";
import { defaultTemplates } from "./notification-template.seed";
import { EmailService } from "../email";

@Injectable()
export class NotificationTemplatesService implements OnModuleInit {
  constructor(
    @InjectModel(NotificationTemplate.name)
    private templateModel: Model<NotificationTemplateDocument>,
    private readonly emailService: EmailService
  ) {}

  async onModuleInit() {
    await this.seedDefaultTemplates();
  }

  /**
   * Varsayılan template'leri seed eder (yalnızca yoksa oluşturur).
   * Mevcut kayıtları güncellemez; kullanıcı özelleştirmeleri korunur.
   */
  private async seedDefaultTemplates(): Promise<void> {
    for (const template of defaultTemplates) {
      const existingTemplate = await this.templateModel
        .findOne({ code: template.code })
        .select("_id")
        .lean()
        .exec();

      if (!existingTemplate) {
        await this.templateModel.create({
          ...template,
          id: uuidv4(),
        });
        console.log(`✅ Template seed edildi: ${template.code}`);
      }
    }
  }

  async create(
    dto: CreateNotificationTemplateDto
  ): Promise<NotificationTemplateResponseDto> {
    const id = uuidv4();
    const template = new this.templateModel({
      ...dto,
      id,
    });
    const saved = await template.save();
    return this.mapToResponseDto(saved);
  }

  async findAll(
    queryDto: NotificationTemplateQueryDto
  ): Promise<PaginatedNotificationTemplatesResponseDto> {
    const { page = 1, limit = 50, channel, isActive, search } = queryDto;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (channel) filter.channel = channel;
    if (isActive !== undefined) filter.isActive = isActive;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const [data, total] = await Promise.all([
      this.templateModel
        .find(filter)
        .sort({ code: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.templateModel.countDocuments(filter).exec(),
    ]);

    return {
      data: data.map((doc) => this.mapToResponseDto(doc)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<NotificationTemplateResponseDto | null> {
    const template = await this.templateModel.findById(id).exec();
    return template ? this.mapToResponseDto(template) : null;
  }

  async findByCode(code: string): Promise<NotificationTemplateResponseDto | null> {
    const template = await this.templateModel.findOne({ code }).exec();
    return template ? this.mapToResponseDto(template) : null;
  }

  async update(
    id: string,
    dto: UpdateNotificationTemplateDto
  ): Promise<NotificationTemplateResponseDto> {
    const template = await this.templateModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();

    if (!template) {
      throw new NotFoundException(`Template bulunamadı: ${id}`);
    }

    return this.mapToResponseDto(template);
  }

  async delete(id: string): Promise<void> {
    const result = await this.templateModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Template bulunamadı: ${id}`);
    }
  }

  /**
   * Template'i verilen data ile render eder
   */
  async renderTemplate(
    code: string,
    data: Record<string, unknown>
  ): Promise<RenderTemplateResponseDto> {
    const template = await this.templateModel.findOne({ code }).exec();

    if (!template) {
      throw new NotFoundException(`Template bulunamadı: ${code}`);
    }

    if (!template.isActive) {
      throw new Error(`Template aktif değil: ${code}`);
    }

    // Handlebars ile render et
    const bodyTemplate = Handlebars.compile(template.body);
    const renderedBody = bodyTemplate(data);

    let renderedSubject: string | undefined;
    if (template.subject) {
      const subjectTemplate = Handlebars.compile(template.subject);
      renderedSubject = subjectTemplate(data);
    }

    return {
      subject: renderedSubject,
      body: renderedBody,
    };
  }

  /**
   * Template'i önizleme için örnek verilerle render eder
   */
  async previewTemplate(
    code: string
  ): Promise<RenderTemplateResponseDto> {
    // Örnek veriler
    const sampleData: Record<string, unknown> = {
      company: "Örnek Şirket A.Ş.",
      amount: "5.250,00 TL",
      dueDate: "15.02.2026",
      invoiceNumber: "FT-2026-00123",
      paymentLink: "https://kerzz-pay.cloudlabs.com.tr/odeme/example-token",
      confirmLink: "https://kerzz-pay.cloudlabs.com.tr/fatura-goruntule/example-uuid",
      contractEndDate: "31.03.2026",
      customerName: "Ahmet Yılmaz",
      overdueDays: "5",
    };

    return this.renderTemplate(code, sampleData);
  }

  async sendPreviewEmail(
    code: string,
    recipientEmail: string
  ): Promise<SendTestEmailResponseDto> {
    const template = await this.templateModel
      .findOne({ code })
      .select("name channel")
      .lean()
      .exec();

    if (!template) {
      throw new NotFoundException(`Template bulunamadı: ${code}`);
    }

    if (template.channel !== "email") {
      throw new BadRequestException(
        "Test mail gönderimi sadece e-posta şablonları için kullanılabilir."
      );
    }

    const preview = await this.previewTemplate(code);
    const subject = preview.subject?.trim() || `[Test] ${template.name}`;
    const result = await this.emailService.send({
      to: recipientEmail,
      subject,
      html: preview.body,
      text: this.stripHtml(preview.body),
    });

    if (!result.success) {
      throw new BadRequestException(
        result.error || "Test mail gönderimi başarısız oldu."
      );
    }

    return {
      success: true,
      messageId: result.messageId,
    };
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\s+/g, " ")
      .trim();
  }

  private mapToResponseDto(
    doc: NotificationTemplateDocument
  ): NotificationTemplateResponseDto {
    return {
      _id: doc._id.toString(),
      id: doc.id,
      name: doc.name,
      code: doc.code,
      channel: doc.channel,
      subject: doc.subject,
      body: doc.body,
      isActive: doc.isActive,
      variables: doc.variables,
      description: doc.description,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
