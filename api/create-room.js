export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { roomCode } = req.body || {};
  if (!roomCode) return res.status(400).json({ error: 'roomCode required' });

  const apiKey = process.env.DAILY_API_KEY;
  if (!apiKey) {
    console.error('[create-room] DAILY_API_KEY is not set');
    return res.status(500).json({ error: 'DAILY_API_KEY not configured' });
  }

  const roomName = ('lg-' + roomCode).toLowerCase().replace(/[^a-z0-9-]/g, '');

  // First try to GET the room — if it already exists, just return it
  try {
    const getRes = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
    if (getRes.ok) {
      const existing = await getRes.json();
      console.log('[create-room] Room already exists:', roomName);
      return res.status(200).json({ url: existing.url });
    }
  } catch (e) {
    console.error('[create-room] GET room failed:', e);
  }

  // Room doesn't exist — create it
  try {
    const createRes = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        name: roomName,
        properties: {
          max_participants: 30,
          enable_chat: false,
          enable_screenshare: false,
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 4 // expires in 4 hours
        }
      })
    });

    const data = await createRes.json();

    if (!createRes.ok) {
      console.error('[create-room] Daily API error:', JSON.stringify(data));
      return res.status(500).json({ error: data });
    }

    console.log('[create-room] Created room:', roomName);
    return res.status(200).json({ url: data.url });

  } catch (e) {
    console.error('[create-room] Unexpected error:', e);
    return res.status(500).json({ error: e.message });
  }
}
