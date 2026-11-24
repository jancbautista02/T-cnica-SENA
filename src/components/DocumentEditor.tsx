import React, { useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Copy,
  Eye,
  FileDown,
  FileText,
  PenLine,
  Printer,
  Save,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import {
  createInitialDataForModule,
  DOCUMENT_MODULES,
  getDefaultFormatForModule,
  getModuleTemplates,
} from '../data/defaults';
import {
  ActaData,
  AnyDocumentData,
  CartaData,
  CertificadoConstanciaData,
  CircularData,
  DocumentFormatConfig,
  DocumentModuleId,
  HojaVidaData,
  InformeData,
  MemorandoData,
  MensajeElectronicoData,
  SavedDraft,
  SobreData,
  TarjetaProtocolariaData,
} from '../types/documents';
import { exportDocumentToDocx } from '../utils/docxExporter';
import { validateDocument } from '../utils/gtcValidator';
import { exportPreviewToPdf } from '../utils/pdfExporter';
import { AiAssistantModal } from './AiAssistantModal';
import { DocumentPreview } from './DocumentPreview';
import { ExportActionType, ExportConfirmModal } from './ExportConfirmModal';
import { FormatControlsPanel } from './FormatControlsPanel';
import { ValidationPanel } from './ValidationModal';
import { ActaForm } from './forms/ActaForm';
import { CartaForm } from './forms/CartaForm';
import { CertificadoForm } from './forms/CertificadoForm';
import { CircularForm } from './forms/CircularForm';
import { HojaVidaForm } from './forms/HojaVidaForm';
import { InformeForm } from './forms/InformeForm';
import { MemorandoForm } from './forms/MemorandoForm';
import { MensajeElectronicoForm } from './forms/MensajeElectronicoForm';
import { SobreForm } from './forms/SobreForm';
import { TarjetaProtocolariaForm } from './forms/TarjetaProtocolariaForm';

interface DocumentEditorProps {
  moduleId: DocumentModuleId;
  initialTemplateName?: string;
  loadedDraft?: SavedDraft | null;
  onBack: () => void;
}

type LeftTab = 'contenido' | 'formato' | 'validacion';

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  moduleId,
  initialTemplateName,
  loadedDraft,
  onBack,
}) => {
  const { corporateConfig, saveDraft, duplicateDraft } = useAppContext();
  const moduleInfo = useMemo(
    () => DOCUMENT_MODULES.find((m) => m.id === moduleId)!,
    [moduleId]
  );
  const templates = useMemo(
    () => getModuleTemplates(moduleId, corporateConfig),
    [moduleId, corporateConfig]
  );

  const [draftId, setDraftId] = useState<string | undefined>(() => loadedDraft?.id);
  const [docTitle, setDocTitle] = useState<string>(() => {
    if (loadedDraft) return loadedDraft.title;
    if (initialTemplateName) return initialTemplateName;
    return `${moduleInfo.title} — ${corporateConfig.nombreComercial}`;
  });

  const [format, setFormat] = useState<DocumentFormatConfig>(() => {
    if (loadedDraft) return loadedDraft.format;
    const base = getDefaultFormatForModule(moduleId);
    if (initialTemplateName) {
      const tpl = getModuleTemplates(moduleId, corporateConfig).find(
        (t) => t.name === initialTemplateName
      );
      if (tpl?.formatPatch) {
        return { ...base, ...tpl.formatPatch };
      }
    }
    return base;
  });

  const [data, setData] = useState<AnyDocumentData>(() => {
    if (loadedDraft) return loadedDraft.data;
    const base = createInitialDataForModule(moduleId, corporateConfig);
    if (initialTemplateName) {
      const tpl = getModuleTemplates(moduleId, corporateConfig).find(
        (t) => t.name === initialTemplateName
      );
      if (tpl?.data) {
        return { ...base, ...tpl.data } as AnyDocumentData;
      }
    }
    return base;
  });

  const [leftTab, setLeftTab] = useState<LeftTab>('contenido');
  const [mobilePane, setMobilePane] = useState<'form' | 'preview'>('form');
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(initialTemplateName || '');
  const [exportAction, setExportAction] = useState<ExportActionType | null>(null);

  const [aiState, setAiState] = useState<{
    isOpen: boolean;
    targetKey: string;
    initialText: string;
    enableSubjectApply: boolean;
  }>({
    isOpen: false,
    targetKey: '',
    initialText: '',
    enableSubjectApply: false,
  });

  const previewContainerRef = useRef<HTMLDivElement | null>(null);

  const validationReport = useMemo(
    () => validateDocument(moduleId, data, format, corporateConfig),
    [moduleId, data, format, corporateConfig]
  );

  const handleApplyTemplate = (tplName: string) => {
    setSelectedTemplate(tplName);
    const tpl = templates.find((t) => t.name === tplName);
    if (!tpl) return;
    const fresh = createInitialDataForModule(moduleId, corporateConfig);
    setData({ ...fresh, ...tpl.data } as AnyDocumentData);
    if (tpl.formatPatch) {
      setFormat((prev) => ({ ...prev, ...tpl.formatPatch }));
    }
    setDocTitle(tpl.name);
  };

  const handleSave = () => {
    const saved = saveDraft(moduleId, docTitle, format, data, draftId);
    setDraftId(saved.id);
    setSavedFeedback('Guardado');
    setTimeout(() => setSavedFeedback(null), 2200);
  };

  const handleDuplicate = () => {
    const saved = saveDraft(moduleId, docTitle, format, data, draftId);
    const copy = duplicateDraft(saved.id);
    if (copy) {
      setDraftId(copy.id);
      setDocTitle(copy.title);
      setSavedFeedback('Copia creada');
      setTimeout(() => setSavedFeedback(null), 2200);
    }
  };

  const executeExport = async () => {
    if (exportAction === 'docx') {
      await exportDocumentToDocx(moduleId, data, format, corporateConfig, docTitle);
    } else if (exportAction === 'pdf') {
      if (!previewContainerRef.current) {
        throw new Error('No fue posible ubicar la vista previa del documento.');
      }
      await exportPreviewToPdf(
        previewContainerRef.current,
        docTitle,
        moduleId,
        format,
        data
      );
    } else if (exportAction === 'print') {
      window.print();
    }
  };

  const getPlainTextForValidation = (): string => {
    if (moduleId === 'carta') {
      const d = data as CartaData;
      return `Asunto: ${d.asunto}\n${d.saludo}\n${d.cuerpo}\n${d.despedida}`;
    }
    if (moduleId === 'memorando') {
      const d = data as MemorandoData;
      return `ASUNTO: ${d.asunto}\n${d.cuerpo}\n${d.despedida}`;
    }
    if (moduleId === 'circular') {
      const d = data as CircularData;
      return `ASUNTO: ${d.asunto}\n${d.cuerpo}\n${d.despedida}`;
    }
    if (moduleId === 'acta') {
      const d = data as ActaData;
      return d.desarrollo
        .map((p) => `${p.numero}. ${p.tema}\n${p.descripcion}\n${p.decisiones}`)
        .join('\n\n');
    }
    if (moduleId === 'informe') {
      const d = data as InformeData;
      return [
        d.titulo,
        d.objetivos,
        d.introduccion,
        ...d.capitulos.map((c) => `${c.numero}. ${c.titulo}\n${c.contenido}`),
        d.conclusiones,
        d.recomendaciones,
      ]
        .filter(Boolean)
        .join('\n\n');
    }
    if (moduleId === 'certificado') {
      const d = data as CertificadoConstanciaData;
      return `${d.cargoExpide}\n${d.cuerpoParrafos}\n${d.motivoDestino}`;
    }
    if (moduleId === 'correo') {
      const d = data as MensajeElectronicoData;
      return `Asunto: ${d.asunto}\n${d.saludo}\n${d.cuerpo}\n${d.despedida}`;
    }
    if (moduleId === 'tarjeta') {
      const d = data as TarjetaProtocolariaData;
      return `${d.motivoInvitacion}\n${d.cuerpoMensaje}`;
    }
    return JSON.stringify(data);
  };

  const applyAiText = (newText: string) => {
    const key = aiState.targetKey;
    if (moduleId === 'carta' && key === 'cuerpo') {
      setData({ ...(data as CartaData), cuerpo: newText });
    } else if (moduleId === 'memorando' && key === 'cuerpo') {
      setData({ ...(data as MemorandoData), cuerpo: newText });
    } else if (moduleId === 'circular' && key === 'cuerpo') {
      setData({ ...(data as CircularData), cuerpo: newText });
    } else if (moduleId === 'acta' && key.startsWith('punto:')) {
      const pid = key.replace('punto:', '');
      const a = data as ActaData;
      setData({
        ...a,
        desarrollo: a.desarrollo.map((p) => (p.id === pid ? { ...p, descripcion: newText } : p)),
      });
    } else if (moduleId === 'informe') {
      const inf = data as InformeData;
      if (key.startsWith('cap:')) {
        const cid = key.replace('cap:', '');
        setData({
          ...inf,
          capitulos: inf.capitulos.map((c) => (c.id === cid ? { ...c, contenido: newText } : c)),
        });
      } else if (key === 'conclusiones') {
        setData({ ...inf, conclusiones: newText });
      }
    } else if (moduleId === 'certificado') {
      setData({ ...(data as CertificadoConstanciaData), cuerpoParrafos: newText });
    } else if (moduleId === 'correo' && key === 'cuerpo') {
      setData({ ...(data as MensajeElectronicoData), cuerpo: newText });
    } else if (moduleId === 'tarjeta') {
      const t = data as TarjetaProtocolariaData;
      if (t.tipo === 'invitacion') {
        setData({ ...t, motivoInvitacion: newText });
      } else {
        setData({ ...t, cuerpoMensaje: newText });
      }
    }
  };

  const applyAiSubject = (newSubject: string) => {
    if (moduleId === 'carta') {
      setData({ ...(data as CartaData), asunto: newSubject });
    } else if (moduleId === 'memorando') {
      setData({ ...(data as MemorandoData), asunto: newSubject });
    } else if (moduleId === 'circular') {
      setData({ ...(data as CircularData), asunto: newSubject });
    } else if (moduleId === 'correo') {
      setData({ ...(data as MensajeElectronicoData), asunto: newSubject });
    }
  };

  const renderForm = () => {
    switch (moduleId) {
      case 'carta':
        return (
          <CartaForm
            data={data as CartaData}
            onChange={(next) => setData(next)}
            onOpenAi={(field) =>
              setAiState({
                isOpen: true,
                targetKey: field,
                initialText:
                  field === 'asunto' ? (data as CartaData).cuerpo : (data as CartaData).cuerpo,
                enableSubjectApply: true,
              })
            }
          />
        );
      case 'memorando':
        return (
          <MemorandoForm
            data={data as MemorandoData}
            onChange={(next) => setData(next)}
            onOpenAi={(field) =>
              setAiState({
                isOpen: true,
                targetKey: field,
                initialText: (data as MemorandoData).cuerpo,
                enableSubjectApply: true,
              })
            }
          />
        );
      case 'circular':
        return (
          <CircularForm
            data={data as CircularData}
            onChange={(next) => setData(next)}
            onOpenAi={(field) =>
              setAiState({
                isOpen: true,
                targetKey: field,
                initialText: (data as CircularData).cuerpo,
                enableSubjectApply: true,
              })
            }
          />
        );
      case 'acta':
        return (
          <ActaForm
            data={data as ActaData}
            onChange={(next) => setData(next)}
            onOpenAiForPoint={(puntoId, text) =>
              setAiState({
                isOpen: true,
                targetKey: `punto:${puntoId}`,
                initialText: text,
                enableSubjectApply: false,
              })
            }
          />
        );
      case 'informe':
        return (
          <InformeForm
            data={data as InformeData}
            onChange={(next) => setData(next)}
            onOpenAi={(targetKey, text) =>
              setAiState({
                isOpen: true,
                targetKey,
                initialText: text,
                enableSubjectApply: false,
              })
            }
          />
        );
      case 'certificado':
        return (
          <CertificadoForm
            data={data as CertificadoConstanciaData}
            onChange={(next) => setData(next)}
            onCategoryChange={(categoria) =>
              setFormat((prev) => ({
                ...prev,
                distributionStyle: categoria === 'certificado' ? 'bloque' : 'bloque_extremo',
              }))
            }
            onOpenAi={() =>
              setAiState({
                isOpen: true,
                targetKey: 'cuerpoParrafos',
                initialText: (data as CertificadoConstanciaData).cuerpoParrafos,
                enableSubjectApply: false,
              })
            }
          />
        );
      case 'hoja_vida':
        return (
          <HojaVidaForm
            data={data as HojaVidaData}
            onChange={(next) => setData(next)}
          />
        );
      case 'sobre':
        return (
          <SobreForm
            data={data as SobreData}
            onChange={(next) => setData(next)}
          />
        );
      case 'correo':
        return (
          <MensajeElectronicoForm
            data={data as MensajeElectronicoData}
            onChange={(next) => setData(next)}
            onOpenAi={(field) =>
              setAiState({
                isOpen: true,
                targetKey: field,
                initialText: (data as MensajeElectronicoData).cuerpo,
                enableSubjectApply: true,
              })
            }
          />
        );
      case 'tarjeta':
        return (
          <TarjetaProtocolariaForm
            data={data as TarjetaProtocolariaData}
            onChange={(next) => setData(next)}
            onOpenAi={() => {
              const t = data as TarjetaProtocolariaData;
              setAiState({
                isOpen: true,
                targetKey: 'tarjeta',
                initialText: t.tipo === 'invitacion' ? t.motivoInvitacion : t.cuerpoMensaje,
                enableSubjectApply: false,
              });
            }}
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-57px)]">
      {/* Workspace Action Bar */}
      <div className="no-print bg-white border-b border-[#E4E2EC] px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#4A465C] hover:text-[#181622] hover:bg-[#F4F3F8] rounded-md whitespace-nowrap shrink-0 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Menú</span>
          </button>

          <div className="h-4 w-px bg-[#E4E2EC] hidden sm:block" />

          <div className="min-w-0 flex-1 max-w-sm">
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              aria-label="Nombre del documento"
              className="w-full px-2.5 py-1 text-sm font-semibold text-[#181622] bg-transparent border border-transparent hover:border-[#DCD8E6] focus:border-[#5B2E7A] focus:bg-white rounded-md focus:outline-none truncate"
            />
          </div>

          <select
            value={selectedTemplate}
            onChange={(e) => handleApplyTemplate(e.target.value)}
            aria-label="Cargar plantilla base"
            className="hidden xl:block px-2.5 py-1.5 text-xs bg-[#FAF9FC] border border-[#DCD8E6] rounded-md text-[#3E394E] focus:outline-none focus:border-[#5B2E7A]"
          >
            <option value="">Plantilla base...</option>
            {templates.map((t) => (
              <option key={t.name} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#181622] bg-white border border-[#DCD8E6] hover:bg-[#F7F7FA] rounded-md whitespace-nowrap shrink-0 transition-colors"
          >
            {savedFeedback ? <Check size={14} className="text-[#16A34A]" /> : <Save size={14} />}
            <span>{savedFeedback || 'Guardar borrador'}</span>
          </button>

          <button
            type="button"
            onClick={handleDuplicate}
            title="Duplicar documento"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#4A465C] bg-white border border-[#DCD8E6] hover:bg-[#F7F7FA] rounded-md whitespace-nowrap shrink-0 transition-colors"
          >
            <Copy size={14} />
            <span className="hidden md:inline">Duplicar</span>
          </button>

          <button
            type="button"
            onClick={() => setExportAction('print')}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#4A465C] bg-white border border-[#DCD8E6] hover:bg-[#F7F7FA] rounded-md whitespace-nowrap shrink-0 transition-colors"
          >
            <Printer size={14} />
            <span className="hidden md:inline">Imprimir</span>
          </button>

          <button
            type="button"
            onClick={() => setExportAction('docx')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#5B2E7A] bg-[#5B2E7A]/[0.08] hover:bg-[#5B2E7A]/[0.14] rounded-md whitespace-nowrap shrink-0 transition-colors"
          >
            <FileText size={14} />
            <span>Word (.docx)</span>
          </button>

          <button
            type="button"
            onClick={() => setExportAction('pdf')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#5B2E7A] hover:bg-[#4A2366] rounded-md whitespace-nowrap shrink-0 transition-colors"
          >
            <FileDown size={14} />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Mobile Pane Switcher */}
      <div className="no-print lg:hidden bg-[#FAF9FC] border-b border-[#E4E2EC] px-4 py-2 flex gap-2">
        <button
          type="button"
          onClick={() => setMobilePane('form')}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md ${
            mobilePane === 'form' ? 'bg-[#5B2E7A] text-white' : 'bg-white border border-[#DCD8E6] text-[#4A465C]'
          }`}
        >
          <PenLine size={13} />
          <span>Edición</span>
        </button>
        <button
          type="button"
          onClick={() => setMobilePane('preview')}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md ${
            mobilePane === 'preview' ? 'bg-[#5B2E7A] text-white' : 'bg-white border border-[#DCD8E6] text-[#4A465C]'
          }`}
        >
          <Eye size={13} />
          <span>Vista previa</span>
        </button>
      </div>

      {/* Split Workstation */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12">
        {/* Left Editing Pane */}
        <div
          className={`no-print lg:col-span-5 xl:col-span-5 flex flex-col min-h-0 border-r border-[#E4E2EC] bg-[#F7F7FA] ${
            mobilePane === 'form' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Editor Sub-navigation Tabs */}
          <div className="bg-white border-b border-[#E4E2EC] px-4 pt-2.5 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setLeftTab('contenido')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                leftTab === 'contenido'
                  ? 'border-[#5B2E7A] text-[#5B2E7A]'
                  : 'border-transparent text-[#6B6580] hover:text-[#181622]'
              }`}
            >
              <PenLine size={13} />
              <span>Contenido</span>
            </button>
            <button
              type="button"
              onClick={() => setLeftTab('formato')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                leftTab === 'formato'
                  ? 'border-[#5B2E7A] text-[#5B2E7A]'
                  : 'border-transparent text-[#6B6580] hover:text-[#181622]'
              }`}
            >
              <SlidersHorizontal size={13} />
              <span>Formato GTC 185</span>
            </button>
            <button
              type="button"
              onClick={() => setLeftTab('validacion')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                leftTab === 'validacion'
                  ? 'border-[#5B2E7A] text-[#5B2E7A]'
                  : 'border-transparent text-[#6B6580] hover:text-[#181622]'
              }`}
            >
              <ShieldCheck size={13} />
              <span>
                Validación ({validationReport.errorCount + validationReport.warningCount})
              </span>
            </button>
          </div>

          {/* Scrollable Form / Controls Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            {leftTab === 'contenido' && renderForm()}
            {leftTab === 'formato' && (
              <FormatControlsPanel
                moduleId={moduleId}
                format={format}
                supportedDistributionStyles={moduleInfo.supportsDistributionStyles}
                onChange={setFormat}
              />
            )}
            {leftTab === 'validacion' && (
              <ValidationPanel
                report={validationReport}
                docType={moduleInfo.title}
                plainTextForReview={getPlainTextForValidation()}
              />
            )}
          </div>
        </div>

        {/* Right Live Preview Pane */}
        <div
          className={`lg:col-span-7 xl:col-span-7 p-3 sm:p-4 min-h-0 flex flex-col ${
            mobilePane === 'preview' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <DocumentPreview
            moduleId={moduleId}
            data={data}
            format={format}
            corp={corporateConfig}
            previewContainerRef={previewContainerRef}
          />
        </div>
      </div>

      {/* AI Modal */}
      <AiAssistantModal
        isOpen={aiState.isOpen}
        onClose={() => setAiState((s) => ({ ...s, isOpen: false }))}
        docType={moduleInfo.title}
        initialText={aiState.initialText}
        defaultTone={moduleId === 'carta' ? (data as CartaData).estiloRedaccion : 'Formal y directo'}
        context={{
          organizacion: corporateConfig.razonSocial,
          ciudad: corporateConfig.municipio,
        }}
        onApplyText={applyAiText}
        onApplySubject={aiState.enableSubjectApply ? applyAiSubject : undefined}
      />

      {/* Export Confirmation Modal */}
      <ExportConfirmModal
        isOpen={exportAction !== null}
        actionType={exportAction}
        documentTitle={docTitle}
        report={validationReport}
        onClose={() => setExportAction(null)}
        onConfirm={executeExport}
      />
    </div>
  );
};
