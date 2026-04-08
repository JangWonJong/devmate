import { http } from "./http"
import type { ApiResponse } from "./type"

export type StudyCreateRequest = {
    postId: number
    maxMembers: number
}

export type StudyResponse = {
    id: number
    postId: number
    postTitle: string
    authorNickname: string
    leaderNickname: string
    maxMembers: number
    notice: string | null
    status: string
    currentMembers: number
    createdAt: string
}

export type StudyMemberResponse = {
    memberId: number
    nickname: string
    role: string
    joinedAt: string
}

export type StudyLeaderDelegateRequest = { 
    targetMemberId: number
}

export async function createStudy(req: StudyCreateRequest) {
    
    const {data} = await http.post<ApiResponse<number>>("/api/studies", req)
    if (!data.success || data.data == null) {
        throw new Error(data?.error?.message ?? "Create study failed")
    }
    return data.data
    
}

export async function getStudy(studyId: number) {
    
    const {data} = await http.get<ApiResponse<StudyResponse>>(`/api/studies/${studyId}`)
    if (!data.success || data.data == null) {
        throw new Error(data?.error?.message ?? "Get study failed")
    }
    return data.data
    
}

export async function getStudyMembers(studyId: number) {

    const {data} = await http.get<ApiResponse<StudyMemberResponse[]>>(`/api/studies/${studyId}/members`)
    if (!data.success || data.data == null) {
        throw new Error(data?.error?.message ?? "Get study members failed")
    }
    return data.data
    
}

export async function joinStudy(studyId: number) {
  const { data } = await http.post<ApiResponse<number>>(`/api/studies/${studyId}/join`)
  if (!data.success || data.data == null) {
    throw new Error(data?.error?.message ?? "Join study failed")
  }
  return data.data
}

export async function leaveStudy(studyId: number) {
  const { data } = await http.post<ApiResponse<number>>(`/api/studies/${studyId}/leave`)
  if (!data.success || data.data == null) {
    throw new Error(data?.error?.message ?? "Leave study failed")
  }
  return data.data
}

export async function closeStudy(studyId: number) {
  const { data } = await http.post<ApiResponse<number>>(`/api/studies/${studyId}/close`)
  if (!data.success || data.data == null) {
    throw new Error(data?.error?.message ?? "Close study failed")
  }
  return data.data
}

export async function delegateStudyLeader(
  studyId: number,
  req: StudyLeaderDelegateRequest
) {
  const { data } = await http.post<ApiResponse<number>>(
    `/api/studies/${studyId}/delegate`,
    req
  )
  if (!data.success || data.data == null) {
    throw new Error(data?.error?.message ?? "Delegate leader failed")
  }
  return data.data
}

export async function getMyStudies() {
  const { data } = await http.get<ApiResponse<StudyResponse[]>>("/api/studies/me")
  if (!data.success || data.data == null) {
    throw new Error(data?.error?.message ?? "Get my studies failed")
  }
  return data.data
}

export async function getStudyByPostId(postId: number) {
  const { data } = await http.get<ApiResponse<StudyResponse>>(
    `/api/studies/post/${postId}`
  )

  if (!data.success || data.data == null) {
    throw new Error(data?.error?.message ?? "Get study by post failed")
  }

  return data.data
}


export async function updateStudyCapacity(studyId: number, req: { maxMembers: number}) {

  const {data} = await http.patch<ApiResponse<number>>(`/api/studies/${studyId}/capacity`, req)
  
  if (!data.success || !data.data == null) {
    throw new Error(data.error?.message ?? "스터디 정원 수정 실패")
  }

  return data.data
  
}

export async function updateStudyNotice(studyId: number, notice:string) {
  
  const {data} = await http.patch<ApiResponse<number>>(
    `/api/studies/${studyId}/notice`, { notice}
  )

  if (!data.success || !data.data == null) {
    throw new Error(data.error?.message ?? "공지 수정 실패")
  }

  return data.data
  
}


export async function listPopularStudies(limit = 3): Promise<StudyResponse[]> {
  const { data } = await http.get<ApiResponse<StudyResponse[]>>("/api/studies/popular", {
    params: { limit },
  })

  if (!data.success || data.data == null) {
    throw new Error(data.error?.message ?? "Popular studies failed")
  }

  return data.data
}