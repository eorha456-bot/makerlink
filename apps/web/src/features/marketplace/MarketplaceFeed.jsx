import { useState } from 'react';
import { categories } from './materialLabels';
import { MarketplacePostCard } from './MarketplacePostCard';
export function MarketplaceFeed({ posts, onOpen }) {
  const [category, setCategory] = useState('전체');
  const [keyword, setKeyword] = useState('');
  const filtered = posts.filter(p => (category === '전체' || category === p.category) &&
    [p.title,p.company,p.specification].join(' ').toLowerCase().includes(keyword.trim().toLowerCase()));
  return <section className="page-content"><h1>자재 매칭 피드</h1>
    <input type="search" aria-label="품목·규격·기업 검색" placeholder="품목·규격·기업 검색" value={keyword} onChange={e=>setKeyword(e.target.value)}/>
    <div className="filter-row">{['전체',...categories].map(c=><button key={c} aria-pressed={c===category} className={'filter '+(c===category?'active':'')} onClick={()=>setCategory(c)}>{c}</button>)}</div>
    <div className="post-list">{filtered.map(post=><MarketplacePostCard key={post.id} post={post} onOpen={onOpen}/>)}</div>
    {!filtered.length && <p>{posts.length ? '조건에 맞는 게시물이 없습니다.' : '첫 자재 요청이나 공급 품목을 등록해 주세요.'}</p>}
  </section>;
}
