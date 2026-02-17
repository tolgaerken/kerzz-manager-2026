import { Controller, Get, Put, Body } from "@nestjs/common";
import { NotificationSettingsService } from "./notification-settings.service";
import { UpdateNotificationSettingsDto } from "./dto";
import { AuditLog } from "../system-logs";

@Controller("notification-settings")
export class NotificationSettingsController {
  constructor(
    private readonly settingsService: NotificationSettingsService
  ) {}

  @Get()
  async getSettings() {
    return this.settingsService.getSettings();
  }

  @AuditLog({ module: "notification-settings", entityType: "NotificationSetting" })
  @Put()
  async updateSettings(@Body() dto: UpdateNotificationSettingsDto) {
    return this.settingsService.updateSettings(dto);
  }
}
