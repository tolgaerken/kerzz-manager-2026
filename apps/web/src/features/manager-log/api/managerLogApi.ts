import { apiGet, apiPost, apiPatch } from "../../../lib/apiClient";
import { MANAGER_LOG_CONSTANTS } from "../constants/manager-log.constants";
import type { LogQueryParams, LogsResponse, Log, CreateLogInput, PipelineLogsResponse } from "../types";

const { API_BASE_URL, ENDPOINTS } = MANAGER_LOG_CONSTANTS;

function buildQueryString(params: LogQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.customerId) searchParams.set("customerId", params.customerId);
  if (params.contextType) searchParams.set("contextType", params.contextType);
  if (params.contextId) searchParams.set("contextId", params.contextId);
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());

  return searchParams.toString();
}

/** Son log tarihleri response tipi */
export type LastByContextsResponse = Record<string, string>;

/** Context sorgusu için yapı */
export interface ContextQuery {
  type: string;
  ids: string[];
}

/** Son log tarihleri sorgusu için parametreler */
export interface LastByContextsParams {
  /** Sorgulanacak context'ler listesi */
  contexts: ContextQuery[];
  /** Legacy loglar için contractId'ler (opsiyonel) */
  legacyContractIds?: string[];
  /** Legacy loglar için customerId'ler (opsiyonel) */
  legacyCustomerIds?: string[];
  /** Legacy logları dahil et (varsayılan: true) */
  includeLegacy?: boolean;
  /** Sonuçları hangi ID ile grupla */
  groupByField?: "contractId" | "customerId";
}

// Query key factory
export const managerLogKeys = {
  all: ["manager-logs"] as const,
  lists: () => [...managerLogKeys.all, "list"] as const,
  list: (params: LogQueryParams) => [...managerLogKeys.lists(), params] as const,
  details: () => [...managerLogKeys.all, "detail"] as const,
  detail: (id: string) => [...managerLogKeys.details(), id] as const,
  pipeline: (pipelineRef: string) => [...managerLogKeys.all, "pipeline", pipelineRef] as const,
  lastByContexts: (params: LastByContextsParams) => {
    // Query key için deterministik bir hash oluştur
    const contextKey = params.contexts
      .map((c) => `${c.type}:${c.ids.slice().sort().join(",")}`)
      .join("|");
    const legacyContractKey = params.legacyContractIds?.slice().sort().join(",") || "";
    const legacyCustomerKey = params.legacyCustomerIds?.slice().sort().join(",") || "";
    return [
      ...managerLogKeys.all,
      "last-by-contexts",
      contextKey,
      legacyContractKey,
      legacyCustomerKey,
      params.includeLegacy ?? true,
      params.groupByField ?? "contractId",
    ] as const;
  },
};

// Logları getir
export async function fetchManagerLogs(params: LogQueryParams = {}): Promise<LogsResponse> {
  const queryString = buildQueryString(params);
  const url = `${API_BASE_URL}${ENDPOINTS.LOGS}${queryString ? `?${queryString}` : ""}`;
  return apiGet<LogsResponse>(url);
}

// Tek log getir
export async function fetchManagerLogById(id: string): Promise<Log> {
  const url = `${API_BASE_URL}${ENDPOINTS.LOGS}/${id}`;
  return apiGet<Log>(url);
}

// Yeni log oluştur
export async function createManagerLog(data: CreateLogInput): Promise<Log> {
  const url = `${API_BASE_URL}${ENDPOINTS.LOGS}`;
  return apiPost<Log>(url, data);
}

// Hatırlatmayı tamamlandı olarak işaretle
export async function markManagerLogReminderCompleted(id: string): Promise<Log> {
  const url = `${API_BASE_URL}${ENDPOINTS.LOGS}/${id}/reminder/complete`;
  return apiPatch<Log>(url);
}

// Pipeline loglarını getir (lead/offer/sale zinciri)
export async function fetchPipelineLogs(pipelineRef: string): Promise<PipelineLogsResponse> {
  const url = `${API_BASE_URL}${ENDPOINTS.LOGS}/pipeline/${encodeURIComponent(pipelineRef)}`;
  return apiGet<PipelineLogsResponse>(url);
}

/**
 * Bir array'i belirli boyutlarda chunk'lara böler.
 */
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Tek bir chunk için API isteği yapar.
 */
async function fetchLastLogDatesChunk(
  params: LastByContextsParams
): Promise<LastByContextsResponse> {
  const url = `${API_BASE_URL}${ENDPOINTS.LOGS}/last-by-contexts`;
  return apiPost<LastByContextsResponse>(url, params);
}

// Body-parser limiti 100KB, güvenli bir chunk boyutu kullan
// Her ID ortalama 24 karakter (MongoDB ObjectId), JSON overhead ile ~30 byte
// 500 ID * 30 byte = ~15KB per context, güvenli margin ile 300 ID
const CHUNK_SIZE = 300;

/**
 * Birden fazla context için son log tarihlerini batch olarak getirir.
 * Çoklu context tipi ve legacy log desteği sağlar.
 * Büyük veri setleri için otomatik chunking yapar.
 *
 * @param params - Sorgu parametreleri
 * @returns { [entityId]: ISO date string }
 */
export async function fetchLastLogDatesByContexts(
  params: LastByContextsParams
): Promise<LastByContextsResponse> {
  // Hiçbir ID yoksa boş döndür
  const hasContextIds = params.contexts.some((c) => c.ids.length > 0);
  const hasLegacyIds =
    (params.legacyContractIds && params.legacyContractIds.length > 0) ||
    (params.legacyCustomerIds && params.legacyCustomerIds.length > 0);

  if (!hasContextIds && !hasLegacyIds) {
    return {};
  }

  // Toplam ID sayısını hesapla
  const totalContextIds = params.contexts.reduce((sum, c) => sum + c.ids.length, 0);
  const totalLegacyContractIds = params.legacyContractIds?.length ?? 0;
  const totalLegacyCustomerIds = params.legacyCustomerIds?.length ?? 0;
  const totalIds = totalContextIds + totalLegacyContractIds + totalLegacyCustomerIds;

  // Küçük veri setleri için tek istek yap
  if (totalIds <= CHUNK_SIZE) {
    return fetchLastLogDatesChunk(params);
  }

  // Büyük veri setleri için chunking uygula
  const allResults: LastByContextsResponse = {};
  const requests: Promise<LastByContextsResponse>[] = [];

  // Context'leri chunk'la
  for (const context of params.contexts) {
    if (context.ids.length === 0) continue;

    const idChunks = chunkArray(context.ids, CHUNK_SIZE);
    for (const chunk of idChunks) {
      requests.push(
        fetchLastLogDatesChunk({
          contexts: [{ type: context.type, ids: chunk }],
          includeLegacy: false, // Legacy'yi ayrı chunk'larda işle
          groupByField: params.groupByField,
        })
      );
    }
  }

  // Legacy contractId'leri chunk'la
  if (params.legacyContractIds && params.legacyContractIds.length > 0) {
    const contractChunks = chunkArray(params.legacyContractIds, CHUNK_SIZE);
    for (const chunk of contractChunks) {
      requests.push(
        fetchLastLogDatesChunk({
          contexts: [],
          legacyContractIds: chunk,
          includeLegacy: true,
          groupByField: params.groupByField,
        })
      );
    }
  }

  // Legacy customerId'leri chunk'la
  if (params.legacyCustomerIds && params.legacyCustomerIds.length > 0) {
    const customerChunks = chunkArray(params.legacyCustomerIds, CHUNK_SIZE);
    for (const chunk of customerChunks) {
      requests.push(
        fetchLastLogDatesChunk({
          contexts: [],
          legacyCustomerIds: chunk,
          includeLegacy: true,
          groupByField: params.groupByField,
        })
      );
    }
  }

  // Tüm istekleri paralel olarak çalıştır
  const results = await Promise.all(requests);

  // Sonuçları birleştir (en yeni tarihi al)
  for (const result of results) {
    for (const [entityId, dateStr] of Object.entries(result)) {
      const existingDate = allResults[entityId];
      if (!existingDate || dateStr > existingDate) {
        allResults[entityId] = dateStr;
      }
    }
  }

  return allResults;
}
