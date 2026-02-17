import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const envFiles = ['.env.local', '.env'];

function parseEnvFile(filePath) {
  const values = {};
  if (!fs.existsSync(filePath)) return values;
  const content = fs.readFileSync(filePath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIndex = line.indexOf('=');
    if (eqIndex <= 0) continue;
    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }
  return values;
}

const merged = {};
for (const name of envFiles) {
  Object.assign(merged, parseEnvFile(path.join(root, name)));
}

for (const [k, v] of Object.entries(process.env)) {
  if (!(k in merged) && typeof v === 'string') merged[k] = v;
}

function hasValue(key) {
  return Boolean(merged[key] && String(merged[key]).trim().length > 0);
}

const required = [
  'VITE_PRIVY_APP_ID',
  'VITE_WALLETCONNECT_PROJECT_ID',
  'VITE_DEFAULT_CHAIN',
  'VITE_RPC_BASE_SEPOLIA',
  'VITE_RPC_BASE_MAINNET',
  'VITE_EVM_CHAIN_ID_HEX',
];

const missing = required.filter((k) => !hasValue(k));

const onchainCreateEnabled = String(merged.VITE_ENABLE_ONCHAIN_CAMPAIGN_CREATE || 'false').toLowerCase() === 'true';
if (onchainCreateEnabled && !hasValue('VITE_EVM_CONTRACT_ADDRESS')) {
  missing.push('VITE_EVM_CONTRACT_ADDRESS (required when VITE_ENABLE_ONCHAIN_CAMPAIGN_CREATE=true)');
}

const jsSdkUrl = merged.VITE_PRIVY_JS_SDK_URL;
if (hasValue('VITE_PRIVY_JS_SDK_URL') && /\/jwks\.json$/i.test(String(jsSdkUrl))) {
  missing.push('VITE_PRIVY_JS_SDK_URL points to JWKS; set it to https://auth.privy.io/js/privy.js');
}

if (missing.length > 0) {
  console.error('\n❌ Env validation failed. Missing/invalid values:\n');
  for (const item of missing) console.error(`- ${item}`);
  console.error('\nHint: copy .env.example to .env.local and fill required keys.\n');
  process.exit(1);
}

console.log('✅ Env validation passed for frontend/blockchain required keys.');
