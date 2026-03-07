const base = process.env.BACKEND_BASE_URL || 'http://127.0.0.1:5001/api/v1';
const url = `${base.replace(/\/+$/, '')}/health`;

const res = await fetch(url);
if (!res.ok) {
  console.error(`Healthcheck failed (${res.status}) for ${url}`);
  process.exit(1);
}
const body = await res.json();
if (!body?.success) {
  console.error('Healthcheck payload invalid', body);
  process.exit(1);
}
console.log('✅ Backend healthcheck passed:', url);
