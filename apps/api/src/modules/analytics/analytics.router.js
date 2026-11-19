const analyticsRouter = require('express').Router();
const { mysqlPool } = require('../../config/mysql.pool');
const { requireSession, requireCompany } = require('../auth/session.middleware');
const { materialPostQuery } = require('../posts/material-post-query');
analyticsRouter.get('/dashboard', requireSession, requireCompany, async (req,res) => {
  const [items] = await mysqlPool.execute(materialPostQuery + ' WHERE p.company_id=? ORDER BY p.id DESC',[req.companyId]);
  const totals = { views:0, clicks:0, offers:0, matched:0 };
  for (const row of items) for (const key of Object.keys(totals)) totals[key] += Number(row[key]);
  res.json({ items, totals });
});
module.exports = { analyticsRouter };
