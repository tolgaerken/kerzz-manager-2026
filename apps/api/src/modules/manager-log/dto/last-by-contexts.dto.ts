import {
  IsArray,
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

/**
 * Tek bir context tipi ve ID'leri için yapı.
 */
export class ContextQuery {
  @IsString()
  type: string;

  @IsArray()
  @IsString({ each: true })
  ids: string[];
}

/**
 * Batch olarak birden fazla context için son log tarihini sorgulamak için DTO.
 * Çoklu context tipi ve legacy log desteği sağlar.
 */
export class LastByContextsDto {
  /**
   * Sorgulanacak context'ler listesi.
   * Örnek: [{ type: "payment-plan", ids: ["id1", "id2"] }, { type: "contract", ids: ["cid1"] }]
   */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContextQuery)
  contexts: ContextQuery[];

  /**
   * Legacy loglar için contractId'ler (opsiyonel).
   * Legacy log'da contractId alanı ile eşleştirilir.
   */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  legacyContractIds?: string[];

  /**
   * Legacy loglar için customerId'ler (opsiyonel).
   * Legacy log'da customerId alanı ile eşleştirilir.
   */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  legacyCustomerIds?: string[];

  /**
   * Legacy logları dahil et (varsayılan: true).
   */
  @IsBoolean()
  @IsOptional()
  includeLegacy?: boolean;

  /**
   * Sonuçları hangi ID ile grupla.
   * "contractId" veya "customerId" olabilir.
   * Bu, frontend'in sonuçları entity'ye eşleştirmesi için kullanılır.
   */
  @IsString()
  @IsOptional()
  groupByField?: "contractId" | "customerId";
}

/**
 * Son log tarihleri response tipi.
 * Key: entityId (contextId, contractId veya customerId), Value: ISO date string
 */
export type LastByContextsResponseDto = Record<string, string>;
