import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { NotificationTemplatesService } from "./notification-templates.service";
import {
  CreateNotificationTemplateDto,
  UpdateNotificationTemplateDto,
  NotificationTemplateQueryDto,
  RenderTemplateDto,
} from "./dto";
import { AuditLog } from "../system-logs";

@Controller("notification-templates")
export class NotificationTemplatesController {
  constructor(
    private readonly templatesService: NotificationTemplatesService
  ) {}

  @AuditLog({ module: "notification-templates", entityType: "NotificationTemplate" })
  @Post()
  async create(@Body() dto: CreateNotificationTemplateDto) {
    return this.templatesService.create(dto);
  }

  @Get()
  async findAll(@Query() query: NotificationTemplateQueryDto) {
    return this.templatesService.findAll(query);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.templatesService.findOne(id);
  }

  @Get("code/:code")
  async findByCode(@Param("code") code: string) {
    return this.templatesService.findByCode(code);
  }

  @AuditLog({ module: "notification-templates", entityType: "NotificationTemplate" })
  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateNotificationTemplateDto
  ) {
    return this.templatesService.update(id, dto);
  }

  @AuditLog({ module: "notification-templates", entityType: "NotificationTemplate" })
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param("id") id: string) {
    return this.templatesService.delete(id);
  }

  @Post("render")
  async renderTemplate(@Body() dto: RenderTemplateDto) {
    return this.templatesService.renderTemplate(dto.code, dto.data || {});
  }

  @Get("preview/:code")
  async previewTemplate(@Param("code") code: string) {
    return this.templatesService.previewTemplate(code);
  }
}
