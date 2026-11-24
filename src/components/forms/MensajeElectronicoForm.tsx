import React from 'react';
import { Sparkles } from 'lucide-react';
import { MensajeElectronicoData } from '../../types/documents';
import { DESPEDIDAS_GTC185, MENSAJE_TIPOS, SALUDOS_GTC185 } from '../../data/defaults';
import { FormSection, SelectInput, TextAreaInput, TextInput } from '../FormPrimitives';

interface MensajeElectronicoFormProps {
  data: MensajeElectronicoData;
  onChange: (next: MensajeElectronicoData) => void;
  onOpenAi: (targetField: 'cuerpo' | 'asunto') => void;
}

export const MensajeElectronicoForm: React.FC<MensajeElectronicoFormProps> = ({
  data,
  onChange,
  onOpenAi,
}) => {
  const update = (patch: Partial<MensajeElectronicoData>) => onChange({ ...data, ...patch });

  return (
    <div className="space-y-4">
      <div className="text-xs text-[#4A465C] bg-[#FAF9FC] border border-[#E4E2EC] rounded-lg p-3">
        Este módulo estructura y exporta el borrador del mensaje electrónico conforme al Capítulo 13 de la GTC 185. El envío real debe hacerse desde el cliente de correo oficial de VAQUIMILK S.A.S. (no se simulan envíos).
      </div>

      <FormSection stepNumber={1} title="Tipo y encabezamiento del mensaje (Cap. 13)">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SelectInput
            label="Propósito del mensaje"
            value={MENSAJE_TIPOS.includes(data.tipo) ? data.tipo : 'Otro mensaje personalizado'}
            onChange={(e) => update({ tipo: e.target.value })}
          >
            {MENSAJE_TIPOS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </SelectInput>
          <TextInput
            label="Fecha de referencia"
            value={data.fechaReferencia}
            onChange={(e) => update({ fechaReferencia: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <TextInput
            label="Nombre del remitente"
            required
            value={data.remitenteNombre}
            onChange={(e) => update({ remitenteNombre: e.target.value })}
          />
          <TextInput
            label="Cargo del remitente"
            value={data.remitenteCargo}
            onChange={(e) => update({ remitenteCargo: e.target.value })}
          />
          <TextInput
            label="Correo remitente"
            type="email"
            value={data.remitenteCorreo}
            onChange={(e) => update({ remitenteCorreo: e.target.value })}
          />
        </div>

        <TextInput
          label="Destinatario(s) — Para"
          required
          placeholder="correo@organizacion.com"
          value={data.destinatario}
          onChange={(e) => update({ destinatario: e.target.value })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextInput
            label="Con copia (CC — opcional)"
            value={data.copiaCC}
            onChange={(e) => update({ copiaCC: e.target.value })}
          />
          <TextInput
            label="Copia oculta (CCO — recomendada en envíos múltiples)"
            value={data.copiaOcultaCCO}
            onChange={(e) => update({ copiaOcultaCCO: e.target.value })}
          />
        </div>

        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <label className="text-xs font-medium text-[#2F2B3D]">
              Asunto del mensaje <span className="text-[#DC2626]">*</span>
            </label>
            <button
              type="button"
              onClick={() => onOpenAi('asunto')}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-[#5B2E7A] hover:underline"
            >
              <Sparkles size={12} />
              <span>Sugerir asunto con IA</span>
            </button>
          </div>
          <input
            type="text"
            value={data.asunto}
            onChange={(e) => update({ asunto: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white border border-[#DCD8E6] rounded-md focus:outline-none focus:border-[#5B2E7A]"
          />
        </div>
      </FormSection>

      <FormSection stepNumber={2} title="Redacción y firma institucional">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SelectInput
            label="Saludo sugerido"
            value={SALUDOS_GTC185.includes(data.saludo) ? data.saludo : 'custom'}
            onChange={(e) => {
              if (e.target.value !== 'custom') update({ saludo: e.target.value });
            }}
          >
            {SALUDOS_GTC185.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
            <option value="custom">Personalizado</option>
          </SelectInput>
          <TextInput
            label="Saludo"
            value={data.saludo}
            onChange={(e) => update({ saludo: e.target.value })}
          />
        </div>

        <TextAreaInput
          label="Cuerpo del mensaje"
          required
          rows={6}
          hint="Conciso y directo (GTC 185 Cap. 13)"
          value={data.cuerpo}
          onChange={(e) => update({ cuerpo: e.target.value })}
          rightAction={
            <button
              type="button"
              onClick={() => onOpenAi('cuerpo')}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#5B2E7A] bg-[#5B2E7A]/[0.07] hover:bg-[#5B2E7A]/[0.12] rounded-md transition-colors"
            >
              <Sparkles size={12} />
              <span>Asistente IA</span>
            </button>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SelectInput
            label="Despedida sugerida"
            value={DESPEDIDAS_GTC185.includes(data.despedida) ? data.despedida : 'custom'}
            onChange={(e) => {
              if (e.target.value !== 'custom') update({ despedida: e.target.value });
            }}
          >
            {DESPEDIDAS_GTC185.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
            <option value="custom">Personalizada</option>
          </SelectInput>
          <TextInput
            label="Despedida"
            value={data.despedida}
            onChange={(e) => update({ despedida: e.target.value })}
          />
        </div>

        <TextInput
          label="Archivos adjuntos de referencia (opcional)"
          placeholder="Ej. Portafolio_Vaquimilk_2026.pdf"
          value={data.adjuntosReferencia}
          onChange={(e) => update({ adjuntosReferencia: e.target.value })}
        />

        <label className="flex items-center gap-2 text-xs text-[#3E394E] cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={data.incluirFirmaInstitucional}
            onChange={(e) => update({ incluirFirmaInstitucional: e.target.checked })}
            className="accent-[#5B2E7A]"
          />
          <span>Incluir firma corporativa de VAQUIMILK S.A.S. al cierre</span>
        </label>
      </FormSection>
    </div>
  );
};
