// Rate limit em memória: N requisições por IP por dia (UTC). Reinicia com o servidor.
const LIMIT = Number(process.env.DAILY_LIMIT_PER_IP) || 10;
const hits = new Map();

export function dailyLimit(req, res, next) {
  const day = new Date().toISOString().slice(0, 10);
  const key = `${day}:${req.ip}`;
  const n = (hits.get(key) ?? 0) + 1;
  hits.set(key, n);
  for (const k of hits.keys()) if (!k.startsWith(day)) hits.delete(k);
  res.set("X-RateLimit-Remaining", String(Math.max(0, LIMIT - n)));
  if (n > LIMIT) return res.status(429).json({ error: "Limite diário atingido. Tente amanhã." });
  next();
}
