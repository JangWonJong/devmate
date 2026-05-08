import { useState } from 'react'
import { KakaoPlaceSearchModal, type KakaoPlace } from './KakaoPlaceSearchModal'

type PlaceSelectModalProps = {
  open: boolean
  title: string
  loading?: boolean

  placeName: string
  address: string

  onChangePlaceName: (value: string) => void
  onChangeAddress: (value: string) => void
  onSelectPlace: (place: KakaoPlace) => void

  onConfirm: () => void
  onCancel: () => void
}

export function PlaceSelectModal({
  open,
  title,
  loading = false,
  placeName,
  address,
  onChangePlaceName,
  onChangeAddress,
  onSelectPlace,
  onConfirm,
  onCancel,
}: PlaceSelectModalProps) {
  const [searchOpen, setSearchOpen] = useState(false)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            장소를 검색하거나 직접 입력해 주세요.
          </p>
        </div>

        <div className="mt-5 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-semibold text-slate-700">
                장소명
              </label>

              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100"
              >
                장소 검색
              </button>
            </div>

            <input
              value={placeName}
              onChange={(e) => onChangePlaceName(e.target.value)}
              placeholder="예: 강남 스터디카페"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">주소</label>

            <input
              value={address}
              onChange={(e) => onChangeAddress(e.target.value)}
              placeholder="예: 서울 강남구 테헤란로"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            취소
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>

      <KakaoPlaceSearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={(place) => {
          onSelectPlace(place)
          setSearchOpen(false)
        }}
      />
    </div>
  )
}
