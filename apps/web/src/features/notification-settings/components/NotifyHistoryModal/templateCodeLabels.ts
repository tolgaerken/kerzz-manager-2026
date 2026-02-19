const TEMPLATE_CODE_MAP: Record<string, string> = {
  "invoice-due-email": "Vade Hatırlatma (E-posta)",
  "invoice-due-sms": "Vade Hatırlatma (SMS)",
  "invoice-overdue-3-email": "Vadesi Geçmiş ≤3 gün (E-posta)",
  "invoice-overdue-3-sms": "Vadesi Geçmiş ≤3 gün (SMS)",
  "invoice-overdue-5-email": "Vadesi Geçmiş >3 gün (E-posta)",
  "invoice-overdue-5-sms": "Vadesi Geçmiş >3 gün (SMS)",
  "contract-expiry-email": "Kontrat Süresi Dolumu (E-posta)",
  "contract-expiry-sms": "Kontrat Süresi Dolumu (SMS)",
};

export function getTemplateLabel(code: string): string {
  return TEMPLATE_CODE_MAP[code] ?? code;
}
