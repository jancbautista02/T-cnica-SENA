export type AiAssistAction =
  | 'redactar_desde_ideas'
  | 'corregir_ortografia'
  | 'mejorar_coherencia'
  | 'adaptar_tono'
  | 'resumir'
  | 'proponer_asunto'
  | 'validar_documento';

export interface AiAssistParams {
  action: AiAssistAction;
  docType: string;
  docSubtype?: string;
  tone?: string;
  text: string;
  ideas?: string;
  context?: Record<string, string>;
}

export async function requestAiAssist(params: AiAssistParams): Promise<string> {
  const res = await fetch('/api/ai/assist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const payload = (await res.json()) as { result?: string; error?: string };
  if (!res.ok) {
    throw new Error(payload.error || 'No se pudo obtener respuesta del asistente de redacción.');
  }
  return payload.result || '';
}
