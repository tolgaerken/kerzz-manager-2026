import { Global, Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { ClsModule } from "nestjs-cls";
import { AuditContextInterceptor } from "./audit-context.interceptor";

/**
 * Audit Module
 *
 * Global olarak CLS (Continuation Local Storage) ve audit interceptor'ı register eder.
 * Bu sayede tüm HTTP request'lerinde kullanıcı bilgisi CLS üzerinden erişilebilir olur.
 *
 * Mongoose audit plugin bu CLS context'inden kullanıcı bilgisini okur.
 */
@Global()
@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        // Her HTTP request için otomatik CLS context oluştur
        mount: true,
        // Request başlamadan önce context'i setup et
        setup: (cls, req) => {
          // Initial setup - user bilgisi henüz yok (JwtAuthGuard çalışmadı)
          // AuditContextInterceptor daha sonra user bilgisini set edecek
          cls.set("requestId", req.headers["x-request-id"] || crypto.randomUUID());
        },
      },
    }),
  ],
  providers: [
    // Global interceptor olarak register et
    // JwtAuthGuard'dan SONRA çalışması için APP_INTERCEPTOR kullanıyoruz
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditContextInterceptor,
    },
  ],
  exports: [ClsModule],
})
export class AuditModule {}
