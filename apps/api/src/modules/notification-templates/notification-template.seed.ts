import { NotificationChannel } from "./schemas/notification-template.schema";

interface TemplateSeed {
  name: string;
  code: string;
  channel: NotificationChannel;
  subject?: string;
  body: string;
  isActive: boolean;
  variables: string[];
  description: string;
}

export const defaultTemplates: TemplateSeed[] = [
  // ==================== FATURA - SON ÖDEME TARİHİ ====================
  {
    name: "Son Ödeme Tarihi Hatırlatması (E-posta)",
    code: "invoice-due-email",
    channel: "email",
    subject: "{{company}} - Fatura Son Ödeme Tarihi Hatırlatması",
    body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
    .info-box { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .amount { font-size: 24px; color: #2563eb; font-weight: bold; }
    .btn { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
    .btn-secondary { background: #64748b; }
    .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Fatura Hatırlatması</h1>
    </div>
    <div class="content">
      <p>Sayın {{customerName}},</p>
      <p><strong>{{company}}</strong> adına düzenlenen faturanızın son ödeme tarihi bugündür.</p>
      
      <div class="info-box">
        <p><strong>Fatura No:</strong> {{invoiceNumber}}</p>
        <p><strong>Son Ödeme Tarihi:</strong> {{dueDate}}</p>
        <p><strong>Tutar:</strong> <span class="amount">{{amount}}</span></p>
      </div>
      
      <p>Ödemenizi aşağıdaki bağlantıdan gerçekleştirebilirsiniz:</p>
      
      <div style="text-align: center;">
        <a href="{{paymentLink}}" class="btn">💳 Şimdi Öde</a>
        <a href="{{confirmLink}}" class="btn btn-secondary">📄 Faturayı Görüntüle</a>
      </div>
      
      <p style="margin-top: 20px; font-size: 14px; color: #64748b;">
        Eğer ödemenizi zaten gerçekleştirdiyseniz, bu mesajı dikkate almanıza gerek yoktur.
      </p>
    </div>
    <div class="footer">
      <p>Bu e-posta Kerzz Manager tarafından otomatik olarak gönderilmiştir.</p>
    </div>
  </div>
</body>
</html>`,
    isActive: true,
    variables: [
      "company",
      "customerName",
      "invoiceNumber",
      "dueDate",
      "amount",
      "paymentLink",
      "confirmLink",
    ],
    description: "Fatura son ödeme tarihi geldiğinde gönderilen e-posta bildirimi",
  },
  {
    name: "Son Ödeme Tarihi Hatırlatması (SMS)",
    code: "invoice-due-sms",
    channel: "sms",
    body: `Sayin {{customerName}}, {{company}} adina duzenlenen {{amount}} tutarindaki faturanizin son odeme tarihi bugun. Odeme: {{paymentLink}}`,
    isActive: true,
    variables: [
      "company",
      "customerName",
      "amount",
      "paymentLink",
    ],
    description: "Fatura son ödeme tarihi geldiğinde gönderilen SMS bildirimi",
  },

  // ==================== FATURA - VADESİ GEÇMİŞ (3 GÜN) ====================
  {
    name: "Vadesi Geçmiş Fatura - 3 Gün (E-posta)",
    code: "invoice-overdue-3-email",
    channel: "email",
    subject: "{{company}} - Vadesi Geçmiş Fatura Hatırlatması",
    body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #fef2f2; padding: 20px; border: 1px solid #fecaca; }
    .info-box { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #dc2626; }
    .amount { font-size: 24px; color: #dc2626; font-weight: bold; }
    .btn { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
    .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Vadesi Geçmiş Fatura</h1>
    </div>
    <div class="content">
      <p>Sayın {{customerName}},</p>
      <p><strong>{{company}}</strong> adına düzenlenen faturanızın vadesi <strong>{{overdueDays}} gün</strong> önce dolmuştur.</p>
      
      <div class="info-box">
        <p><strong>Fatura No:</strong> {{invoiceNumber}}</p>
        <p><strong>Son Ödeme Tarihi:</strong> {{dueDate}}</p>
        <p><strong>Geciken Gün:</strong> {{overdueDays}} gün</p>
        <p><strong>Tutar:</strong> <span class="amount">{{amount}}</span></p>
      </div>
      
      <p>Gecikme yaşanmaması adına ödemenizi en kısa sürede gerçekleştirmenizi rica ederiz.</p>
      
      <div style="text-align: center;">
        <a href="{{paymentLink}}" class="btn">💳 Hemen Öde</a>
      </div>
      
      <p style="margin-top: 20px; font-size: 14px; color: #64748b;">
        Eğer ödemenizi zaten gerçekleştirdiyseniz, bu mesajı dikkate almanıza gerek yoktur.
      </p>
    </div>
    <div class="footer">
      <p>Bu e-posta Kerzz Manager tarafından otomatik olarak gönderilmiştir.</p>
    </div>
  </div>
</body>
</html>`,
    isActive: true,
    variables: [
      "company",
      "customerName",
      "invoiceNumber",
      "dueDate",
      "amount",
      "overdueDays",
      "paymentLink",
    ],
    description: "Fatura vadesi 3 gün geçtiğinde gönderilen e-posta bildirimi",
  },
  {
    name: "Vadesi Geçmiş Fatura - 3 Gün (SMS)",
    code: "invoice-overdue-3-sms",
    channel: "sms",
    body: `{{company}} faturaniz {{overdueDays}} gundur odenmemistir. Tutar: {{amount}}. Lutfen en kisa surede odeme yapin: {{paymentLink}}`,
    isActive: true,
    variables: [
      "company",
      "amount",
      "overdueDays",
      "paymentLink",
    ],
    description: "Fatura vadesi 3 gün geçtiğinde gönderilen SMS bildirimi",
  },

  // ==================== FATURA - VADESİ GEÇMİŞ (5 GÜN) ====================
  {
    name: "Vadesi Geçmiş Fatura - 5 Gün (E-posta)",
    code: "invoice-overdue-5-email",
    channel: "email",
    subject: "{{company}} - Acil: Vadesi Geçmiş Fatura",
    body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #b91c1c; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #fef2f2; padding: 20px; border: 1px solid #fecaca; }
    .info-box { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #b91c1c; }
    .amount { font-size: 24px; color: #b91c1c; font-weight: bold; }
    .btn { display: inline-block; background: #b91c1c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
    .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚨 ACİL: Vadesi Geçmiş Fatura</h1>
    </div>
    <div class="content">
      <p>Sayın {{customerName}},</p>
      <p><strong>{{company}}</strong> adına düzenlenen faturanızın vadesi <strong>{{overdueDays}} gün</strong> önce dolmuştur ve hâlâ ödenmemiştir.</p>
      
      <div class="info-box">
        <p><strong>Fatura No:</strong> {{invoiceNumber}}</p>
        <p><strong>Son Ödeme Tarihi:</strong> {{dueDate}}</p>
        <p><strong>Geciken Gün:</strong> {{overdueDays}} gün</p>
        <p><strong>Tutar:</strong> <span class="amount">{{amount}}</span></p>
      </div>
      
      <p><strong>Lütfen ödemenizi bugün gerçekleştirin.</strong> Aksi takdirde gecikme faizi uygulanabilir.</p>
      
      <div style="text-align: center;">
        <a href="{{paymentLink}}" class="btn">💳 Hemen Öde</a>
      </div>
    </div>
    <div class="footer">
      <p>Bu e-posta Kerzz Manager tarafından otomatik olarak gönderilmiştir.</p>
    </div>
  </div>
</body>
</html>`,
    isActive: true,
    variables: [
      "company",
      "customerName",
      "invoiceNumber",
      "dueDate",
      "amount",
      "overdueDays",
      "paymentLink",
    ],
    description: "Fatura vadesi 5 gün geçtiğinde gönderilen e-posta bildirimi",
  },
  {
    name: "Vadesi Geçmiş Fatura - 5 Gün (SMS)",
    code: "invoice-overdue-5-sms",
    channel: "sms",
    body: `ACIL: {{company}} faturaniz {{overdueDays}} gundur odenmedi! Tutar: {{amount}}. Bugün odeyin: {{paymentLink}}`,
    isActive: true,
    variables: [
      "company",
      "amount",
      "overdueDays",
      "paymentLink",
    ],
    description: "Fatura vadesi 5 gün geçtiğinde gönderilen SMS bildirimi",
  },

  // ==================== KONTRAT - BİTİŞ ZAMANI YAKLASAN ====================
  {
    name: "Kontrat Bitiş Hatırlatması (E-posta)",
    code: "contract-expiry-email",
    channel: "email",
    subject: "{{company}} - Kontrat Bitiş Hatırlatması",
    body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #fffbeb; padding: 20px; border: 1px solid #fde68a; }
    .info-box { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #f59e0b; }
    .date { font-size: 20px; color: #f59e0b; font-weight: bold; }
    .btn { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
    .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 Kontrat Bitiş Hatırlatması</h1>
    </div>
    <div class="content">
      <p>Sayın {{customerName}},</p>
      <p><strong>{{company}}</strong> için geçerli olan kontratınızın bitiş tarihi yaklaşmaktadır.</p>
      
      <div class="info-box">
        <p><strong>Şirket:</strong> {{company}}</p>
        <p><strong>Kontrat Bitiş Tarihi:</strong> <span class="date">{{contractEndDate}}</span></p>
        <p><strong>Kalan Gün:</strong> {{remainingDays}} gün</p>
      </div>
      
      <p>Kontratınızın kesintisiz devam etmesi için yenileme işlemlerinizi başlatmanızı öneririz.</p>
      
      <p style="margin-top: 20px; font-size: 14px; color: #64748b;">
        Sorularınız için bizimle iletişime geçebilirsiniz.
      </p>
    </div>
    <div class="footer">
      <p>Bu e-posta Kerzz Manager tarafından otomatik olarak gönderilmiştir.</p>
    </div>
  </div>
</body>
</html>`,
    isActive: true,
    variables: [
      "company",
      "customerName",
      "contractEndDate",
      "remainingDays",
    ],
    description: "Kontrat bitiş tarihi yaklaştığında gönderilen e-posta bildirimi",
  },
  {
    name: "Kontrat Bitiş Hatırlatması (SMS)",
    code: "contract-expiry-sms",
    channel: "sms",
    body: `{{company}} kontratiniz {{remainingDays}} gun icinde sona erecek. Bitis tarihi: {{contractEndDate}}. Yenileme icin bizimle iletisime gecin.`,
    isActive: true,
    variables: [
      "company",
      "contractEndDate",
      "remainingDays",
    ],
    description: "Kontrat bitiş tarihi yaklaştığında gönderilen SMS bildirimi",
  },

  // ==================== SATIŞ ONAY BİLDİRİMLERİ ====================
  {
    name: "Satış Onay İsteği (E-posta)",
    code: "sale-approval-request-email",
    channel: "email",
    subject: "Kerzz Manager - Satış Onay İsteği",
    body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
    .info-box { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #2563eb; }
    .amount { font-size: 20px; color: #2563eb; font-weight: bold; }
    .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 Satış Onay İsteği</h1>
    </div>
    <div class="content">
      <p>Sayın {{approverName}},</p>
      <p><strong>{{requesterName}}</strong> tarafından {{saleCount}} adet satış onayınıza sunulmuştur.</p>
      
      <div class="info-box">
        <p><strong>Satış No:</strong> {{saleNumbers}}</p>
        <p><strong>Toplam Tutar:</strong> <span class="amount">{{totalAmount}}</span></p>
        <p><strong>İstek Sahibi:</strong> {{requesterName}}</p>
      </div>
      
      <p>Satışları incelemek ve onaylamak için Kerzz Manager uygulamasına giriş yapınız.</p>
    </div>
    <div class="footer">
      <p>Bu e-posta Kerzz Manager tarafından otomatik olarak gönderilmiştir.</p>
    </div>
  </div>
</body>
</html>`,
    isActive: true,
    variables: [
      "approverName",
      "requesterName",
      "saleCount",
      "totalAmount",
      "saleNumbers",
    ],
    description: "Satış onay isteği geldiğinde yetkililere gönderilen e-posta bildirimi",
  },
  {
    name: "Satış Onay İsteği (SMS)",
    code: "sale-approval-request-sms",
    channel: "sms",
    body: `{{requesterName}} tarafindan {{saleCount}} adet satis onayiniza sunuldu. Toplam: {{totalAmount}}. Kerzz Manager'dan inceleyin.`,
    isActive: true,
    variables: [
      "requesterName",
      "saleCount",
      "totalAmount",
    ],
    description: "Satış onay isteği geldiğinde yetkililere gönderilen SMS bildirimi",
  },
  {
    name: "Satış Onaylandı (E-posta)",
    code: "sale-approved-email",
    channel: "email",
    subject: "Kerzz Manager - Satışınız Onaylandı",
    body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f0fdf4; padding: 20px; border: 1px solid #bbf7d0; }
    .info-box { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #16a34a; }
    .amount { font-size: 20px; color: #16a34a; font-weight: bold; }
    .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Satışınız Onaylandı</h1>
    </div>
    <div class="content">
      <p>Sayın {{requesterName}},</p>
      <p>Aşağıdaki satışınız <strong>{{approverName}}</strong> tarafından onaylanmıştır.</p>
      
      <div class="info-box">
        <p><strong>Satış No:</strong> {{saleNo}}</p>
        <p><strong>Müşteri:</strong> {{customerName}}</p>
        <p><strong>Tutar:</strong> <span class="amount">{{totalAmount}}</span></p>
        <p><strong>Onaylayan:</strong> {{approverName}}</p>
      </div>
    </div>
    <div class="footer">
      <p>Bu e-posta Kerzz Manager tarafından otomatik olarak gönderilmiştir.</p>
    </div>
  </div>
</body>
</html>`,
    isActive: true,
    variables: [
      "requesterName",
      "approverName",
      "saleNo",
      "customerName",
      "totalAmount",
    ],
    description: "Satış onaylandığında istek sahibine gönderilen e-posta bildirimi",
  },
  {
    name: "Satış Onaylandı (SMS)",
    code: "sale-approved-sms",
    channel: "sms",
    body: `Satis No {{saleNo}} ({{customerName}}) {{approverName}} tarafindan onaylandi. Tutar: {{totalAmount}}`,
    isActive: true,
    variables: [
      "saleNo",
      "customerName",
      "approverName",
      "totalAmount",
    ],
    description: "Satış onaylandığında istek sahibine gönderilen SMS bildirimi",
  },
  {
    name: "Satış Reddedildi (E-posta)",
    code: "sale-rejected-email",
    channel: "email",
    subject: "Kerzz Manager - Satışınız Reddedildi",
    body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #fef2f2; padding: 20px; border: 1px solid #fecaca; }
    .info-box { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #dc2626; }
    .amount { font-size: 20px; color: #dc2626; font-weight: bold; }
    .reason { background: #fee2e2; padding: 10px; border-radius: 4px; margin-top: 10px; }
    .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✗ Satışınız Reddedildi</h1>
    </div>
    <div class="content">
      <p>Sayın {{requesterName}},</p>
      <p>Aşağıdaki satışınız <strong>{{approverName}}</strong> tarafından reddedilmiştir.</p>
      
      <div class="info-box">
        <p><strong>Satış No:</strong> {{saleNo}}</p>
        <p><strong>Müşteri:</strong> {{customerName}}</p>
        <p><strong>Tutar:</strong> <span class="amount">{{totalAmount}}</span></p>
        <p><strong>Reddeden:</strong> {{approverName}}</p>
        <div class="reason">
          <strong>Red Nedeni:</strong> {{rejectionReason}}
        </div>
      </div>
      
      <p>Gerekli düzeltmeleri yaparak satışı tekrar onaya gönderebilirsiniz.</p>
    </div>
    <div class="footer">
      <p>Bu e-posta Kerzz Manager tarafından otomatik olarak gönderilmiştir.</p>
    </div>
  </div>
</body>
</html>`,
    isActive: true,
    variables: [
      "requesterName",
      "approverName",
      "saleNo",
      "customerName",
      "totalAmount",
      "rejectionReason",
    ],
    description: "Satış reddedildiğinde istek sahibine gönderilen e-posta bildirimi",
  },
  {
    name: "Satış Reddedildi (SMS)",
    code: "sale-rejected-sms",
    channel: "sms",
    body: `Satis No {{saleNo}} ({{customerName}}) {{approverName}} tarafindan reddedildi. Neden: {{rejectionReason}}`,
    isActive: true,
    variables: [
      "saleNo",
      "customerName",
      "approverName",
      "rejectionReason",
    ],
    description: "Satış reddedildiğinde istek sahibine gönderilen SMS bildirimi",
  },
];
