import { useEffect, useRef, useState } from 'react';
import { request } from '../shared/api/makerlinkApi';
import { AppHeader } from '../shared/components/AppHeader';
import { BottomNavigation } from '../shared/components/BottomNavigation';
import { MarketplaceFeed } from '../features/marketplace/MarketplaceFeed';
import { MaterialPostForm } from '../features/marketplace/MaterialPostForm';
import { MaterialPostDetail } from '../features/marketplace/MaterialPostDetail';
import { CompanyProfileForm } from '../features/companies/CompanyProfileForm';
import { CompanyActivity } from '../features/offers/CompanyActivity';
import { PerformanceDashboard } from '../features/analytics/PerformanceDashboard';
import './marketplace-layout.css';

const pageTitles = { feed:'자재 매칭 피드', register:'자재 게시물 등록', activity:'내 활동', performance:'우리 기업 홍보 성과' };

async function loadScreen(tab) {
  const session = await request('/auth/session').catch(error=>{
    if (error.status===401) return { userId:null };
    throw error;
  });
  const company = session.userId ? await request('/companies/me') : null;
  const [feed, activity, dashboard] = await Promise.all([
    ['feed','activity'].includes(tab) ? request('/posts') : null,
    company && tab==='activity' ? request('/offers/mine') : null,
    company && tab==='performance' ? request('/analytics/dashboard') : null
  ]);
  return { session,company,posts:feed?.items || [],offers:activity?.items || [],dashboard };
}

export function MakerLinkApp() {
  const [tab,setTab] = useState('feed');
  const [screen,setScreen] = useState(null);
  const [revision,setRevision] = useState(0);
  const [detail,setDetail] = useState(null);
  const [composing,setComposing] = useState(false);
  const [error,setError] = useState('');
  const [notice,setNotice] = useState('');
  const [busy,setBusy] = useState(false);
  const pending = useRef(false);
  useEffect(()=>{
    let active = true;
    loadScreen(tab).then(value=>{ if(active) setScreen(value); })
      .catch(e=>{ if(active) setError(e.message); });
    return ()=>{ active=false; };
  },[tab,revision]);

  function navigate(next, message='') {
    setDetail(null); setComposing(false); setError(''); setNotice(message);
    setScreen(null); setTab(next); setRevision(r=>r+1);
  }
  async function perform(operation) {
    if (pending.current) return;
    pending.current=true; setBusy(true); setError(''); setNotice('');
    try { await operation(); }
    catch(e) { setError(e.message); }
    finally { pending.current=false; setBusy(false); }
  }
  function openPost(post) {
    perform(async ()=>{
      await request('/posts/'+post.id+'/events','POST',{eventType:'VIEW'});
      setDetail(post); setComposing(false);
    });
  }
  function saveCompany(values) {
    perform(async ()=>{ await request('/companies/me','PUT',values); navigate(tab,'기업 정보를 저장했습니다.'); });
  }
  function renderPage() {
    if (!screen) return error ? <button className="filter" onClick={()=>navigate(tab)}>다시 불러오기</button> : <p role="status">불러오는 중…</p>;
    const { session, company, posts, offers, dashboard } = screen;
    if (detail) return <MaterialPostDetail post={detail} company={company} signedIn={!!session.userId} composing={composing}
      onBack={()=>navigate(tab)} onProfile={()=>navigate('activity')}
      onClose={()=>{
        if (window.confirm('모집을 마감할까요? 검토 대기 중인 제안은 미채택 처리됩니다.')) {
          perform(async()=>{ await request('/posts/'+detail.id+'/close','PATCH'); navigate('activity','모집을 마감했습니다.'); });
        }
      }}
      onContact={()=>perform(async()=>{ await request('/posts/'+detail.id+'/events','POST',{eventType:'CONTACT_CLICK'}); setComposing(true); })}
      onSend={message=>perform(async()=>{ await request('/offers','POST',{postId:detail.id,message}); navigate('activity','상대 기업에 전달했습니다.'); })}/>;
    if (tab==='feed') return <MarketplaceFeed posts={posts} onOpen={openPost}/>;
    if (!session.userId) return <section className="page-content"><p>상단의 카카오 로그인으로 계속해 주세요.</p></section>;
    if (!company) return <section className="page-content"><p>첫 이용 시 소속 기업을 등록해 주세요.</p><CompanyProfileForm onSave={saveCompany}/></section>;
    if (tab==='register') return <MaterialPostForm onSave={values=>perform(async()=>{ await request('/posts','POST',values); navigate('feed','게시물이 등록되었습니다.'); })}/>;
    if (tab==='performance') return <PerformanceDashboard totals={dashboard.totals} posts={dashboard.items}/>;
    return <CompanyActivity company={company} items={offers} posts={posts.filter(p=>p.companyId===company.id)}
      onOpen={openPost} onSave={saveCompany} onDecide={(id,status)=>perform(async()=>{
        await request('/offers/'+id+'/status','PATCH',{status}); navigate('activity',status==='ACCEPTED'?'매칭이 완료되었습니다.':'제안을 거절했습니다.');
      })}/>;
  }
  return <main className="app-shell"><fieldset className="screen-controls" disabled={busy}>
    <AppHeader title={detail ? (detail.type === 'REQUEST' ? '자재 요청 상세' : '공급 품목 상세') : pageTitles[tab]}
      companyName={screen?.company?.name} session={screen?.session}
      onLogout={()=>perform(async()=>{await request('/auth/logout','POST');navigate('feed','로그아웃했습니다.');})}/>
    {error && <p className="feedback error" role="alert">{error}</p>}
    {notice && <p className="feedback" role="status">{notice}</p>}
    {renderPage()}<BottomNavigation activeTab={tab} onChange={navigate}/>
  </fieldset></main>;
}
