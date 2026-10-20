# ToinkanAI

Landing + MVP de planner de estudos com IA (PT/EN). O backend usa a API da Anthropic (`claude-sonnet-4-6`); a chave **nunca** vai para o front.

![App](docs/screenshot.png)

> Screenshot do onboarding em `/app`. Gerar o plano exige uma `ANTHROPIC_API_KEY` válida.

## Arquitetura

```
Browser (index.html, app.html)  --fetch-->  Express (server/index.js)
                                              ├─ limits.js  rate limit por IP/dia
                                              ├─ schema.js  zod (entrada e saída)
                                              └─ claude.js  Anthropic SDK  -->  Claude
```

- `POST /api/plan` — `{meta, prazo, horas_por_dia, dias_disponiveis, melhor_horario}` → `{sessoes:[{dia,inicio,fim,topico,tipo}]}`
- `POST /api/replan` — `{plano, sessoes, concluidas:[índices]}` → novas sessões para o que atrasou
- `/app` — formulário, semana, marcar como feita (clique), replanejar, exportar `.ics`. Estado em `localStorage`.

## Como o Claude é usado

1. O system prompt exige **somente JSON** no formato das sessões, com regras de dias, horários e duração.
2. Os dados do usuário vão em `<dados>…</dados>` e são tratados como dados, não instruções (mitiga prompt injection).
3. A resposta é validada com zod; se inválida, o erro é devolvido ao Claude para correção (até 2 retries).
4. No replan, o servidor separa sessões feitas e atrasadas e pede a redistribuição das atrasadas.
5. Custo: ≈ US$0,02 por plano (ver comentário em `server/claude.js`).

Limites: `DAILY_LIMIT_PER_IP` requisições/IP/dia (em memória), `MAX_OUTPUT_TOKENS` por chamada, corpo JSON ≤ 20 KB.

## Rodar local

```bash
npm install
cp .env.example .env   # preencha ANTHROPIC_API_KEY
npm start              # http://localhost:3000  (app em /app)
npm test
```

> A landing no GitHub Pages é estática; `/app` e `/api` precisam do servidor Node hospedado (Render, Fly, etc.).
