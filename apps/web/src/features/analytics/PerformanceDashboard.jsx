const metrics = { views:'상세 조회', clicks:'문의 버튼 클릭', offers:'접수된 제안·문의', matched:'매칭 완료' };
function rate(p) { return p.views ? (100*p.offers/p.views).toFixed(1)+'%' : '—'; }
export function PerformanceDashboard({ totals, posts }) {
  return <section className="page-content">
    <div className="metric-grid">{Object.entries(metrics).map(([key,label])=><div className="metric-card" key={key}><span>{label}</span><strong>{totals[key]}</strong></div>)}</div>
    <h2>게시물별 성과</h2>{!posts.length && <p>게시물을 등록하면 성과가 표시됩니다.</p>}
    {posts.map(p=><div key={p.id} className="analytics-row"><div><strong>{p.title}</strong><span>조회 {p.views} · 클릭 {p.clicks} · 접수 {p.offers} · 매칭 {p.matched}</span></div><b>{rate(p)}</b></div>)}
    {!!posts.length && <small className="analytics-note">문의 전환율 = 접수 건수 ÷ 상세 조회 수 × 100</small>}
  </section>;
}
