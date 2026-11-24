import React from 'react';
import { Sparkles } from 'lucide-react';
import { CircularData } from '../../types/documents';
import { CIRCULAR_DESTINATARIOS_PRESETS, DESPEDIDAS_GTC185, TRATAMIENTOS_GTC185 } from '../../data/defaults';
import { FormSection, SelectInput, TextAreaInput, TextInput } from '../FormPrimitives';

interface CircularFormProps {
  data: CircularData;
  onChange: (next: CircularData) => void;
  onOpenAi: (targetField: 'cuerpo' | 'asunto') => void;
}

export const CircularForm: React.FC<CircularFormProps> = ({ data, onChange, onOpenAi }) => {
  const update = (patch: Partial<CircularData>) => onChange({ ...data, ...patch });

  return (
    <div className="space-y-4">
      <FormSection stepNumber={1} title="Clase y numeración de circular" description="Capítulo 7 de la GTC 185: comunicaciones de interés común.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SelectInput
            label="Clase de circular"
            value={data.clase}
            onChange={(e) => update({ clase: e.target.value as CircularData['clase'] })}
          >
            <option value="general">Circular general</option>
            <option value="interna">Circular interna</option>
            <option value="externa">Circular externa</option>
          </SelectInput>
          <SelectInput
            label="Modalidad (num. 7.2)"
            value={data.modalidad}
            onChange={(e) => update({ modalidad: e.target.value as CircularData['modalidad'] })}
          >
            <option value="circular_general">Circular general (dirigida a grupo)</option>
            <option value="carta_circular">Carta circular (dirigida personalmente)</option>
          </SelectInput>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <TextInput
            label="Consecutivo encabezado"
            placeholder="CIRCULAR 001"
            value={data.consecutivo}
            onChange={(e) => update({ consecutivo: e.target.value })}
          />
          <TextInput
            label="Código"
            placeholder="VQ-CIR-001"
            value={data.codigo}
            onChange={(e) => update({ codigo: e.target.value })}
          />
          <TextInput
            label="Lugar y fecha"
            required
            value={data.ciudadFecha}
            onChange={(e) => update({ ciudadFecha: e.target.value })}
          />
        </div>
      </FormSection>

      <FormSection stepNumber={2} title="Destinatarios" description="En circular general la preposición PARA no lleva dos puntos (GTC 185 num. 7.3.4).">
        {data.modalidad === 'circular_general' ? (
          <div className="space-y-3">
            <SelectInput
              label="Grupo destinatario predefinido"
              value={data.grupoDestinatarioCategoria}
              onChange={(e) => {
                const cat = e.target.value;
                update({
                  grupoDestinatarioCategoria: cat,
                  grupoDestinatario: cat === 'Personalizado' ? data.grupoDestinatario : cat,
                });
              }}
            >
              {CIRCULAR_DESTINATARIOS_PRESETS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </SelectInput>
            <TextInput
              label="Texto del grupo destinatario (se mostrará tras PARA)"
              required
              value={data.grupoDestinatario}
              onChange={(e) => update({ grupoDestinatario: e.target.value })}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SelectInput
              label="Tratamiento"
              value={TRATAMIENTOS_GTC185.includes(data.cartaDestinatarioTratamiento) ? data.cartaDestinatarioTratamiento : 'Señor'}
              onChange={(e) => update({ cartaDestinatarioTratamiento: e.target.value })}
            >
              {TRATAMIENTOS_GTC185.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </SelectInput>
            <TextInput
              label="Nombre completo"
              required
              value={data.cartaDestinatarioNombre}
              onChange={(e) => update({ cartaDestinatarioNombre: e.target.value })}
            />
            <TextInput
              label="Cargo"
              value={data.cartaDestinatarioCargo}
              onChange={(e) => update({ cartaDestinatarioCargo: e.target.value })}
            />
            <TextInput
              label="Organización"
              value={data.cartaDestinatarioOrg}
              onChange={(e) => update({ cartaDestinatarioOrg: e.target.value })}
            />
          </div>
        )}
      </FormSection>

      <FormSection stepNumber={3} title="Asunto y contenido">
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
              <span>Sugerir asunto</span>
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
          label="Cuerpo de la circular (iniciar con saludo de cortesía)"
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

      <FormSection stepNumber={4} title="Responsable y líneas especiales">
        <SelectInput
          label="Despedida"
          value={DESPEDIDAS_GTC185.includes(data.despedida) ? data.despedida : 'custom'}
          onChange={(e) => {
            if (e.target.value !== 'custom') update({ despedida: e.target.value });
          }}
        >
          {DESPEDIDAS_GTC185.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
          <option value="custom">Personalizada</option>
        </SelectInput>
        <TextInput
          label="Despedida (texto)"
          value={data.despedida}
          onChange={(e) => update({ despedida: e.target.value })}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextInput
            label="Nombre del responsable"
            required
            value={data.responsableNombre}
            onChange={(e) => update({ responsableNombre: e.target.value })}
          />
          <TextInput
            label="Cargo"
            required
            value={data.responsableCargo}
            onChange={(e) => update({ responsableCargo: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <TextInput
            label="Anexos (opcional)"
            value={data.anexos}
            onChange={(e) => update({ anexos: e.target.value })}
          />
          <TextInput
            label="Copias (opcional)"
            value={data.copias}
            onChange={(e) => update({ copias: e.target.value })}
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
