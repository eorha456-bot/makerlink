import { categories } from './materialLabels';
export function MaterialPostForm({ onSave }) {
  function submit(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    onSave({ ...values, quantity:Number(values.quantity) });
  }
  return <section className="page-content"><h1>자재 게시물 등록</h1><form onSubmit={submit}>
    <label>거래 유형<select name="type"><option value="REQUEST">자재 요청</option><option value="SUPPLY">공급 가능</option></select></label>
    <label>분류<select name="category">{categories.map(c=><option key={c}>{c}</option>)}</select></label>
    <label>품목명<input name="title" required maxLength={200}/></label>
    <label>규격·단위<textarea name="specification" placeholder="예: M8 × 30 mm, 개 단위" required maxLength={255}/></label>
    <label>수량<input type="number" name="quantity" min="1" max="2147483647" step="1" required/></label>
    <label>납기일 (선택)<input type="date" name="deadline"/></label>
    <button className="primary-action">게시물 등록</button></form></section>;
}
