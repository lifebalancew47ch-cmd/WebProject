// Tipos derivados de docs/AUTH_PROFILE_API.md (LifeBalance Auth & Profile Service)

export interface ApiResponse<T> {
  success: boolean
  message: string | null
  data: T | null
  errors: string[] | null
}

export interface PagedResult<T> {
  items: T[] | null
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPrevious: boolean
  hasNext: boolean
}

// ---- Auth ----

export interface RegisterRequest {
  email: string
  username: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  phoneNumber?: string
}

export interface RegisterResponse {
  userId: string | null
  email: string | null
  username: string | null
  requiresEmailConfirmation: boolean
}

export interface LoginRequest {
  email: string
  password: string
  ipAddress?: string
}

export interface LoginResponse {
  accessToken: string | null
  refreshToken: string | null
  expiresAt: string
  userProfile: UserProfileDto
}

export interface LogoutRequest {
  refreshToken: string
}

export interface RefreshTokenRequest {
  accessToken: string
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string | null
  refreshToken: string | null
  expiresAt: string
}

export interface TokenRevocationRequest {
  refreshToken: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  email: string
  token: string
  newPassword: string
  confirmPassword: string
}

export interface SendConfirmationRequest {
  email: string
}

export interface ConfirmEmailRequest {
  email: string
  token: string
}

// ---- Profile ----

export interface UserProfileDto {
  id: string | null
  email: string | null
  username: string | null
  firstName: string | null
  lastName: string | null
  phoneNumber: string | null
  avatarUrl: string | null
  isEmailConfirmed: boolean
  isActive: boolean
  createdAt: string
  lastLoginAt: string | null
}

export interface UpdateProfileRequest {
  firstName?: string
  lastName?: string
  phoneNumber?: string
  avatarUrl?: string
}

export interface UserPreferenceDto {
  theme: string | null
  language: string | null
  timezone: string | null
  unitsSystem: string | null
  notificationsEnabled: boolean
  emailNotificationsEnabled: boolean
  pushNotificationsEnabled: boolean
  profileVisibility: string | null
  marketingConsent: boolean
  activitySharing: boolean
}

export interface UpdatePreferenceRequest {
  theme?: string
  language?: string
  timezone?: string
  unitsSystem?: string
  notificationsEnabled?: boolean
  emailNotificationsEnabled?: boolean
  pushNotificationsEnabled?: boolean
  profileVisibility?: string
  marketingConsent?: boolean
  activitySharing?: boolean
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

// ---- Roles / Permissions / Audit (uso administrativo) ----

export interface RoleDto {
  id: string | null
  name: string | null
  description: string | null
  permissionIds: string[] | null
  createdAt: string
}

export interface PermissionDto {
  id: string | null
  name: string | null
  description: string | null
  module: string | null
  createdAt: string
}

export interface LoginHistoryDto {
  id: string | null
  email: string | null
  ipAddress: string | null
  userAgent: string | null
  device: string | null
  success: boolean
  failureReason: string | null
  loginAt: string
}

export interface AuditLogDto {
  id: string | null
  userId: string | null
  action: string | null
  details: string | null
  ipAddress: string | null
  resourceType: string | null
  success: boolean
  errorMessage: string | null
  createdAt: string
}
