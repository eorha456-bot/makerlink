import { apiBase } from '../api/makerlinkApi';

export function AppHeader({ title, companyName, session, onLogout }) {
  return <header className="app-header">
    <div className="header-row">
      <strong className="wordmark"><i aria-hidden="true" />MakerLink</strong>
      {session?.userId
        ? <div className="session-actions"><span title={companyName}>{companyName || '로그인됨'}</span><button onClick={onLogout}>로그아웃</button></div>
        : session && <a className="kakao-login-link" href={apiBase + '/auth/kakao'}>카카오 로그인</a>}
    </div>
    <h1>{title}</h1>
  </header>;
}
