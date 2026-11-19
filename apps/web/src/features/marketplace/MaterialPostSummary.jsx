import { statusLabels } from './materialLabels';

function getDeadlineBadge(post) {
  if (!post.deadline || !['OPEN', 'NEGOTIATING'].includes(post.status)) return null;
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const days = (Date.parse(post.deadline) - today) / 86400000;
  if (days === 0) return '오늘 납기';
  return days > 0 && days <= 3 ? '납기 D−' + days : null;
}

export function MaterialPostSummary({ post }) {
  const badge = getDeadlineBadge(post);
  return <>
    <div className="status-row"><span className="post-badge">{post.type === 'REQUEST' ? '자재 요청' : '공급 가능'}</span>
      {badge && <span className="deadline-badge">{badge}</span>}
    </div>
    <h2 className="post-title">{post.title}</h2>
    <p className="post-meta">{post.company} · {post.category} · {statusLabels[post.status]}</p>
    <dl className="post-facts">
      <div><dt>규격</dt><dd>{post.specification || '협의 가능'}</dd></div>
      <div><dt>수량</dt><dd>{post.quantity?.toLocaleString('ko-KR') ?? '협의 가능'}</dd></div>
      <div><dt>희망 납기</dt><dd>{post.deadline || '협의 가능'}</dd></div>
    </dl>
  </>;
}
