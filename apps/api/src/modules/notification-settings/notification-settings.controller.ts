import { Controller, Get, Put, Body } from "@nestjs/common";
import { NotificationSettingsService } from "./notification-settings.service";
import { UpdateNotificationSettingsDto } from "./dto";

@Controller("notification-settings")
export class NotificationSettingsController {
  constructor(
    private readonly settingsService: NotificationSettingsService
  ) {}

  @Get()
  async getSettings() {
    return this.settingsService.getSettings();
  }

  @Put()
  async updateSettings(@Body() dto: UpdateNotificationSettingsDto) {
    return this.settingsService.updateSettings(dto);
  }
}
