const materialPostQuery = `SELECT p.id, p.company_id AS companyId, c.company_name AS company,
  p.post_type AS type, p.title, p.category, p.specification, p.quantity,
  DATE_FORMAT(p.due_date,'%Y-%m-%d') AS deadline, p.status,
  (SELECT COUNT(*) FROM post_events e WHERE e.post_id=p.id AND e.event_type='VIEW') AS views,
  (SELECT COUNT(*) FROM post_events e WHERE e.post_id=p.id AND e.event_type='CONTACT_CLICK') AS clicks,
  (SELECT COUNT(*) FROM offers o WHERE o.post_id=p.id) AS offers,
  (SELECT COUNT(*) FROM offers o WHERE o.post_id=p.id AND o.status='ACCEPTED') AS matched
  FROM posts p JOIN companies c ON c.id=p.company_id`;
module.exports = { materialPostQuery };
