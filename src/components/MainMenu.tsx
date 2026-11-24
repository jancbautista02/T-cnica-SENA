import React from 'react';
import {
  ArrowRight,
  Award,
  BarChart3,
  CreditCard,
  FileText,
  FolderOpen,
  Mail,
  MailOpen,
  Megaphone,
  StickyNote,
  UserCheck,
  Users,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { DOCUMENT_MODULES } from '../data/defaults';
import { DocumentModuleId, SavedDraft } from '../types/documents';

interface MainMenuProps {
  onSelectModule: (moduleId: DocumentModuleId, templateName?: string) => void;
  onOpenDrafts: () => void;
  onLoadDraft: (draft: SavedDraft) => void;
}

const MODULE_ICONS: Record<DocumentModuleId, React.ReactNode> = {
  carta: <FileText size={19} />,
  memorando: <StickyNote size={19} />,
  circular: <Megaphone size={19} />,
  acta: <Users size={19} />,
  informe: <BarChart3 size={19} />,
  certificado: <Award size={19} />,
  hoja_vida: <UserCheck size={19} />,
  sobre: <MailOpen size={19} />,
  correo: <Mail size={19} />,
  tarjeta: <CreditCard size={19} />,
};

export const MainMenu: React.FC<MainMenuProps> = ({
  onSelectModule,
  onOpenDrafts,
  onLoadDraft,
}) => {
  const { corporateConfig, drafts } = useAppContext();
  const recentDrafts = drafts.slice(0, 3);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Institutional Hero / Intro */}
      <section className="bg-white border border-[#E4E2EC] rounded-xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          <div className="text-xs font-medium text-[#5B2E7A] tracking-wide uppercase">
            {corporateConfig.razonSocial} · NIT {corporateConfig.nit} · {corporateConfig.municipio}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#181622] tracking-tight leading-tight">
            GENERADOR INTEGRAL DE DOCUMENTOS EMPRESARIALES
          </h1>
          <p className="text-sm sm:text-base text-[#4A465C] leading-relaxed">
            Crea, personaliza y genera documentos empresariales profesionales para VAQUIMILK S.A.S., utilizando estructuras documentales basadas en la GTC 185 de ICONTEC.
          </p>
          <div className="text-xs text-[#6B6580] pt-1">
            {corporateConfig.direccion} ({corporateConfig.localidad}) · {corporateConfig.correo} · Representante legal: {corporateConfig.representanteLegal}
          </div>
        </div>

        <div className="shrink-0 flex items-center justify-center sm:justify-end">
          {corporateConfig.logoUrl && (
            <img
              src={corporateConfig.logoUrl}
              alt={corporateConfig.razonSocial}
              className="h-24 w-auto object-contain"
            />
          )}
        </div>
      </section>

      {/* Recent Drafts Quick Bar if present */}
      {recentDrafts.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#181622]">Borradores recientes</h2>
            <button
              type="button"
              onClick={onOpenDrafts}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5B2E7A] hover:underline"
            >
              <FolderOpen size={14} />
              <span>Ver todos ({drafts.length})</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recentDrafts.map((d) => {
              const mod = DOCUMENT_MODULES.find((m) => m.id === d.moduleId);
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => onLoadDraft(d)}
                  className="text-left bg-white border border-[#E4E2EC] hover:border-[#5B2E7A] rounded-lg p-3.5 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#181622] truncate">{d.title}</div>
                    <div className="text-[11px] text-[#6B6580] mt-0.5 tabular-nums">
                      {mod?.title || d.moduleId} ·{' '}
                      {new Date(d.updatedAt).toLocaleDateString('es-CO', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </div>
                  </div>
                  <ArrowRight size={15} className="text-[#5B2E7A] shrink-0" />
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* 10 Document Modules Grid */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-[#181622]">
              Módulos documentales GTC 185:2009
            </h2>
            <p className="text-xs text-[#6B6580]">
              Selecciona el tipo de documento o inicia directamente desde una plantilla base.
            </p>
          </div>
          <div className="text-xs text-[#6B6580]">
            10 capítulos disponibles · Exportación .docx y .pdf
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DOCUMENT_MODULES.map((mod) => (
            <article
              key={mod.id}
              className="bg-white border border-[#E4E2EC] rounded-xl p-5 flex flex-col justify-between gap-4 hover:border-[#C5BCD9] transition-colors"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-9 h-9 rounded-lg bg-[#5B2E7A]/[0.08] text-[#5B2E7A] flex items-center justify-center shrink-0">
                    {MODULE_ICONS[mod.id]}
                  </div>
                  <span className="text-[11px] font-medium text-[#6B6580]">
                    {mod.chapter} · GTC 185
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-[#181622]">{mod.title}</h3>
                  <p className="text-xs text-[#5E5972] mt-1 leading-relaxed">{mod.shortDesc}</p>
                </div>

                <div className="pt-1 border-t border-[#F2F0F7]">
                  <div className="text-[11px] font-medium text-[#6B6580] mb-1">
                    Plantillas iniciales
                  </div>
                  <div className="flex flex-wrap gap-x-2 gap-y-1 text-[11px]">
                    {mod.availableTemplates.map((tpl, idx) => (
                      <React.Fragment key={tpl}>
                        <button
                          type="button"
                          onClick={() => onSelectModule(mod.id, tpl)}
                          className="text-[#5B2E7A] hover:underline text-left"
                        >
                          {tpl}
                        </button>
                        {idx < mod.availableTemplates.length - 1 && (
                          <span className="text-[#C7C1D6]" aria-hidden="true">
                            ·
                          </span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectModule(mod.id)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#5B2E7A] hover:bg-[#4A2366] rounded-md transition-colors"
              >
                <span>Crear {mod.title.toLowerCase()}</span>
                <ArrowRight size={14} />
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};
