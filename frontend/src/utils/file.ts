export function fileUrl(path: string) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? ""
  return `${baseUrl}${path}`
}


export function validateFiles(files: File[]) {
  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
  ]

  if (files.length > 5) {
    return "이미지는 최대 5장까지 업로드할 수 있어요."
  }

  for (const file of files) {
    if (!allowedTypes.includes(file.type)) {
      return "PNG, JPG, JPEG, WEBP 파일만 업로드할 수 있어요."
    }

    if (file.size > 5 * 1024 * 1024) {
      return "파일은 최대 5MB까지 업로드할 수 있어요."
    }
  }

  return null
}