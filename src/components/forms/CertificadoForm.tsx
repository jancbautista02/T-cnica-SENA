import React from 'react';
import { Sparkles } from 'lucide-react';
import { CertificadoConstanciaData } from '../../types/documents';
import { CERTIFICADO_SUBTIPOS, CONSTANCIA_SUBTIPOS } from '../../data/defaults';
import { FormSection, SelectInput, TextAreaInput, TextInput } from '../FormPrimitives';

interface CertificadoFormProps {
  data: CertificadoConstanciaData;
  onChange: (next: CertificadoConstanciaData) => void;
  onCategoryChange: (categoria: 'certificado' | 'constancia') => void;
  onOpenAi: () => void;
}

export const CertificadoForm: React.FC<CertificadoFormProps> = ({
  data,
  onChange,
  onCategoryChange,
  onOpenAi,
}) => {
  const update = (patch: Partial<CertificadoConstanciaData>) => onChange({ ...data, ...patch });
  const subtipos = data.categoria === 'certificado' ? CERTIFICADO_SUBTIPOS : CONSTANCIA_SUBTIPOS;

  return (
    <div className="space-y-4">
      <FormSection
        stepNumber={1}
        title="Diferenciación normativa GTC 185 (Cap. 10)"
        description="Certificados (estilo bloque, CERTIFICA:) vs. Constancias (bloque extremo, HACE CONSTAR:)."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#2F2B3D] mb-1">Tipo de documento probatorio</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  const defaultSub = CONSTANCIA_SUBTIPOS[0];
                  update({
                    categoria: 'constancia',
                    subtipo: CONSTANCIA_SUBTIPOS.includes(data.subtipo) ? data.subtipo : defaultSub,
                  });
                  onCategoryChange('constancia');
                }}
                className={`px-3 py-2 text-xs font-semibold rounded-md border transition-colors ${
                  data.categoria === 'constancia'
                    ? 'border-[#5B2E7A] bg-[#5B2E7A]/[0.06] text-[#5B2E7A]'
                    : 'border-[#DCD8E6] text-[#4A465C] hover:bg-[#FAF9FC]'
                }`}
              >
                Constancia (Bloque extremo)
              </button>
              <button
                type="button"
                onClick={() => {
                  const defaultSub = CERTIFICADO_SUBTIPOS[0];
                  update({
                    categoria: 'certificado',
                    subtipo: CERTIFICADO_SUBTIPOS.includes(data.subtipo) ? data.subtipo : defaultSub,
                  });
                  onCategoryChange('certificado');
                }}
                className={`px-3 py-2 text-xs font-semibold rounded-md border transition-colors ${
                  data.categoria === 'certificado'
                    ? 'border-[#5B2E7A] bg-[#5B2E7A]/[0.06] text-[#5B2E7A]'
                    : 'border-[#DCD8E6] text-[#4A465C] hover:bg-[#FAF9FC]'
                }`}
              >
                Certificado (Bloque)
              </button>
            </div>
          </div>

          <SelectInput
            label="Subtipo documental"
            value={subtipos.includes(data.subtipo) ? data.subtipo : subtipos[subtipos.length - 1]}
            onChange={(e) => update({ subtipo: e.target.value })}
          >
            {subtipos.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </SelectInput>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <TextInput
            label="Código"
            placeholder="Ej. VQ-CON-001"
            value={data.codigo}
            onChange={(e) => update({ codigo: e.target.value })}
          />
          <SelectInput
            label="Ubicación de la fecha"
            value={data.ubicacionFecha}
            onChange={(e) => update({ ubicacionFecha: e.target.value as 'inicio' | 'final' })}
          >
            <option value="inicio">Al inicio (debajo del código)</option>
            <option value="final">Al final (antes de la firma)</option>
          </SelectInput>
          <TextInput
            label="Lugar de origen y fecha"
            required
            value={data.ciudadFecha}
            onChange={(e) => update({ ciudadFecha: e.target.value })}
          />
        </div>
      </FormSection>

      <FormSection stepNumber={2} title="Autoridad que expide y datos del solicitante">
        <TextInput
          label="Cargo de la persona que expide (en mayúscula sostenida)"
          required
          placeholder="Ej. LA REPRESENTANTE LEGAL"
          value={data.cargoExpide}
          onChange={(e) => update({ cargoExpide: e.target.value })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <TextInput
            label="Tratamiento"
            placeholder="señor(a)"
            value={data.solicitanteTratamiento}
            onChange={(e) => update({ solicitanteTratamiento: e.target.value })}
          />
          <div className="sm:col-span-2">
            <TextInput
              label="Nombre completo del solicitante / interesado"
              required
              value={data.solicitanteNombre}
              onChange={(e) => update({ solicitanteNombre: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <TextInput
            label="Tipo de documento"
            placeholder="cédula de ciudadanía"
            value={data.tipoDocumento}
            onChange={(e) => update({ tipoDocumento: e.target.value })}
          />
          <TextInput
            label="Número de documento"
            required
            value={data.numeroDocumento}
            onChange={(e) => update({ numeroDocumento: e.target.value })}
          />
          <TextInput
            label="Lugar de expedición"
            value={data.expedicionDocumento}
            onChange={(e) => update({ expedicionDocumento: e.target.value })}
          />
        </div>

        <TextInput
          label="Periodo o fechas de referencia"
          placeholder="Ej. 10 de enero de 2024 a la fecha"
          value={data.periodoFechas}
          onChange={(e) => update({ periodoFechas: e.target.value })}
        />
      </FormSection>

      <FormSection
        stepNumber={3}
        title={`Texto probatorio (${data.categoria === 'certificado' ? 'CERTIFICA:' : 'HACE CONSTAR:'})`}
        description="Cada párrafo del texto debe iniciar con la conjunción 'Que' con mayúscula inicial (GTC 185 num. 10.4.5)."
      >
        <TextAreaInput
          label="Párrafos del documento"
          required
          rows={6}
          hint="Inicia cada párrafo con 'Que ...'"
          value={data.cuerpoParrafos}
          onChange={(e) => update({ cuerpoParrafos: e.target.value })}
          rightAction={
            <button
              type="button"
              onClick={onOpenAi}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#5B2E7A] bg-[#5B2E7A]/[0.07] hover:bg-[#5B2E7A]/[0.12] rounded-md transition-colors"
            >
              <Sparkles size={12} />
              <span>Asistente IA</span>
            </button>
          }
        />

        <TextInput
          label="Motivo o destinatario de expedición"
          placeholder="Ej. Esta constancia se expide a solicitud del interesado."
          value={data.motivoDestino}
          onChange={(e) => update({ motivoDestino: e.target.value })}
        />
      </FormSection>

      <FormSection stepNumber={4} title="Firma responsable y líneas especiales">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <TextInput
            label="Nombre completo de quien firma"
            required
            value={data.expideNombre}
            onChange={(e) => update({ expideNombre: e.target.value })}
          />
          <TextInput
            label="Cargo de quien firma"
            required
            value={data.expideCargo}
            onChange={(e) => update({ expideCargo: e.target.value })}
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
