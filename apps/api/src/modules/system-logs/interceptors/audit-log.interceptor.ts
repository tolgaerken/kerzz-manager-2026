import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable, tap, catchError, throwError } from "rxjs";
import { Request } from "express";
import { SystemLogsService } from "../system-logs.service";
import {
  SystemLogCategory,
  SystemLogAction,
  SystemLogStatus
} from "../schemas/system-log.schema";
import { AUDIT_LOG_KEY, AuditLogOptions } from "../decorators/audit-log.decorator";
import { AuthenticatedUser } from "../../auth/auth.types";

// Extend Express Request to include user from JWT
interface RequestWithUser extends Request {
  user?: AuthenticatedUser;
}

/**
 * HTTP method'unu SystemLogAction'a map eder
 */
function mapHttpMethodToAction(method: string): SystemLogAction {
  switch (method.toUpperCase()) {
    case "POST":
      return SystemLogAction.CREATE;
    case "GET":
      return SystemLogAction.READ;
    case "PUT":
    case "PATCH":
      return SystemLogAction.UPDATE;
    case "DELETE":
      return SystemLogAction.DELETE;
    default:
      return SystemLogAction.INFO;
  }
}

/**
 * Request'ten entity ID çıkar
 */
function extractEntityId(req: Request): string | null {
  return (req.params?.id as string) || null;
}

/**
 * Request'ten kullanıcı bilgisi çıkar
 * Önce JWT'den (request.user), yoksa header'dan alır
 */
function extractUserInfo(req: RequestWithUser): { userId: string | null; userName: string | null } {
  // First try to get from JWT (request.user set by JwtAuthGuard)
  if (req.user) {
    return {
      userId: req.user.id,
      userName: req.user.name
    };
  }

  // Fallback to headers (for backward compatibility)
  const userId = (req.headers["x-user-id"] as string) || null;
  const rawUserName = (req.headers["x-user-name"] as string) || null;
  // Frontend Türkçe karakterler için encodeURIComponent kullanıyor, decode et
  const userName = rawUserName ? decodeURIComponent(rawUserName) : null;
  return { userId, userName };
}

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly systemLogsService: SystemLogsService,
    private readonly reflector: Reflector
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const auditOptions = this.reflector.get<AuditLogOptions>(
      AUDIT_LOG_KEY,
      context.getHandler()
    );

    // Decorator yoksa loglama yapma
    if (!auditOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const method = request.method;
    const action = mapHttpMethodToAction(method);

    // GET isteklerini loglamayı atla (çok fazla olur)
    if (action === SystemLogAction.READ) {
      return next.handle();
    }

    const startTime = Date.now();
    const { userId, userName } = extractUserInfo(request);
    const entityId = extractEntityId(request);
    const ipAddress =
      (request.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      request.ip ||
      null;

    return next.handle().pipe(
      tap((responseData) => {
        const duration = Date.now() - startTime;
        const resultEntityId =
          entityId || (responseData as Record<string, unknown>)?._id?.toString() || null;

        this.systemLogsService.log(
          SystemLogCategory.CRUD,
          action,
          auditOptions.module,
          {
            userId,
            userName,
            entityId: resultEntityId,
            entityType: auditOptions.entityType,
            status: SystemLogStatus.SUCCESS,
            method,
            path: request.originalUrl,
            statusCode: context.switchToHttp().getResponse().statusCode,
            duration,
            ipAddress,
            userAgent: request.headers["user-agent"] || null,
            details: this.buildDetails(action, request),
          }
        );
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;

        this.systemLogsService.log(
          SystemLogCategory.CRUD,
          action,
          auditOptions.module,
          {
            userId,
            userName,
            entityId,
            entityType: auditOptions.entityType,
            status: SystemLogStatus.ERROR,
            method,
            path: request.originalUrl,
            statusCode: error.status || 500,
            duration,
            ipAddress,
            userAgent: request.headers["user-agent"] || null,
            errorMessage: error.message || "Bilinmeyen hata",
            details: this.buildDetails(action, request),
          }
        );

        return throwError(() => error);
      })
    );
  }

  private buildDetails(
    action: SystemLogAction,
    request: Request
  ): Record<string, unknown> {
    const details: Record<string, unknown> = {};

    // CREATE ve UPDATE işlemlerinde body'yi kaydet (hassas veriler hariç)
    if (
      action === SystemLogAction.CREATE ||
      action === SystemLogAction.UPDATE
    ) {
      const sanitizedBody = { ...request.body };
      // Hassas alanları temizle
      delete sanitizedBody.password;
      delete sanitizedBody.token;
      delete sanitizedBody.accessToken;
      delete sanitizedBody.refreshToken;
      details.body = sanitizedBody;
    }

    return details;
  }
}
