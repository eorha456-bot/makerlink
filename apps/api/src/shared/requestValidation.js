function fail(status, message) {
  throw Object.assign(new Error(message), { publicStatus: status });
}
function textField(value, max, label, required = true) {
  const text = typeof value === 'string' ? value.trim() : '';
  if ((required && !text) || text.length > max) fail(400, label + ' 입력값을 확인해 주세요.');
  return text;
}
module.exports = { fail, textField };
