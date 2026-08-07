import { jsonFetch } from "./client"
import type {
  DashboardHealthResponse,
  IndividualDashboardResponse,
  IndividualHeatmapResponse,
  IndividualStatisticsResponse,
} from "./dashboard-types"

/**
 * Cliente para el microservicio Dashboard (docs/DASHBOARD_SERVICE_API.md).
 *
 * Verificado en vivo (2026-08-07): el JWT del Auth & Profile service ya es
 * aceptado aquí — el bug de audience ("The audience '(null)' is invalid")
 * quedó resuelto en el backend. Mismo día se corrigió también que
 * `individual/activity` y `individual/statistics` devolvían `sedentaryHours`/
 * `caloriesBurned` en 0 (ver [[dashboard-sedentary-fix-backend]] en memoria).
 */

export const DASHBOARD_API_BASE_URL =
  process.env.NEXT_PUBLIC_DASHBOARD_API_URL ?? "https://lifebalance-dashboard-service.onrender.com"

function dashboardFetch<T>(path: string, token?: string | null) {
  return jsonFetch<T>(DASHBOARD_API_BASE_URL, path, { method: "GET" }, token)
}

export const getHealth = () => dashboardFetch<DashboardHealthResponse>("/api/v1/dashboard/health")

export const getIndividualDashboard = (userId: string, token: string) =>
  dashboardFetch<IndividualDashboardResponse>(`/api/v1/dashboard/individual?userId=${encodeURIComponent(userId)}`, token)

export const getIndividualSummary = (userId: string, token: string) =>
  dashboardFetch<unknown>(`/api/v1/dashboard/individual/summary?userId=${encodeURIComponent(userId)}`, token)

export const getIndividualKpis = (userId: string, token: string) =>
  dashboardFetch<unknown>(`/api/v1/dashboard/individual/kpis?userId=${encodeURIComponent(userId)}`, token)

export const getIndividualStatistics = (userId: string, token: string) =>
  dashboardFetch<IndividualStatisticsResponse>(`/api/v1/dashboard/individual/statistics?userId=${encodeURIComponent(userId)}`, token)

export const getIndividualHeatmap = (userId: string, token: string) =>
  dashboardFetch<IndividualHeatmapResponse>(`/api/v1/dashboard/individual/heatmap?userId=${encodeURIComponent(userId)}`, token)

export const getIndividualGoals = (userId: string, token: string) =>
  dashboardFetch<unknown>(`/api/v1/dashboard/individual/goals?userId=${encodeURIComponent(userId)}`, token)

export const getIndividualProgress = (userId: string, token: string) =>
  dashboardFetch<unknown>(`/api/v1/dashboard/individual/progress?userId=${encodeURIComponent(userId)}`, token)

export const getIndividualActivity = (userId: string, token: string) =>
  dashboardFetch<unknown>(`/api/v1/dashboard/individual/activity?userId=${encodeURIComponent(userId)}`, token)

export const getIndividualRecommendations = (userId: string, token: string) =>
  dashboardFetch<unknown>(`/api/v1/dashboard/individual/recommendations?userId=${encodeURIComponent(userId)}`, token)

export const getIndividualRewards = (userId: string, token: string) =>
  dashboardFetch<unknown>(`/api/v1/dashboard/individual/rewards?userId=${encodeURIComponent(userId)}`, token)

export const getIndividualNotifications = (userId: string, token: string) =>
  dashboardFetch<unknown>(`/api/v1/dashboard/individual/notifications?userId=${encodeURIComponent(userId)}`, token)

export const getIndividualBiometrics = (userId: string, token: string) =>
  dashboardFetch<unknown>(`/api/v1/dashboard/individual/biometrics?userId=${encodeURIComponent(userId)}`, token)

export const getFamilyDashboard = (familyId: string, token: string) =>
  dashboardFetch<unknown>(`/api/v1/dashboard/family?familyId=${encodeURIComponent(familyId)}`, token)

export const getFamilyStatistics = (familyId: string, token: string) =>
  dashboardFetch<unknown>(`/api/v1/dashboard/family/statistics?familyId=${encodeURIComponent(familyId)}`, token)

export const getFamilyGoals = (familyId: string, token: string) =>
  dashboardFetch<unknown>(`/api/v1/dashboard/family/goals?familyId=${encodeURIComponent(familyId)}`, token)

export const getFamilyRanking = (familyId: string, token: string) =>
  dashboardFetch<unknown>(`/api/v1/dashboard/family/ranking?familyId=${encodeURIComponent(familyId)}`, token)

export const getFamilyMembers = (familyId: string, token: string) =>
  dashboardFetch<unknown>(`/api/v1/dashboard/family/members?familyId=${encodeURIComponent(familyId)}`, token)

export const getFamilyChallenges = (familyId: string, token: string) =>
  dashboardFetch<unknown>(`/api/v1/dashboard/family/challenges?familyId=${encodeURIComponent(familyId)}`, token)

export const getFamilyRewards = (familyId: string, token: string) =>
  dashboardFetch<unknown>(`/api/v1/dashboard/family/rewards?familyId=${encodeURIComponent(familyId)}`, token)

export const getFamilyHeatmap = (familyId: string, token: string) =>
  dashboardFetch<unknown>(`/api/v1/dashboard/family/heatmap?familyId=${encodeURIComponent(familyId)}`, token)

export const getCompanyDashboard = (companyId: string, token: string) =>
  dashboardFetch<unknown>(`/api/v1/dashboard/company?companyId=${encodeURIComponent(companyId)}`, token)

export const getCompanyKpis = (companyId: string, token: string) =>
  dashboardFetch<unknown>(`/api/v1/dashboard/company/kpis?companyId=${encodeURIComponent(companyId)}`, token)

export const getCompanyStatistics = (companyId: string, token: string) =>
  dashboardFetch<unknown>(`/api/v1/dashboard/company/statistics?companyId=${encodeURIComponent(companyId)}`, token)

export const getCompanyDepartments = (companyId: string, token: string) =>
  dashboardFetch<unknown>(`/api/v1/dashboard/company/departments?companyId=${encodeURIComponent(companyId)}`, token)

export const getCompanyHeatmap = (companyId: string, token: string) =>
  dashboardFetch<unknown>(`/api/v1/dashboard/company/heatmap?companyId=${encodeURIComponent(companyId)}`, token)

export const getCompanyAdherence = (companyId: string, token: string) =>
  dashboardFetch<unknown>(`/api/v1/dashboard/company/adherence?companyId=${encodeURIComponent(companyId)}`, token)

export const getCompanyTrends = (companyId: string, token: string) =>
  dashboardFetch<unknown>(`/api/v1/dashboard/company/trends?companyId=${encodeURIComponent(companyId)}`, token)

export const getCompanyRanking = (companyId: string, token: string) =>
  dashboardFetch<unknown>(`/api/v1/dashboard/company/ranking?companyId=${encodeURIComponent(companyId)}`, token)

export const getCompanyLicenses = (companyId: string, token: string) =>
  dashboardFetch<unknown>(`/api/v1/dashboard/company/licenses?companyId=${encodeURIComponent(companyId)}`, token)

export const getCompanyOrganization = (companyId: string, token: string) =>
  dashboardFetch<unknown>(`/api/v1/dashboard/company/organization?companyId=${encodeURIComponent(companyId)}`, token)

export const getGeneralSummary = (token: string) => dashboardFetch<unknown>("/api/v1/dashboard/summary", token)
export const getGeneralIndicators = (token: string) => dashboardFetch<unknown>("/api/v1/dashboard/indicators", token)
export const getGeneralKpis = (token: string) => dashboardFetch<unknown>("/api/v1/dashboard/kpis", token)
export const getGeneralSystem = (token: string) => dashboardFetch<unknown>("/api/v1/dashboard/system", token)
export const getGeneralVersion = (token: string) => dashboardFetch<unknown>("/api/v1/dashboard/version", token)
