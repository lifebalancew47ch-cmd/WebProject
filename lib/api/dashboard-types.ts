// Tipos derivados de docs/DASHBOARD_SERVICE_API.md (LifeBalance Dashboard Service)

export interface AuthUserResponseDto {
  userId: string | null
  email: string | null
  firstName: string | null
  lastName: string | null
  roles: string[] | null
  familyId: string | null
  companyId: string | null
}

export interface MedicalDataResponseDto {
  userId: string | null
  heartRate: number
  systolicBp: number
  diastolicBp: number
  weight: number
  height: number
  bmi: number
  recordedAt: string
}

export interface SedentaryActivityResponseDto {
  userId: string | null
  dailySteps: number
  activeMinutes: number
  sedentaryHours: number
  caloriesBurned: number
  hourlyHeatmap: number[] | null
  // Campos confirmados en vivo el 2026-08-09 (cuenta demo) — no estaban
  // documentados, el backend ya los regresa con metas/progreso reales:
  sedentaryScore?: number
  riskLevel?: string
  dailyStepsTarget?: number
  activeMinutesTarget?: number
  stepsProgress?: number
  activeProgress?: number
}

export interface UserRewardsResponseDto {
  userId: string | null
  points: number
  badgesUnlocked: number
  currentStreakDays: number
  recentRewards: string[] | null
}

export interface NotificationItemDto {
  id: string | null
  title: string | null
  message: string | null
  severity: string | null
  createdAtUtc: string
  read: boolean
}

export interface RecommendationDto {
  recommendationId: string | null
  category: string | null
  title: string | null
  description: string | null
  priorityScore: number
}

export interface IndividualDashboardResponse {
  userProfile: AuthUserResponseDto
  biometrics: MedicalDataResponseDto
  activity: SedentaryActivityResponseDto
  rewards: UserRewardsResponseDto
  notifications: NotificationItemDto[] | null
  recommendations: RecommendationDto[] | null
}

export interface DashboardHealthResponse {
  overallStatus: string
  componentHealth: Record<string, string>
}

export interface IndividualStatisticsResponse {
  userId: string
  activeHoursThisWeek: number
  sedentaryHoursThisWeek: number
  averageHeartRate: number
}

export interface IndividualHeatmapResponse {
  userId: string
  hourlyHeatmap: number[]
}
