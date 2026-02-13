import { Controller, Post, Body } from "@nestjs/common";
import { EDocStatusesService } from "./e-doc-statuses.service";
import { IntegratorStatusQueryDto } from "./dto";
import type { IntegratorStatusItem } from "./dto";

@Controller("e-doc-statuses")
export class EDocStatusesController {
  constructor(private readonly eDocStatusesService: EDocStatusesService) {}

  @Post("integrator-statuses")
  async getIntegratorStatuses(
    @Body() dto: IntegratorStatusQueryDto,
  ): Promise<IntegratorStatusItem[]> {
    return this.eDocStatusesService.getIntegratorStatuses(
      dto.startDate,
      dto.endDate,
    );
  }
}
