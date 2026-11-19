import { statusLabels } from './materialLabels';
export function MaterialPostDetail({ post, composing, company, signedIn, onBack, onContact, onSend, onProfile, onClose }) {
  const open = ['OPEN','NEGOTIATING'].includes(post.status);
  const action = post.type === 'REQUEST' ? '공급 제안' : '공급 문의';
  return <section className="page-content">
    <button className="filter" onClick={onBack}>목록으로</button>
    <article className="marketplace-post post-detail"><span className="post-badge">{post.type==='REQUEST'?'자재 요청':'공급 가능'} · {statusLabels[post.status]}</span>
      <h1>{post.title}</h1><dl>{Object.entries({'기업':post.company,'분류':post.category,'규격':post.specification,'수량':post.quantity,'납기일':post.deadline || '협의 가능'}).map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
      {open && company?.id!==post.companyId && (composing ? <form onSubmit={e=>{e.preventDefault();onSend(new FormData(e.currentTarget).get('message'));}}>
        <label>{action} 내용<textarea name="message" required maxLength={2000}/></label><button className="primary-action">{action} 보내기</button></form>
        : company ? <button className="primary-action" onClick={onContact}>{action}하기</button>
        : signedIn ? <button onClick={onProfile}>기업 프로필 등록</button> : <p>상단에서 로그인하면 {action}를 보낼 수 있습니다.</p>)}
      {open && company?.id===post.companyId && <button className="filter" onClick={onClose}>모집 마감</button>}
    </article>
  </section>;
}
