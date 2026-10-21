// Rate limit em memória (reinicia com o servidor): por IP/dia e teto global/dia (UTC).
const LIMIT = Number(process.env.DAILY_LIMIT_PER_IP) || 10;
const GLOBAL = Number(process.env.GLOBAL_DAILY_LIMIT) || 500;
const hits = new Map();
const bump = (k) => { const n = (hits.get(k) ?? 0) + 1; hits.set(k, n); return n; };

export function dailyLimit(req, res, next) {
  const day = new Date().toISOString().slice(0, 10);
  for (const k of hits.keys()) if (!k.startsWith(day)) hits.delete(k);
  const n = bump(`${day}:${req.ip}`), g = bump(`${day}:*`);
  res.set("X-RateLimit-Remaining", String(Math.max(0, LIMIT - n)));
  if (g > GLOBAL) return res.status(429).json({ error: "Muita gente usando hoje. Tente amanhã." });
  if (n > LIMIT) return res.status(429).json({ error: "Limite diário atingido. Tente amanhã." });
  next();
}
