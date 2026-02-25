import { useParams } from "react-router-dom";

export function PostDetailPage() {
  const { id } = useParams();
  return <div>게시글 상세 (/posts/{id})</div>;
}