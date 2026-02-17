import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
} from "@nestjs/common";
import { EDocMembersService } from "./e-doc-members.service";
import {
  EDocMemberQueryDto,
  CreateEDocMemberDto,
  UpdateEDocMemberDto,
} from "./dto";
import { RequirePermission } from "../auth/decorators";
import { PERMISSIONS } from "../auth/constants/permissions";
import { AuditLog } from "../system-logs";

@Controller("e-doc-members")
@RequirePermission(PERMISSIONS.EDOC_MENU)
export class EDocMembersController {
  constructor(private readonly eDocMembersService: EDocMembersService) {}

  @Get()
  async findAll(@Query() query: EDocMemberQueryDto) {
    return this.eDocMembersService.findAll(query);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.eDocMembersService.findOne(id);
  }

  @AuditLog({ module: "e-doc-members", entityType: "EDocMember" })
  @Post()
  async create(@Body() dto: CreateEDocMemberDto) {
    return this.eDocMembersService.create(dto);
  }

  @AuditLog({ module: "e-doc-members", entityType: "EDocMember" })
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateEDocMemberDto) {
    return this.eDocMembersService.update(id, dto);
  }

  @AuditLog({ module: "e-doc-members", entityType: "EDocMember" })
  @Delete(":id")
  async delete(@Param("id") id: string) {
    return this.eDocMembersService.delete(id);
  }
}
