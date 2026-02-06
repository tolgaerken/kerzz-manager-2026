import { Controller, Get, Param } from "@nestjs/common";
import { CompaniesService } from "./companies.service";

@Controller("companies")
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  async findAll() {
    return this.companiesService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.companiesService.findById(id);
  }
}
