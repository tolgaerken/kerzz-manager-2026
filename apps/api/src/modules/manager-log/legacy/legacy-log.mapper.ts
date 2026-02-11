import { createHash } from "crypto";
import { ManagerLogResponseDto } from "../dto";
import { LegacyLogDocument } from "./legacy-log.schema";
import { LegacyLogEntity } from "./legacy-log.types";

function toLegacyEntity(log: LegacyLogDocument): LegacyLogEntity {
  return {
    id: log.id,
    log: log.log,
    date: log.date,
    userId: log.userId,
    userName: log.userName,
    notifyUsers: log.notifyUsers,
    resolved: log.resolved,
    accountId: log.accountId,
    customerId: log.customerId,
    licenceId: log.licenceId,
    contractId: log.contractId,
    saleId: log.saleId,
    logType: log.logType,
  };
}

function normalizeContextType(logType?: string): string {
  if (!logType) return "customer";
  if (logType === "licence") return "license";
  return logType;
}

function resolveContextId(log: LegacyLogEntity, contextType: string): string {
  const fieldMap: Record<string, string | undefined> = {
    contract: log.contractId,
    license: log.licenceId,
    sale: log.saleId,
    customer: log.customerId,
  };

  return fieldMap[contextType] ?? log.customerId ?? "";
}

function buildLegacyId(log: LegacyLogEntity): string {
  if (log.id && log.id.trim().length > 0) {
    return `legacy-${log.id}`;
  }

  const raw = `${log.customerId ?? ""}|${log.contractId ?? ""}|${log.licenceId ?? ""}|${log.saleId ?? ""}|${log.date?.toISOString() ?? ""}|${log.log ?? ""}`;
  const hash = createHash("sha1").update(raw).digest("hex");
  return `legacy-${hash}`;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeMentions(notifyUsers: unknown): Array<{ userId: string; userName: string }> {
  if (!Array.isArray(notifyUsers)) {
    return [];
  }

  return notifyUsers
    .map((item) => {
      if (!isPlainObject(item)) {
        return null;
      }

      const id = item.id;
      const name = item.name;

      if (typeof id !== "string" || typeof name !== "string") {
        return null;
      }

      return {
        userId: id,
        userName: name,
      };
    })
    .filter((item): item is { userId: string; userName: string } => item !== null);
}

export function mapLegacyLogToManagerLogResponse(logDoc: LegacyLogDocument): ManagerLogResponseDto {
  const legacyLog = toLegacyEntity(logDoc);
  const contextType = normalizeContextType(legacyLog.logType);
  const createdAt = legacyLog.date ? new Date(legacyLog.date) : new Date();
  const stableId = buildLegacyId(legacyLog);

  return {
    _id: stableId,
    id: stableId,
    customerId: legacyLog.customerId ?? "",
    contextType,
    contextId: resolveContextId(legacyLog, contextType),
    message: legacyLog.log ?? "",
    mentions: normalizeMentions(legacyLog.notifyUsers),
    references: [],
    reminder: null,
    authorId: legacyLog.userId ?? "legacy-user",
    authorName: legacyLog.userName ?? "Legacy Kullanici",
    createdAt,
    updatedAt: createdAt,
    source: "legacy",
  };
}
