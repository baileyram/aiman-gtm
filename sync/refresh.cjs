const { readFileSync, writeFileSync } = require('node:fs');
const { constants, createCipheriv, publicEncrypt, randomBytes } = require('node:crypto');

async function refresh() {
  const apiKey = process.env.EXPLEE_API_KEY;
  if (!apiKey) throw new Error('EXPLEE_API_KEY is missing.');
  const response = await fetch('https://api.explee.com/public/api/v1/autogtm/projects/61893/analytics?period=all', {
    headers: {'X-API-Key': apiKey},
    redirect: 'error',
    signal: AbortSignal.timeout(90000),
  });
  if (!response.ok) throw new Error(`Campaign analytics returned HTTP ${response.status}.`);
  const data = await response.json();
  const { total_emails_sent: sent, total_replies: replies, total_hot_leads: hot, overall_reply_rate_pct: rate } = data;
  if (data.project_id !== 61893 || data.period !== 'all' || ![sent, replies, hot, rate].every(value => Number.isFinite(value) && value >= 0)) {
    throw new Error('Campaign analytics returned unexpected metrics.');
  }

  const key = randomBytes(32);
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const json = JSON.stringify({updated: new Date().toISOString(), sent, replies, hot, rate});
  const ciphertext = Buffer.concat([cipher.update(json), cipher.final(), cipher.getAuthTag()]);
  const wrappedKey = publicEncrypt({
    key: readFileSync('sync/feed-public.pem'),
    padding: constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: 'sha256',
  }, key);
  writeFileSync('docs/campaign-feed.json', JSON.stringify({
    key: wrappedKey.toString('base64'),
    iv: iv.toString('base64'),
    data: ciphertext.toString('base64'),
  }));
  console.log('Encrypted campaign totals are ready.');
}

refresh().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
