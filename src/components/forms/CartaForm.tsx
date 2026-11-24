import React from 'react';
import { Sparkles } from 'lucide-react';
import { CartaData } from '../../types/documents';
import {
  CARTA_ASUNTO_OPCIONES,
  CARTA_ESTILOS_REDACCION,
  DESPEDIDAS_GTC185,
  SALUDOS_GTC185,
  TRATAMIENTOS_GTC185,
} from '../../data/defaults';
import { FormSection, SelectInput, TextAreaInput, TextInput } from '../FormPrimitives';

interface CartaFormProps {
  data: CartaData;
  onChange: (next: CartaData) => void;
  onOpenAi: (targetField: 'cuerpo' | 'asunto') => void;
}

export const CartaForm: React.FC<CartaFormProps> = ({ data, onChange, onOpenAi }) => {
  const update = (patch: Partial<CartaData>) => onChange({ ...data, ...patch });
  const asuntoWords = data.asunto.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <FormSection stepNumber={1} title="Clasificación y radicación" description="Define la clase de carta y alcance conforme al Capítulo 5 de la GTC 185.">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <SelectInput
            label="Clase de carta"
            value={data.clase}
            onChange={(e) => update({ clase: e.target.value as CartaData['clase'] })}
          >
            <option value="organizacional">Organizacional</option>
            <option value="oficial">Oficial</option>
            <option value="personal">Personal</option>
          </SelectInput>
          <SelectInput
            label="Alcance (membrete en páginas)"
            value={data.alcance}
            onChange={(e) => update({ alcance: e.target.value as CartaData['alcance'] })}
          >
            <option value="externa">Externa (membrete y pie en todas)</option>
            <option value="interna">Interna (solo logo en subsiguientes)</option>
          </SelectInput>
          <TextInput
            label="Código documental"
            placeholder="Ej. VQ-GD-001"
            value={data.codigo}
            onChange={(e) => update({ codigo: e.target.value })}
          />
        </div>
        <TextInput
          label="Lugar de origen y fecha de elaboración"
          required
          placeholder="Ej. Bogotá D.C., 24 de noviembre de 2026"
          value={data.ciudadFecha}
          onChange={(e) => update({ ciudadFecha: e.target.value })}
        />
      </FormSection>

      <FormSection stepNumber={2} title="Datos del destinatario" description="Dirección personalizada al funcionario u oficina competente.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SelectInput
            label="Tratamiento o título académico"
            value={TRATAMIENTOS_GTC185.includes(data.destinatarioTratamiento) ? data.destinatarioTratamiento : 'Personalizado'}
            onChange={(e) => {
              if (e.target.value !== 'Personalizado') {
                update({ destinatarioTratamiento: e.target.value });
              }
            }}
          >
            {TRATAMIENTOS_GTC185.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
            <option value="Personalizado">Otro tratamiento...</option>
          </SelectInput>
          <TextInput
            label="Tratamiento (texto exacto)"
            value={data.destinatarioTratamiento}
            onChange={(e) => update({ destinatarioTratamiento: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextInput
            label="Nombre completo"
            required
            value={data.destinatarioNombre}
            onChange={(e) => update({ destinatarioNombre: e.target.value })}
          />
          <TextInput
            label="Cargo"
            value={data.destinatarioCargo}
            onChange={(e) => update({ destinatarioCargo: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextInput
            label="Organización"
            value={data.destinatarioOrganizacion}
            onChange={(e) => update({ destinatarioOrganizacion: e.target.value })}
          />
          <TextInput
            label="Dirección / Apartado / Correo"
            value={data.destinatarioDireccion}
            onChange={(e) => update({ destinatarioDireccion: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextInput
            label="Ciudad y departamento"
            value={data.destinatarioCiudadDepto}
            onChange={(e) => update({ destinatarioCiudadDepto: e.target.value })}
          />
          <TextInput
            label="País (si va al exterior)"
            placeholder="Opcional"
            value={data.destinatarioPais}
            onChange={(e) => update({ destinatarioPais: e.target.value })}
          />
        </div>
        <label className="flex items-center gap-2 text-xs text-[#3E394E] cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={data.sobreVentanilla}
            onChange={(e) => update({ sobreVentanilla: e.target.checked })}
            className="accent-[#5B2E7A]"
          />
          <span>Sobre con ventanilla (ciudad y país en mayúscula sostenida según num. 5.4.3.7)</span>
        </label>
      </FormSection>

      <FormSection stepNumber={3} title="Asunto y desarrollo del texto" description="Un solo tema por comunicación, lenguaje claro, natural y conciso.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SelectInput
            label="Categoría de asunto"
            value={data.asuntoCategoria}
            onChange={(e) => {
              const val = e.target.value;
              update({
                asuntoCategoria: val,
                asunto: val === 'Otro asunto personalizado' ? data.asunto : val,
              });
            }}
          >
            {CARTA_ASUNTO_OPCIONES.map((op) => (
              <option key={op} value={op}>{op}</option>
            ))}
          </SelectInput>
          <SelectInput
            label="Estilo de redacción"
            value={data.estiloRedaccion}
            onChange={(e) => update({ estiloRedaccion: e.target.value as CartaData['estiloRedaccion'] })}
          >
            {CARTA_ESTILOS_REDACCION.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </SelectInput>
        </div>

        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <label className="text-xs font-medium text-[#2F2B3D]">
              Asunto <span className="text-[#DC2626]">*</span>{' '}
              <span className={`ml-1 font-normal ${asuntoWords > 4 ? 'text-[#D97706]' : 'text-[#6B6580]'}`}>
                ({asuntoWords}/4 palabras recomendadas)
              </span>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SelectInput
            label="Saludo sugerido (Anexo A)"
            value={SALUDOS_GTC185.includes(data.saludo) ? data.saludo : 'custom'}
            onChange={(e) => {
              if (e.target.value !== 'custom') update({ saludo: e.target.value });
            }}
          >
            {SALUDOS_GTC185.map((s) => (
              <option key={s} value={s}>{s}</option>
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
          label="Cuerpo o texto de la carta"
          required
          rows={7}
          hint="Separa párrafos con una línea en blanco"
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

      <FormSection stepNumber={4} title="Despedida, firma y líneas especiales">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SelectInput
            label="Despedida sugerida"
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
            label="Despedida"
            value={data.despedida}
            onChange={(e) => update({ despedida: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextInput
            label="Nombre completo del remitente"
            required
            value={data.remitenteNombre}
            onChange={(e) => update({ remitenteNombre: e.target.value })}
          />
          <TextInput
            label="Cargo del remitente"
            required
            value={data.remitenteCargo}
            onChange={(e) => update({ remitenteCargo: e.target.value })}
          />
        </div>

        <label className="flex items-center gap-2 text-xs text-[#3E394E] cursor-pointer">
          <input
            type="checkbox"
            checked={data.incluirLineaFirma}
            onChange={(e) => update({ incluirLineaFirma: e.target.checked })}
            className="accent-[#5B2E7A]"
          />
          <span>Incluir línea guía sobre el nombre del remitente</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#F0EEF5]">
          <TextInput
            label="Anexos (opcional)"
            placeholder="Ej. uno (15 folios)"
            value={data.anexos}
            onChange={(e) => update({ anexos: e.target.value })}
          />
          <TextInput
            label="Copias (opcional)"
            placeholder="Ej. Gerencia, Contabilidad"
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
