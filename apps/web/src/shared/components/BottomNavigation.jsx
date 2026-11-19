const tabs = [{ id: 'feed', label: '홈' }, { id: 'performance', label: '성과' }, { id: 'register', label: '등록' }, { id: 'activity', label: '내 활동' }];
export function BottomNavigation({ activeTab, onChange }) {
  return <nav className="bottom-navigation" aria-label="주요 메뉴">{tabs.map(tab => <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => onChange(tab.id)}>{tab.label}</button>)}</nav>;
}
