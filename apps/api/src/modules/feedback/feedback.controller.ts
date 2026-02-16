import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { CurrentUser, RequirePermission } from "../auth/decorators";
import { PERMISSIONS } from "../auth/constants/permissions";
import { AuthenticatedUser } from "../auth/auth.types";
import {
  CreateFeedbackDto,
  FeedbackQueryDto,
  UpdateFeedbackDto,
} from "./dto";
import { FeedbackService } from "./feedback.service";

@Controller("feedbacks")
@RequirePermission(PERMISSIONS.FEEDBACK_MENU)
export class FeedbackController {
  constructor(private readonly service: FeedbackService) {}

  @Get()
  async findAll(@Query() query: FeedbackQueryDto) {
    return this.service.findAll(query);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.service.findOne(id);
  }

  @Post()
  async create(
    @Body() dto: CreateFeedbackDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.create(dto, user.id, user.name);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateFeedbackDto) {
    return this.service.update(id, dto);
  }

  @Delete(":id")
  async delete(@Param("id") id: string) {
    return this.service.delete(id);
  }
}
