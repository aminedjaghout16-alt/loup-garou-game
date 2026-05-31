import { AccessToken } from 'livekit-server-sdk';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { roomCode, participantName } = req.body || {};
  if (!roomCode) return res.status(400).json({ error: 'roomCode required' });

  const apiKey    = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const livekitUrl = process.env.LIVEKIT_URL;

  if (!apiKey || !apiSecret || !livekitUrl) {
    console.error('[create-room] Missing LiveKit env vars');
    return res.status(500).json({ error: 'LiveKit not configured' });
  }

  const roomName = ('lg-' + roomCode).toLowerCase().replace(/[^a-z0-9-]/g, '');
  const identity = (participantName || 'Player') + '-' + Math.random().toString(36).slice(2, 7);

  try {
    const token = new AccessToken(apiKey, apiSecret, {
      identity,
      ttl: '4h',
    });

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const jwt = await token.toJwt();

    console.log('[create-room] Token generated for room:', roomName, 'identity:', identity);
    return res.status(200).json({ token: jwt, url: livekitUrl });

  } catch (e) {
    console.error('[create-room] Token generation failed:', e);
    return res.status(500).json({ error: e.message });
  }
}
