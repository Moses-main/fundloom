import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import {
  upsertUserFromPrivy,
  listCampaigns,
  createCampaign,
  upsertCryptoTx,
} from './store.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.BACKEND_PORT || 5001);
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-change-me';

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

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`FundLoom backend running on http://localhost:${PORT}`);
});
