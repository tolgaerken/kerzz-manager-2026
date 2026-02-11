import { Controller, Get } from "@nestjs/common";
import { VersionService } from "./version.service";
import { Public } from "../auth/decorators/public.decorator";

@Controller("version")
export class VersionController {
  constructor(private readonly versionService: VersionService) {}

  @Public()
  @Get()
  getVersion() {
    return this.versionService.getVersion();
  }
}
