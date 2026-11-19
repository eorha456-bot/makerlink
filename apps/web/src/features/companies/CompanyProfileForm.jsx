export function CompanyProfileForm({ company, onSave }) {
  return <form className="form-panel" onSubmit={e=>{e.preventDefault(); onSave(Object.fromEntries(new FormData(e.currentTarget)));}}>
    <h2>기업 프로필</h2>
    <label>회사명<input name="name" required maxLength={150} defaultValue={company?.name}/></label>
    <label>업종<input name="industry" required maxLength={100} defaultValue={company?.industry}/></label>
    <label>지역 (선택)<input name="region" maxLength={100} defaultValue={company?.region}/></label>
    <button className="primary-action">기업 정보 저장</button>
  </form>;
}
