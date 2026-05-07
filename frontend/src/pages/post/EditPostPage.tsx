import React, { useEffect, useMemo, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { PostAttachmentResponse } from '../../api/post/posts'
import { getPost, updatePost } from '../../api/post/posts'
import { validateFiles } from '../../utils/file'
import { PageContainer } from '../../layouts/PageContainer'
import { makeFileKey } from '../../utils/file'
import { CodeBlockButtons } from '../../components/common/markdown/CodeBlockButtons'
import { insertCodeBlockAtCursor } from '../../utils/button'

export function EditPostPage() {
  const nav = useNavigate()
  const { id } = useParams()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [solved, setSolved] = useState(false)

  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [files, setFiles] = useState<File[]>([])
  const [existingFiles, setExistingFiles] = useState<PostAttachmentResponse[]>(
    []
  )
  const [removedFileIds, setRemovedFileIds] = useState<number[]>([])

  const [dragging, setDragging] = useState(false)

  const contentRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        setErr(null)
        setLoading(true)

        if (!id) return

        const post = await getPost(id)
        setTitle(post.title)
        setContent(post.content)
        setSolved(post.solved)
        setExistingFiles(post.attachments ?? [])
      } catch (e: any) {
        setErr(e.message ?? '게시글 불러오기 실패')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const previewUrls = useMemo(() => {
    return files.map((file) => ({
      key: makeFileKey(file),
      name: file.name,
      url: URL.createObjectURL(file),
    }))
  }, [files])

  useEffect(() => {
    return () => {
      previewUrls.forEach((item) => URL.revokeObjectURL(item.url))
    }
  }, [previewUrls])

  const addFiles = (selected: File[]) => {
    setFiles((prev) => {
      const merged = [...prev, ...selected]

      const unique = merged.filter(
        (file, index, self) =>
          index === self.findIndex((f) => makeFileKey(f) === makeFileKey(file))
      )

      return unique.slice(0, 5)
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files ? Array.from(e.target.files) : []
    if (selected.length === 0) return

    addFiles(selected)
    e.currentTarget.value = ''
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)

    const dropped = Array.from(e.dataTransfer.files ?? [])
    if (dropped.length === 0) return

    addFiles(dropped)
  }

  const removeExistingFile = (fileId: number) => {
    setRemovedFileIds((prev) =>
      prev.includes(fileId) ? prev : [...prev, fileId]
    )
    setExistingFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const removeNewFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async () => {
    setErr(null)

    const t = title.trim()
    const c = content.trim()

    if (!t) return setErr('제목을 입력해 주세요.')
    if (!c) return setErr('내용을 입력해 주세요.')
    if (!id) return setErr('잘못된 접근입니다.')

    const fileError = validateFiles(files)
    if (fileError) return setErr(fileError)

    try {
      setSaving(true)

      await updatePost(
        id,
        {
          title: t,
          content: c,
          solved,
          removedFileIds,
        },
        files
      )

      nav(`/posts/${id}`)
    } catch (e: any) {
      setErr(e.message ?? '수정 실패')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
        게시글 불러오는 중...
      </div>
    )
  }

  return (
    <PageContainer className="mx-auto max-w-4xl">
      <section className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          게시글 수정
        </h1>
        <p className="text-lg leading-8 text-slate-600">
          기존 내용을 수정하고, 해결 상태와 첨부 이미지를 함께 관리할 수 있어요.
        </p>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="space-y-8">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">제목</label>
            <input
              placeholder="제목을 입력해 주세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-13 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-semibold text-slate-700">
                내용
              </label>

              <CodeBlockButtons
                onSelect={(lang) =>
                  insertCodeBlockAtCursor(contentRef, content, setContent, lang)
                }
              />
            </div>
            <textarea
              ref={contentRef}
              placeholder="내용을 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[280px] w-full resize-y rounded-2xl border border-slate-300 bg-white px-4 py-4 text-sm leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
            />
          </div>

          {existingFiles.length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">
                현재 첨부 이미지
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                {existingFiles.map((file) => (
                  <div
                    key={file.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                  >
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL}${file.fileUrl}`}
                      alt={file.originalFileName}
                      className="w-full object-cover"
                    />
                    <div className="flex items-center justify-between px-3 py-2 text-xs text-slate-500">
                      <span className="truncate">{file.originalFileName}</span>
                      <button
                        type="button"
                        onClick={() => removeExistingFile(file.id)}
                        className="ml-3 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-100"
                      >
                        제거
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-semibold text-slate-700">
                새 이미지 첨부
              </label>
            </div>

            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
                dragging
                  ? 'border-indigo-400 bg-indigo-50'
                  : 'border-slate-300 bg-slate-50 hover:border-slate-400'
              }`}
            >
              <p className="text-sm font-medium text-slate-700">
                파일을 드래그해서 업로드
              </p>
              <p className="mt-1 text-xs text-slate-500">
                또는 아래 버튼으로 선택하세요
              </p>

              <label className="mt-4 cursor-pointer rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                파일 선택
                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <p className="text-xs text-slate-500">
              새 이미지를 추가할 수 있어요. 최대 5장, 각 5MB까지 업로드
              가능해요.
            </p>
          </div>

          {files.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 text-sm font-semibold text-slate-900">
                새로 업로드할 파일 ({files.length}/5)
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {previewUrls.map((item, index) => (
                  <div
                    key={item.key}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                  >
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full object-cover"
                    />
                    <div className="flex items-center justify-between px-3 py-2 text-xs text-slate-500">
                      <span className="truncate">{item.name}</span>
                      <button
                        type="button"
                        onClick={() => removeNewFile(index)}
                        className="ml-3 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-100"
                      >
                        제거
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={solved}
                onChange={(e) => setSolved(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              해결됨으로 표시
            </label>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              체크하면 이 게시글은 해결된 고민으로 표시됩니다.
            </p>
          </div>

          {err && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {err}
            </div>
          )}

          {saving && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
              게시글 수정 중...
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6">
            <button
              disabled={saving}
              onClick={onSubmit}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              수정 완료
            </button>

            <button
              disabled={saving}
              onClick={() => nav(-1)}
              className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              취소
            </button>
          </div>
        </div>
      </section>
    </PageContainer>
  )
}
