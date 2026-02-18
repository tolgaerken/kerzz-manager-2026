const DEFAULT_WEB_URL = "https://io.kerzz.com";

function isPrivateIpv4(hostname: string): boolean {
  const parts = hostname.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
    return false;
  }

  const [first, second] = parts;
  if (first === 10) return true;
  if (first === 172 && second >= 16 && second <= 31) return true;
  if (first === 192 && second === 168) return true;
  if (first === 127) return true;

  return false;
}

function isLoopbackOrLocalName(hostname: string): boolean {
  return hostname === "localhost" || hostname.endsWith(".local");
}

/**
 * Üretim ortamında local/private URL kullanımını engeller.
 * Geçersiz veya boş URL geldiğinde güvenli varsayılan döner.
 */
export function resolveApprovalWebUrl(
  configuredWebUrl: string | undefined,
  nodeEnv: string | undefined
): { webUrl: string; isFallback: boolean } {
  const fallbackResult = { webUrl: DEFAULT_WEB_URL, isFallback: true };

  if (!configuredWebUrl || configuredWebUrl.trim().length === 0) {
    return fallbackResult;
  }

  const trimmedUrl = configuredWebUrl.trim();

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(trimmedUrl);
  } catch {
    return fallbackResult;
  }

  if (nodeEnv === "production") {
    const hostname = parsedUrl.hostname.toLowerCase();
    if (isLoopbackOrLocalName(hostname) || isPrivateIpv4(hostname)) {
      return fallbackResult;
    }
  }

  return { webUrl: trimmedUrl.replace(/\/+$/, ""), isFallback: false };
}
