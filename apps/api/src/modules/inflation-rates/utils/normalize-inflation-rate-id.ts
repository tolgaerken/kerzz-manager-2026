const ID_PREFIX_PATTERN = /^[A-Za-z0-9-]+/;

export function normalizeInflationRateId(rawId: string): string {
  const trimmed = rawId.trim();
  const idWithoutQuery = trimmed.split(/[?#]/, 1)[0] ?? "";
  const matchedPrefix = idWithoutQuery.match(ID_PREFIX_PATTERN)?.[0];

  return matchedPrefix ?? idWithoutQuery;
}
