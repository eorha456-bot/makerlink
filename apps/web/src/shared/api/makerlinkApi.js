export const apiBase = import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? '/api' : window.location.protocol + '//' + window.location.hostname + ':4000/api');
export async function request(path, method = 'GET', body) {
  let response;
  try {
    response = await fetch(apiBase + path, {
      method, credentials: 'include', cache: 'no-store',
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined
    });
  } catch { throw new Error('서버에 연결하지 못했습니다. 연결 상태를 확인해 주세요.'); }
  const data = response.headers.get('content-type')?.includes('application/json') ? await response.json() : null;
  if (!response.ok) throw Object.assign(new Error(data?.message || '요청을 처리하지 못했습니다.'), { status: response.status });
  return data;
}
