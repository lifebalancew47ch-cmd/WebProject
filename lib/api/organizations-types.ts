// Tipos derivados de docs/ORGANIZATION_SAAS_API.md (LifeBalance Organization & SaaS Service)

export interface OrgPagedResult<T> {
  items: T[]
  pageIndex: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface Address {
  street?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  zipCode?: string | null
}

export interface ContactInfo {
  email?: string | null
  phone?: string | null
  contactPerson?: string | null
}

// Shape confirmado con datos reales el 2026-08-02 (ver docs/ORGANIZATION_SAAS_API.md).
export interface OrganizationDto {
  id?: string
  tenantId?: string
  name?: string
  taxId?: string
  status?: string
  planId?: string
  subscriptionId?: string
  configurationId?: string
  contactInfo?: ContactInfo
  address?: Address
  createdAt?: string
  updatedAt?: string
}

export interface CreateOrgRequest {
  name: string
  taxId: string
  planId: string
  contactInfo: ContactInfo
  address: Address
}

export interface UpdateOrgRequest {
  name?: string
  taxId?: string
  contactInfo?: ContactInfo
  address?: Address
}

export interface CreateDepartmentCommand {
  organizationId?: string
  name?: string
  description?: string
  managerUserId?: string
  parentDepartmentId?: string
}

export interface UpdateDeptRequest {
  name?: string
  description?: string
  managerUserId?: string
  parentDepartmentId?: string
}

export interface DeptMemberRequest {
  userId?: string
}

export interface CreateTeamCommand {
  organizationId?: string
  name?: string
  departmentId?: string
  leaderUserId?: string
}

export interface UpdateTeamRequest {
  name?: string
  departmentId?: string
  leaderUserId?: string
}

export interface CreateFamilyCommand {
  name?: string
  administratorUserId?: string
  maxMembers: number
}

export interface UpdateFamilyRequest {
  name?: string
}

export interface AddMemberRequest {
  userId?: string
}

export interface TransferAdminRequest {
  newAdminUserId?: string
}

export interface CreateInvitationCommand {
  targetEmail?: string
  organizationId?: string
  familyId?: string
  role?: string
}

export interface CreateLicenseCommand {
  organizationId?: string
  type?: string
  expiresAt: string
}

export interface AssignLicenseRequest {
  userId?: string
}

export interface RenewLicenseRequest {
  newExpiration: string
}

export interface CreateSubscriptionCommand {
  organizationId?: string
  planId?: string
  billingCycle?: string
}

export interface ChangePlanRequest {
  newPlanId?: string
}

// ---- Plans ----
// Shape confirmado con datos reales el 2026-08-05 (endpoint público, sin token).

export interface PlanLimits {
  maxUsers: number
  maxFamilies: number
  maxCompanies: number
  maxDepartments: number
  maxTeams: number
  maxLicenses: number
  dataRetentionDays: number
  dashboardsAvailable: boolean
  reportsAvailable: boolean
  iaEnabled: boolean
  gamificationEnabled: boolean
  notificationsEnabled: boolean
  apiAccess: boolean
}

export interface PlanDto {
  id: string
  name: string
  tier: string
  priceMonthly: number
  priceYearly: number
  currency: string
  isCustomPricing: boolean
  isHighlighted: boolean
  features: string[]
  limits: PlanLimits
  isActive: boolean
}

// Shape confirmado con datos reales el 2026-08-05 (POST /api/v1/subscriptions → 201).
export interface SubscriptionDto {
  id: string
  organizationId: string
  tenantId: string
  planId: string
  status: string
  renewalDate: string
  billingCycle: string
  paymentHistoryLog: unknown[]
}
