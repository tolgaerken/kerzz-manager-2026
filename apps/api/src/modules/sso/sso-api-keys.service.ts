import { Injectable, Logger, NotFoundException, ConflictException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { SSO_DB_CONNECTION } from "../../database";
import { SsoApiKey, SsoApiKeyDocument } from "./schemas";

export interface CreateApiKeyDto {
  app_id: string;
  name: string;
  description?: string;
  api_key?: string; // If not provided, will be generated
}

export interface UpdateApiKeyDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

@Injectable()
export class SsoApiKeysService {
  private readonly logger = new Logger(SsoApiKeysService.name);

  constructor(
    @InjectModel(SsoApiKey.name, SSO_DB_CONNECTION)
    private readonly ssoApiKeyModel: Model<SsoApiKeyDocument>
  ) {}

  /**
   * Generate a random API key
   */
  private generateApiKey(): string {
    const segments = [
      uuidv4().split("-").slice(0, 2).join("-"),
      "kerzz",
      uuidv4().split("-").slice(2, 4).join("-"),
      uuidv4().split("-")[4]
    ];
    return `${segments[0]}-${segments[1]}-${segments[2]}!?@${segments[3].slice(0, 4)}!${segments[3].slice(4, 8)}**${segments[3].slice(8)}`;
  }

  /**
   * Get all API keys
   */
  async getApiKeys(): Promise<SsoApiKey[]> {
    return this.ssoApiKeyModel.find({ isActive: { $ne: false } }).sort({ name: 1 }).lean().exec();
  }

  /**
   * Get API keys by application ID
   */
  async getApiKeysByApp(appId: string): Promise<SsoApiKey[]> {
    return this.ssoApiKeyModel
      .find({ app_id: appId, isActive: { $ne: false } })
      .sort({ name: 1 })
      .lean()
      .exec();
  }

  /**
   * Get an API key by ID
   */
  async getApiKeyById(apiKeyId: string): Promise<SsoApiKey | null> {
    return this.ssoApiKeyModel.findOne({ id: apiKeyId }).lean().exec();
  }

  /**
   * Get an API key by key value
   */
  async getApiKeyByKey(apiKey: string): Promise<SsoApiKey | null> {
    return this.ssoApiKeyModel.findOne({ api_key: apiKey, isActive: { $ne: false } }).lean().exec();
  }

  /**
   * Create a new API key
   */
  async createApiKey(dto: CreateApiKeyDto): Promise<SsoApiKey> {
    // Check if name already exists for this app
    const existing = await this.ssoApiKeyModel
      .findOne({ app_id: dto.app_id, name: dto.name })
      .lean()
      .exec();

    if (existing) {
      throw new ConflictException("Bu uygulama için bu isimde bir API anahtarı zaten mevcut");
    }

    const apiKey = new this.ssoApiKeyModel({
      id: uuidv4(),
      app_id: dto.app_id,
      name: dto.name,
      description: dto.description,
      api_key: dto.api_key || this.generateApiKey(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await apiKey.save();
    return apiKey.toObject();
  }

  /**
   * Update an API key
   */
  async updateApiKey(apiKeyId: string, dto: UpdateApiKeyDto): Promise<SsoApiKey> {
    const apiKey = await this.ssoApiKeyModel.findOne({ id: apiKeyId }).exec();

    if (!apiKey) {
      throw new NotFoundException("API anahtarı bulunamadı");
    }

    if (dto.name !== undefined) apiKey.name = dto.name;
    if (dto.description !== undefined) apiKey.description = dto.description;
    if (dto.isActive !== undefined) apiKey.isActive = dto.isActive;
    apiKey.updatedAt = new Date();

    await apiKey.save();
    return apiKey.toObject();
  }

  /**
   * Delete an API key (soft delete)
   */
  async deleteApiKey(apiKeyId: string): Promise<void> {
    const result = await this.ssoApiKeyModel.updateOne(
      { id: apiKeyId },
      { $set: { isActive: false, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      throw new NotFoundException("API anahtarı bulunamadı");
    }
  }

  /**
   * Regenerate API key
   */
  async regenerateApiKey(apiKeyId: string): Promise<SsoApiKey> {
    const apiKey = await this.ssoApiKeyModel.findOne({ id: apiKeyId }).exec();

    if (!apiKey) {
      throw new NotFoundException("API anahtarı bulunamadı");
    }

    apiKey.api_key = this.generateApiKey();
    apiKey.updatedAt = new Date();

    await apiKey.save();
    return apiKey.toObject();
  }
}
