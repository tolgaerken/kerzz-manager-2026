import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body
} from "@nestjs/common";
import { ContractUsersService } from "./contract-users.service";
import { ContractUserQueryDto } from "./dto/contract-user-query.dto";
import { CreateContractUserDto } from "./dto/create-contract-user.dto";
import { UpdateContractUserDto } from "./dto/update-contract-user.dto";

@Controller("contract-users")
export class ContractUsersController {
  constructor(private readonly contractUsersService: ContractUsersService) {}

  @Get()
  async findAll(@Query() query: ContractUserQueryDto) {
    return this.contractUsersService.findAll(query);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.contractUsersService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateContractUserDto) {
    return this.contractUsersService.create(dto);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateContractUserDto) {
    return this.contractUsersService.update(id, dto);
  }

  @Delete(":id")
  async delete(@Param("id") id: string) {
    return this.contractUsersService.delete(id);
  }
}
