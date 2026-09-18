/** Chamadas à Lovable AI Gateway. Executa apenas no servidor. */

const ENDPOINT = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "openai/gpt-6-astra";

export class AiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function askJson<T>(system: string, user: string): Promise<T> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new AiError("A análise por IA não está configurada neste projeto.", 401);

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      reasoning_effort: "low",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    if (response.status === 429)
      throw new AiError("Muitas análises em sequência. Aguarde alguns instantes e tente novamente.", 429);
    if (response.status === 402)
      throw new AiError("Os créditos de IA do espaço de trabalho acabaram. Adicione créditos para continuar.", 402);
    throw new AiError(`A análise por IA falhou (${response.status}). ${text.slice(0, 180)}`, response.status);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content ?? "";
  if (!content.trim()) throw new AiError("A IA não retornou conteúdo para esta solicitação.", 502);
  try {
    return JSON.parse(content) as T;
  } catch {
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(content.slice(start, end + 1)) as T;
    throw new AiError("A IA retornou um formato inesperado.", 502);
  }
}

export const NO_INVENTION_RULE =
  "Regra crítica: otimize a apresentação das informações existentes, mas NUNCA crie fatos. " +
  "Nunca invente empregos, cargos, certificações, idiomas, projetos, números, resultados, tecnologias, " +
  "experiências ou formação que não estejam explicitamente no material recebido. " +
  "Responda sempre em português do Brasil e apenas com JSON válido.";
