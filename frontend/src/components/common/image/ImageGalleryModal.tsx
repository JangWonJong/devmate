import { useEffect } from "react"

export type GalleryImage = {
  id: number
  fileUrl: string
  originalFileName: string
}

type ImageGalleryModalProps = {
  images: GalleryImage[]
  currentIndex: number
  getImageUrl: (fileUrl: string) => string
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

export function ImageGalleryModal({
  images,
  currentIndex,
  getImageUrl,
  onClose,
  onPrev,
  onNext,
}: ImageGalleryModalProps) {
  const current = images[currentIndex]

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") onPrev()
      if (e.key === "ArrowRight") onNext()
    }

    window.addEventListener("keydown", handleKeyDown)
    document.body.style.overflow = "hidden"

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [onClose, onPrev, onNext])

  if (!current) return null

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 px-4 py-6"
      onClick={onClose}
    >
      <div
        className="relative max-h-full w-full max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-0 top-0 z-10 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-white"
        >
          닫기
        </button>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={onPrev}
              className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 px-4 py-3 text-lg font-bold text-slate-900 shadow hover:bg-white"
            >
              ‹
            </button>

            <button
              type="button"
              onClick={onNext}
              className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 px-4 py-3 text-lg font-bold text-slate-900 shadow hover:bg-white"
            >
              ›
            </button>
          </>
        )}

        <img
          src={getImageUrl(current.fileUrl)}
          alt={current.originalFileName}
          className="mx-auto max-h-[85vh] max-w-full rounded-2xl object-contain"
        />

        <div className="mt-3 text-center text-sm text-white/80">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  )
}