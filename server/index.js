import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PlanRequest, ReplanRequest } from "./schema.js";
import { generatePlan, replan } from "./claude.js";
import { dailyLimit } from "./limits.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const app = express();
app.set("trust proxy", 1); // atrás de proxy (Render/Fly), req.ip passa a ser o IP real do cliente
app.use(express.json({ limit: "20kb" })); // limita o tamanho de entrada (e tokens de entrada)

const handler = (schema, fn) => async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Entrada inválida", detalhes: parsed.error.issues });
  try {
    res.json(await fn(parsed.data));
  } catch (e) {
    console.error(e.message);
    res.status(502).json({ error: "Falha ao gerar o plano. Tente novamente." });
  }
};

app.post("/api/plan", dailyLimit, handler(PlanRequest, generatePlan));
app.post("/api/replan", dailyLimit, handler(ReplanRequest, replan));

// Estáticos: só arquivos públicos (nunca servir a raiz inteira: .env, server/)
for (const f of ["index.html", "privacidade.html", "termos.html", "robots.txt", "sitemap.xml"])
  app.get(f === "index.html" ? "/" : "/" + f, (_, res) => res.sendFile(path.join(root, f)));
app.get("/app", (_, res) => res.sendFile(path.join(root, "app.html")));
app.use("/docs", express.static(path.join(root, "docs")));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`http://localhost:${port}`));
