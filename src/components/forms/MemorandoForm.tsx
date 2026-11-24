import React from 'react';
import { Sparkles } from 'lucide-react';
import { MemorandoData } from '../../types/documents';
import { DESPEDIDAS_GTC185, MEMORANDO_TIPOS, TRATAMIENTOS_GTC185 } from '../../data/defaults';
import { FormSection, SelectInput, TextAreaInput, TextInput } from '../FormPrimitives';

interface MemorandoFormProps {
  data: MemorandoData;
  onChange: (next: MemorandoData) => void;
  onOpenAi: (targetField: 'cuerpo' | 'asunto') => void;
}

export const MemorandoForm: React.FC<MemorandoFormProps> = ({ data, onChange, onOpenAi }) => {
  const update = (patch: Partial<MemorandoData>) => onChange({ ...data, ...patch });

  return (
    <div className="space-y-4">
      <FormSection stepNumber={1} title="Tipo y estructura de encabezamiento" description="Capítulo 6 de la GTC 185: comunicaciones internas jerárquicas.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SelectInput
            label="Tipo de memorando"
            value={data.tipo}
            onChange={(e) => update({ tipo: e.target.value as MemorandoData['tipo'] })}
          >
            {MEMORANDO_TIPOS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </SelectInput>
          <SelectInput
            label="Opción de firma (num. 6.3.2.1)"
            value={data.opcionEncabezamiento}
            onChange={(e) => update({ opcionEncabezamiento: e.target.value as MemorandoData['opcionEncabezamiento'] })}
          >
            <option value="primera">1ª: Nombre y cargo arriba (solo firma al final)</option>
            <option value="segunda">2ª: Remitente cargo arriba / nombre al final</option>
            <option value="tercera">3ª: Solo cargos arriba / nombre al final</option>
          </SelectInput>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextInput
            label="Código"
            placeholder="Ej. VQ-MEM-001"
            value={data.codigo}
            onChange={(e) => update({ codigo: e.target.value })}
          />
          <TextInput
            label="Lugar de origen y fecha"
            required
            value={data.ciudadFecha}
            onChange={(e) => update({ ciudadFecha: e.target.value })}
          />
        </div>
      </FormSection>

      <FormSection stepNumber={2} title="Destinatario (PARA) y remitente (DE)">
        {data.opcionEncabezamiento !== 'tercera' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SelectInput
              label="Tratamiento destinatario"
              value={TRATAMIENTOS_GTC185.includes(data.paraTratamiento) ? data.paraTratamiento : 'Señor'}
              onChange={(e) => update({ paraTratamiento: e.target.value })}
            >
              {TRATAMIENTOS_GTC185.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </SelectInput>
            <TextInput
              label="Nombre completo destinatario"
              required
              value={data.paraNombre}
              onChange={(e) => update({ paraNombre: e.target.value })}
            />
          </div>
        )}

        <TextInput
          label="Cargo o dependencia del destinatario (PARA)"
          required
          value={data.paraCargo}
          onChange={(e) => update({ paraCargo: e.target.value })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#F0EEF5]">
          <TextInput
            label="Nombre del remitente (DE)"
            required={data.opcionEncabezamiento !== 'tercera'}
            value={data.deNombre}
            onChange={(e) => update({ deNombre: e.target.value })}
          />
          <TextInput
            label="Cargo o dependencia remitente (DE)"
            required
            value={data.deCargo}
            onChange={(e) => update({ deCargo: e.target.value })}
          />
        </div>
      </FormSection>

      <FormSection stepNumber={3} title="ASUNTO y cuerpo del memorando" description="En memorandos la palabra ASUNTO se presenta en mayúscula sostenida seguida de dos puntos.">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-[#2F2B3D]">
              ASUNTO <span className="text-[#DC2626]">*</span>
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

        <TextAreaInput
          label="Texto (el saludo va incluido en el primer párrafo según num. 6.3.3)"
          required
          rows={6}
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
      </FormSection>

      <FormSection stepNumber={4} title="Despedida y líneas especiales">
        <SelectInput
          label="Despedida"
          value={DESPEDIDAS_GTC185.includes(data.despedida) ? data.despedida : 'Atentamente,'}
          onChange={(e) => update({ despedida: e.target.value })}
        >
          {DESPEDIDAS_GTC185.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </SelectInput>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextInput
            label="Anexos (opcional)"
            placeholder="Ej. uno (un folio)"
            value={data.anexos}
            onChange={(e) => update({ anexos: e.target.value })}
          />
          <TextInput
            label="Copias (opcional)"
            value={data.copias}
            onChange={(e) => update({ copias: e.target.value })}
          />
          <TextInput
            label="Redactor (opcional)"
            value={data.redactor}
            onChange={(e) => update({ redactor: e.target.value })}
          />
          <TextInput
            label="Transcriptor (opcional)"
            value={data.transcriptor}
            onChange={(e) => update({ transcriptor: e.target.value })}
          />
        </div>
      </FormSection>
    </div>
  );
};
