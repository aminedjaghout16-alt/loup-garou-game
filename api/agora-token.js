// api/agora-token.js  — Vercel serverless function
// Generates a short-lived Agora RTC token for a given channel + uid.
//
// Set these in your Vercel project's Environment Variables:
//   AGORA_APP_ID       — your App ID  (already in your frontend, safe to re-use here)
//   AGORA_APP_CERTIFICATE — your App Certificate (from Agora Console → Project → Edit)
//
// Usage: GET /api/agora-token?channel=roomCode_alive&uid=0

import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

const APP_ID          = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;
const TOKEN_TTL       = 3600; // seconds — token valid for 1 hour

export default function handler(req, res) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!APP_ID || !APP_CERTIFICATE) {
    return res.status(500).json({ error: 'Agora credentials not configured on server' });
  }

  const { channel, uid = '0' } = req.query;

  if (!channel || typeof channel !== 'string' || channel.length > 120) {
    return res.status(400).json({ error: 'Missing or invalid channel name' });
  }

  const uidNum     = parseInt(uid, 10) || 0;
  const expireTime = Math.floor(Date.now() / 1000) + TOKEN_TTL;

  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channel,
    uidNum,
    RtcRole.PUBLISHER,
    expireTime
  );

  // Cache for 50 min (token lives 60 min, give 10 min buffer)
  res.setHeader('Cache-Control', 'private, max-age=3000');
  return res.status(200).json({ token, expireTime });
}
