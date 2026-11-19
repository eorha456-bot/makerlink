import { MaterialPostSummary } from './MaterialPostSummary';

export function MarketplacePostCard({ post, onOpen }) {
  return <article className="marketplace-post">
    <MaterialPostSummary post={post} />
    <footer><small>조회 {post.views} · 제안/문의 {post.offers}</small>
      <button onClick={() => onOpen(post)}>상세 보기 <span aria-hidden="true">→</span></button>
    </footer>
  </article>;
}
