import { useEffect, useRef, useState } from 'react'
import { loadKakaoMapSdk } from '../../../utils/kakaoMap'

type KakaoMapPreviewProps = {
  latitude: number
  longitude: number
  placeName?: string | null
}

export function KakaoMapPreview({
  latitude,
  longitude,
  placeName,
}: KakaoMapPreviewProps) {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    let cancelled = false

    ;(async () => {
      try {
        setError(null)
        await loadKakaoMapSdk()

        if (cancelled || !mapRef.current) return

        const position = new window.kakao.maps.LatLng(latitude, longitude)

        const map = new window.kakao.maps.Map(mapRef.current, {
          center: position,
          level: 3,
        })

        new window.kakao.maps.Marker({
          map,
          position,
          title: placeName ?? '스터디 장소',
        })
      } catch (e: any) {
        setError(e.message ?? '지도를 불러오지 못했습니다.')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [latitude, longitude, placeName])

  if (error) {
    return (
      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
        {error}
      </div>
    )
  }

  return (
    <div
      ref={mapRef}
      className="mt-4 h-72 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
    />
  )
}