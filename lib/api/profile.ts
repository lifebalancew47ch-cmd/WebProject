import { apiFetch } from "./client"
import type {
  ChangePasswordRequest,
  UpdatePreferenceRequest,
  UpdateProfileRequest,
  UserPreferenceDto,
  UserProfileDto,
} from "./types"

export const getMyProfile = (token: string) =>
  apiFetch<UserProfileDto>("/api/v1/Profile/me", { method: "GET" }, token)

export const updateMyProfile = (payload: UpdateProfileRequest, token: string) =>
  apiFetch<UserProfileDto>(
    "/api/v1/Profile/me",
    { method: "PUT", body: JSON.stringify(payload) },
    token
  )

export const getMyPreferences = (token: string) =>
  apiFetch<UserPreferenceDto>("/api/v1/Profile/preferences", { method: "GET" }, token)

export const updateMyPreferences = (payload: UpdatePreferenceRequest, token: string) =>
  apiFetch<UserPreferenceDto>(
    "/api/v1/Profile/preferences",
    { method: "PUT", body: JSON.stringify(payload) },
    token
  )

export const changeMyPassword = (payload: ChangePasswordRequest, token: string) =>
  apiFetch<boolean>(
    "/api/v1/Profile/change-password",
    { method: "PUT", body: JSON.stringify(payload) },
    token
  )
