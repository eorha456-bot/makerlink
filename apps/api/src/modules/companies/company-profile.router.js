const companyRouter = require('express').Router();
const { mysqlPool } = require('../../config/mysql.pool');
const { requireSession } = require('../auth/session.middleware');
const { textField } = require('../../shared/requestValidation');
companyRouter.use(requireSession);
companyRouter.get('/me', async (req, res) => {
  const [[company]] = await mysqlPool.execute(
    'SELECT id, company_name AS name, business_type AS industry, region FROM companies WHERE user_id=?', [req.userId]);
  res.json(company || null);
});
companyRouter.put('/me', async (req, res) => {
  const name = textField(req.body.name, 150, '회사명');
  const industry = textField(req.body.industry, 100, '업종');
  const region = textField(req.body.region, 100, '지역', false);
  await mysqlPool.execute(
    'INSERT INTO companies(user_id,company_name,business_type,region) VALUES(?,?,?,?) ON DUPLICATE KEY UPDATE company_name=?,business_type=?,region=?',
    [req.userId, name, industry, region, name, industry, region]);
  res.sendStatus(204);
});
module.exports = { companyRouter };
