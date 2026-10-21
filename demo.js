// Plano de demonstração gerado por regras, SEM chamar IA. Roda no Node e no navegador.
const DIAS = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];
const INICIO = { manha: 6, tarde: 12, noite: 18 }; // início da janela (h)
const TEXTOS = {
  pt: {
    assuntos: ["conceitos-chave", "exercícios guiados", "resolução de problemas", "leitura e resumo", "questões comentadas", "mapa mental"],
    simulado: "simulado da semana",
  },
  en: {
    assuntos: ["key concepts", "guided exercises", "problem solving", "reading and summary", "worked questions", "mind map"],
    simulado: "weekly mock exam",
  },
};
const hhmm = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

// `idioma` ("pt" | "en") só muda os textos dos tópicos; `tipo` segue o schema (estudo|revisão|simulado).
export function demoPlan({ meta, horas_por_dia, dias_disponiveis, melhor_horario, idioma }) {
  const T = TEXTOS[idioma] ?? TEXTOS.pt;
  const total = Math.round(horas_por_dia * 60);
  const n = Math.min(3, Math.max(1, Math.floor(total / 60)));
  const dur = Math.min(90, Math.max(25, Math.floor(total / n)));
  const dias = DIAS.filter((d) => dias_disponiveis.includes(d));
  const tema = meta.slice(0, 90);
  let k = 0;
  const sessoes = dias.flatMap((dia, i) => Array.from({ length: n }, (_, j) => {
    const ini = INICIO[melhor_horario] * 60 + j * (dur + 10);
    const ultima = i === dias.length - 1 && j === n - 1;
    const tipo = ultima ? "simulado" : k % 3 === 2 ? "revisão" : "estudo";
    const topico = ultima ? `${tema}: ${T.simulado}` : `${tema}: ${T.assuntos[k % T.assuntos.length]}`;
    k++;
    return { dia, inicio: hhmm(ini), fim: hhmm(ini + dur), topico, tipo };
  }));
  return { sessoes };
}

export function demoReplan({ plano, sessoes, concluidas }) {
  const slots = demoPlan(plano).sessoes;
  const feitas = new Set(concluidas);
  const atrasadas = sessoes.filter((_, i) => !feitas.has(i));
  return { sessoes: atrasadas.slice(0, slots.length).map((s, i) => ({ dia: slots[i].dia, inicio: slots[i].inicio, fim: slots[i].fim, topico: s.topico, tipo: s.tipo })) };
}
