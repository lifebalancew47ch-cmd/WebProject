import { jsonFetch } from "./client"
import type {
  BroadcastPushDto,
  BulkEmailDto,
  CreateAlertDto,
  CreateTemplateDto,
  DeviceRegistrationDto,
  EmailTemplateDto,
  NotificationDto,
  ScheduleNotificationDto,
  SendEmailDto,
  SendNotificationDto,
  SendPushDto,
  UpdatePreferenceDto,
} from "./notifications-types"

/**
 * Cliente para el microservicio de Notificaciones (docs/NOTIFICATIONS_API.md).
 *
 * Conectado y funcionando (verificado en vivo 2026-08-02): CORS habilitado y
 * el JWT del Auth & Profile service es aceptado. Los endpoints sin shape de
 * respuesta confirmado se mantienen tipados como `unknown`.
 */

export const NOTIFICATIONS_API_BASE_URL =
  process.env.NEXT_PUBLIC_NOTIFICATIONS_API_URL ?? "https://lifebalance-notifications-api.onrender.com"

function notificationsFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
  trustHttpStatus: boolean = false
) {
  return jsonFetch<T>(NOTIFICATIONS_API_BASE_URL, path, options, token, trustHttpStatus)
}

// ---- Notifications ----

export const sendNotification = (payload: SendNotificationDto, token: string) =>
  notificationsFetch<NotificationDto>("/api/v1/notifications", { method: "POST", body: JSON.stringify(payload) }, token)

export const listNotifications = (
  filters: { userId?: string; organizationId?: string; familyId?: string; departmentId?: string },
  token: string
) => {
  const params = new URLSearchParams(Object.entries(filters).filter(([, v]) => v) as [string, string][])
  return notificationsFetch<NotificationDto[]>(`/api/v1/notifications?${params}`, { method: "GET" }, token)
}

export const sendBulkNotifications = (payload: SendNotificationDto[], token: string) =>
  notificationsFetch<unknown>("/api/v1/notifications/bulk", { method: "POST", body: JSON.stringify(payload) }, token)

export const scheduleNotification = (payload: ScheduleNotificationDto, token: string) =>
  notificationsFetch<unknown>("/api/v1/notifications/schedule", { method: "POST", body: JSON.stringify(payload) }, token)

export const getNotification = (id: string, token: string) =>
  notificationsFetch<unknown>(`/api/v1/notifications/${id}`, { method: "GET" }, token)

export const deleteNotification = (id: string, token: string) =>
  notificationsFetch<unknown>(`/api/v1/notifications/${id}`, { method: "DELETE" }, token, true)

export const cancelNotification = (id: string, token: string) =>
  notificationsFetch<unknown>(`/api/v1/notifications/${id}/cancel`, { method: "PATCH" }, token, true)

// Estos 3 devuelven `success: false` con status 200 aunque la operación sí se
// aplica (bug confirmado del backend, ver docs/NOTIFICATIONS_API.md) — se
// confía en el status HTTP en vez del flag `success`.
export const markNotificationRead = (id: string, token: string) =>
  notificationsFetch<unknown>(`/api/v1/notifications/${id}/read`, { method: "PATCH" }, token, true)

export const markAllNotificationsRead = (userId: string, token: string) =>
  notificationsFetch<unknown>(`/api/v1/notifications/read-all?userId=${encodeURIComponent(userId)}`, { method: "PATCH" }, token, true)

export const archiveNotification = (id: string, token: string) =>
  notificationsFetch<unknown>(`/api/v1/notifications/${id}/archive`, { method: "PATCH" }, token, true)

export const favoriteNotification = (id: string, token: string) =>
  notificationsFetch<unknown>(`/api/v1/notifications/${id}/favorite`, { method: "PATCH" }, token, true)

export const listUserNotifications = (userId: string, limit: number = 10, token?: string) =>
  notificationsFetch<unknown>(`/api/v1/notifications/user/${userId}?limit=${limit}`, { method: "GET" }, token)

// ---- Alerts ----

export const createAlert = (payload: CreateAlertDto, token: string) =>
  notificationsFetch<unknown>("/api/v1/alerts", { method: "POST", body: JSON.stringify(payload) }, token)

export const listAlerts = (userId: string | undefined, token: string) =>
  notificationsFetch<unknown>(`/api/v1/alerts${userId ? `?userId=${encodeURIComponent(userId)}` : ""}`, { method: "GET" }, token)

export const getAlert = (id: string, token: string) =>
  notificationsFetch<unknown>(`/api/v1/alerts/${id}`, { method: "GET" }, token)

export const markAlertRead = (id: string, token: string) =>
  notificationsFetch<unknown>(`/api/v1/alerts/${id}/read`, { method: "PATCH" }, token)

export const dismissAlert = (id: string, token: string) =>
  notificationsFetch<unknown>(`/api/v1/alerts/${id}/dismiss`, { method: "PATCH" }, token)

// ---- Emails ----

export const sendEmail = (payload: SendEmailDto, token: string) =>
  notificationsFetch<unknown>("/api/v1/emails/send", { method: "POST", body: JSON.stringify(payload) }, token)

export const sendEmailFromTemplate = (payload: EmailTemplateDto, token: string) =>
  notificationsFetch<unknown>("/api/v1/emails/template", { method: "POST", body: JSON.stringify(payload) }, token)

export const sendBulkEmail = (payload: BulkEmailDto, token: string) =>
  notificationsFetch<unknown>("/api/v1/emails/bulk", { method: "POST", body: JSON.stringify(payload) }, token)

// ---- Push ----

export const sendPush = (payload: SendPushDto, token: string) =>
  notificationsFetch<unknown>("/api/v1/push/send", { method: "POST", body: JSON.stringify(payload) }, token)

export const broadcastPush = (payload: BroadcastPushDto, token: string) =>
  notificationsFetch<unknown>("/api/v1/push/broadcast", { method: "POST", body: JSON.stringify(payload) }, token)

export const sendWearPush = (payload: SendPushDto, token: string) =>
  notificationsFetch<unknown>("/api/v1/push/wear", { method: "POST", body: JSON.stringify(payload) }, token)

export const broadcastCompanyPush = (payload: BroadcastPushDto, token: string) =>
  notificationsFetch<unknown>("/api/v1/push/company", { method: "POST", body: JSON.stringify(payload) }, token)

export const broadcastFamilyPush = (payload: BroadcastPushDto, token: string) =>
  notificationsFetch<unknown>("/api/v1/push/family", { method: "POST", body: JSON.stringify(payload) }, token)

export const broadcastDepartmentPush = (payload: BroadcastPushDto, token: string) =>
  notificationsFetch<unknown>("/api/v1/push/department", { method: "POST", body: JSON.stringify(payload) }, token)

// ---- Devices ----

export const registerDevice = (payload: DeviceRegistrationDto, token: string) =>
  notificationsFetch<unknown>("/api/v1/devices/register", { method: "POST", body: JSON.stringify(payload) }, token)

export const unregisterDevice = (userId: string, deviceToken: string, token: string) =>
  notificationsFetch<unknown>(
    `/api/v1/devices/unregister?userId=${encodeURIComponent(userId)}&deviceToken=${encodeURIComponent(deviceToken)}`,
    { method: "DELETE" },
    token
  )

// ---- Preferences ----

export const getNotificationPreferences = (userId: string, token: string) =>
  notificationsFetch<unknown>(`/api/v1/preferences?userId=${encodeURIComponent(userId)}`, { method: "GET" }, token)

export const updateNotificationPreferences = (userId: string, payload: UpdatePreferenceDto, token: string) =>
  notificationsFetch<unknown>(
    `/api/v1/preferences?userId=${encodeURIComponent(userId)}`,
    { method: "PUT", body: JSON.stringify(payload) },
    token
  )

export const setPushEnabled = (userId: string, enabled: boolean, token: string) =>
  notificationsFetch<unknown>(
    `/api/v1/preferences/push?userId=${encodeURIComponent(userId)}&enabled=${enabled}`,
    { method: "PATCH" },
    token
  )

export const setEmailEnabled = (userId: string, enabled: boolean, token: string) =>
  notificationsFetch<unknown>(
    `/api/v1/preferences/email?userId=${encodeURIComponent(userId)}&enabled=${enabled}`,
    { method: "PATCH" },
    token
  )

export const setWearEnabled = (userId: string, enabled: boolean, token: string) =>
  notificationsFetch<unknown>(
    `/api/v1/preferences/wear?userId=${encodeURIComponent(userId)}&enabled=${enabled}`,
    { method: "PATCH" },
    token
  )

// ---- Templates ----

export const createTemplate = (payload: CreateTemplateDto, token: string) =>
  notificationsFetch<unknown>("/api/v1/templates", { method: "POST", body: JSON.stringify(payload) }, token)

export const listTemplates = (token: string) =>
  notificationsFetch<unknown>("/api/v1/templates", { method: "GET" }, token)

export const getTemplate = (id: string, token: string) =>
  notificationsFetch<unknown>(`/api/v1/templates/${id}`, { method: "GET" }, token)

export const updateTemplate = (id: string, payload: CreateTemplateDto, token: string) =>
  notificationsFetch<unknown>(`/api/v1/templates/${id}`, { method: "PUT", body: JSON.stringify(payload) }, token)

export const deleteTemplate = (id: string, token: string) =>
  notificationsFetch<unknown>(`/api/v1/templates/${id}`, { method: "DELETE" }, token)

// ---- History ----

export const listHistory = (page: number = 1, pageSize: number = 20, token?: string) =>
  notificationsFetch<unknown>(`/api/v1/history?page=${page}&pageSize=${pageSize}`, { method: "GET" }, token)

export const listUserHistory = (userId: string, token: string) =>
  notificationsFetch<unknown>(`/api/v1/history/user/${userId}`, { method: "GET" }, token)

export const listOrganizationHistory = (organizationId: string, token: string) =>
  notificationsFetch<unknown>(`/api/v1/history/organization/${organizationId}`, { method: "GET" }, token)

// ---- Metrics ----

export const getMetrics = (token: string) => notificationsFetch<unknown>("/api/v1/metrics", { method: "GET" }, token)

export const getDeliveryMetrics = (token: string) =>
  notificationsFetch<unknown>("/api/v1/metrics/delivery", { method: "GET" }, token)

export const getChannelMetrics = (token: string) =>
  notificationsFetch<unknown>("/api/v1/metrics/channels", { method: "GET" }, token)

export const getErrorMetrics = (token: string) =>
  notificationsFetch<unknown>("/api/v1/metrics/errors", { method: "GET" }, token)
