import { useNavigate } from "react-router-dom"
import InquiryList from "../../components/support/InquiryList"
import { PageContainer } from "../../layouts/PageContainer"

export function MyInquiriesPage() {
  const nav = useNavigate()

  return (
    <PageContainer className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-600">My Page</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
            내 문의
          </h1>
          <p className="mt-2 text-base text-slate-600">
            문의 내역과 관리자 답변을 확인할 수 있어요.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => nav("/mypage")}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            마이페이지로
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              내 문의 목록
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              접수 상태, 처리 진행 상황, 답변 완료 여부를 확인할 수 있습니다.
            </p>
          </div>
        </div>

        <InquiryList variant="full" />
      </section>
    </PageContainer>
  )
}