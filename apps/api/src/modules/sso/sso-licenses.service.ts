import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CONTRACT_DB_CONNECTION } from "../../database";
import { SsoLicense, SsoLicenseDocument } from "./schemas";

export interface LicenseSearchParams {
  brand?: string;
  isActive?: boolean;
  search?: string;
  limit?: number;
  skip?: number;
}

@Injectable()
export class SsoLicensesService {
  private readonly logger = new Logger(SsoLicensesService.name);

  constructor(
    @InjectModel(SsoLicense.name, CONTRACT_DB_CONNECTION)
    private readonly ssoLicenseModel: Model<SsoLicenseDocument>
  ) {}

  /**
   * Get all licenses
   */
  async getLicenses(params?: LicenseSearchParams): Promise<SsoLicense[]> {
    const filter: Record<string, unknown> = {};

    if (params?.isActive !== undefined) {
      filter.isActive = params.isActive;
    }

    if (params?.brand) {
      filter.brand = { $regex: params.brand, $options: "i" };
    }

    if (params?.search) {
      filter.$or = [
        { brand: { $regex: params.search, $options: "i" } },
        { companyName: { $regex: params.search, $options: "i" } },
        { taxNumber: { $regex: params.search, $options: "i" } }
      ];
    }

    let query = this.ssoLicenseModel.find(filter).sort({ brand: 1 });

    if (params?.skip) {
      query = query.skip(params.skip);
    }

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    return query.lean().exec();
  }

  /**
   * Get a license by ID
   */
  async getLicenseById(licenseId: string): Promise<SsoLicense | null> {
    return this.ssoLicenseModel
      .findOne({ $or: [{ id: licenseId }, { licanceId: licenseId }] })
      .lean()
      .exec();
  }

  /**
   * Get licenses by brand
   */
  async getLicensesByBrand(brand: string): Promise<SsoLicense[]> {
    return this.ssoLicenseModel
      .find({ brand: { $regex: brand, $options: "i" }, isActive: true })
      .lean()
      .exec();
  }

  /**
   * Search licenses
   */
  async searchLicenses(query: string, limit = 20): Promise<SsoLicense[]> {
    const searchRegex = new RegExp(query, "i");

    return this.ssoLicenseModel
      .find({
        $or: [
          { brand: searchRegex },
          { companyName: searchRegex },
          { taxNumber: searchRegex },
          { email: searchRegex },
          { phone: searchRegex }
        ],
        isActive: true
      })
      .limit(limit)
      .lean()
      .exec();
  }

  /**
   * Get license count
   */
  async getLicenseCount(params?: LicenseSearchParams): Promise<number> {
    const filter: Record<string, unknown> = {};

    if (params?.isActive !== undefined) {
      filter.isActive = params.isActive;
    }

    if (params?.brand) {
      filter.brand = { $regex: params.brand, $options: "i" };
    }

    return this.ssoLicenseModel.countDocuments(filter).exec();
  }
}
