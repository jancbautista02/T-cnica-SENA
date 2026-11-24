import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Download, Loader2, Printer, X, XCircle } from 'lucide-react';
import { ValidationReport } from '../utils/gtcValidator';

export type ExportActionType = 'docx' | 'pdf' | 'print';

interface ExportConfirmModalProps {
  isOpen: boolean;
  actionType: ExportActionType | null;
  documentTitle: string;
  report: ValidationReport;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const ExportConfirmModal: React.FC<ExportConfirmModalProps> = ({
  isOpen,
  actionType,
  documentTitle,
  report,
  onClose,
  onConfirm,
}) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !actionType) return null;

  const actionLabel =
    actionType === 'docx'
      ? 'Descargar documento editable (.docx)'
      : actionType === 'pdf'
        ? 'Descargar documento PDF (.pdf)'
        : 'Imprimir documento';

  const handleConfirm = async () => {
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Ocurrió un error al generar el archivo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="bg-white border border-[#E4E2EC] rounded-xl w-full max-w-lg shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E4E2EC]">
          <h2 className="text-sm font-semibold text-[#181622]">{actionLabel}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar confirmación"
            className="p-1.5 rounded-md text-[#6B6580] hover:text-[#181622] hover:bg-[#F4F3F8]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="text-xs text-[#4A465C]">
            Documento: <strong className="text-[#181622]">{documentTitle}</strong>
          </div>

          <div className="border border-[#E4E2EC] rounded-lg p-3.5 bg-[#FAF9FC] space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#181622]">Resumen de verificación GTC 185</span>
              <span className="text-[#6B6580] tabular-nums">
                {report.errorCount} errores · {report.warningCount} advertencias
              </span>
            </div>

            {report.issues.length === 0 ? (
              <div className="flex items-center gap-2 text-xs text-[#16A34A]">
                <CheckCircle2 size={15} />
                <span>Sin campos faltantes ni advertencias estructurales detectadas.</span>
              </div>
            ) : (
              <div className="max-h-44 overflow-y-auto space-y-1.5">
                {report.issues.map((issue) => (
                  <div key={issue.id} className="flex items-start gap-2 text-xs text-[#3E394E]">
                    {issue.severity === 'error' ? (
                      <XCircle size={14} className="text-[#DC2626] shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle size={14} className="text-[#D97706] shrink-0 mt-0.5" />
                    )}
                    <span>{issue.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-[11px] text-[#6B6580]">
            Recuerda que la GTC 185:2009 es una guía técnica orientadora; verifica los datos finales antes de distribuir oficialmente el documento.
          </p>

          {error && (
            <div className="text-xs text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] rounded-md p-2.5">
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[#E4E2EC] bg-[#FAF9FC]">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="px-3.5 py-2 text-xs font-medium text-[#4A465C] hover:text-[#181622] rounded-md"
          >
            Volver a revisar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={busy}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#5B2E7A] hover:bg-[#4A2366] rounded-md disabled:opacity-50 transition-colors"
          >
            {busy ? (
              <Loader2 size={14} className="animate-spin" />
            ) : actionType === 'print' ? (
              <Printer size={14} />
            ) : (
              <Download size={14} />
            )}
            <span>
              {busy
                ? 'Generando...'
                : actionType === 'print'
                  ? 'Imprimir ahora'
                  : 'Confirmar y descargar'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
