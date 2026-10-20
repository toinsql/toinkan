import test from "node:test";
import assert from "node:assert/strict";
import { PlanRequest, PlanResponse, ReplanRequest, extractJson } from "../server/schema.js";

const ok = { dia: "seg", inicio: "19:00", fim: "20:00", topico: "Álgebra", tipo: "estudo" };
const req = { meta: "Passar no ENEM", prazo: "8 semanas", horas_por_dia: 2, dias_disponiveis: ["seg", "qua"], melhor_horario: "noite" };

test("sessão válida", () => assert.ok(PlanResponse.safeParse({ sessoes: [ok] }).success));
test("tipo inválido", () => assert.ok(!PlanResponse.safeParse({ sessoes: [{ ...ok, tipo: "x" }] }).success));
test("fim antes do início", () => assert.ok(!PlanResponse.safeParse({ sessoes: [{ ...ok, fim: "18:00" }] }).success));
test("hora mal formatada", () => assert.ok(!PlanResponse.safeParse({ sessoes: [{ ...ok, inicio: "7pm" }] }).success));
test("request válido/ inválido", () => {
  assert.ok(PlanRequest.safeParse(req).success);
  assert.ok(!PlanRequest.safeParse({ ...req, horas_por_dia: 20 }).success);
  assert.ok(!PlanRequest.safeParse({ ...req, dias_disponiveis: [] }).success);
});
test("replan request", () => assert.ok(ReplanRequest.safeParse({ plano: req, sessoes: [ok], concluidas: [0] }).success));
test("extractJson tolera cerca markdown", () => assert.deepEqual(extractJson('```json\n{"a":1}\n```'), { a: 1 }));
