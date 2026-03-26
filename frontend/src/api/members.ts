import { http } from "./http";


type ApiError = { code: string; message: string}
type ApiResponse<T> = { success: boolean; data?: T; error?: ApiError}

export type ProfileLinkType = "GITHUB" | "BLOG" | "PORTFOLIO" | "ETC"

export type ProfileLinkResponse = {
  id?: number
  type: ProfileLinkType
  label: string
  url: string
  displayOrder: number
}

export type MeResponse = {
    id: number
    email: string
    name: string
    nickname: string
    phone: string | null
    bio: string | null
    profileImageUrl?: string
    status: "ACTIVE" | "DELETED"
    links: ProfileLinkResponse[]
}

export type ProfileLinkRequest = {
  type: ProfileLinkType
  label: string
  url: string
  displayOrder: number
}

export type ProfileLinkForm = {
  type: ProfileLinkType
  label: string
  url: string
  displayOrder: number
}

export type UpdateProfileRequest = {
  name: string
  nickname: string
  phone?: string
  bio?: string
  links: ProfileLinkRequest[]
  removeProfileImage?: boolean
}

export type ChangePasswordRequest = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export type WithdrawRequest = {
  password: string
}

export async function getMe() {
    const { data } = await http.get<ApiResponse<MeResponse>>("/api/members/me")
    if (!data.success || !data.data) throw new Error(data.error?.message ?? "me failed")
    return data.data
    
}

export async function getMeId() {
    const me = await getMe()
    return me.id
}

export async function updateProfile(
  req: UpdateProfileRequest,
  profileImage?: File | null
) {
  const formData = new FormData()

  formData.append(
    "request",
    new Blob([JSON.stringify(req)], { type: "application/json" })
  )

  if (profileImage) {
    formData.append("profileImage", profileImage)
  }

  const { data } = await http.patch<ApiResponse<MeResponse>>(
    "/api/members/me",
    formData
  )

  if (!data.success || !data.data) {
    throw new Error(data.error?.message ?? "Update profile failed")
  }

  return data.data
}


export async function changePassword(req: ChangePasswordRequest) {
  const { data } = await http.patch<ApiResponse<null>>("/api/members/me/password", req)
  if (!data.success) {
    throw new Error(data.error?.message ?? "비밀번호 변경 실패")
  }
}

export async function withdrawMember(req: WithdrawRequest) {
  const { data } = await http.delete<ApiResponse<null>>("/api/members/me", {
    data: req,
  })
  if (!data.success) {
    throw new Error(data.error?.message ?? "회원탈퇴 실패")
  }
}