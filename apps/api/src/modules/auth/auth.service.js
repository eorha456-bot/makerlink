const crypto = require('crypto');
const { mysqlPool } = require('../../config/mysql.pool');

function createOAuthState() { return crypto.randomBytes(32).toString('hex'); }
function createSessionToken(user) {
  const payload = Buffer.from(JSON.stringify({ userId: user.id, issuedAt: Date.now() })).toString('base64url');
  const signature = crypto.createHmac('sha256', process.env.APP_SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}
function verifySessionToken(token) {
  if (!token) return null;
  const [payload, receivedSignature] = token.split('.');
  if (!payload || !receivedSignature) return null;
  const expectedSignature = crypto.createHmac('sha256', process.env.APP_SESSION_SECRET).update(payload).digest('base64url');
  if (Buffer.byteLength(receivedSignature) !== Buffer.byteLength(expectedSignature) ||
      !crypto.timingSafeEqual(Buffer.from(receivedSignature), Buffer.from(expectedSignature))) return null;
  const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  const age = Date.now() - session.issuedAt;
  return age >= 0 && age < 28800000 ? session : null;
}
async function exchangeAuthorizationCode(code) {
  const form = new URLSearchParams({ grant_type: 'authorization_code', client_id: process.env.KAKAO_REST_API_KEY, client_secret: process.env.KAKAO_CLIENT_SECRET, redirect_uri: process.env.KAKAO_REDIRECT_URI, code });
  const response = await fetch('https://kauth.kakao.com/oauth/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' }, body: form });
  if (!response.ok) throw new Error('Kakao token exchange failed.');
  return response.json();
}
async function fetchKakaoUser(accessToken) {
  const response = await fetch('https://kapi.kakao.com/v2/user/me', { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error('Kakao user lookup failed.');
  return response.json();
}
async function upsertKakaoUser(kakaoUser) {
  const [result] = await mysqlPool.execute('INSERT INTO users (kakao_id, nickname) VALUES (?, ?) ON DUPLICATE KEY UPDATE nickname = VALUES(nickname), id = LAST_INSERT_ID(id)', [String(kakaoUser.id), kakaoUser.properties?.nickname || '메이커링크 사용자']);
  const [rows] = await mysqlPool.execute('SELECT id, nickname FROM users WHERE id = ?', [result.insertId]);
  return rows[0];
}
module.exports = { createOAuthState, createSessionToken, verifySessionToken, exchangeAuthorizationCode, fetchKakaoUser, upsertKakaoUser };
