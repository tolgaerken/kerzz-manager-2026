import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus
} from "@nestjs/common";
import { RequirePermission } from "../auth/decorators/require-permission.decorator";
import { PERMISSIONS } from "../auth/constants/permissions";
import { BossUsersService } from "./boss-users.service";
import { BossUsersNotificationService, NotificationResult } from "./boss-users-notification.service";
import {
  BossLicenseUserDto,
  BranchDto,
  CreateBossLicenseDto,
  UpdateBossLicenseDto,
  UpdateBranchesDto,
  BlockUserDto,
  SendNotificationDto,
  UpsertUserDto
} from "./dto";
import { SsoUser } from "../sso/schemas";

@Controller("boss-users")
@RequirePermission(PERMISSIONS.SSO_MANAGEMENT_MENU)
export class BossUsersController {
  constructor(
    private readonly bossUsersService: BossUsersService,
    private readonly notificationService: BossUsersNotificationService
  ) {}

  /**
   * Tüm Kerzz Boss lisanslarını getir
   */
  @Get("licenses")
  async getAllLicenses(): Promise<BossLicenseUserDto[]> {
    return this.bossUsersService.getAllLicenses();
  }

  /**
   * Belirli bir kullanıcının Boss lisanslarını getir
   */
  @Get("licenses/user/:userId")
  async getLicensesByUser(
    @Param("userId") userId: string
  ): Promise<BossLicenseUserDto[]> {
    return this.bossUsersService.getLicensesByUser(userId);
  }

  /**
   * Lisans oluştur veya güncelle
   */
  @Post("licenses")
  @HttpCode(HttpStatus.OK)
  async upsertLicense(
    @Body() dto: CreateBossLicenseDto
  ): Promise<BossLicenseUserDto> {
    return this.bossUsersService.upsertLicense(dto);
  }

  /**
   * Lisans güncelle
   */
  @Put("licenses/:id")
  async updateLicense(
    @Param("id") id: string,
    @Body() dto: UpdateBossLicenseDto
  ): Promise<BossLicenseUserDto> {
    return this.bossUsersService.updateLicense(id, dto);
  }

  /**
   * Lisans sil
   */
  @Delete("licenses/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteLicense(@Param("id") id: string): Promise<void> {
    return this.bossUsersService.deleteLicense(id);
  }

  /**
   * Şube yetkilerini güncelle
   */
  @Put("licenses/:id/branches")
  async updateBranches(
    @Param("id") id: string,
    @Body() dto: UpdateBranchesDto
  ): Promise<BossLicenseUserDto> {
    return this.bossUsersService.updateBranches(id, dto);
  }

  /**
   * Kullanıcıyı engelle
   */
  @Put("licenses/:id/block")
  async blockUser(
    @Param("id") id: string,
    @Body() dto: BlockUserDto
  ): Promise<BossLicenseUserDto> {
    return this.bossUsersService.blockUser(id, dto);
  }

  /**
   * Engeli kaldır
   */
  @Put("licenses/:id/unblock")
  async unblockUser(@Param("id") id: string): Promise<BossLicenseUserDto> {
    return this.bossUsersService.unblockUser(id);
  }

  /**
   * Şubeleri getir (SSO helper API proxy)
   */
  @Get("branches/:licanceId")
  async getBranches(
    @Param("licanceId") licanceId: string,
    @Headers("x-user-token") xUserToken?: string,
    @Headers("x-api-key") xApiKey?: string,
    @Headers("authorization") authorization?: string
  ): Promise<BranchDto[]> {
    const bearerToken = authorization?.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length)
      : undefined;

    return this.bossUsersService.getBranches(licanceId, {
      userToken: xUserToken || bearerToken,
      apiKey: xApiKey
    });
  }

  /**
   * Kullanıcı oluştur veya güncelle
   */
  @Post("users")
  @HttpCode(HttpStatus.OK)
  async upsertUser(@Body() dto: UpsertUserDto): Promise<SsoUser> {
    return this.bossUsersService.upsertUser(dto);
  }

  /**
   * Kullanıcıyı telefon ile ara
   */
  @Get("users/by-phone")
  async findUserByPhone(@Query("phone") phone: string): Promise<SsoUser | null> {
    return this.bossUsersService.findUserByPhone(phone);
  }

  /**
   * Kullanıcıyı email ile ara
   */
  @Get("users/by-email")
  async findUserByEmail(@Query("email") email: string): Promise<SsoUser | null> {
    return this.bossUsersService.findUserByEmail(email);
  }

  /**
   * Kullanıcıyı ID ile getir
   */
  @Get("users/:userId")
  async getUserById(@Param("userId") userId: string): Promise<SsoUser | null> {
    return this.bossUsersService.getUserById(userId);
  }

  /**
   * Bildirim gönder (SMS/Email)
   */
  @Post("notify")
  @HttpCode(HttpStatus.OK)
  async sendNotification(
    @Body() dto: SendNotificationDto
  ): Promise<NotificationResult> {
    const user = await this.bossUsersService.getUserById(dto.user_id);
    if (!user) {
      return {
        sms: { success: false, error: "Kullanıcı bulunamadı" },
        email: { success: false, error: "Kullanıcı bulunamadı" }
      };
    }

    return this.notificationService.sendBossAppNotification(
      user.phone,
      user.email,
      user.name,
      {
        sendSms: dto.sendSms,
        sendEmail: dto.sendEmail,
        customMessage: dto.customMessage
      }
    );
  }
}
