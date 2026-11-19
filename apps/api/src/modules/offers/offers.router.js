const offersRouter = require('express').Router();
const { mysqlPool } = require('../../config/mysql.pool');
const { requireSession, requireCompany } = require('../auth/session.middleware');
const { fail, textField } = require('../../shared/requestValidation');
offersRouter.use(requireSession, requireCompany);

async function withTransaction(work) {
  const db = await mysqlPool.getConnection();
  try {
    await db.beginTransaction();
    const result = await work(db);
    await db.commit();
    return result;
  } catch (error) {
    await db.rollback();
    throw error;
  } finally { db.release(); }
}
offersRouter.get('/mine', async (req,res) => {
  const [items] = await mysqlPool.execute(`SELECT o.id,o.status,o.message,p.title,
    p.company_id AS ownerId,c.company_name AS sender,owner.company_name AS recipient
    FROM offers o JOIN posts p ON p.id=o.post_id JOIN companies c ON c.id=o.company_id
    JOIN companies owner ON owner.id=p.company_id
    WHERE o.company_id=? OR p.company_id=? ORDER BY o.id DESC`,[req.companyId,req.companyId]);
  res.json({ items });
});
offersRouter.post('/', async (req,res) => {
  const message = textField(req.body.message,2000,'제안 내용');
  const id = await withTransaction(async db => {
    const [[post]] = await db.execute('SELECT id,status,company_id FROM posts WHERE id=? FOR UPDATE',[req.body.postId ?? null]);
    if (!post) fail(404,'게시물이 없습니다.');
    if (post.company_id === req.companyId) fail(403,'자사 게시물입니다.');
    if (!['OPEN','NEGOTIATING'].includes(post.status)) fail(409,'종료된 게시물입니다.');
    const [[existing]] = await db.execute('SELECT id FROM offers WHERE post_id=? AND company_id=?',[post.id,req.companyId]);
    if (existing) fail(409,'이미 제안 또는 문의를 보낸 게시물입니다.');
    const [result] = await db.execute('INSERT INTO offers(post_id,company_id,message) VALUES(?,?,?)',[post.id,req.companyId,message]);
    await db.execute("UPDATE posts SET status='NEGOTIATING' WHERE id=?",[post.id]);
    return result.insertId;
  });
  res.status(201).json({ id });
});
offersRouter.patch('/:offerId/status', async (req,res) => {
  if (!['ACCEPTED','REJECTED'].includes(req.body.status)) fail(400,'처리 상태를 확인해 주세요.');
  await withTransaction(async db => {
    const [[link]] = await db.execute('SELECT post_id FROM offers WHERE id=?',[req.params.offerId]);
    if (!link) fail(404,'제안이 없습니다.');
    const [[post]] = await db.execute('SELECT company_id,status FROM posts WHERE id=? FOR UPDATE',[link.post_id]);
    if (post.company_id !== req.companyId) fail(403,'게시물을 등록한 기업만 처리할 수 있습니다.');
    const [[offer]] = await db.execute('SELECT status FROM offers WHERE id=? FOR UPDATE',[req.params.offerId]);
    if (offer.status !== 'PENDING' || post.status === 'MATCHED') fail(409,'이미 처리된 제안입니다.');
    await db.execute('UPDATE offers SET status=? WHERE id=?',[req.body.status,req.params.offerId]);
    if (req.body.status === 'ACCEPTED') {
      await db.execute("UPDATE offers SET status='REJECTED' WHERE post_id=? AND status='PENDING'",[link.post_id]);
      await db.execute("UPDATE posts SET status='MATCHED' WHERE id=?",[link.post_id]);
    } else {
      await db.execute("UPDATE posts SET status='OPEN' WHERE id=? AND NOT EXISTS (SELECT 1 FROM offers WHERE post_id=? AND status='PENDING')",[link.post_id,link.post_id]);
    }
  });
  res.sendStatus(204);
});
module.exports = { offersRouter };
