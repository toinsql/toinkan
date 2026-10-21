import test from "node:test";
import assert from "node:assert/strict";
import { PlanResponse } from "../server/schema.js";
import { demoPlan, demoReplan } from "../demo.js";

const req = { meta: "Passar no ENEM", prazo: "8 semanas", horas_por_dia: 3, dias_disponiveis: ["seg", "qua", "sab"], melhor_horario: "noite" };
const mins = (h) => +h.slice(0, 2) * 60 + +h.slice(3);

test("plano demo é válido e respeita dias, janela e limite diário", () => {
  const { sessoes } = demoPlan(req);
  assert.ok(PlanResponse.safeParse({ sessoes }).success);
  assert.ok(sessoes.every((s) => req.dias_disponiveis.includes(s.dia) && s.inicio >= "18:00" && s.fim <= "23:00"));
  for (const d of req.dias_disponiveis)
    assert.ok(sessoes.filter((s) => s.dia === d).reduce((a, s) => a + mins(s.fim) - mins(s.inicio), 0) <= 180);
  assert.equal(sessoes.at(-1).tipo, "simulado");
});

test("replan demo redistribui só as atrasadas", () => {
  const { sessoes } = demoPlan(req);
  assert.equal(demoReplan({ plano: req, sessoes, concluidas: [0, 1] }).sessoes.length, sessoes.length - 2);
});

test("demo segue o idioma pedido (en) e mantém tipo do schema", () => {
  const { sessoes } = demoPlan({ ...req, idioma: "en" });
  assert.ok(PlanResponse.safeParse({ sessoes }).success);
  assert.match(sessoes.at(-1).topico, /weekly mock exam/);
  assert.match(demoPlan(req).sessoes.at(-1).topico, /simulado da semana/);
});
