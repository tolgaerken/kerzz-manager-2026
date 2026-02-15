import { Test, TestingModule } from "@nestjs/testing";
import { EmployeeProfileController } from "./employee-profile.controller";
import { EmployeeProfileService } from "./employee-profile.service";
import { PERMISSIONS } from "../auth/constants/permissions";
import { EmploymentStatus, WorkType } from "./schemas/employee-profile.schema";

describe("EmployeeProfileController", () => {
  let controller: EmployeeProfileController;
  let service: EmployeeProfileService;

  const mockProfile = {
    _id: "profile-123",
    userId: "user-123",
    employeeNumber: "EMP001",
    departmentCode: "IT",
    departmentName: "Bilgi Teknolojileri",
    titleCode: "DEV",
    titleName: "Yazılım Geliştirici",
    managerUserId: "",
    location: "İstanbul",
    workType: WorkType.FULL_TIME,
    nationalId: "123*****01",
    address: {
      street: "",
      city: "",
      district: "",
      postalCode: "",
      country: "",
    },
    emergencyContact: {
      name: "",
      phone: "",
      relationship: "",
    },
    employmentStatus: EmploymentStatus.ACTIVE,
    notes: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPaginatedResponse = {
    data: [mockProfile],
    meta: {
      total: 1,
      page: 1,
      limit: 50,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    },
  };

  const mockStats = {
    total: 100,
    byStatus: {
      active: 80,
      inactive: 15,
      terminated: 5,
    },
    byDepartment: [
      { code: "IT", name: "Bilgi Teknolojileri", count: 30 },
      { code: "HR", name: "İnsan Kaynakları", count: 10 },
    ],
  };

  const mockRequest = {
    user: {
      id: "admin-user-123",
      name: "Admin User",
      email: "admin@example.com",
      isAdmin: true,
      permissions: [
        PERMISSIONS.EMPLOYEE_PROFILE_MENU,
        PERMISSIONS.EMPLOYEE_PROFILE_EDIT_ALL,
        PERMISSIONS.EMPLOYEE_PROFILE_VIEW_SENSITIVE,
      ],
    },
  };

  const mockSelfServiceRequest = {
    user: {
      id: "user-123",
      name: "Regular User",
      email: "user@example.com",
      isAdmin: false,
      permissions: [PERMISSIONS.EMPLOYEE_PROFILE_EDIT_SELF],
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeProfileController],
      providers: [
        {
          provide: EmployeeProfileService,
          useValue: {
            findAll: jest.fn().mockResolvedValue(mockPaginatedResponse),
            findByUserId: jest.fn().mockResolvedValue(mockProfile),
            findMyProfile: jest.fn().mockResolvedValue(mockProfile),
            create: jest.fn().mockResolvedValue(mockProfile),
            update: jest.fn().mockResolvedValue(mockProfile),
            updateMyProfile: jest.fn().mockResolvedValue(mockProfile),
            softDelete: jest.fn().mockResolvedValue(mockProfile),
            findByDepartment: jest.fn().mockResolvedValue([mockProfile]),
            findByManager: jest.fn().mockResolvedValue([mockProfile]),
            getStats: jest.fn().mockResolvedValue(mockStats),
            bulkCreate: jest.fn().mockResolvedValue({ created: 5, skipped: 2, errors: [] }),
          },
        },
      ],
    }).compile();

    controller = module.get<EmployeeProfileController>(EmployeeProfileController);
    service = module.get<EmployeeProfileService>(EmployeeProfileService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should return paginated profiles", async () => {
      const result = await controller.findAll(mockRequest as any, {});

      expect(result).toEqual(mockPaginatedResponse);
      expect(service.findAll).toHaveBeenCalled();
    });

    it("should pass query parameters to service", async () => {
      const query = {
        page: 2,
        limit: 25,
        departmentCode: "IT",
        employmentStatus: EmploymentStatus.ACTIVE,
      };

      await controller.findAll(mockRequest as any, query);

      expect(service.findAll).toHaveBeenCalledWith(
        query,
        expect.objectContaining({
          userId: mockRequest.user.id,
          isAdmin: true,
          canViewSensitiveData: true,
          canEditAll: true,
        })
      );
    });
  });

  describe("getStats", () => {
    it("should return statistics", async () => {
      const result = await controller.getStats();

      expect(result).toEqual(mockStats);
      expect(service.getStats).toHaveBeenCalled();
    });
  });

  describe("findMyProfile", () => {
    it("should return own profile for self-service user", async () => {
      const result = await controller.findMyProfile(mockSelfServiceRequest as any);

      expect(result).toEqual(mockProfile);
      expect(service.findMyProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockSelfServiceRequest.user.id,
        })
      );
    });
  });

  describe("updateMyProfile", () => {
    it("should update own profile with allowed fields", async () => {
      const updateDto = {
        address: { city: "Ankara" },
        iban: "TR999999999999999999999999",
      };

      const result = await controller.updateMyProfile(mockSelfServiceRequest as any, updateDto);

      expect(result).toEqual(mockProfile);
      expect(service.updateMyProfile).toHaveBeenCalledWith(
        updateDto,
        expect.objectContaining({
          userId: mockSelfServiceRequest.user.id,
        })
      );
    });
  });

  describe("findByUserId", () => {
    it("should return profile by userId", async () => {
      const result = await controller.findByUserId(mockRequest as any, "user-123");

      expect(result).toEqual(mockProfile);
      expect(service.findByUserId).toHaveBeenCalledWith(
        "user-123",
        expect.objectContaining({
          userId: mockRequest.user.id,
        })
      );
    });
  });

  describe("create", () => {
    it("should create new profile", async () => {
      const createDto = {
        userId: "new-user-456",
        employeeNumber: "EMP002",
        departmentCode: "HR",
      };

      const result = await controller.create(mockRequest as any, createDto);

      expect(result).toEqual(mockProfile);
      expect(service.create).toHaveBeenCalledWith(
        createDto,
        expect.objectContaining({
          canEditAll: true,
        })
      );
    });
  });

  describe("update", () => {
    it("should update profile", async () => {
      const updateDto = {
        departmentCode: "HR",
        titleName: "İK Uzmanı",
      };

      const result = await controller.update(mockRequest as any, "user-123", updateDto);

      expect(result).toEqual(mockProfile);
      expect(service.update).toHaveBeenCalledWith(
        "user-123",
        updateDto,
        expect.objectContaining({
          canEditAll: true,
        })
      );
    });
  });

  describe("softDelete", () => {
    it("should soft delete profile", async () => {
      const result = await controller.softDelete(mockRequest as any, "user-123", "İstifa");

      expect(result).toEqual(mockProfile);
      expect(service.softDelete).toHaveBeenCalledWith(
        "user-123",
        "İstifa",
        expect.objectContaining({
          canEditAll: true,
        })
      );
    });
  });

  describe("findByDepartment", () => {
    it("should return profiles by department", async () => {
      const result = await controller.findByDepartment(mockRequest as any, "IT");

      expect(result).toEqual([mockProfile]);
      expect(service.findByDepartment).toHaveBeenCalledWith("IT", expect.any(Object));
    });
  });

  describe("findByManager", () => {
    it("should return profiles by manager", async () => {
      const result = await controller.findByManager(mockRequest as any, "manager-123");

      expect(result).toEqual([mockProfile]);
      expect(service.findByManager).toHaveBeenCalledWith("manager-123", expect.any(Object));
    });
  });

  describe("bulkCreate", () => {
    it("should bulk create profiles", async () => {
      const userIds = ["user-1", "user-2", "user-3"];

      const result = await controller.bulkCreate(mockRequest as any, userIds);

      expect(result).toEqual({ created: 5, skipped: 2, errors: [] });
      expect(service.bulkCreate).toHaveBeenCalledWith(
        userIds,
        expect.objectContaining({
          canEditAll: true,
        })
      );
    });
  });

  describe("Permission context generation", () => {
    it("should generate correct context for admin user", async () => {
      await controller.findAll(mockRequest as any, {});

      expect(service.findAll).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          userId: "admin-user-123",
          isAdmin: true,
          canViewSensitiveData: true,
          canEditAll: true,
        })
      );
    });

    it("should generate correct context for regular user", async () => {
      await controller.findMyProfile(mockSelfServiceRequest as any);

      expect(service.findMyProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-123",
          isAdmin: false,
          canViewSensitiveData: false,
          canEditAll: false,
        })
      );
    });
  });
});
