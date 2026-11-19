import { apiBase } from '../api/makerlinkApi';
export function AppHeader({ session, onLogout }) {
  return <header className="app-header">
    <div><strong>MAKERLINK</strong><p>제조업 자재·물품 연결</p></div>
    {session?.userId ? <div className="session-actions"><span>로그인됨</span><button onClick={onLogout}>로그아웃</button></div>
      : session && <a className="kakao-login-link" href={apiBase + '/auth/kakao'}>카카오 로그인</a>}
  </header>;
}
