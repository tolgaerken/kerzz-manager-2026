import { Controller, Get, Post, Body, Query } from "@nestjs/common";
import { NotificationQueueService } from "./notification-queue.service";
import {
  InvoiceQueueQueryDto,
  ContractQueueQueryDto,
  ManualSendDto,
} from "./dto";
import { AuditLog } from "../system-logs";

@Controller("notification-queue")
export class NotificationQueueController {
  constructor(private readonly queueService: NotificationQueueService) {}

  @Get("invoices")
  getInvoices(@Query() query: InvoiceQueueQueryDto) {
    return this.queueService.getPendingInvoices(query);
  }

  @Get("contracts")
  getContracts(@Query() query: ContractQueueQueryDto) {
    return this.queueService.getPendingContracts(query);
  }

  @Get("stats")
  getStats() {
    return this.queueService.getStats();
  }

  @Get("preview")
  preview(
    @Query("type") type: "invoice" | "contract",
    @Query("id") id: string,
    @Query("channel") channel: "email" | "sms"
  ) {
    return this.queueService.previewNotification(type, id, channel);
  }

  @AuditLog({ module: "notification-queue", entityType: "NotificationQueue" })
  @Post("send")
  send(@Body() dto: ManualSendDto) {
    return this.queueService.sendManualNotification(dto);
  }
}
