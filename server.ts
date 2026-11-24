import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '2mb' }));

type AiAction =
  | 'redactar_desde_ideas'
  | 'corregir_ortografia'
  | 'mejorar_coherencia'
  | 'adaptar_tono'
  | 'resumir'
  | 'proponer_asunto'
  | 'validar_documento';

interface AiAssistBody {
  action: AiAction;
  docType: string;
  docSubtype?: string;
  tone?: string;
  text: string;
  ideas?: string;
  context?: Record<string, string>;
}

const VALID_ACTIONS = new Set<AiAction>([
  'redactar_desde_ideas',
  'corregir_ortografia',
  'mejorar_coherencia',
  'adaptar_tono',
  'resumir',
  'proponer_asunto',
  'validar_documento',
]);

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY no está configurada en las variables de entorno del servidor.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const SYSTEM_INSTRUCTION = `Eres un asistente especializado en redacción administrativa, empresarial y gestión documental colombiana para VAQUIMILK S.A.S., utilizando como guía técnica de referencia la norma ICONTEC GTC 185:2009 (Documentación Organizacional).

REGLAS ESTRICTAS DE OBLIGATORIO CUMPLIMIENTO:
1. NO INVENTAR INFORMACIÓN: Jamás inventes nombres de personas, cargos, números de identificación (cédulas, NIT), fechas, cifras económicas, resultados, compromisos, experiencias laborales, teléfonos, direcciones ni hechos que no hayan sido proporcionados explícitamente por el usuario. Si falta un dato necesario, indica un marcador claro entre corchetes como [COMPLETAR: dato requerido].
2. ESTILO GTC 185:2009:
   - Usa español formal, claro, preciso, concreto, conciso, respetuoso y cortés.
   - Evita lenguaje telegráfico, redundancias y negrillas innecesarias.
   - En cartas, memorandos y circulares: trata un solo tema por comunicación, redacta en primera persona del plural ("nos permitimos informar", "solicitamos") o modo impersonal cuando corresponda, y emplea el tratamiento de usted.
   - En actas: redacta en tiempo pasado (excepto descargos en presente), sin iniciar párrafos con gerundio, con énfasis en decisiones concretas.
   - En informes: redacta en modo impersonal ("se analizó", "se observó"), lenguaje técnico adecuado y objetivo.
   - En certificados y constancias: inicia los párrafos del cuerpo con la conjunción "Que " con mayúscula inicial, manteniendo tono probatorio e impersonal.
   - En asuntos: máximo cuatro palabras, sin artículos ni preposiciones innecesarias, sin punto final.
   - Respeta la ortografía de la Real Academia Española, incluyendo tildes en mayúsculas sostenidas cuando corresponda.
3. Responde únicamente con el texto solicitado o el análisis estructurado, sin introducciones ni despedidas conversacionales de chatbot.`;

app.post('/api/ai/assist', async (req, res) => {
  try {
    const body = req.body as Partial<AiAssistBody>;
    if (!body || !body.action || !VALID_ACTIONS.has(body.action)) {
      res.status(400).json({ error: 'Acción de asistencia no válida.' });
      return;
    }

    const docType = typeof body.docType === 'string' ? body.docType.slice(0, 80) : 'Documento empresarial';
    const docSubtype = typeof body.docSubtype === 'string' ? body.docSubtype.slice(0, 80) : '';
    const tone = typeof body.tone === 'string' ? body.tone.slice(0, 80) : 'Formal y directo';
    const text = typeof body.text === 'string' ? body.text.slice(0, 20000) : '';
    const ideas = typeof body.ideas === 'string' ? body.ideas.slice(0, 10000) : '';

    if (!text.trim() && !ideas.trim()) {
      res.status(400).json({ error: 'Ingresa texto o ideas base para que el asistente pueda ayudarte.' });
      return;
    }

    const contextLines = body.context
      ? Object.entries(body.context)
          .filter(([, v]) => typeof v === 'string' && v.trim().length > 0)
          .map(([k, v]) => `- ${k}: ${String(v).slice(0, 300)}`)
          .join('\n')
      : '';

    let userPrompt = '';
    switch (body.action) {
      case 'redactar_desde_ideas':
        userPrompt = `Tipo de documento: ${docType}${docSubtype ? ` (${docSubtype})` : ''}
Tono solicitado: ${tone}
${contextLines ? `Contexto proporcionado:\n${contextLines}\n` : ''}
Ideas o notas del usuario:
"""
${ideas || text}
"""

Redacta el cuerpo o contenido completo y bien estructurado en párrafos claros, aplicando las recomendaciones de la GTC 185:2009 para este tipo documental. No inventes fechas, cifras, nombres ni datos no suministrados.`;
        break;
      case 'corregir_ortografia':
        userPrompt = `Tipo de documento: ${docType}${docSubtype ? ` (${docSubtype})` : ''}
Texto original:
"""
${text}
"""

Corrige únicamente errores ortográficos, tildes, signos de puntuación, concordancia gramatical y mayúsculas/minúsculas según las recomendaciones de la RAE y la GTC 185:2009, conservando intactos los datos y el sentido original. Devuelve solo el texto corregido.`;
        break;
      case 'mejorar_coherencia':
        userPrompt = `Tipo de documento: ${docType}${docSubtype ? ` (${docSubtype})` : ''}
Tono objetivo: ${tone}
Texto original:
"""
${text}
"""

Mejora la coherencia, organización de párrafos, claridad y fluidez administrativa, eliminando redundancias y manteniendo estrictamente los hechos, cifras y datos originales. Devuelve únicamente el texto mejorado.`;
        break;
      case 'adaptar_tono':
        userPrompt = `Tipo de documento: ${docType}${docSubtype ? ` (${docSubtype})` : ''}
Nuevo tono requerido: ${tone}
Texto original:
"""
${text}
"""

Reescribe el texto adaptándolo al tono "${tone}" conforme al protocolo de la GTC 185:2009, sin alterar ni inventar ningún dato factual. Devuelve únicamente el texto adaptado.`;
        break;
      case 'resumir':
        userPrompt = `Tipo de documento: ${docType}${docSubtype ? ` (${docSubtype})` : ''}
Texto original:
"""
${text}
"""

Resume el texto de forma concisa, precisa y empresarial, conservando todos los datos clave sin omitir información esencial ni inventar detalles. Devuelve únicamente el resumen.`;
        break;
      case 'proponer_asunto':
        userPrompt = `Tipo de documento: ${docType}${docSubtype ? ` (${docSubtype})` : ''}
Contenido de referencia:
"""
${text || ideas}
"""

Propón exactamente 3 opciones de Asunto que cumplan con la GTC 185:2009 (máximo 4 palabras cada una, concretas, omitiendo artículos o preposiciones innecesarias, sin punto final). Devuélvelas numeradas del 1 al 3, una por línea, sin texto adicional.`;
        break;
      case 'validar_documento':
        userPrompt = `Tipo de documento: ${docType}${docSubtype ? ` (${docSubtype})` : ''}
${contextLines ? `Metadatos del documento:\n${contextLines}\n` : ''}
Contenido completo del documento:
"""
${text}
"""

Revisa ortografía, gramática, concordancia, tono administrativo y coherencia del texto frente a las recomendaciones de la GTC 185:2009. Entrega una lista breve y práctica (máximo 5 puntos) con observaciones concretas o confirma si la redacción es clara y adecuada. No inventes datos faltantes ni afirmes cumplimiento normativo absoluto.`;
        break;
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    const resultText = (response.text ?? '').trim();
    if (!resultText) {
      res.status(502).json({ error: 'El modelo no devolvió una sugerencia. Intenta de nuevo.' });
      return;
    }

    res.json({ result: resultText });
  } catch (error) {
    const err = error as { status?: number; message?: string };
    const message = err?.message || 'Error al procesar la solicitud de asistencia.';
    const statusCode = err?.status && err.status >= 400 && err.status < 600 ? err.status : 500;
    console.error('[AI Assist Error]', message);
    res.status(statusCode).json({ error: message });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VAQUIMILK Document Generator running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
