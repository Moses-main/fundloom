import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import {
  upsertUserFromPrivy,
  listCampaigns,
  createCampaign,
  upsertCryptoTx,
  createReport,
  listReports,
  resolveReport,
  getCampaignById,
  patchCampaign,
  listCampaignUpdates,
  createCampaignUpdate,
} from './store.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.BACKEND_PORT || 5001);
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-change-me';
const ADMIN_BASIC_USER = process.env.ADMIN_BASIC_USER || 'admin';
const ADMIN_BASIC_PASS = process.env.ADMIN_BASIC_PASS || 'admin123';

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const signToken = (user) => {
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.id,
      role: user.role || 'user',
      iat: Date.now(),
      exp: Date.now() + 1000 * 60 * 60 * 24,
    })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
};

const verifyToken = (token) => {
  if (!token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('base64url');
  if (sig !== expectedSig) return null;
  const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  if (!parsed || parsed.exp < Date.now()) return null;
  return parsed;
};

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const claims = verifyToken(token);
  if (!claims) return res.status(401).json({ success: false, message: 'Unauthorized' });
  req.auth = claims;
  return next();
};

const basicAuthMiddleware = (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Basic ')) {
    return res.status(401).json({ success: false, message: 'Missing basic auth' });
  }
  const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
  const [user, pass] = decoded.split(':');
  if (user !== ADMIN_BASIC_USER || pass !== ADMIN_BASIC_PASS) {
    return res.status(401).json({ success: false, message: 'Invalid basic auth credentials' });
  }
  return next();
};

app.get('/api/v1/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', service: 'fundloom-backend' } });
});

app.post('/api/v1/auth/privy/verify', (req, res) => {
  try {
    const user = upsertUserFromPrivy(req.body || {});
    const token = signToken(user);
    return res.json({ success: true, data: { user, token } });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message || 'Invalid payload' });
  }
});

app.post('/api/v1/auth/refresh', authMiddleware, (req, res) => {
  const token = signToken({ id: req.auth.sub, role: req.auth.role });
  return res.json({
    success: true,
    data: {
      token,
      user: { id: req.auth.sub, role: req.auth.role, name: 'FundLoom User', email: '' },
    },
  });
});

app.get('/api/v1/auth/me', authMiddleware, (req, res) => {
  return res.json({
    success: true,
    data: {
      user: {
        id: req.auth.sub,
        role: req.auth.role,
      },
    },
  });
});

app.get('/api/v1/campaigns', (_req, res) => {
  return res.json({ success: true, data: { campaigns: listCampaigns() } });
});

app.post('/api/v1/campaigns', authMiddleware, (req, res) => {
  const creator = { id: req.auth.sub, name: 'FundLoom User', email: '' };
  const campaign = createCampaign(req.body || {}, creator);
  return res.status(201).json({ success: true, data: { campaign } });
});

app.patch('/api/v1/campaigns/:campaignId', authMiddleware, (req, res) => {
  const campaign = patchCampaign(req.params.campaignId, req.body || {});
  if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
  return res.json({ success: true, data: { campaign } });
});

app.get('/api/v1/campaigns/:campaignId/updates', (req, res) => {
  const campaign = getCampaignById(req.params.campaignId);
  if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
  const updates = listCampaignUpdates(req.params.campaignId);
  return res.json({
    success: true,
    data: {
      updates,
      pagination: { page: 1, limit: updates.length, total: updates.length },
    },
  });
});

app.post('/api/v1/campaigns/:campaignId/updates', authMiddleware, (req, res) => {
  const campaign = getCampaignById(req.params.campaignId);
  if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
  const update = createCampaignUpdate(req.params.campaignId, req.body || {}, {
    id: req.auth.sub,
    name: 'FundLoom User',
  });
  return res.status(201).json({ success: true, data: { update } });
});

const handleCryptoUpsert = (req, res) => {
  const payload = req.body || {};
  if (!payload.campaignId) {
    return res.status(400).json({ success: false, message: 'campaignId is required' });
  }
  const donation = upsertCryptoTx(payload);
  return res.json({ success: true, data: { donation } });
};

app.post('/api/v1/donations/crypto/tx', handleCryptoUpsert);
app.post('/api/v1/donations/crypto', handleCryptoUpsert);

app.post('/api/v1/campaigns/:campaignId/report', authMiddleware, (req, res) => {
  const report = createReport({
    type: 'campaign',
    campaignId: req.params.campaignId,
    reason: req.body?.reason,
    details: req.body?.details,
    reporterId: req.auth.sub,
  });
  return res.status(201).json({ success: true, data: { report } });
});

app.post('/api/v1/comments/campaign/:campaignId/:commentId/report', authMiddleware, (req, res) => {
  const report = createReport({
    type: 'comment',
    campaignId: req.params.campaignId,
    commentId: req.params.commentId,
    reason: req.body?.reason,
    details: req.body?.details,
    reporterId: req.auth.sub,
  });
  return res.status(201).json({ success: true, data: { report } });
});

app.get('/api/v1/admin/reports', basicAuthMiddleware, (req, res) => {
  const reports = listReports(String(req.query.status || ''));
  return res.json({
    success: true,
    data: {
      reports,
      pagination: { page: 1, limit: reports.length, total: reports.length },
    },
  });
});

app.put('/api/v1/admin/reports/:reportId', basicAuthMiddleware, (req, res) => {
  const report = resolveReport(req.params.reportId, req.body || {});
  if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
  return res.json({ success: true, data: { report } });
});

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`FundLoom backend running on http://localhost:${PORT}`);
});
