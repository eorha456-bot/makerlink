import { statusLabels } from '../marketplace/materialLabels';
import { CompanyProfileForm } from '../companies/CompanyProfileForm';
import { MarketplacePostCard } from '../marketplace/MarketplacePostCard';
export function CompanyActivity({ company, items, posts, onOpen, onSave, onDecide }) {
  return <section className="page-content"><h1>내 활동</h1>
    {['받은 제안·문의','보낸 제안·문의'].map((title,index)=>{
      const group = items.filter(o=>(o.ownerId===company.id) === (index===0));
      return <section key={title}><h2>{title}</h2>{group.length===0 && <p>아직 내역이 없습니다.</p>}
        {group.map(o=><article key={o.id} className="marketplace-post"><span className="post-badge">{statusLabels[o.status]}</span>
          <h3>{o.title}</h3><small>{index===0?o.sender:o.recipient}</small><p>{o.message}</p>
          {index===0 && o.status==='PENDING' && <footer><button onClick={()=>onDecide(o.id,'REJECTED')}>거절</button><button onClick={()=>onDecide(o.id,'ACCEPTED')}>채택</button></footer>}</article>)}</section>;
    })}
    <h2>내 게시물</h2>{!posts.length && <p>등록한 게시물이 없습니다.</p>}
    {posts.map(p=><MarketplacePostCard key={p.id} post={p} onOpen={onOpen}/>)}
    <details><summary>기업 프로필 수정</summary><CompanyProfileForm company={company} onSave={onSave}/></details>
  </section>;
}
