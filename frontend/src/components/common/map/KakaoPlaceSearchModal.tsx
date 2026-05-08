import { useEffect, useState } from 'react'
import { loadKakaoMapSdk } from '../../../utils/kakaoMap'

export type KakaoPlace = {
  id: string
  placeName: string
  address: string
  roadAddress: string
  latitude: number
  longitude: number
}

type KakaoPlaceSearchModalProps = {
  open: boolean
  onClose: () => void
  onSelect: (place: KakaoPlace) => void
}

export function KakaoPlaceSearchModal({
  open,
  onClose,
  onSelect,
}: KakaoPlaceSearchModalProps) {
  const [keyword, setKeyword] = useState('')
  const [places, setPlaces] = useState<KakaoPlace[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setKeyword('')
      setPlaces([])
      setError(null)
    }
  }, [open])

  if (!open) return null

  const searchPlaces = async () => {
    const trimmed = keyword.trim()

    if (!trimmed) {
      setError('검색어를 입력해주세요.')
      return
    }

    try {
      setLoading(true)
      setError(null)

      await loadKakaoMapSdk()

      const placesService = new window.kakao.maps.services.Places()

      placesService.keywordSearch(trimmed, (data: any[], status: string) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const results = data.map((item) => ({
            id: item.id,
            placeName: item.place_name,
            address: item.address_name,
            roadAddress: item.road_address_name,
            latitude: Number(item.y),
            longitude: Number(item.x),
          }))

          setPlaces(results)
          setError(null)
        } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
          setPlaces([])
          setError('검색 결과가 없습니다.')
        } else {
          setPlaces([])
          setError('장소 검색 중 오류가 발생했습니다.')
        }

        setLoading(false)
      })
    } catch (e: any) {
      setLoading(false)
      setError(e.message ?? '카카오맵을 불러오지 못했습니다.')
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 px-4">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">장소 검색</h2>
            <p className="mt-2 text-sm text-slate-500">
              스터디가 진행될 장소를 검색하고 선택하세요.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-3 py-1.5 text-sm font-semibold text-slate-500 hover:bg-slate-100"
          >
            닫기
          </button>
        </div>

        <div className="flex gap-2">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') searchPlaces()
            }}
            placeholder="예: 강남 스터디카페, 노원 할리스"
            className="h-12 flex-1 rounded-2xl border border-slate-300 px-4 text-sm outline-none transition focus:border-indigo-500"
          />

          <button
            type="button"
            disabled={loading}
            onClick={searchPlaces}
            className="rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? '검색 중...' : '검색'}
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {error}
          </div>
        )}

        <div className="mt-5 max-h-[420px] space-y-3 overflow-y-auto">
          {places.map((place) => (
            <button
              key={place.id}
              type="button"
              onClick={() => {
                onSelect(place)
                onClose()
              }}
              className="block w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-indigo-300 hover:bg-indigo-50"
            >
              <div className="font-bold text-slate-900">{place.placeName}</div>

              <div className="mt-1 text-sm leading-6 text-slate-600">
                {place.roadAddress || place.address}
              </div>

              {place.roadAddress && place.address && (
                <div className="mt-1 text-xs leading-5 text-slate-400">
                  지번: {place.address}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}