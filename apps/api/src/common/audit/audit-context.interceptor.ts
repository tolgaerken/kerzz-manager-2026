import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { ClsService } from "nestjs-cls";
import { Request } from "express";
import { AuditUser, AUDIT_CLS_KEY } from "./audit.interfaces";
import { AuthenticatedUser } from "../../modules/auth/auth.types";

/**
 * Audit Context Interceptor
 *
 * JwtAuthGuard çalıştıktan sonra request.user'ı CLS'e yazar.
 * Bu sayede Mongoose plugin'i her yerden kullanıcı bilgisine erişebilir.
 *
 * Execution order:
 * 1. ClsMiddleware -> CLS context oluşturur
 * 2. JwtAuthGuard -> request.user set eder
 * 3. AuditContextInterceptor -> request.user'ı CLS'e yazar
 * 4. Controller/Service -> Mongoose plugin CLS'den okur
 */
@Injectable()
export class AuditContextInterceptor implements NestInterceptor {
  constructor(private readonly cls: ClsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();

    if (request?.user) {
      const auditUser: AuditUser = {
        userId: request.user.id,
        userName: request.user.name,
      };
      this.cls.set(AUDIT_CLS_KEY, auditUser);
    }

    return next.handle();
  }
}
