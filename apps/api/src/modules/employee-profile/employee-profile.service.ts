import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { SSO_DB_CONNECTION } from "../../database";
import {
  EmployeeProfile,
  EmployeeProfileDocument,
  EmploymentStatus,
} from "./schemas/employee-profile.schema";
import { SsoUser, SsoUserDocument, SsoUserApp, SsoUserAppDocument } from "../sso/schemas";
import {
  OrgDepartment,
  OrgDepartmentDocument,
  OrgTitle,
  OrgTitleDocument,
  OrgLocation,
  OrgLocationDocument,
} from "../employee-org-lookup/schemas";
import {
  EmployeeProfileQueryDto,
  CreateEmployeeProfileDto,
  UpdateEmployeeProfileDto,
  UpdateSelfProfileDto,
  SELF_SERVICE_ALLOWED_FIELDS,
  PaginatedEmployeeProfileResponseDto,
  EmployeeProfileResponseDto,
  EnrichedEmployeeProfileResponseDto,
  HierarchyNodeDto,
  HierarchyResponseDto,
  FlatHierarchyNodeDto,
  FlatHierarchyResponseDto,
  maskNationalId,
  maskIban,
} from "./dto";

export interface EmployeeProfileServiceContext {
  userId: string;
  isAdmin: boolean;
  canViewSensitiveData: boolean;
  canEditAll: boolean;
}

@Injectable()
export class EmployeeProfileService {
  private readonly logger = new Logger(EmployeeProfileService.name);
  private readonly appId: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(EmployeeProfile.name, SSO_DB_CONNECTION)
    private readonly employeeProfileModel: Model<EmployeeProfileDocument>,
    @InjectModel(SsoUser.name, SSO_DB_CONNECTION)
    private readonly ssoUserModel: Model<SsoUserDocument>,
    @InjectModel(SsoUserApp.name, SSO_DB_CONNECTION)
    private readonly ssoUserAppModel: Model<SsoUserAppDocument>,
    @InjectModel(OrgDepartment.name, SSO_DB_CONNECTION)
    private readonly orgDepartmentModel: Model<OrgDepartmentDocument>,
    @InjectModel(OrgTitle.name, SSO_DB_CONNECTION)
    private readonly orgTitleModel: Model<OrgTitleDocument>,
    @InjectModel(OrgLocation.name, SSO_DB_CONNECTION)
    private readonly orgLocationModel: Model<OrgLocationDocument>
  ) {
    this.appId = this.configService.get<string>("APP_ID") || "kerzz-manager";
  }

  /**
   * Tüm çalışan profillerini sayfalanmış olarak getir
   * Sadece bu uygulamaya (kerzz-manager) atanmış kullanıcıları getirir
   */
  async findAll(
    query: EmployeeProfileQueryDto,
    context: EmployeeProfileServiceContext
  ): Promise<PaginatedEmployeeProfileResponseDto> {
    const {
      page = 1,
      limit = 50,
      search,
      departmentCode,
      titleCode,
      managerUserId,
      location,
      employmentStatus,
      workType,
      contractType,
      sortField = "createdAt",
      sortOrder = "desc",
    } = query;

    // Önce bu uygulamaya atanmış kullanıcıları al (user_apps tablosundan)
    const userApps = await this.ssoUserAppModel
      .find({ app_id: this.appId, isActive: { $ne: false } })
      .lean()
      .exec();

    if (userApps.length === 0) {
      return {
        data: [],
        meta: {
          total: 0,
          page,
          limit,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }

    // Bu kullanıcıların ID'lerini al
    const appUserIds = userApps.map((ua) => ua.user_id);
    const userAppMap = new Map(userApps.map((ua) => [ua.user_id, ua]));

    // SSO'dan bu kullanıcıların detaylarını al
    const ssoFilter: Record<string, unknown> = { id: { $in: appUserIds } };
    
    // Arama filtresi (isim, email, phone)
    if (search) {
      const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      ssoFilter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    const ssoUsers = await this.ssoUserModel.find(ssoFilter).lean().exec();
    const ssoUserIds = ssoUsers.map((u) => u.id);

    // Bu kullanıcıların profillerini al
    const profiles = await this.employeeProfileModel
      .find({ userId: { $in: ssoUserIds } })
      .lean()
      .exec();

    // Profilleri userId'ye göre map'le
    const profileMap = new Map<string, EmployeeProfile>();
    for (const profile of profiles) {
      profileMap.set(profile.userId, profile);
    }

    // SSO kullanıcılarını profilleriyle birleştir
    let combinedData = ssoUsers.map((ssoUser) => {
      const profile = profileMap.get(ssoUser.id);
      
      // Profil varsa onu kullan, yoksa SSO'dan temel bilgilerle oluştur
      const baseData: EnrichedEmployeeProfileResponseDto = {
        _id: profile ? (profile as EmployeeProfileDocument)._id?.toString() || "" : "",
        userId: ssoUser.id,
        employeeNumber: profile?.employeeNumber || "",
        departmentCode: profile?.departmentCode || "",
        departmentName: profile?.departmentName || "",
        titleCode: profile?.titleCode || "",
        titleName: profile?.titleName || "",
        managerUserId: profile?.managerUserId || "",
        location: profile?.location || "",
        workType: profile?.workType,
        nationalId: maskNationalId(profile?.nationalId || "", context.canViewSensitiveData),
        birthDate: profile?.birthDate,
        gender: profile?.gender,
        address: {
          street: profile?.address?.street || "",
          city: profile?.address?.city || "",
          district: profile?.address?.district || "",
          postalCode: profile?.address?.postalCode || "",
          country: profile?.address?.country || "",
        },
        emergencyContact: {
          name: profile?.emergencyContact?.name || "",
          phone: profile?.emergencyContact?.phone || "",
          relationship: profile?.emergencyContact?.relationship || "",
        },
        hireDate: profile?.hireDate,
        contractType: profile?.contractType,
        probationEndDate: profile?.probationEndDate,
        payrollGroup: profile?.payrollGroup || "",
        seniorityStartDate: profile?.seniorityStartDate,
        employmentStatus: profile?.employmentStatus || (ssoUser.isActive ? EmploymentStatus.ACTIVE : EmploymentStatus.INACTIVE),
        terminationDate: profile?.terminationDate,
        terminationReason: profile?.terminationReason || "",
        iban: context.canViewSensitiveData ? profile?.iban : maskIban(profile?.iban || "", false),
        salary: context.canViewSensitiveData ? profile?.salary : undefined,
        salaryCurrency: context.canViewSensitiveData ? profile?.salaryCurrency : undefined,
        notes: profile?.notes || "",
        creatorId: profile?.creatorId,
        updaterId: profile?.updaterId,
        createdAt: profile?.createdAt,
        updatedAt: profile?.updatedAt,
        // SSO bilgileri
        userName: ssoUser.name,
        userEmail: ssoUser.email,
        userPhone: ssoUser.phone,
        userIsActive: ssoUser.isActive,
        hasProfile: !!profile,
      };

      return baseData;
    });

    // Profil bazlı filtreler (sadece profili olanlar için)
    if (departmentCode || titleCode || managerUserId || location || workType || contractType) {
      combinedData = combinedData.filter((item) => {
        if (!item.hasProfile) return false;
        if (departmentCode && item.departmentCode !== departmentCode) return false;
        if (titleCode && item.titleCode !== titleCode) return false;
        if (managerUserId && item.managerUserId !== managerUserId) return false;
        if (location && !item.location.toLowerCase().includes(location.toLowerCase())) return false;
        if (workType && item.workType !== workType) return false;
        if (contractType && item.contractType !== contractType) return false;
        return true;
      });
    }

    // Employment status filtresi
    if (employmentStatus) {
      combinedData = combinedData.filter((item) => item.employmentStatus === employmentStatus);
    }

    // Sıralama
    const sortDirection = sortOrder === "asc" ? 1 : -1;
    combinedData.sort((a, b) => {
      const aVal = a[sortField as keyof typeof a];
      const bVal = b[sortField as keyof typeof b];
      
      if (sortField === "userName") {
        return sortDirection * ((a.userName || "").localeCompare(b.userName || ""));
      }
      
      if (aVal === undefined || aVal === null) return sortDirection;
      if (bVal === undefined || bVal === null) return -sortDirection;
      
      if (aVal < bVal) return -sortDirection;
      if (aVal > bVal) return sortDirection;
      return 0;
    });

    const total = combinedData.length;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    
    // Sayfalama
    const paginatedData = combinedData.slice(skip, skip + limit);

    return {
      data: paginatedData,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Kullanıcı ID'sine göre profil getir
   */
  async findByUserId(
    userId: string,
    context: EmployeeProfileServiceContext
  ): Promise<EnrichedEmployeeProfileResponseDto | null> {
    const profile = await this.employeeProfileModel
      .findOne({ userId })
      .lean()
      .exec();

    if (!profile) {
      return null;
    }

    // SSO'dan kullanıcı bilgilerini al
    const ssoUser = await this.ssoUserModel.findOne({ id: userId }).lean().exec();

    const responseDto = this.toResponseDto(
      profile,
      context.canViewSensitiveData || context.userId === userId
    ) as EnrichedEmployeeProfileResponseDto;

    // SSO bilgilerini ekle
    if (ssoUser) {
      responseDto.userName = ssoUser.name;
      responseDto.userEmail = ssoUser.email;
      responseDto.userPhone = ssoUser.phone;
      responseDto.userIsActive = ssoUser.isActive;
    }

    return responseDto;
  }

  /**
   * Kendi profilini getir (self-service)
   */
  async findMyProfile(
    context: EmployeeProfileServiceContext
  ): Promise<EnrichedEmployeeProfileResponseDto | null> {
    return this.findByUserId(context.userId, {
      ...context,
      canViewSensitiveData: true, // Kendi profilinde hassas alanları görebilir
    });
  }

  /**
   * Yeni çalışan profili oluştur (Admin/İK)
   */
  async create(
    dto: CreateEmployeeProfileDto,
    context: EmployeeProfileServiceContext
  ): Promise<EmployeeProfileResponseDto> {
    // Yetki kontrolü
    if (!context.canEditAll) {
      throw new ForbiddenException("Bu işlem için yetkiniz bulunmamaktadır");
    }

    // SSO'da kullanıcı var mı kontrol et
    const ssoUser = await this.ssoUserModel.findOne({ id: dto.userId }).lean().exec();
    if (!ssoUser) {
      throw new BadRequestException(`Kullanıcı bulunamadı: ${dto.userId}`);
    }

    // Zaten profil var mı kontrol et
    const existingProfile = await this.employeeProfileModel
      .findOne({ userId: dto.userId })
      .lean()
      .exec();

    if (existingProfile) {
      throw new BadRequestException(`Bu kullanıcı için zaten bir profil mevcut: ${dto.userId}`);
    }

    // Lookup doğrulamaları
    await this.validateLookupFields(dto);

    // Manager cycle kontrolü
    if (dto.managerUserId) {
      await this.validateManagerAssignment(dto.userId, dto.managerUserId);
    }

    const profile = new this.employeeProfileModel({
      ...dto,
      creatorId: context.userId,
      updaterId: context.userId,
    });

    await profile.save();
    this.logger.log(`Employee profile created for user: ${dto.userId} by ${context.userId}`);

    return this.toResponseDto(profile.toObject(), context.canViewSensitiveData);
  }

  /**
   * Çalışan profilini güncelle (Admin/İK - tam yetki)
   */
  async update(
    userId: string,
    dto: UpdateEmployeeProfileDto,
    context: EmployeeProfileServiceContext
  ): Promise<EmployeeProfileResponseDto> {
    // Yetki kontrolü
    if (!context.canEditAll) {
      throw new ForbiddenException("Bu işlem için yetkiniz bulunmamaktadır");
    }

    const profile = await this.employeeProfileModel.findOne({ userId }).exec();

    if (!profile) {
      throw new NotFoundException(`Profil bulunamadı: ${userId}`);
    }

    // Lookup doğrulamaları
    await this.validateLookupFields(dto);

    // Manager cycle kontrolü
    if (dto.managerUserId !== undefined && dto.managerUserId !== profile.managerUserId) {
      await this.validateManagerAssignment(userId, dto.managerUserId);
    }

    // Güncelleme
    Object.assign(profile, dto);
    profile.updaterId = context.userId;

    await profile.save();
    this.logger.log(`Employee profile updated for user: ${userId} by ${context.userId}`);

    return this.toResponseDto(profile.toObject(), context.canViewSensitiveData);
  }

  /**
   * Kendi profilini güncelle (Self-Service - sınırlı alanlar)
   */
  async updateMyProfile(
    dto: UpdateSelfProfileDto,
    context: EmployeeProfileServiceContext
  ): Promise<EmployeeProfileResponseDto> {
    const profile = await this.employeeProfileModel
      .findOne({ userId: context.userId })
      .exec();

    if (!profile) {
      throw new NotFoundException("Profiliniz bulunamadı");
    }

    // Whitelist kontrolü - sadece izin verilen alanları güncelle
    const updateData: Partial<EmployeeProfile> = {};

    for (const field of SELF_SERVICE_ALLOWED_FIELDS) {
      if (dto[field] !== undefined) {
        (updateData as Record<string, unknown>)[field] = dto[field];
      }
    }

    // Güncelleme
    Object.assign(profile, updateData);
    profile.updaterId = context.userId;

    await profile.save();
    this.logger.log(`Self-service profile update for user: ${context.userId}`);

    return this.toResponseDto(profile.toObject(), true); // Kendi profilinde hassas alanları görebilir
  }

  /**
   * Profil sil (soft delete - employmentStatus değişikliği)
   * Gerçek silme yerine terminated durumuna geçirir
   */
  async softDelete(
    userId: string,
    terminationReason: string,
    context: EmployeeProfileServiceContext
  ): Promise<EmployeeProfileResponseDto> {
    if (!context.canEditAll) {
      throw new ForbiddenException("Bu işlem için yetkiniz bulunmamaktadır");
    }

    const profile = await this.employeeProfileModel.findOne({ userId }).exec();

    if (!profile) {
      throw new NotFoundException(`Profil bulunamadı: ${userId}`);
    }

    profile.employmentStatus = EmploymentStatus.TERMINATED;
    profile.terminationDate = new Date();
    profile.terminationReason = terminationReason;
    profile.updaterId = context.userId;

    await profile.save();
    this.logger.log(`Employee profile soft-deleted for user: ${userId} by ${context.userId}`);

    return this.toResponseDto(profile.toObject(), context.canViewSensitiveData);
  }

  /**
   * Departmana göre çalışanları getir
   */
  async findByDepartment(
    departmentCode: string,
    context: EmployeeProfileServiceContext
  ): Promise<EmployeeProfileResponseDto[]> {
    const profiles = await this.employeeProfileModel
      .find({
        departmentCode,
        employmentStatus: { $ne: EmploymentStatus.TERMINATED },
      })
      .lean()
      .exec();

    return profiles.map((profile) =>
      this.toResponseDto(profile, context.canViewSensitiveData)
    );
  }

  /**
   * Yöneticiye bağlı çalışanları getir
   */
  async findByManager(
    managerUserId: string,
    context: EmployeeProfileServiceContext
  ): Promise<EmployeeProfileResponseDto[]> {
    const profiles = await this.employeeProfileModel
      .find({
        managerUserId,
        employmentStatus: { $ne: EmploymentStatus.TERMINATED },
      })
      .lean()
      .exec();

    return profiles.map((profile) =>
      this.toResponseDto(profile, context.canViewSensitiveData)
    );
  }

  /**
   * Recursive hiyerarşi - yöneticiye bağlı tüm alt çalışanları getir (tree yapısında)
   * Sadece aktif çalışanları döndürür
   */
  async getHierarchy(managerUserId: string): Promise<HierarchyResponseDto> {
    // Manager'ın profilini ve SSO bilgilerini al
    const managerProfile = await this.employeeProfileModel
      .findOne({ userId: managerUserId })
      .lean()
      .exec();

    const managerSso = await this.ssoUserModel
      .findOne({ id: managerUserId })
      .lean()
      .exec();

    if (!managerSso) {
      throw new NotFoundException(`Yönetici bulunamadı: ${managerUserId}`);
    }

    // Root node oluştur
    const rootNode: HierarchyNodeDto = {
      userId: managerUserId,
      userName: managerSso.name || "",
      userEmail: managerSso.email || "",
      employeeNumber: managerProfile?.employeeNumber || "",
      departmentCode: managerProfile?.departmentCode || "",
      departmentName: managerProfile?.departmentName || "",
      titleCode: managerProfile?.titleCode || "",
      titleName: managerProfile?.titleName || "",
      location: managerProfile?.location || "",
      employmentStatus: managerProfile?.employmentStatus || EmploymentStatus.ACTIVE,
      level: 0,
      subordinates: [],
    };

    // Recursive olarak alt çalışanları bul
    let totalCount = 1;
    const buildSubordinates = async (
      parentUserId: string,
      level: number
    ): Promise<HierarchyNodeDto[]> => {
      const subordinateProfiles = await this.employeeProfileModel
        .find({
          managerUserId: parentUserId,
          employmentStatus: EmploymentStatus.ACTIVE,
        })
        .lean()
        .exec();

      const subordinateUserIds = subordinateProfiles.map((p) => p.userId);
      const subordinateSsoUsers = await this.ssoUserModel
        .find({ id: { $in: subordinateUserIds } })
        .lean()
        .exec();

      const ssoMap = new Map(subordinateSsoUsers.map((u) => [u.id, u]));

      const nodes: HierarchyNodeDto[] = [];

      for (const profile of subordinateProfiles) {
        const sso = ssoMap.get(profile.userId);
        totalCount++;

        const node: HierarchyNodeDto = {
          userId: profile.userId,
          userName: sso?.name || "",
          userEmail: sso?.email || "",
          employeeNumber: profile.employeeNumber || "",
          departmentCode: profile.departmentCode || "",
          departmentName: profile.departmentName || "",
          titleCode: profile.titleCode || "",
          titleName: profile.titleName || "",
          location: profile.location || "",
          employmentStatus: profile.employmentStatus,
          level: level + 1,
          subordinates: await buildSubordinates(profile.userId, level + 1),
        };

        nodes.push(node);
      }

      return nodes;
    };

    rootNode.subordinates = await buildSubordinates(managerUserId, 0);

    return {
      root: rootNode,
      totalCount,
    };
  }

  /**
   * Recursive hiyerarşi - yöneticiye bağlı tüm alt çalışanları flat liste olarak getir
   * Sadece aktif çalışanları döndürür
   */
  async getHierarchyFlat(managerUserId: string): Promise<FlatHierarchyResponseDto> {
    const result: FlatHierarchyNodeDto[] = [];

    // Manager'ın SSO bilgilerini al
    const managerSso = await this.ssoUserModel
      .findOne({ id: managerUserId })
      .lean()
      .exec();

    if (!managerSso) {
      throw new NotFoundException(`Yönetici bulunamadı: ${managerUserId}`);
    }

    // Recursive olarak alt çalışanları bul
    const collectSubordinates = async (
      parentUserId: string,
      parentName: string,
      level: number
    ): Promise<void> => {
      const subordinateProfiles = await this.employeeProfileModel
        .find({
          managerUserId: parentUserId,
          employmentStatus: EmploymentStatus.ACTIVE,
        })
        .lean()
        .exec();

      const subordinateUserIds = subordinateProfiles.map((p) => p.userId);
      const subordinateSsoUsers = await this.ssoUserModel
        .find({ id: { $in: subordinateUserIds } })
        .lean()
        .exec();

      const ssoMap = new Map(subordinateSsoUsers.map((u) => [u.id, u]));

      for (const profile of subordinateProfiles) {
        const sso = ssoMap.get(profile.userId);
        const userName = sso?.name || "";

        result.push({
          userId: profile.userId,
          userName,
          userEmail: sso?.email || "",
          employeeNumber: profile.employeeNumber || "",
          departmentCode: profile.departmentCode || "",
          departmentName: profile.departmentName || "",
          titleCode: profile.titleCode || "",
          titleName: profile.titleName || "",
          location: profile.location || "",
          employmentStatus: profile.employmentStatus,
          managerUserId: parentUserId,
          managerName: parentName,
          level,
        });

        // Alt çalışanları recursive olarak topla
        await collectSubordinates(profile.userId, userName, level + 1);
      }
    };

    await collectSubordinates(managerUserId, managerSso.name || "", 1);

    return {
      data: result,
      totalCount: result.length,
    };
  }

  /**
   * Profil var mı kontrol et
   */
  async exists(userId: string): Promise<boolean> {
    const count = await this.employeeProfileModel.countDocuments({ userId }).exec();
    return count > 0;
  }

  /**
   * Toplu profil oluştur (backfill için)
   */
  async bulkCreate(
    userIds: string[],
    context: EmployeeProfileServiceContext
  ): Promise<{ created: number; skipped: number; errors: string[] }> {
    if (!context.canEditAll) {
      throw new ForbiddenException("Bu işlem için yetkiniz bulunmamaktadır");
    }

    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const userId of userIds) {
      try {
        const exists = await this.exists(userId);
        if (exists) {
          skipped++;
          continue;
        }

        // SSO'da kullanıcı var mı kontrol et
        const ssoUser = await this.ssoUserModel.findOne({ id: userId }).lean().exec();
        if (!ssoUser) {
          errors.push(`SSO kullanıcısı bulunamadı: ${userId}`);
          continue;
        }

        const profile = new this.employeeProfileModel({
          userId,
          employmentStatus: ssoUser.isActive
            ? EmploymentStatus.ACTIVE
            : EmploymentStatus.INACTIVE,
          creatorId: context.userId,
          updaterId: context.userId,
        });

        await profile.save();
        created++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push(`${userId}: ${errorMessage}`);
      }
    }

    this.logger.log(
      `Bulk create completed: created=${created}, skipped=${skipped}, errors=${errors.length}`
    );

    return { created, skipped, errors };
  }

  /**
   * İstatistikler
   */
  async getStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byDepartment: { code: string; name: string; count: number }[];
  }> {
    const [total, statusAgg, deptAgg] = await Promise.all([
      this.employeeProfileModel.countDocuments().exec(),
      this.employeeProfileModel.aggregate([
        { $group: { _id: "$employmentStatus", count: { $sum: 1 } } },
      ]),
      this.employeeProfileModel.aggregate([
        {
          $match: {
            employmentStatus: { $ne: EmploymentStatus.TERMINATED },
            departmentCode: { $ne: "" },
          },
        },
        {
          $group: {
            _id: "$departmentCode",
            name: { $first: "$departmentName" },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]),
    ]);

    const byStatus: Record<string, number> = {};
    for (const item of statusAgg) {
      byStatus[item._id || "unknown"] = item.count;
    }

    const byDepartment = deptAgg.map((item) => ({
      code: item._id,
      name: item.name || item._id,
      count: item.count,
    }));

    return { total, byStatus, byDepartment };
  }

  /**
   * Profili response DTO'ya dönüştür ve hassas alanları maskele
   */
  private toResponseDto(
    profile: EmployeeProfile,
    canViewSensitiveData: boolean
  ): EmployeeProfileResponseDto {
    return {
      _id: (profile as EmployeeProfileDocument)._id?.toString() || "",
      userId: profile.userId,
      employeeNumber: profile.employeeNumber || "",
      departmentCode: profile.departmentCode || "",
      departmentName: profile.departmentName || "",
      titleCode: profile.titleCode || "",
      titleName: profile.titleName || "",
      managerUserId: profile.managerUserId || "",
      location: profile.location || "",
      workType: profile.workType,
      nationalId: maskNationalId(profile.nationalId || "", canViewSensitiveData),
      birthDate: profile.birthDate,
      gender: profile.gender,
      address: {
        street: profile.address?.street || "",
        city: profile.address?.city || "",
        district: profile.address?.district || "",
        postalCode: profile.address?.postalCode || "",
        country: profile.address?.country || "",
      },
      emergencyContact: {
        name: profile.emergencyContact?.name || "",
        phone: profile.emergencyContact?.phone || "",
        relationship: profile.emergencyContact?.relationship || "",
      },
      hireDate: profile.hireDate,
      contractType: profile.contractType,
      probationEndDate: profile.probationEndDate,
      payrollGroup: profile.payrollGroup || "",
      seniorityStartDate: profile.seniorityStartDate,
      employmentStatus: profile.employmentStatus,
      terminationDate: profile.terminationDate,
      terminationReason: profile.terminationReason || "",
      iban: canViewSensitiveData ? profile.iban : maskIban(profile.iban || "", false),
      salary: canViewSensitiveData ? profile.salary : undefined,
      salaryCurrency: canViewSensitiveData ? profile.salaryCurrency : undefined,
      notes: profile.notes || "",
      creatorId: profile.creatorId,
      updaterId: profile.updaterId,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  /**
   * Lookup alanlarını doğrula (departman, ünvan, lokasyon)
   */
  private async validateLookupFields(
    dto: CreateEmployeeProfileDto | UpdateEmployeeProfileDto
  ): Promise<void> {
    // Departman kodu doğrulama
    if (dto.departmentCode) {
      const department = await this.orgDepartmentModel
        .findOne({ code: dto.departmentCode, isActive: true })
        .lean()
        .exec();

      if (!department) {
        throw new BadRequestException(
          `Geçersiz veya pasif departman kodu: ${dto.departmentCode}`
        );
      }

      // Departman adını otomatik doldur
      if (!dto.departmentName) {
        (dto as CreateEmployeeProfileDto).departmentName = department.name;
      }
    }

    // Ünvan kodu doğrulama
    if (dto.titleCode) {
      const title = await this.orgTitleModel
        .findOne({ code: dto.titleCode, isActive: true })
        .lean()
        .exec();

      if (!title) {
        throw new BadRequestException(`Geçersiz veya pasif ünvan kodu: ${dto.titleCode}`);
      }

      // Ünvan adını otomatik doldur
      if (!dto.titleName) {
        (dto as CreateEmployeeProfileDto).titleName = title.name;
      }
    }

    // Lokasyon doğrulama
    if (dto.location) {
      const location = await this.orgLocationModel
        .findOne({ name: dto.location, isActive: true })
        .lean()
        .exec();

      if (!location) {
        throw new BadRequestException(`Geçersiz veya pasif lokasyon: ${dto.location}`);
      }
    }

    // Manager userId doğrulama (SSO'da var mı)
    if (dto.managerUserId) {
      const manager = await this.ssoUserModel
        .findOne({ id: dto.managerUserId })
        .lean()
        .exec();

      if (!manager) {
        throw new BadRequestException(
          `Yönetici kullanıcı bulunamadı: ${dto.managerUserId}`
        );
      }
    }
  }

  /**
   * Manager atamasında döngü (cycle) kontrolü
   * A -> B -> C -> A gibi döngüsel hiyerarşi oluşmasını engeller
   */
  private async validateManagerAssignment(
    userId: string,
    managerUserId: string
  ): Promise<void> {
    if (!managerUserId) return;

    // Kendini manager olarak atama kontrolü
    if (userId === managerUserId) {
      throw new BadRequestException("Bir çalışan kendi yöneticisi olamaz");
    }

    // Döngü kontrolü: manager'ın üst hiyerarşisinde userId var mı?
    const visited = new Set<string>();
    let currentManagerId: string | undefined = managerUserId;

    while (currentManagerId) {
      // Döngü tespit edildi
      if (currentManagerId === userId) {
        throw new BadRequestException(
          "Bu atama döngüsel bir hiyerarşi oluşturacaktır. Yönetici zincirinde döngü tespit edildi."
        );
      }

      // Sonsuz döngü koruması
      if (visited.has(currentManagerId)) {
        break;
      }
      visited.add(currentManagerId);

      // Bir üst manager'ı bul
      const managerProfile = await this.employeeProfileModel
        .findOne({ userId: currentManagerId })
        .lean()
        .exec();

      currentManagerId = managerProfile?.managerUserId || undefined;
    }
  }
}
