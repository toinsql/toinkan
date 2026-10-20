import { z } from "zod";

export const DIAS = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

export const PlanRequest = z.object({
  meta: z.string().trim().min(3).max(300),
  prazo: z.string().trim().min(1).max(60), // ex: "2026-12-15" ou "8 semanas"
  horas_por_dia: z.number().min(0.5).max(12),
  dias_disponiveis: z.array(z.enum(DIAS)).min(1).max(7),
  melhor_horario: z.enum(["manha", "tarde", "noite"]),
});

export const Session = z
  .object({
    dia: z.enum(DIAS),
    inicio: z.string().regex(HHMM),
    fim: z.string().regex(HHMM),
    topico: z.string().min(1).max(160),
    tipo: z.enum(["estudo", "revisão", "simulado"]),
    feita: z.boolean().optional(),
  })
  .refine((s) => s.fim > s.inicio, { message: "fim deve ser depois do início" });

export const PlanResponse = z.object({
  sessoes: z.array(Session).min(1).max(40),
});

export const ReplanRequest = z.object({
  plano: PlanRequest,
  sessoes: z.array(Session).min(1).max(40),
  concluidas: z.array(z.number().int().min(0)).max(40), // índices em `sessoes`
});

/** Extrai o primeiro objeto JSON do texto (tolera cercas ```json). */
export function extractJson(text) {
  const t = text.replace(/```(?:json)?/g, "");
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  if (a < 0 || b < a) throw new Error("sem JSON");
  return JSON.parse(t.slice(a, b + 1));
}
