import test from "node:test";
import assert from "node:assert/strict";
process.env.ANTHROPIC_API_KEY = "test";
process.env.DEMO_MODE = "false";
const { generatePlan, _setClient } = await import("../server/claude.js");

const VALID = JSON.stringify({ sessoes: [{ dia: "seg", inicio: "19:00", fim: "20:00", topico: "Álgebra", tipo: "estudo" }] });
const req = { meta: "Passar no ENEM", prazo: "8 semanas", horas_por_dia: 2, dias_disponiveis: ["seg"], melhor_horario: "noite" };
const fake = (...texts) => {
  const c = { calls: 0, messages: { create: async () => ({ content: [{ type: "text", text: texts[Math.min(c.calls++, texts.length - 1)] }] }) } };
  return c;
};

test("tenta de novo quando o JSON vem inválido", async () => {
  const c = fake("não é json", VALID);
  _setClient(c);
  assert.equal((await generatePlan(req)).sessoes.length, 1);
  assert.equal(c.calls, 2);
});

test("desiste depois dos retries", async () => {
  const c = fake("lixo");
  _setClient(c);
  await assert.rejects(generatePlan(req), /inválido/);
  assert.equal(c.calls, 3);
});
