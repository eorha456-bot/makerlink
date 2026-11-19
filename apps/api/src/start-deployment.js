const fs = require('node:fs/promises');
const path = require('node:path');
const { app } = require('./server');
const { mysqlPool } = require('./config/mysql.pool');

async function start() {
  const required = ['MYSQL_HOST', 'MYSQL_PORT', 'MYSQL_DATABASE', 'MYSQL_USER', 'MYSQL_PASSWORD',
    'APP_SESSION_SECRET', 'KAKAO_REST_API_KEY', 'KAKAO_CLIENT_SECRET'];
  const missing = required.filter(name => !process.env[name]);
  if (missing.length) throw new Error('Missing variables: ' + missing.join(', '));
  await fs.access(path.resolve(__dirname, '../../web/dist/index.html'));
  const schema = await fs.readFile(path.resolve(__dirname, '../../../docs/database/001-create-makerlink-schema.sql'), 'utf8');
  // The local script also creates/selects makerlink. On Railway use the database selected by MYSQL_DATABASE.
  const tables = schema.split(';').map(sql => sql.trim()).filter(sql => /^CREATE TABLE /i.test(sql));
  if (!tables.length) throw new Error('No table definitions in the bootstrap schema');
  for (const table of tables) {
    await mysqlPool.query(table.replace(/^CREATE TABLE /i, 'CREATE TABLE IF NOT EXISTS '));
  }
  app.listen(Number(process.env.PORT || 4000), '0.0.0.0', () => console.log('MakerLink is ready'));
}
start().catch(async error => {
  console.error('MakerLink startup failed:', error.code || error.message);
  await mysqlPool.end();
  process.exitCode = 1;
});
