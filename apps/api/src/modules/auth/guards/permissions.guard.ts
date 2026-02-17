import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY, PERMISSIONS_ANY_KEY } from "../decorators/require-permission.decorator";
import { ROLES_KEY } from "../decorators/require-role.decorator";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { AuthenticatedUser } from "../auth.types";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Public routes skip permission checks
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (isPublic) {
      return true;
    }

    // Get required permissions (all must match)
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    // Get required permissions (any must match)
    const requiredAnyPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_ANY_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    // Get required roles
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    // If no permissions or roles required, allow access
    if (!requiredPermissions && !requiredAnyPermissions && !requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;

    if (!user) {
      throw new ForbiddenException("Kullanıcı bilgisi bulunamadı");
    }

    // Admin users have all permissions
    if (user.isAdmin) {
      return true;
    }

    // Check required permissions (all must match)
    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasAllPermissions = requiredPermissions.every((permission) =>
        user.permissions.includes(permission)
      );

      if (!hasAllPermissions) {
        throw new ForbiddenException("Bu işlem için yetkiniz yok");
      }
    }

    // Check required permissions (any must match)
    if (requiredAnyPermissions && requiredAnyPermissions.length > 0) {
      const hasAnyPermission = requiredAnyPermissions.some((permission) =>
        user.permissions.includes(permission)
      );

      if (!hasAnyPermission) {
        throw new ForbiddenException("Bu işlem için yetkiniz yok");
      }
    }

    // Check required roles
    if (requiredRoles && requiredRoles.length > 0) {
      const userRolesLower = user.roles.map((r) => r.toLowerCase());
      const hasRole = requiredRoles.some((role) => userRolesLower.includes(role.toLowerCase()));

      if (!hasRole) {
        throw new ForbiddenException("Bu işlem için gerekli role sahip değilsiniz");
      }
    }

    return true;
  }
}
