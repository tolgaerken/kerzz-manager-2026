import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { ForbiddenException, BadRequestException, NotFoundException } from "@nestjs/common";
import { Model } from "mongoose";
import { EmployeeProfileService, EmployeeProfileServiceContext } from "./employee-profile.service";
import {
  EmployeeProfile,
  EmployeeProfileDocument,
  EmploymentStatus,
  WorkType,
} from "./schemas/employee-profile.schema";
import { SsoUser, SsoUserDocument } from "../sso/schemas";
import { SSO_DB_CONNECTION } from "../../database";
import { CreateEmployeeProfileDto, UpdateSelfProfileDto } from "./dto";

describe("EmployeeProfileService", () => {
  let service: EmployeeProfileService;
  let employeeProfileModel: Model<EmployeeProfileDocument>;
  let ssoUserModel: Model<SsoUserDocument>;

  // Mock data
  const mockUserId = "test-user-123";
  const mockAdminUserId = "admin-user-456";

  const mockSsoUser = {
    id: mockUserId,
    name: "Test User",
    email: "test@example.com",
    phone: "5551234567",
    isActive: true,
  };

  const mockEmployeeProfile = {
    _id: "profile-id-123",
    userId: mockUserId,
    employeeNumber: "EMP001",
    departmentCode: "IT",
    departmentName: "Bilgi Teknolojileri",
    titleCode: "DEV",
    titleName: "Yazılım Geliştirici",
    managerUserId: "",
    location: "İstanbul",
    workType: WorkType.FULL_TIME,
    nationalId: "12345678901",
    address: {
      street: "Test Sokak",
      city: "İstanbul",
      district: "Kadıköy",
      postalCode: "34000",
      country: "Türkiye",
    },
    emergencyContact: {
      name: "Acil Kişi",
      phone: "5559876543",
      relationship: "Eş",
    },
    iban: "TR123456789012345678901234",
    salary: 50000,
    salaryCurrency: "TRY",
    employmentStatus: EmploymentStatus.ACTIVE,
    notes: "Test notu",
    creatorId: mockAdminUserId,
    updaterId: mockAdminUserId,
    createdAt: new Date(),
    updatedAt: new Date(),
    save: jest.fn().mockResolvedValue(true),
    toObject: jest.fn().mockReturnThis(),
  };

  // Context helpers
  const adminContext: EmployeeProfileServiceContext = {
    userId: mockAdminUserId,
    isAdmin: true,
    canViewSensitiveData: true,
    canEditAll: true,
  };

  const selfServiceContext: EmployeeProfileServiceContext = {
    userId: mockUserId,
    isAdmin: false,
    canViewSensitiveData: false,
    canEditAll: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeProfileService,
        {
          provide: getModelToken(EmployeeProfile.name, SSO_DB_CONNECTION),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            countDocuments: jest.fn(),
            aggregate: jest.fn(),
            new: jest.fn().mockResolvedValue(mockEmployeeProfile),
            constructor: jest.fn().mockResolvedValue(mockEmployeeProfile),
            create: jest.fn(),
          },
        },
        {
          provide: getModelToken(SsoUser.name, SSO_DB_CONNECTION),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EmployeeProfileService>(EmployeeProfileService);
    employeeProfileModel = module.get<Model<EmployeeProfileDocument>>(
      getModelToken(EmployeeProfile.name, SSO_DB_CONNECTION)
    );
    ssoUserModel = module.get<Model<SsoUserDocument>>(
      getModelToken(SsoUser.name, SSO_DB_CONNECTION)
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findByUserId", () => {
    it("should return profile with masked sensitive data for non-admin", async () => {
      jest.spyOn(employeeProfileModel, "findOne").mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockEmployeeProfile),
        }),
      } as unknown as ReturnType<typeof employeeProfileModel.findOne>);

      jest.spyOn(ssoUserModel, "findOne").mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockSsoUser),
        }),
      } as unknown as ReturnType<typeof ssoUserModel.findOne>);

      const result = await service.findByUserId(mockUserId, {
        ...selfServiceContext,
        userId: "other-user", // Başka bir kullanıcı olarak sorgula
      });

      expect(result).toBeDefined();
      // nationalId maskelenmiş olmalı
      expect(result?.nationalId).not.toBe(mockEmployeeProfile.nationalId);
      expect(result?.nationalId).toContain("*");
    });

    it("should return profile with full sensitive data for admin", async () => {
      jest.spyOn(employeeProfileModel, "findOne").mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockEmployeeProfile),
        }),
      } as unknown as ReturnType<typeof employeeProfileModel.findOne>);

      jest.spyOn(ssoUserModel, "findOne").mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockSsoUser),
        }),
      } as unknown as ReturnType<typeof ssoUserModel.findOne>);

      const result = await service.findByUserId(mockUserId, adminContext);

      expect(result).toBeDefined();
      // nationalId tam gösterilmeli
      expect(result?.nationalId).toBe(mockEmployeeProfile.nationalId);
      expect(result?.salary).toBe(mockEmployeeProfile.salary);
    });

    it("should return null for non-existent profile", async () => {
      jest.spyOn(employeeProfileModel, "findOne").mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      } as unknown as ReturnType<typeof employeeProfileModel.findOne>);

      const result = await service.findByUserId("non-existent", adminContext);

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should throw ForbiddenException for non-admin", async () => {
      const createDto: CreateEmployeeProfileDto = {
        userId: "new-user-123",
        employeeNumber: "EMP002",
      };

      await expect(service.create(createDto, selfServiceContext)).rejects.toThrow(
        ForbiddenException
      );
    });

    it("should throw BadRequestException if user not found in SSO", async () => {
      jest.spyOn(ssoUserModel, "findOne").mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      } as unknown as ReturnType<typeof ssoUserModel.findOne>);

      const createDto: CreateEmployeeProfileDto = {
        userId: "non-existent-user",
      };

      await expect(service.create(createDto, adminContext)).rejects.toThrow(
        BadRequestException
      );
    });

    it("should throw BadRequestException if profile already exists", async () => {
      jest.spyOn(ssoUserModel, "findOne").mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockSsoUser),
        }),
      } as unknown as ReturnType<typeof ssoUserModel.findOne>);

      jest.spyOn(employeeProfileModel, "findOne").mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockEmployeeProfile),
        }),
      } as unknown as ReturnType<typeof employeeProfileModel.findOne>);

      const createDto: CreateEmployeeProfileDto = {
        userId: mockUserId,
      };

      await expect(service.create(createDto, adminContext)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe("update", () => {
    it("should throw ForbiddenException for non-admin", async () => {
      await expect(
        service.update(mockUserId, { departmentCode: "HR" }, selfServiceContext)
      ).rejects.toThrow(ForbiddenException);
    });

    it("should throw NotFoundException if profile not found", async () => {
      jest.spyOn(employeeProfileModel, "findOne").mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as unknown as ReturnType<typeof employeeProfileModel.findOne>);

      await expect(
        service.update("non-existent", { departmentCode: "HR" }, adminContext)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("updateMyProfile (self-service)", () => {
    it("should only update allowed fields", async () => {
      const mockProfileInstance = {
        ...mockEmployeeProfile,
        save: jest.fn().mockResolvedValue(true),
        toObject: jest.fn().mockReturnValue(mockEmployeeProfile),
      };

      jest.spyOn(employeeProfileModel, "findOne").mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProfileInstance),
      } as unknown as ReturnType<typeof employeeProfileModel.findOne>);

      const updateDto: UpdateSelfProfileDto = {
        address: {
          city: "Ankara",
        },
        emergencyContact: {
          name: "Yeni Acil Kişi",
        },
        iban: "TR999999999999999999999999",
      };

      await service.updateMyProfile(updateDto, selfServiceContext);

      // save çağrılmalı
      expect(mockProfileInstance.save).toHaveBeenCalled();
    });

    it("should throw NotFoundException if own profile not found", async () => {
      jest.spyOn(employeeProfileModel, "findOne").mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as unknown as ReturnType<typeof employeeProfileModel.findOne>);

      const updateDto: UpdateSelfProfileDto = {
        iban: "TR123",
      };

      await expect(service.updateMyProfile(updateDto, selfServiceContext)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("softDelete", () => {
    it("should throw ForbiddenException for non-admin", async () => {
      await expect(
        service.softDelete(mockUserId, "Test reason", selfServiceContext)
      ).rejects.toThrow(ForbiddenException);
    });

    it("should set employmentStatus to TERMINATED", async () => {
      const mockProfileInstance = {
        ...mockEmployeeProfile,
        employmentStatus: EmploymentStatus.ACTIVE,
        save: jest.fn().mockResolvedValue(true),
        toObject: jest.fn().mockReturnValue({
          ...mockEmployeeProfile,
          employmentStatus: EmploymentStatus.TERMINATED,
        }),
      };

      jest.spyOn(employeeProfileModel, "findOne").mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProfileInstance),
      } as unknown as ReturnType<typeof employeeProfileModel.findOne>);

      const result = await service.softDelete(mockUserId, "İstifa", adminContext);

      expect(mockProfileInstance.employmentStatus).toBe(EmploymentStatus.TERMINATED);
      expect(mockProfileInstance.save).toHaveBeenCalled();
    });
  });

  describe("maskNationalId helper", () => {
    it("should mask national ID correctly", () => {
      // Bu test için response dto'daki fonksiyonu import edip test edebiliriz
      // Burada basit bir örnek:
      const { maskNationalId } = require("./dto/employee-profile-response.dto");

      expect(maskNationalId("12345678901", false)).toBe("123*****01");
      expect(maskNationalId("12345678901", true)).toBe("12345678901");
      expect(maskNationalId("", false)).toBe("");
    });
  });

  describe("maskIban helper", () => {
    it("should mask IBAN correctly", () => {
      const { maskIban } = require("./dto/employee-profile-response.dto");

      expect(maskIban("TR123456789012345678901234", false)).toContain("****");
      expect(maskIban("TR123456789012345678901234", false)).toMatch(/\*+1234$/);
      expect(maskIban("TR123456789012345678901234", true)).toBe("TR123456789012345678901234");
      expect(maskIban("", false)).toBe("");
    });
  });
});
