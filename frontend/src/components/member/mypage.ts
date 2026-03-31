export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("ko-KR")
}

export function isUpcomingReservation(date: string, endTime: string) {
  const now = new Date()
  const end = new Date(`${date}T${endTime}`)
  return end >= now
}

export type RecentActivityItem = {
  type: "POST" | "COMMENT" | "LIKE"
  title: string
  description: string
  createdAt: string
  postId: number
}

export function buildRecentActivities({
  myPosts,
  myComments,
  likedPosts,
}: {
  myPosts: {
    id: number
    title: string
    createdAt: string
  }[]
  myComments: {
    postId: number
    postTitle: string
    content: string
    createdAt: string
  }[]
  likedPosts: {
    id: number
    title: string
    createdAt: string
  }[]
}) {
  const postActivities: RecentActivityItem[] = myPosts.map((post) => ({
    type: "POST",
    title: post.title,
    description: "내가 작성한 게시글입니다.",
    createdAt: post.createdAt,
    postId: post.id,
  }))

  const commentActivities: RecentActivityItem[] = myComments.map((comment) => ({
    type: "COMMENT",
    title: comment.postTitle,
    description: comment.content,
    createdAt: comment.createdAt,
    postId: comment.postId,
  }))

  const likedActivities: RecentActivityItem[] = likedPosts.map((post) => ({
    type: "LIKE",
    title: post.title,
    description: "좋아요한 게시글입니다.",
    createdAt: post.createdAt,
    postId: post.id,
  }))

  return [...postActivities, ...commentActivities, ...likedActivities]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 6)
}

export function countRecentActivities(
  items: { createdAt: string }[],
  days: number
) {
  const now = new Date()
  const limit = new Date()
  limit.setDate(now.getDate() - days)

  return items.filter(
    (item) => new Date(item.createdAt) >= limit
  ).length
}