import { Controller, Get, Post, Body, Headers, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Public } from "./decorators/public.decorator";
import { CurrentUser } from "./decorators/current-user.decorator";
import { AuthenticatedUser, AuthMeResponse } from "./auth.types";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Verify token validity
   * POST /api/auth/verify-token
   */
  @Public()
  @Post("verify-token")
  async verifyToken(@Body("token") token: string) {
    if (!token) {
      throw new UnauthorizedException("Token gerekli");
    }
    return this.authService.verifyToken(token);
  }

  /**
   * Get current user profile with permissions
   * GET /api/auth/me
   */
  @Get("me")
  async getMe(@CurrentUser() user: AuthenticatedUser): Promise<AuthMeResponse> {
    return this.authService.getMe(user.id);
  }

  /**
   * Get current user info (from JWT, without DB lookup)
   * GET /api/auth/user
   */
  @Get("user")
  getCurrentUser(@CurrentUser() user: AuthenticatedUser): AuthenticatedUser {
    return user;
  }

  /**
   * Validate token from header (for middleware/proxy use)
   * GET /api/auth/validate
   */
  @Public()
  @Get("validate")
  async validateFromHeader(@Headers("authorization") authHeader: string) {
    if (!authHeader) {
      throw new UnauthorizedException("Authorization header gerekli");
    }

    const token = authHeader.replace("Bearer ", "");
    return this.authService.verifyToken(token);
  }
}
