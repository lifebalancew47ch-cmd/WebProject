import { apiFetch } from "./client"
import type {
  AuditLogDto,
  ChangePasswordRequest,
  ConfirmEmailRequest,
  ForgotPasswordRequest,
  LoginHistoryDto,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  PagedResult,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  SendConfirmationRequest,
  UpdatePreferenceRequest,
  UpdateProfileRequest,
  UserPreferenceDto,
  UserProfileDto,
} from "./types"

export const login = (payload: LoginRequest) =>
  apiFetch<LoginResponse>("/api/v1/Auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  })

export const register = (payload: RegisterRequest) =>
  apiFetch<RegisterResponse>("/api/v1/Auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  })

export const logout = (payload: LogoutRequest, token: string) =>
  apiFetch<boolean>(
    "/api/v1/Auth/logout",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token
  )

export const refreshToken = (payload: RefreshTokenRequest) =>
  apiFetch<RefreshTokenResponse>("/api/v1/Auth/refresh-token", {
    method: "POST",
    body: JSON.stringify(payload),
  })

export const forgotPassword = (payload: ForgotPasswordRequest) =>
  apiFetch<boolean>("/api/v1/Auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  })

export const resetPassword = (payload: ResetPasswordRequest) =>
  apiFetch<boolean>("/api/v1/Auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  })

export const sendConfirmation = (payload: SendConfirmationRequest) =>
  apiFetch<boolean>("/api/v1/Auth/send-confirmation", {
    method: "POST",
    body: JSON.stringify(payload),
  })

export const confirmEmail = (payload: ConfirmEmailRequest) =>
  apiFetch<boolean>("/api/v1/Auth/confirm-email", {
    method: "POST",
    body: JSON.stringify(payload),
  })

export const getProfile = (token: string) => apiFetch<UserProfileDto>("/api/v1/profile/me", { method: "GET" }, token)

export const updateProfile = (payload: UpdateProfileRequest, token: string) =>
  apiFetch<UserProfileDto>(
    "/api/v1/profile/me",
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    token
  )

export const getPreferences = (token: string) =>
  apiFetch<UserPreferenceDto>("/api/v1/profile/preferences", { method: "GET" }, token)

export const updatePreferences = (payload: UpdatePreferenceRequest, token: string) =>
  apiFetch<UserPreferenceDto>(
    "/api/v1/profile/preferences",
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    token
  )

export const changePassword = (payload: ChangePasswordRequest, token: string) =>
  apiFetch<boolean>(
    "/api/v1/profile/change-password",
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    token
  )

/**
 * `/api/v1/Audit/*` requiere rol Admin (ver docs/AUTH_PROFILE_API.md) — con un
 * usuario normal responde 403, no 401, así que el caller debe distinguir ese
 * caso de un error genérico en vez de asumir que siempre hay datos.
 */
export const getLoginHistory = (params: { page?: number; pageSize?: number } = {}, token: string) => {
  const query = new URLSearchParams(
    Object.entries({ page: 1, pageSize: 20, ...params }).map(([k, v]) => [k, String(v)])
  )
  return apiFetch<PagedResult<LoginHistoryDto>>(`/api/v1/Audit/login-history?${query}`, { method: "GET" }, token)
}

export const getSecurityEvents = (params: { page?: number; pageSize?: number } = {}, token: string) => {
  const query = new URLSearchParams(
    Object.entries({ page: 1, pageSize: 20, ...params }).map(([k, v]) => [k, String(v)])
  )
  return apiFetch<PagedResult<AuditLogDto>>(`/api/v1/Audit/security-events?${query}`, { method: "GET" }, token)
}
