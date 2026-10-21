import test, { after } from "node:test";
import assert from "node:assert/strict";
delete process.env.ANTHROPIC_API_KEY;
delete process.env.DEMO_MODE;
const { default: app } = await import("../server/index.js");
const srv = app.listen(0);
const base = `http://127.0.0.1:${srv.address().port}`;
const post = (p, b) => fetch(base + p, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) });
const req = { meta: "Passar no ENEM", prazo: "8 semanas", horas_por_dia: 2, dias_disponiveis: ["seg", "qua"], melhor_horario: "noite" };
after(() => srv.close());

test("sem chave, /api/plan responde em modo demo", async () => {
  const r = await post("/api/plan", req);
  const j = await r.json();
  assert.equal(r.status, 200);
  assert.equal(j.demo, true);
  assert.ok(j.sessoes.length > 0);
});
test("entrada inválida retorna 400", async () => assert.equal((await post("/api/plan", { meta: "x" })).status, 400));
test("rate limit por IP retorna 429", async () => {
  let s;
  for (let i = 0; i < 12; i++) s = (await post("/api/plan", req)).status;
  assert.equal(s, 429);
});
