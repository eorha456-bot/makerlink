const { verifySessionToken } = require('./auth.service');
const { mysqlPool } = require('../../config/mysql.pool');
const { fail } = require('../../shared/requestValidation');

function readSession(req) {
  return verifySessionToken(req.headers.cookie?.match(/(?:^|;\s*)makerlink_session=([^;]+)/)?.[1]);
}
function requireSession(req, res, next) {
  const session = readSession(req);
  if (!session) return res.status(401).json({ message: '카카오 로그인이 필요합니다.' });
  req.userId = session.userId;
  next();
}
async function requireCompany(req, res, next) {
  const [[company]] = await mysqlPool.execute('SELECT id FROM companies WHERE user_id=?', [req.userId]);
  if (!company) fail(409, '내 활동에서 기업 프로필을 등록해 주세요.');
  req.companyId = company.id;
  next();
}
module.exports = { readSession, requireSession, requireCompany };
