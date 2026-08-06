import { jsonFetch } from "./client"
import type {
  AddMemberRequest,
  AssignLicenseRequest,
  ChangePlanRequest,
  CreateDepartmentCommand,
  CreateFamilyCommand,
  CreateInvitationCommand,
  CreateLicenseCommand,
  CreateOrgRequest,
  CreateSubscriptionCommand,
  CreateTeamCommand,
  DeptMemberRequest,
  OrganizationDto,
  OrgPagedResult,
  PlanDto,
  RenewLicenseRequest,
  SubscriptionDto,
  TransferAdminRequest,
  UpdateDeptRequest,
  UpdateFamilyRequest,
  UpdateOrgRequest,
  UpdateTeamRequest,
} from "./organizations-types"

/**
 * Cliente para el microservicio Organization & SaaS (docs/ORGANIZATION_SAAS_API.md).
 *
 * Verificado en vivo: el JWT del Auth & Profile service SÍ es aceptado aquí.
 * Ojo: los endpoints probados responden igual con o sin token (no aplican 401),
 * así que hoy en día se comportan como públicos pese a declarar seguridad Bearer.
 */

export const ORGANIZATIONS_API_BASE_URL =
  process.env.NEXT_PUBLIC_ORGANIZATIONS_API_URL ?? "https://lifebalance-organization-saas.onrender.com"

function orgFetch<T>(path: string, options: RequestInit = {}, token?: string | null) {
  return jsonFetch<T>(ORGANIZATIONS_API_BASE_URL, path, options, token)
}

// ---- Organizations ----

export const createOrganization = (payload: CreateOrgRequest, token?: string | null) =>
  orgFetch<OrganizationDto>("/api/v1/organizations", { method: "POST", body: JSON.stringify(payload) }, token)

export const listOrganizations = (
  params: { pageIndex?: number; pageSize?: number; search?: string } = {},
  token?: string | null
) => {
  const query = new URLSearchParams(
    Object.entries({ pageIndex: 1, pageSize: 10, ...params })
      .filter(([, v]) => v !== undefined && String(v) !== "")
      .map(([k, v]) => [k, String(v)])
  )
  return orgFetch<OrgPagedResult<OrganizationDto>>(`/api/v1/organizations?${query}`, { method: "GET" }, token)
}

export const getOrganization = (id: string, token?: string | null) =>
  orgFetch<OrganizationDto>(`/api/v1/organizations/${id}`, { method: "GET" }, token)

export const updateOrganization = (id: string, payload: UpdateOrgRequest, token?: string | null) =>
  orgFetch<OrganizationDto>(`/api/v1/organizations/${id}`, { method: "PUT", body: JSON.stringify(payload) }, token)

export const deleteOrganization = (id: string, token?: string | null) =>
  orgFetch<unknown>(`/api/v1/organizations/${id}`, { method: "DELETE" }, token)

export const activateOrganization = (id: string, token?: string | null) =>
  orgFetch<OrganizationDto>(`/api/v1/organizations/${id}/activate`, { method: "PATCH" }, token)

export const suspendOrganization = (id: string, token?: string | null) =>
  orgFetch<OrganizationDto>(`/api/v1/organizations/${id}/suspend`, { method: "PATCH" }, token)

export const restoreOrganization = (id: string, token?: string | null) =>
  orgFetch<OrganizationDto>(`/api/v1/organizations/${id}/restore`, { method: "PATCH" }, token)

export const getOrganizationStatistics = (id: string, token?: string | null) =>
  orgFetch<unknown>(`/api/v1/organizations/${id}/statistics`, { method: "GET" }, token)

// ---- Departments ----

export const createDepartment = (payload: CreateDepartmentCommand, token?: string | null) =>
  orgFetch<unknown>("/api/v1/departments", { method: "POST", body: JSON.stringify(payload) }, token)

export const listDepartments = (
  params: { organizationId?: string; pageIndex?: number; pageSize?: number },
  token?: string | null
) => {
  const query = new URLSearchParams(
    Object.entries({ pageIndex: 1, pageSize: 10, ...params })
      .filter(([, v]) => v !== undefined && String(v) !== "")
      .map(([k, v]) => [k, String(v)])
  )
  return orgFetch<OrgPagedResult<unknown>>(`/api/v1/departments?${query}`, { method: "GET" }, token)
}

export const getDepartment = (id: string, token?: string | null) =>
  orgFetch<unknown>(`/api/v1/departments/${id}`, { method: "GET" }, token)

export const updateDepartment = (id: string, payload: UpdateDeptRequest, token?: string | null) =>
  orgFetch<unknown>(`/api/v1/departments/${id}`, { method: "PUT", body: JSON.stringify(payload) }, token)

export const deleteDepartment = (id: string, token?: string | null) =>
  orgFetch<unknown>(`/api/v1/departments/${id}`, { method: "DELETE" }, token)

export const addDepartmentMember = (id: string, payload: DeptMemberRequest, token?: string | null) =>
  orgFetch<unknown>(`/api/v1/departments/${id}/members`, { method: "POST", body: JSON.stringify(payload) }, token)

export const removeDepartmentMember = (id: string, userId: string, token?: string | null) =>
  orgFetch<unknown>(`/api/v1/departments/${id}/members/${userId}`, { method: "DELETE" }, token)

// ---- Teams ----

export const createTeam = (payload: CreateTeamCommand, token?: string | null) =>
  orgFetch<unknown>("/api/v1/teams", { method: "POST", body: JSON.stringify(payload) }, token)

export const listTeams = (
  params: { organizationId?: string; pageIndex?: number; pageSize?: number },
  token?: string | null
) => {
  const query = new URLSearchParams(
    Object.entries({ pageIndex: 1, pageSize: 10, ...params })
      .filter(([, v]) => v !== undefined && String(v) !== "")
      .map(([k, v]) => [k, String(v)])
  )
  return orgFetch<OrgPagedResult<unknown>>(`/api/v1/teams?${query}`, { method: "GET" }, token)
}

export const getTeam = (id: string, token?: string | null) =>
  orgFetch<unknown>(`/api/v1/teams/${id}`, { method: "GET" }, token)

export const updateTeam = (id: string, payload: UpdateTeamRequest, token?: string | null) =>
  orgFetch<unknown>(`/api/v1/teams/${id}`, { method: "PUT", body: JSON.stringify(payload) }, token)

export const deleteTeam = (id: string, token?: string | null) =>
  orgFetch<unknown>(`/api/v1/teams/${id}`, { method: "DELETE" }, token)

// ---- Families ----

export const createFamily = (payload: CreateFamilyCommand, token?: string | null) =>
  orgFetch<unknown>("/api/v1/families", { method: "POST", body: JSON.stringify(payload) }, token)

export const listFamilies = (params: { pageIndex?: number; pageSize?: number } = {}, token?: string | null) => {
  const query = new URLSearchParams(
    Object.entries({ pageIndex: 1, pageSize: 10, ...params })
      .filter(([, v]) => v !== undefined && String(v) !== "")
      .map(([k, v]) => [k, String(v)])
  )
  return orgFetch<OrgPagedResult<unknown>>(`/api/v1/families?${query}`, { method: "GET" }, token)
}

export const getFamily = (id: string, token?: string | null) =>
  orgFetch<unknown>(`/api/v1/families/${id}`, { method: "GET" }, token)

export const updateFamily = (id: string, payload: UpdateFamilyRequest, token?: string | null) =>
  orgFetch<unknown>(`/api/v1/families/${id}`, { method: "PUT", body: JSON.stringify(payload) }, token)

export const deleteFamily = (id: string, token?: string | null) =>
  orgFetch<unknown>(`/api/v1/families/${id}`, { method: "DELETE" }, token)

export const addFamilyMember = (id: string, payload: AddMemberRequest, token?: string | null) =>
  orgFetch<unknown>(`/api/v1/families/${id}/members`, { method: "POST", body: JSON.stringify(payload) }, token)

export const removeFamilyMember = (id: string, userId: string, token?: string | null) =>
  orgFetch<unknown>(`/api/v1/families/${id}/members/${userId}`, { method: "DELETE" }, token)

export const transferFamilyAdmin = (id: string, payload: TransferAdminRequest, token?: string | null) =>
  orgFetch<unknown>(`/api/v1/families/${id}/administrator`, { method: "PATCH", body: JSON.stringify(payload) }, token)

// ---- Invitations ----

export const createInvitation = (payload: CreateInvitationCommand, token?: string | null) =>
  orgFetch<unknown>("/api/v1/invitations", { method: "POST", body: JSON.stringify(payload) }, token)

export const listInvitations = (params: { pageIndex?: number; pageSize?: number } = {}, token?: string | null) => {
  const query = new URLSearchParams(
    Object.entries({ pageIndex: 1, pageSize: 10, ...params })
      .filter(([, v]) => v !== undefined && String(v) !== "")
      .map(([k, v]) => [k, String(v)])
  )
  return orgFetch<OrgPagedResult<unknown>>(`/api/v1/invitations?${query}`, { method: "GET" }, token)
}

export const getInvitation = (id: string, token?: string | null) =>
  orgFetch<unknown>(`/api/v1/invitations/${id}`, { method: "GET" }, token)

export const acceptInvitation = (invitationToken: string, token?: string | null) =>
  orgFetch<unknown>(`/api/v1/invitations/${invitationToken}/accept`, { method: "POST" }, token)

export const rejectInvitation = (invitationToken: string, token?: string | null) =>
  orgFetch<unknown>(`/api/v1/invitations/${invitationToken}/reject`, { method: "POST" }, token)

export const cancelInvitation = (id: string, token?: string | null) =>
  orgFetch<unknown>(`/api/v1/invitations/${id}/cancel`, { method: "POST" }, token)

export const resendInvitation = (id: string, token?: string | null) =>
  orgFetch<unknown>(`/api/v1/invitations/${id}/resend`, { method: "POST" }, token)

// ---- Licenses ----

export const createLicense = (payload: CreateLicenseCommand, token?: string | null) =>
  orgFetch<unknown>("/api/v1/licenses", { method: "POST", body: JSON.stringify(payload) }, token)

export const listLicenses = (
  params: { organizationId?: string; pageIndex?: number; pageSize?: number },
  token?: string | null
) => {
  const query = new URLSearchParams(
    Object.entries({ pageIndex: 1, pageSize: 10, ...params })
      .filter(([, v]) => v !== undefined && String(v) !== "")
      .map(([k, v]) => [k, String(v)])
  )
  return orgFetch<OrgPagedResult<unknown>>(`/api/v1/licenses?${query}`, { method: "GET" }, token)
}

export const getLicense = (id: string, token?: string | null) =>
  orgFetch<unknown>(`/api/v1/licenses/${id}`, { method: "GET" }, token)

export const deleteLicense = (id: string, token?: string | null) =>
  orgFetch<unknown>(`/api/v1/licenses/${id}`, { method: "DELETE" }, token)

export const assignLicense = (id: string, payload: AssignLicenseRequest, token?: string | null) =>
  orgFetch<unknown>(`/api/v1/licenses/${id}/assign`, { method: "POST", body: JSON.stringify(payload) }, token)

export const renewLicense = (id: string, payload: RenewLicenseRequest, token?: string | null) =>
  orgFetch<unknown>(`/api/v1/licenses/${id}/renew`, { method: "POST", body: JSON.stringify(payload) }, token)

// ---- Subscriptions ----

export const createSubscription = (payload: CreateSubscriptionCommand, token?: string | null) =>
  orgFetch<SubscriptionDto>("/api/v1/subscriptions", { method: "POST", body: JSON.stringify(payload) }, token)

export const listSubscriptions = (
  params: { organizationId?: string; pageIndex?: number; pageSize?: number } = {},
  token?: string | null
) => {
  const query = new URLSearchParams(
    Object.entries({ pageIndex: 1, pageSize: 10, ...params })
      .filter(([, v]) => v !== undefined && String(v) !== "")
      .map(([k, v]) => [k, String(v)])
  )
  return orgFetch<OrgPagedResult<SubscriptionDto>>(`/api/v1/subscriptions?${query}`, { method: "GET" }, token)
}

export const getSubscription = (id: string, token?: string | null) =>
  orgFetch<SubscriptionDto>(`/api/v1/subscriptions/${id}`, { method: "GET" }, token)

export const renewSubscription = (id: string, token?: string | null) =>
  orgFetch<SubscriptionDto>(`/api/v1/subscriptions/${id}/renew`, { method: "PATCH" }, token)

export const changeSubscriptionPlan = (id: string, payload: ChangePlanRequest, token?: string | null) =>
  orgFetch<SubscriptionDto>(`/api/v1/subscriptions/${id}/change-plan`, { method: "PATCH", body: JSON.stringify(payload) }, token)

// Cancelación inmediata (verificado en vivo el 2026-08-05): status pasa a "Canceled" de una vez,
// no espera a renewalDate. Es idempotente.
export const cancelSubscription = (id: string, token?: string | null) =>
  orgFetch<SubscriptionDto>(`/api/v1/subscriptions/${id}/cancel`, { method: "PATCH" }, token)

// ---- Plans ----
// Público (verificado en vivo el 2026-08-05): responde igual con o sin token.

export const listPlans = () => orgFetch<PlanDto[]>("/api/v1/plans", { method: "GET" })
