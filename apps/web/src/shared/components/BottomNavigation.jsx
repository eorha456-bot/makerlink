const tabs = [
  { id: 'feed', label: '홈', path: 'M3 11 12 3l9 8v10h-6v-7H9v7H3z' },
  { id: 'performance', label: '성과', path: 'M3 3v18h18 M8 16v-4m5 4V8m5 8V5' },
  { id: 'register', label: '등록', path: 'M11 5H4v15h15v-7 M9 15l1-4 9-9 3 3-9 9z' },
  { id: 'activity', label: '내 활동', path: 'M3 8h18v12H3z M8 8V5h8v3 M3 12q9 5 18 0' }
];

export function BottomNavigation({ activeTab, onChange }) {
  return <nav className="bottom-navigation" aria-label="주요 메뉴">
    {tabs.map(tab => <button key={tab.id} aria-current={tab.id === activeTab ? 'page' : undefined} onClick={() => onChange(tab.id)}>
      <svg aria-hidden="true" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round"><path d={tab.path}/></svg>
      {tab.label}
    </button>)}
  </nav>;
}
