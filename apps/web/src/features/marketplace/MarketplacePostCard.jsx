import { statusLabels } from './materialLabels';
export function MarketplacePostCard({ post, onOpen }) {
  return <article className="marketplace-post">
    <span className="post-badge">{post.type === 'REQUEST' ? '자재 요청' : '공급 가능'}</span> <small>{post.category} · {statusLabels[post.status]}</small>
    <h2>{post.title}</h2><p>{post.company} · 수량 {post.quantity?.toLocaleString() || '협의'}</p>
    <footer><span>조회 {post.views} · 제안/문의 {post.offers}</span><button onClick={() => onOpen(post)}>상세 보기</button></footer>
  </article>;
}
