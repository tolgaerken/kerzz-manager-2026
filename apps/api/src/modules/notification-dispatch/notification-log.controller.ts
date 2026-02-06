import { Controller, Get, Param, Query } from "@nestjs/common";
import { NotificationDispatchService } from "./notification-dispatch.service";
import { NotificationLogQueryDto } from "./dto";

@Controller("notification-logs")
export class NotificationLogController {
  constructor(private readonly dispatchService: NotificationDispatchService) {}

  @Get()
  async findAll(@Query() query: NotificationLogQueryDto) {
    return this.dispatchService.findAll(query);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.dispatchService.findOne(id);
  }
}
