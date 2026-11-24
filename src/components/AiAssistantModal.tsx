import React, { useState } from 'react';
import { Sparkles, X, Check, Loader2, AlertCircle } from 'lucide-react';
import { AiAssistAction, requestAiAssist } from '../utils/aiClient';
import { CARTA_ESTILOS_REDACCION } from '../data/defaults';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  docType: string;
  docSubtype?: string;
  initialText: string;
  defaultTone?: string;
  context?: Record<string, string>;
  onApplyText: (newText: string) => void;
  onApplySubject?: (newSubject: string) => void;
}

const ACTIONS: { id: AiAssistAction; label: string; desc: string }[] = [
  { id: 'redactar_desde_ideas', label: 'Redactar desde ideas', desc: 'Estructura párrafos formales a partir de tus puntos clave.' },
  { id: 'corregir_ortografia', label: 'Corregir ortografía y gramática', desc: 'Aplica reglas RAE, tildes y puntuación GTC 185.' },
  { id: 'mejorar_coherencia', label: 'Mejorar coherencia y claridad', desc: 'Organiza párrafos y elimina redundancias.' },
  { id: 'adaptar_tono', label: 'Adaptar tono empresarial', desc: 'Ajusta el registro sin alterar los hechos.' },
  { id: 'resumir', label: 'Resumir información', desc: 'Sintetiza el contenido conservando datos esenciales.' },
  { id: 'proponer_asunto', label: 'Proponer asunto (máx. 4 palabras)', desc: 'Genera 3 opciones breves según GTC 185 num. 4.5.5.' },
];

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  docType,
  docSubtype,
  initialText,
  defaultTone = 'Formal y directo',
  context,
  onApplyText,
  onApplySubject,
}) => {
  const [selectedAction, setSelectedAction] = useState<AiAssistAction>('mejorar_coherencia');
  const [tone, setTone] = useState<string>(defaultTone);
  const [ideas, setIdeas] = useState<string>('');
  const [suggestion, setSuggestion] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestAiAssist({
        action: selectedAction,
        docType,
        docSubtype,
        tone,
        text: initialText,
        ideas,
        context,
      });
      setSuggestion(res);
    } catch (err) {
      setError((err as Error).message || 'No se pudo procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  const subjectChoices =
    selectedAction === 'proponer_asunto' && suggestion
      ? suggestion
          .split('\n')
          .map((l) => l.replace(/^\d+[\.\)\-\s]+/, '').trim())
          .filter(Boolean)
      : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white border border-[#E4E2EC] rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E4E2EC]">
          <div className="flex items-center gap-2">
            <Sparkles size={17} className="text-[#5B2E7A]" />
            <h2 className="text-sm font-semibold text-[#181622]">
              Asistente de redacción documental — {docType}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar asistente"
            className="p-1.5 rounded-md text-[#6B6580] hover:text-[#181622] hover:bg-[#F4F3F8]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          <div className="text-xs text-[#4A465C] bg-[#F8F7FA] border border-[#E4E2EC] rounded-md p-3">
            El asistente organiza y mejora la redacción siguiendo la GTC 185:2009. Nunca inventa nombres, fechas, cifras, identificaciones ni hechos no suministrados. Revisa siempre la propuesta antes de aplicarla.
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2F2B3D] mb-1.5">Operación solicitada</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ACTIONS.filter((a) => (a.id === 'proponer_asunto' ? Boolean(onApplySubject) : true)).map((a) => {
                const active = selectedAction === a.id;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      setSelectedAction(a.id);
                      setSuggestion('');
                      setError(null);
                    }}
                    className={`text-left p-2.5 rounded-md border transition-colors ${
                      active
                        ? 'border-[#5B2E7A] bg-[#5B2E7A]/[0.05] text-[#181622]'
                        : 'border-[#E4E2EC] hover:border-[#C7C1D6] text-[#3E394E]'
                    }`}
                  >
                    <div className="text-xs font-semibold">{a.label}</div>
                    <div className="text-[11px] text-[#6B6580] mt-0.5">{a.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {(selectedAction === 'redactar_desde_ideas' ||
            selectedAction === 'mejorar_coherencia' ||
            selectedAction === 'adaptar_tono') && (
            <div>
              <label className="block text-xs font-medium text-[#2F2B3D] mb-1">Tono de redacción</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#DCD8E6] rounded-md"
              >
                {CARTA_ESTILOS_REDACCION.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedAction === 'redactar_desde_ideas' ? (
            <div>
              <label className="block text-xs font-medium text-[#2F2B3D] mb-1">
                Ideas principales, datos reales o puntos que deseas incluir
              </label>
              <textarea
                rows={4}
                value={ideas}
                onChange={(e) => setIdeas(e.target.value)}
                placeholder="Ej. Informar al proveedor Lácteos del Sur que el pedido 045 se recibirá el viernes a las 08:00 horas en la sede de Usme..."
                className="w-full px-3 py-2 text-sm border border-[#DCD8E6] rounded-md focus:outline-none focus:border-[#5B2E7A]"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-[#2F2B3D] mb-1">Texto actual tomado del documento</label>
              <div className="max-h-28 overflow-y-auto text-xs text-[#4A465C] bg-[#FAF9FC] border border-[#E4E2EC] rounded-md p-2.5 whitespace-pre-wrap">
                {initialText.trim() || '(No hay texto ingresado aún en el campo principal)'}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#5B2E7A] hover:bg-[#4A2366] rounded-md disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              <span>{loading ? 'Procesando...' : 'Generar propuesta'}</span>
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-2 text-xs text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] rounded-md p-3">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {suggestion && selectedAction === 'proponer_asunto' && subjectChoices.length > 0 && onApplySubject && (
            <div className="space-y-2 border-t border-[#E4E2EC] pt-4">
              <label className="block text-xs font-semibold text-[#181622]">
                Selecciona una propuesta de asunto para aplicar:
              </label>
              <div className="space-y-1.5">
                {subjectChoices.map((choice, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onApplySubject(choice);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-left bg-[#FAF9FC] hover:bg-[#5B2E7A]/[0.06] border border-[#DCD8E6] rounded-md transition-colors"
                  >
                    <span>{choice}</span>
                    <span className="text-xs font-medium text-[#5B2E7A]">Aplicar</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {suggestion && selectedAction !== 'proponer_asunto' && (
            <div className="space-y-2 border-t border-[#E4E2EC] pt-4">
              <label className="block text-xs font-semibold text-[#181622]">
                Propuesta generada (puedes editarla antes de aplicar)
              </label>
              <textarea
                rows={7}
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#5B2E7A]/40 rounded-md focus:outline-none focus:border-[#5B2E7A] leading-relaxed"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[#E4E2EC] bg-[#FAF9FC]">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium text-[#4A465C] hover:text-[#181622] rounded-md"
          >
            Cancelar
          </button>
          {suggestion && selectedAction !== 'proponer_asunto' && (
            <button
              type="button"
              onClick={() => {
                onApplyText(suggestion);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#5B2E7A] hover:bg-[#4A2366] rounded-md transition-colors"
            >
              <Check size={14} />
              <span>Aplicar al documento</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
