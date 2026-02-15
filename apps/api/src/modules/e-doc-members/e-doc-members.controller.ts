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

  @Post()
  async create(@Body() dto: CreateEDocMemberDto) {
    return this.eDocMembersService.create(dto);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateEDocMemberDto) {
    return this.eDocMembersService.update(id, dto);
  }

  @Delete(":id")
  async delete(@Param("id") id: string) {
    return this.eDocMembersService.delete(id);
  }
}
