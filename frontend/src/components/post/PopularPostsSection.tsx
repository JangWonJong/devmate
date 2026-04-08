import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { listPopularQuestionPosts, type PostResponse } from "../../api/posts"

export default function PopularPostsSection() {
  const [posts, setPosts] = useState<PostResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await listPopularQuestionPosts(5)
        if (!mounted) return
        setPosts(data)
      } catch {
        if (!mounted) return
        setError("인기글을 불러오지 못했습니다.")
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    }

    void load()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <section className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
              Popular Questions
            </p>
            <h2 className="text-3xl font-bold text-slate-900">
              지금 많이 반응받고 있는 질문들
            </h2>
          </div>

          <Link
            to="/posts?sort=likes,desc"
            className="hidden rounded-xl border px-4 py-2 text-sm md:inline-flex"
          >
            전체 보기
          </Link>
        </div>

        {loading && <div>로딩중...</div>}

        {error && <div className="text-red-500">{error}</div>}

        {!loading && !error && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post, index) => (
              <Link
                key={post.id}
                to={`/posts/${post.id}`}
                className="rounded-xl border bg-white p-4 hover:shadow-md transition"
              >
                <div className="mb-2 flex justify-between text-sm text-gray-500">
                  <span>{index + 1}위</span>
                  <span>{post.type}</span>
                </div>

                <div className="font-semibold text-lg">{post.title}</div>

                <div className="text-sm text-gray-500 mt-2 line-clamp-2">
                  {post.content}
                </div>

                <div className="mt-4 text-sm flex justify-between">
                  <span>{post.authorNickname}</span>
                  <span>👍 {post.likeCount}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}