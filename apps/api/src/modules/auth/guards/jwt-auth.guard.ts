import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { AuthService } from "../auth.service";
import { AuthenticatedUser } from "../auth.types";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

/**
 * Custom JWT Guard that validates SSO tokens
 *
 * SSO tokens are signed with SSO's own secret, so we can't use Passport's
 * standard JWT verification. Instead, we decode the token and validate
 * the user exists in sso-db.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      this.logger.warn(`No token found for ${request.method} ${request.url}`);
      throw new UnauthorizedException("Authorization header bulunamadı");
    }

    try {
      // Validate token by decoding and checking user in sso-db
      const user: AuthenticatedUser = await this.authService.validateToken(token);

      // Attach user to request for use in controllers
      (request as Request & { user: AuthenticatedUser }).user = user;

      this.logger.debug(`User ${user.id} authenticated for ${request.method} ${request.url}`);
      return true;
    } catch (error) {
      this.logger.error(`Auth error for ${request.method} ${request.url}: ${error}`);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException("Token doğrulama hatası");
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return undefined;
    }

    const [type, token] = authHeader.split(" ");
    return type === "Bearer" ? token : undefined;
  }
}
