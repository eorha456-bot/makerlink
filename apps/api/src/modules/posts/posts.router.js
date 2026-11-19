const postsRouter = require('express').Router();
const { mysqlPool } = require('../../config/mysql.pool');
const { requireSession, requireCompany, readSession } = require('../auth/session.middleware');
const { fail, textField } = require('../../shared/requestValidation');
const { materialPostQuery } = require('./material-post-query');

postsRouter.get('/', async (_req, res) => {
  const [items] = await mysqlPool.query(materialPostQuery + ' ORDER BY p.id DESC');
  res.json({ items });
});
postsRouter.post('/', requireSession, requireCompany, async (req, res) => {
  const { type, category, quantity, deadline } = req.body;
  if (!['REQUEST','SUPPLY'].includes(type) || !['포장재','부품','소모품','원자재','기타'].includes(category))
    fail(400, '거래 유형과 분류를 확인해 주세요.');
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 2147483647) fail(400, '수량은 양의 정수로 입력해 주세요.');
  if (deadline && (!/^\d{4}-\d{2}-\d{2}$/.test(deadline) || !Number.isFinite(Date.parse(deadline)) ||
      new Date(deadline).toISOString().slice(0,10) !== deadline || deadline < '1000-01-01')) fail(400, '납기 날짜를 확인해 주세요.');
  const title = textField(req.body.title,200,'품목명');
  const spec = textField(req.body.specification,255,'규격');
  const [result] = await mysqlPool.execute(
    'INSERT INTO posts(company_id,post_type,category,title,specification,quantity,due_date) VALUES(?,?,?,?,?,?,?)',
    [req.companyId,type,category,title,spec,quantity,deadline || null]);
  res.status(201).json({ id: result.insertId });
});
postsRouter.patch('/:postId/close', requireSession, requireCompany, async (req, res) => {
  const db = await mysqlPool.getConnection();
  try {
    await db.beginTransaction();
    const [result] = await db.execute(
      "UPDATE posts SET status='CLOSED' WHERE id=? AND company_id=? AND status IN ('OPEN','NEGOTIATING')",
      [req.params.postId, req.companyId]);
    if (!result.affectedRows) fail(409, '모집 중이거나 협의 중인 내 게시물만 마감할 수 있습니다.');
    await db.execute("UPDATE offers SET status='REJECTED' WHERE post_id=? AND status='PENDING'", [req.params.postId]);
    await db.commit();
    res.sendStatus(204);
  } catch (error) {
    await db.rollback();
    throw error;
  } finally { db.release(); }
});
postsRouter.post('/:postId/events', async (req, res) => {
  const kind = req.body.eventType;
  if (!['VIEW','CONTACT_CLICK'].includes(kind)) fail(400,'알 수 없는 이벤트입니다.');
  const [result] = await mysqlPool.execute(
    'INSERT INTO post_events(post_id,user_id,event_type) SELECT id,?,? FROM posts WHERE id=?',
    [readSession(req)?.userId ?? null, kind, req.params.postId]);
  if (!result.affectedRows) fail(404,'게시물이 없습니다.');
  res.sendStatus(201);
});
module.exports = { postsRouter };
