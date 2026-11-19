const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
if (!process.env.WEB_ORIGIN && process.env.RAILWAY_PUBLIC_DOMAIN) {
  process.env.WEB_ORIGIN = 'https://' + process.env.RAILWAY_PUBLIC_DOMAIN;
}
if (!process.env.KAKAO_REDIRECT_URI && process.env.WEB_ORIGIN && process.env.NODE_ENV === 'production') {
  process.env.KAKAO_REDIRECT_URI = new URL('/api/auth/kakao/callback', process.env.WEB_ORIGIN).href;
}
const express = require('express');
const cors = require('cors');
const { authRouter } = require('./modules/auth/auth.router');
const { postsRouter } = require('./modules/posts/posts.router');
const { offersRouter } = require('./modules/offers/offers.router');
const { analyticsRouter } = require('./modules/analytics/analytics.router');

const app = express();
app.use(cors({ origin: process.env.WEB_ORIGIN, credentials: true }));
app.use(express.json());
app.use('/api/companies', require('./modules/companies/company-profile.router').companyRouter);
app.get('/api/health', (_request, response) => response.json({ status: 'ok', service: 'makerlink-api' }));
app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.use('/api/offers', offersRouter);
app.use('/api/analytics', analyticsRouter);
app.get('/api/ready', async (_req, res) => {
  try {
    await require('./config/mysql.pool').mysqlPool.query('SELECT id FROM users LIMIT 0');
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'database unavailable' });
  }
});
app.use('/api', (_req, res) => res.status(404).json({ message: 'Unknown API route' }));
app.use(express.static(path.resolve(__dirname, '../../web/dist')));
app.use((error, _request, response, _next) => {
  if (error.publicStatus) return response.status(error.publicStatus).json({ message: error.message });
  console.error(error.message);
  response.status(500).json({ message: 'The server could not complete the request.' });
});
if (require.main === module) {
  app.listen(process.env.PORT || 4000, () => console.log('MakerLink API is running'));
}
module.exports = { app };
