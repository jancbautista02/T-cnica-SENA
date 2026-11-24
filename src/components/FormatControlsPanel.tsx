import React from 'react';
import {
  DistributionStyle,
  DocumentFormatConfig,
  DocumentModuleId,
  FontFamilyOption,
  PageSizeOption,
  VisualStyle,
} from '../types/documents';
import { SelectInput, TextInput } from './FormPrimitives';

interface FormatControlsPanelProps {
  moduleId: DocumentModuleId;
  format: DocumentFormatConfig;
  supportedDistributionStyles: DistributionStyle[];
  onChange: (next: DocumentFormatConfig) => void;
}

const DISTRIBUTION_LABELS: Record<DistributionStyle, { name: string; desc: string }> = {
  bloque_extremo: {
    name: 'Bloque extremo',
    desc: 'Todas las líneas parten del margen izquierdo (GTC 185 num. 4.3.1).',
  },
  bloque: {
    name: 'Bloque',
    desc: 'Código, fecha, firma y cargo parten del centro hacia la derecha (num. 4.3.2).',
  },
  semibloque: {
    name: 'Semibloque',
    desc: 'Conserva estilo bloque e incorpora sangría de 5 a 10 espacios en cada párrafo (num. 4.3.3).',
  },
};

const VISUAL_STYLES: { id: VisualStyle; name: string; desc: string }[] = [
  { id: 'clasico', name: 'Clásico empresarial', desc: 'Presentación formal, sobria y tradicional.' },
  { id: 'moderno', name: 'Moderno empresarial', desc: 'Presentación limpia, organizada y contemporánea.' },
  { id: 'institucional', name: 'Institucional elegante', desc: 'Presentación profesional con acentos corporativos VAQUIMILK.' },
];

export const FormatControlsPanel: React.FC<FormatControlsPanelProps> = ({
  moduleId,
  format,
  supportedDistributionStyles,
  onChange,
}) => {
  const isSpecialDimension = moduleId === 'sobre' || moduleId === 'tarjeta' || moduleId === 'correo';

  const updateMargins = (patch: Partial<DocumentFormatConfig['margins']>) => {
    onChange({
      ...format,
      margins: { ...format.margins, ...patch },
    });
  };

  return (
    <div className="space-y-4">
      {/* Normative Distribution Styles */}
      {supportedDistributionStyles.length > 1 && (
        <div className="bg-white border border-[#E4E2EC] rounded-lg p-4 space-y-2.5">
          <div>
            <h3 className="text-sm font-semibold text-[#181622]">Estilo de distribución documental (GTC 185 num. 4.3)</h3>
            <p className="text-xs text-[#6B6580]">Determina la alineación normativa del contenido, independiente del diseño visual.</p>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {supportedDistributionStyles.map((styleId) => {
              const info = DISTRIBUTION_LABELS[styleId];
              const active = format.distributionStyle === styleId;
              return (
                <button
                  key={styleId}
                  type="button"
                  onClick={() => onChange({ ...format, distributionStyle: styleId })}
                  className={`text-left p-2.5 rounded-md border transition-colors ${
                    active
                      ? 'border-[#5B2E7A] bg-[#5B2E7A]/[0.05] text-[#181622]'
                      : 'border-[#E4E2EC] hover:border-[#C7C1D6] text-[#3E394E]'
                  }`}
                >
                  <div className="text-xs font-semibold">{info.name}</div>
                  <div className="text-[11px] text-[#6B6580] mt-0.5">{info.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Visual Styles */}
      <div className="bg-white border border-[#E4E2EC] rounded-lg p-4 space-y-2.5">
        <div>
          <h3 className="text-sm font-semibold text-[#181622]">Estilo visual de presentación</h3>
          <p className="text-xs text-[#6B6580]">Modifica únicamente la estética visual sin alterar la estructura ni alineaciones GTC 185.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {VISUAL_STYLES.map((vs) => {
            const active = format.visualStyle === vs.id;
            return (
              <button
                key={vs.id}
                type="button"
                onClick={() => onChange({ ...format, visualStyle: vs.id })}
                className={`text-left p-2.5 rounded-md border transition-colors ${
                  active
                    ? 'border-[#5B2E7A] bg-[#5B2E7A]/[0.05] text-[#181622]'
                    : 'border-[#E4E2EC] hover:border-[#C7C1D6] text-[#3E394E]'
                }`}
              >
                <div className="text-xs font-semibold">{vs.name}</div>
                <div className="text-[11px] text-[#6B6580] mt-0.5">{vs.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Typography & Paper */}
      <div className="bg-white border border-[#E4E2EC] rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold text-[#181622]">Tipografía y papel (GTC 185 num. 4.4)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <SelectInput
            label="Fuente"
            value={format.fontFamily}
            onChange={(e) => onChange({ ...format, fontFamily: e.target.value as FontFamilyOption })}
          >
            <option value="Arial">Arial (predeterminada)</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Calibri">Calibri</option>
            <option value="Verdana">Verdana</option>
          </SelectInput>

          <SelectInput
            label="Tamaño base"
            value={String(format.fontSizePt)}
            onChange={(e) => onChange({ ...format, fontSizePt: Number(e.target.value) as 10 | 11 | 12 })}
          >
            <option value="12">12 puntos (recomendado)</option>
            <option value="11">11 puntos</option>
            <option value="10">10 puntos</option>
          </SelectInput>

          {!isSpecialDimension && (
            <SelectInput
              label="Formato de hoja"
              value={format.pageSize}
              onChange={(e) => onChange({ ...format, pageSize: e.target.value as PageSizeOption })}
            >
              <option value="carta">Carta (21,59 × 27,94 cm)</option>
              <option value="oficio">Oficio (21,59 × 33,0 cm)</option>
              <option value="a4">A4 (21,0 × 29,7 cm)</option>
            </SelectInput>
          )}
        </div>
      </div>

      {/* Margins & Zones */}
      {!isSpecialDimension && (
        <>
          <div className="bg-white border border-[#E4E2EC] rounded-lg p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-[#181622]">Márgenes en centímetros (GTC 185 num. 4.2)</h3>
              <label className="flex items-center gap-2 text-xs text-[#2F2B3D] cursor-pointer">
                <input
                  type="checkbox"
                  checked={format.margins.duplexSymmetric}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    updateMargins({
                      duplexSymmetric: checked,
                      leftCm: checked ? 3.0 : 3.5,
                      rightCm: checked ? 3.0 : 2.5,
                    });
                  }}
                  className="accent-[#5B2E7A]"
                />
                <span>Impresión por ambas caras (3 cm simétricos)</span>
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <TextInput
                label="Superior (3–4 cm)"
                type="number"
                step="0.1"
                min="1"
                max="6"
                value={format.margins.topCm}
                onChange={(e) => updateMargins({ topCm: Number(e.target.value) || 3 })}
              />
              <TextInput
                label="Inferior (2–3 cm)"
                type="number"
                step="0.1"
                min="1"
                max="6"
                value={format.margins.bottomCm}
                onChange={(e) => updateMargins({ bottomCm: Number(e.target.value) || 2.5 })}
              />
              <TextInput
                label="Izquierdo (3–4 cm)"
                type="number"
                step="0.1"
                min="1"
                max="6"
                disabled={format.margins.duplexSymmetric}
                value={format.margins.leftCm}
                onChange={(e) => updateMargins({ leftCm: Number(e.target.value) || 3 })}
              />
              <TextInput
                label="Derecho (2–3 cm)"
                type="number"
                step="0.1"
                min="1"
                max="6"
                disabled={format.margins.duplexSymmetric}
                value={format.margins.rightCm}
                onChange={(e) => updateMargins({ rightCm: Number(e.target.value) || 2.5 })}
              />
            </div>
          </div>

          <div className="bg-white border border-[#E4E2EC] rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-semibold text-[#181622]">Zonas documentales (GTC 185 num. 4.1)</h3>
            <div className="space-y-2 text-xs text-[#2F2B3D]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={format.showZona1}
                  onChange={(e) => onChange({ ...format, showZona1: e.target.checked })}
                  className="accent-[#5B2E7A]"
                />
                <span>Zona 1: Membrete institucional (Logo, Razón social y NIT)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={format.showZona2}
                  onChange={(e) => onChange({ ...format, showZona2: e.target.checked })}
                  className="accent-[#5B2E7A]"
                />
                <span>Zona 2: Información de contacto al pie de página</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={format.showZona3}
                  onChange={(e) => onChange({ ...format, showZona3: e.target.checked })}
                  className="accent-[#5B2E7A]"
                />
                <span>Zona 3: Registro y radicación (espacio superior derecho)</span>
              </label>
            </div>

            {format.showZona3 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#F0EEF5]">
                <TextInput
                  label="Número de radicación"
                  placeholder="Ej. RAD-2026-0014"
                  value={format.radicadoNumero}
                  onChange={(e) => onChange({ ...format, radicadoNumero: e.target.value })}
                />
                <TextInput
                  label="Fecha y hora de radicación"
                  placeholder="Ej. 2026-11-24 09:30"
                  value={format.radicadoFechaHora}
                  onChange={(e) => onChange({ ...format, radicadoFechaHora: e.target.value })}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
