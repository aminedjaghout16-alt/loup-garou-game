export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { roomCode } = req.body;
  if (!roomCode) return res.status(400).json({ error: 'roomCode required' });

  const response = await fetch('https://api.daily.co/v1/rooms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DAILY_API_KEY}`
    },
    body: JSON.stringify({
      name: `loupgarou-${roomCode}`,
      properties: {
        max_participants: 30,
        enable_chat: false,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 3
      }
    })
  });

  const data = await response.json();
  if (!response.ok) return res.status(500).json({ error: data });
  res.status(200).json({ url: data.url });
}
