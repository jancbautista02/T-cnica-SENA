import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, Loader2, ShieldCheck, Sparkles, XCircle } from 'lucide-react';
import { ValidationReport } from '../utils/gtcValidator';
import { requestAiAssist } from '../utils/aiClient';

interface ValidationPanelProps {
  report: ValidationReport;
  docType: string;
  plainTextForReview: string;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  report,
  docType,
  plainTextForReview,
}) => {
  const [aiReview, setAiReview] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const runAiGrammarCheck = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await requestAiAssist({
        action: 'validar_documento',
        docType,
        text: plainTextForReview,
      });
      setAiReview(res);
    } catch (err) {
      setAiError((err as Error).message);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#E4E2EC] rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck size={17} className="text-[#5B2E7A]" />
            <h3 className="text-sm font-semibold text-[#181622]">Validación y control de calidad GTC 185</h3>
          </div>
          <div className="text-xs text-[#6B6580] tabular-nums">
            {report.errorCount} errores · {report.warningCount} advertencias
          </div>
        </div>

        <p className="text-xs text-[#5E5972]">
          La GTC 185:2009 es una guía técnica de recomendaciones adaptable a las características internas de VAQUIMILK S.A.S. Esta revisión verifica estructura, campos y alineaciones sin sustituir la verificación institucional final.
        </p>

        {report.issues.length === 0 ? (
          <div className="flex items-center gap-2 text-xs text-[#16A34A] bg-[#F0FDF4] border border-[#BBF7D0] rounded-md p-3">
            <CheckCircle2 size={15} />
            <span>No se detectaron campos faltantes ni inconsistencias estructurales en este borrador.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {report.issues.map((issue) => (
              <div
                key={issue.id}
                className={`flex items-start gap-2.5 text-xs p-2.5 rounded-md border ${
                  issue.severity === 'error'
                    ? 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
                    : issue.severity === 'warning'
                      ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]'
                      : 'bg-[#F8F7FA] border-[#E4E2EC] text-[#3E394E]'
                }`}
              >
                {issue.severity === 'error' ? (
                  <XCircle size={15} className="shrink-0 mt-0.5 text-[#DC2626]" />
                ) : issue.severity === 'warning' ? (
                  <AlertTriangle size={15} className="shrink-0 mt-0.5 text-[#D97706]" />
                ) : (
                  <Info size={15} className="shrink-0 mt-0.5 text-[#5B2E7A]" />
                )}
                <div>
                  <span className="font-semibold mr-1.5">
                    {issue.severity === 'error' ? 'Requerido:' : issue.severity === 'warning' ? 'Advertencia:' : 'Recomendación:'}
                  </span>
                  <span>{issue.message}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {report.passedChecks.length > 0 && (
          <div className="pt-2 border-t border-[#F0EEF5] space-y-1">
            <div className="text-[11px] font-semibold text-[#4A465C]">Verificaciones aplicadas</div>
            {report.passedChecks.map((chk, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-[#3E394E]">
                <CheckCircle2 size={13} className="text-[#16A34A] shrink-0" />
                <span>{chk}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Orthography & Style Audit */}
      <div className="bg-white border border-[#E4E2EC] rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-[#181622]">Revisión ortográfica y de estilo con IA</h3>
            <p className="text-xs text-[#6B6580]">Analiza redacción, tildes, concordancia y tono administrativo.</p>
          </div>
          <button
            type="button"
            onClick={runAiGrammarCheck}
            disabled={aiLoading || !plainTextForReview.trim()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#5B2E7A] hover:bg-[#4A2366] rounded-md disabled:opacity-50 whitespace-nowrap shrink-0 transition-colors"
          >
            {aiLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
            <span>{aiLoading ? 'Analizando...' : 'Revisar redacción'}</span>
          </button>
        </div>

        {aiError && <div className="text-xs text-[#DC2626]">{aiError}</div>}
        {aiReview && (
          <div className="text-xs text-[#2F2B3D] bg-[#FAF9FC] border border-[#E4E2EC] rounded-md p-3 whitespace-pre-wrap leading-relaxed">
            {aiReview}
          </div>
        )}
      </div>
    </div>
  );
};
