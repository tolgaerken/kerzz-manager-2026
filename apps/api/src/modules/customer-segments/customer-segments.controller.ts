import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query
} from "@nestjs/common";
import { CustomerSegmentsService } from "./customer-segments.service";
import { CustomerSegmentQueryDto } from "./dto/customer-segment-query.dto";
import { CreateCustomerSegmentDto } from "./dto/create-customer-segment.dto";
import { UpdateCustomerSegmentDto } from "./dto/update-customer-segment.dto";
import { AuditLog } from "../system-logs";
import { RequirePermission } from "../auth/decorators";
import { PERMISSIONS } from "../auth/constants/permissions";

@Controller("customer-segments")
@RequirePermission(PERMISSIONS.CUSTOMER_MENU)
export class CustomerSegmentsController {
  constructor(
    private readonly customerSegmentsService: CustomerSegmentsService
  ) {}

  @Get()
  async findAll(@Query() query: CustomerSegmentQueryDto) {
    return this.customerSegmentsService.findAll(query);
  }

  @Get("minimal")
  async findAllMinimal() {
    return this.customerSegmentsService.findAllMinimal();
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.customerSegmentsService.findOne(id);
  }

  @AuditLog({ module: "customer-segments", entityType: "CustomerSegment" })
  @Post()
  async create(@Body() createDto: CreateCustomerSegmentDto) {
    return this.customerSegmentsService.create(createDto);
  }

  @AuditLog({ module: "customer-segments", entityType: "CustomerSegment" })
  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() updateDto: UpdateCustomerSegmentDto
  ) {
    return this.customerSegmentsService.update(id, updateDto);
  }

  @AuditLog({ module: "customer-segments", entityType: "CustomerSegment" })
  @Delete(":id")
  async remove(@Param("id") id: string) {
    return this.customerSegmentsService.remove(id);
  }
}
