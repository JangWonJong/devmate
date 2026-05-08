let kakaoMapLoadPromise: Promise<void> | null = null

export function loadKakaoMapSdk() {
  if (window.kakao?.maps?.services) {
    return Promise.resolve()
  }

  if (kakaoMapLoadPromise) {
    return kakaoMapLoadPromise
  }

  const appKey = import.meta.env.VITE_KAKAO_MAP_KEY

  if (!appKey) {
    return Promise.reject(new Error('카카오맵 JavaScript 키가 없습니다.'))
  }

  kakaoMapLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')

    script.dataset.kakaoMapSdk = 'true'
    script.async = true
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(
      appKey
    )}&autoload=false&libraries=services`

    script.onload = () => {
      if (!window.kakao?.maps) {
        kakaoMapLoadPromise = null
        reject(new Error('카카오맵 SDK 객체를 찾을 수 없습니다.'))
        return
      }

      window.kakao.maps.load(() => {
        resolve()
      })
    }

    script.onerror = () => {
      kakaoMapLoadPromise = null
      script.remove()
      reject(new Error('카카오맵 SDK 로드 실패'))
    }

    document.head.appendChild(script)
  })

  return kakaoMapLoadPromise
}
