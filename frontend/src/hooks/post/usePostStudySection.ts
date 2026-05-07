import { useEffect, useState } from "react"
import {
  closeStudy,
  createStudy,
  delegateStudyLeader,
  getStudy,
  getStudyByPostId,
  getStudyMembers,
  joinStudy,
  leaveStudy,
  updateStudyCapacity,
  updateStudyNotice,
  type StudyMemberResponse,
  type StudyResponse,
} from "../../api/study/study"
import {
  listStudyReservations,
  type ReservationResponse,
} from "../../api/reservation/reservations"
import type { PostResponse } from "../../api/post/posts"
import { apiErrorMessage } from "../../utils/error"
import { appToast } from "../../lib/toast"

type OpenConfirmArgs = {
  title: string
  message: string
  danger?: boolean
  onConfirm: () => Promise<void>
}

type UsePostStudySectionParams = {
  post: PostResponse | null
  openConfirm: (args: OpenConfirmArgs) => void
  closeConfirm: () => void
}

export function usePostStudySection({
  post,
  openConfirm,
  closeConfirm,
}: UsePostStudySectionParams) {
  const [study, setStudy] = useState<StudyResponse | null>(null)
  const [studyLoading, setStudyLoading] = useState(false)
  const [studyError, setStudyError] = useState<string | null>(null)
  const [studyMembers, setStudyMembers] = useState<StudyMemberResponse[]>([])
  const [studyReservations, setStudyReservations] = useState<
    ReservationResponse[]
  >([])
  const [reservationsLoading, setReservationsLoading] = useState(false)

  const [noticeModalOpen, setNoticeModalOpen] = useState(false)
  const [noticeInput, setNoticeInput] = useState("")

  const [capacityModalOpen, setCapacityModalOpen] = useState(false)
  const [capacityInput, setCapacityInput] = useState("4")
  const [capacityMode, setCapacityMode] = useState<"create" | "update">(
    "create"
  )

  const refreshStudySection = async (postId: number) => {
    const s = await getStudyByPostId(postId)
    setStudy(s)

    const members = await getStudyMembers(s.id)
    setStudyMembers(members)

    const reservationPage = await listStudyReservations({
      studyId: s.id,
      page: 0,
      size: 20,
      sort: "date,asc",
    })

    setStudyReservations(reservationPage.content)
  }

  useEffect(() => {
    if (!post) return
    if (post.type !== "STUDY") return

    let cancelled = false

    ;(async () => {
      try {
        setStudyLoading(true)
        setReservationsLoading(true)
        setStudyError(null)

        const s = await getStudyByPostId(post.id)
        if (cancelled) return
        setStudy(s)

        const members = await getStudyMembers(s.id)
        if (cancelled) return
        setStudyMembers(members)

        const reservationPage = await listStudyReservations({
          studyId: s.id,
          page: 0,
          size: 20,
          sort: "date,asc",
        })

        if (cancelled) return
        setStudyReservations(reservationPage.content)
      } catch (e: any) {
        const status = e?.response?.status

        if (status === 404) {
          if (cancelled) return

          setStudy(null)
          setStudyMembers([])
          setStudyReservations([])
          return
        }

        if (cancelled) return

        setStudyError(apiErrorMessage(e, "스터디 정보를 불러오지 못했습니다."))
      } finally {
        if (!cancelled) {
          setStudyLoading(false)
          setReservationsLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [post])

  const onCreateStudy = async () => {
    setCapacityMode("create")
    setCapacityInput("4")
    setCapacityModalOpen(true)
  }

  const onUpdateStudyCapacity = async () => {
    if (!study) return

    setCapacityMode("update")
    setCapacityInput(String(study.maxMembers))
    setCapacityModalOpen(true)
  }

  const submitCapacity = async (value: string) => {
    if (!post) return

    const maxMembers = Number(value)

    if (!Number.isInteger(maxMembers) || maxMembers < 2) {
      setStudyError("최대 인원은 2명 이상이어야 합니다.")
      return
    }

    try {
      setStudyError(null)
      setStudyLoading(true)

      if (capacityMode === "create") {
        const studyId = await createStudy({
          postId: post.id,
          maxMembers,
        })

        const createdStudy = await getStudy(studyId)
        setStudy(createdStudy)

        const members = await getStudyMembers(studyId)
        setStudyMembers(members)

        appToast.success("스터디가 생성되었습니다.")
      } else {
        if (!study) return

        await updateStudyCapacity(study.id, { maxMembers })
        await refreshStudySection(post.id)

        appToast.success("정원이 수정되었습니다.")
      }

      setCapacityModalOpen(false)
      setCapacityInput("")
    } catch (e: any) {
      setStudyError(
        apiErrorMessage(
          e,
          capacityMode === "create" ? "스터디 생성 실패" : "스터디 정원 수정 실패"
        )
      )
    } finally {
      setStudyLoading(false)
    }
  }

  const onJoinStudy = async () => {
    if (!study || !post) return

    try {
      setStudyError(null)
      setStudyLoading(true)

      await joinStudy(study.id)
      await refreshStudySection(post.id)

      appToast.success("스터디에 참여했습니다.")
    } catch (e: any) {
      setStudyError(apiErrorMessage(e, "스터디 참가 실패"))
    } finally {
      setStudyLoading(false)
    }
  }

  const onLeaveStudy = async () => {
    if (!study || !post) return

    openConfirm({
      title: "스터디 탈퇴",
      message: "스터디에서 탈퇴할까요?",
      danger: true,
      onConfirm: async () => {
        try {
          setStudyError(null)
          setStudyLoading(true)

          await leaveStudy(study.id)
          await refreshStudySection(post.id)

          appToast.success("스터디에서 탈퇴했습니다.")
        } catch (e: any) {
          setStudyError(apiErrorMessage(e, "스터디 탈퇴 실패"))
        } finally {
          setStudyLoading(false)
          closeConfirm()
        }
      },
    })
  }

  const onCloseStudy = async () => {
    if (!study || !post) return

    openConfirm({
      title: "스터디 모집 마감",
      message: "스터디 모집을 마감할까요?",
      danger: true,
      onConfirm: async () => {
        try {
          setStudyError(null)
          setStudyLoading(true)

          await closeStudy(study.id)
          await refreshStudySection(post.id)

          appToast.success("스터디 모집을 마감했습니다.")
        } catch (e: any) {
          setStudyError(apiErrorMessage(e, "스터디 모집 마감 실패"))
        } finally {
          setStudyLoading(false)
          closeConfirm()
        }
      },
    })
  }

  const onDelegateLeader = async (targetMemberId: number) => {
    if (!study || !post) return

    openConfirm({
      title: "리더 위임",
      message: "이 멤버에게 리더를 위임할까요?",
      onConfirm: async () => {
        try {
          setStudyError(null)
          setStudyLoading(true)

          await delegateStudyLeader(study.id, { targetMemberId })
          await refreshStudySection(post.id)

          appToast.success("리더를 위임했습니다.")
        } catch (e: any) {
          setStudyError(apiErrorMessage(e, "리더 위임 실패"))
        } finally {
          setStudyLoading(false)
          closeConfirm()
        }
      },
    })
  }

  const onUpdateNotice = async () => {
    if (!study || !post) return

    setNoticeInput(study.notice ?? "")
    setNoticeModalOpen(true)
  }

  const submitUpdateNotice = async (value: string) => {
    if (!study || !post) return

    try {
      setStudyError(null)
      setStudyLoading(true)

      await updateStudyNotice(study.id, value)
      await refreshStudySection(post.id)

      appToast.success("공지 내용이 수정되었습니다.")
      setNoticeModalOpen(false)
      setNoticeInput("")
    } catch (e: any) {
      setStudyError(apiErrorMessage(e, "공지 수정 실패"))
    } finally {
      setStudyLoading(false)
    }
  }

  return {
    study,
    studyLoading,
    studyError,
    studyMembers,
    studyReservations,
    reservationsLoading,

    noticeModalOpen,
    noticeInput,
    setNoticeModalOpen,
    setNoticeInput,

    capacityModalOpen,
    capacityInput,
    capacityMode,
    setCapacityModalOpen,
    setCapacityInput,

    onCreateStudy,
    onJoinStudy,
    onLeaveStudy,
    onCloseStudy,
    onUpdateStudyCapacity,
    onUpdateNotice,
    onDelegateLeader,
    submitUpdateNotice,
    submitCapacity,
  }
}