import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from "@nestjs/common";
import { OffersService } from "./offers.service";
import { CreateOfferDto } from "./dto/create-offer.dto";
import { UpdateOfferDto } from "./dto/update-offer.dto";
import { OfferQueryDto } from "./dto/offer-query.dto";
import { AuditLog } from "../system-logs";

@Controller("offers")
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get()
  async findAll(@Query() query: OfferQueryDto) {
    return this.offersService.findAll(query);
  }

  @Get("stats")
  async getStats() {
    return this.offersService.getStats();
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.offersService.findOne(id);
  }

  @AuditLog({ module: "offers", entityType: "Offer" })
  @Post()
  async create(@Body() dto: CreateOfferDto) {
    return this.offersService.create(dto);
  }

  @AuditLog({ module: "offers", entityType: "Offer" })
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateOfferDto) {
    return this.offersService.update(id, dto);
  }

  @AuditLog({ module: "offers", entityType: "Offer" })
  @Delete(":id")
  async remove(@Param("id") id: string) {
    return this.offersService.remove(id);
  }

  @AuditLog({ module: "offers", entityType: "Offer" })
  @Patch(":id/status")
  async updateStatus(
    @Param("id") id: string,
    @Body("status") status: string
  ) {
    return this.offersService.updateStatus(id, status);
  }

  @Post(":id/calculate")
  async calculate(@Param("id") id: string) {
    return this.offersService.calculate(id);
  }

  @AuditLog({ module: "offers", entityType: "Offer" })
  @Post(":id/revert-conversion")
  async revertConversion(@Param("id") id: string) {
    return this.offersService.revertConversion(id);
  }
}
