// Tipos derivados de docs/NOTIFICATIONS_API.md (LifeBalance Notifications & Alerts Service)
// Los enums solo aparecen como enteros en el spec OpenAPI, sin nombres confirmados.
// Se confirmó en vivo (2026-08-02) que `type: 0` corresponde a algo como "SedentaryAlert"
// (visto en el campo `severity` de GET /notifications/user/{userId}), pero no se conoce
// el mapeo completo — ajustar cuando se confirmen más valores.

export type NotificationType = number
export type NotificationChannel = number
export type DevicePlatform = number
export type AlertPriority = number

// Shape real confirmado de GET /api/v1/notifications?userId=... (envelope ApiResponse<NotificationDto[]>)
export interface NotificationDto {
  id: string
  userId: string
  organizationId: string | null
  familyId: string | null
  departmentId: string | null
  title: string
  body: string
  payload: string | null
  type: NotificationType
  channel: NotificationChannel
  status: number
  isRead: boolean
  isArchived: boolean
  isFavorite: boolean
  createdAt: string
  sentAt: string | null
  readAt: string | null
  deliveryTimeMs: number | null
  attempts: number
  errorMessage: string | null
  provider: string | null
}

export interface SendNotificationDto {
  userId: string
  title: string
  body: string
  payload?: string | null
  type: NotificationType
  channel: NotificationChannel
}

export interface ScheduleNotificationDto {
  userId: string
  title: string
  body: string
  payload?: string | null
  type: NotificationType
  channel: NotificationChannel
  scheduledFor: string
}

export interface CreateAlertDto {
  userId: string
  title: string
  body: string
  source: string
  priority: AlertPriority
}

export interface SendEmailDto {
  to: string
  subject: string
  body: string
  isHtml?: boolean
  templateId?: string | null
  templateVariables?: Record<string, string> | null
}

export interface BulkEmailDto {
  to: string[]
  subject: string
  body: string
  isHtml?: boolean
}

export interface EmailTemplateDto {
  to: string[]
  templateId: string
  variables?: Record<string, string> | null
}

export interface SendPushDto {
  userId: string
  title: string
  body: string
  payload?: string | null
  deviceTokens?: string[] | null
  platform: DevicePlatform
}

export interface BroadcastPushDto {
  title: string
  body: string
  payload?: string | null
  userIds?: string[] | null
  organizationId?: string | null
  familyId?: string | null
  departmentId?: string | null
  platform: DevicePlatform
}

export interface DeviceRegistrationDto {
  userId: string
  deviceToken: string
  platform: DevicePlatform
}

export interface UpdatePreferenceDto {
  receivePush?: boolean | null
  receiveEmail?: boolean | null
  receiveSms?: boolean | null
  receiveWearOS?: boolean | null
  receiveCriticalAlerts?: boolean | null
  receiveReminders?: boolean | null
  receiveGoals?: boolean | null
  receiveGamification?: boolean | null
  receiveOrganizational?: boolean | null
  allowedStartTime?: string | null
  allowedEndTime?: string | null
  quietModeEnabled?: boolean | null
  quietModeStart?: string | null
  quietModeEnd?: string | null
  frequency?: string | null
  language?: string | null
  timezone?: string | null
}

export interface CreateTemplateDto {
  name: string
  subject: string
  bodyContent: string
  htmlContent?: string | null
  type: NotificationType
  channel: NotificationChannel
  variables?: string[] | null
  isGlobal?: boolean
}
