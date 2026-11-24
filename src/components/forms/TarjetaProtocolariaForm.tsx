import React from 'react';
import { Sparkles } from 'lucide-react';
import { TarjetaProtocolariaData } from '../../types/documents';
import { FormSection, SelectInput, TextAreaInput, TextInput } from '../FormPrimitives';

interface TarjetaProtocolariaFormProps {
  data: TarjetaProtocolariaData;
  onChange: (next: TarjetaProtocolariaData) => void;
  onOpenAi: () => void;
}

export const TarjetaProtocolariaForm: React.FC<TarjetaProtocolariaFormProps> = ({
  data,
  onChange,
  onOpenAi,
}) => {
  const update = (patch: Partial<TarjetaProtocolariaData>) => onChange({ ...data, ...patch });

  const handleTipoChange = (tipo: TarjetaProtocolariaData['tipo']) => {
    if (tipo === 'presentacion') {
      update({ tipo, anchoCm: 9, altoCm: 5.5 });
    } else {
      update({ tipo, anchoCm: 15, altoCm: 10 });
    }
  };

  return (
    <div className="space-y-4">
      <FormSection stepNumber={1} title="Tipo y formato de tarjeta protocolaria (Cap. 14)">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SelectInput
            label="Modalidad protocolaria"
            value={data.tipo}
            onChange={(e) => handleTipoChange(e.target.value as TarjetaProtocolariaData['tipo'])}
          >
            <option value="invitacion">Tarjeta de invitación</option>
            <option value="felicitacion">Tarjeta de felicitación</option>
            <option value="agradecimiento">Tarjeta de agradecimiento</option>
            <option value="presentacion">Tarjeta de presentación</option>
          </SelectInput>

          <SelectInput
            label="Acabado visual"
            value={data.presentacionVisual}
            onChange={(e) =>
              update({ presentacionVisual: e.target.value as TarjetaProtocolariaData['presentacionVisual'] })
            }
          >
            <option value="marco_corporativo">Marco institucional doble</option>
            <option value="sobria_crema">Sobria en tono marfil</option>
            <option value="editorial_blanca">Blanca editorial minimalista</option>
          </SelectInput>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-end">
          <TextInput
            label="Ancho (cm)"
            type="number"
            step="0.5"
            min="7"
            max="25"
            value={data.anchoCm}
            onChange={(e) => update({ anchoCm: Number(e.target.value) || 15 })}
          />
          <TextInput
            label="Alto (cm)"
            type="number"
            step="0.5"
            min="4.5"
            max="20"
            value={data.altoCm}
            onChange={(e) => update({ altoCm: Number(e.target.value) || 10 })}
          />
          <label className="flex items-center gap-2 text-xs text-[#3E394E] cursor-pointer pb-2">
            <input
              type="checkbox"
              checked={data.incluirLogo}
              onChange={(e) => update({ incluirLogo: e.target.checked })}
              className="accent-[#5B2E7A]"
            />
            <span>Incluir logotipo VAQUIMILK</span>
          </label>
        </div>
      </FormSection>

      {data.tipo === 'invitacion' && (
        <FormSection stepNumber={2} title="Detalles del evento e invitación">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextInput
              label="Tipo de evento"
              value={data.tipoEvento}
              onChange={(e) => update({ tipoEvento: e.target.value })}
            />
            <TextInput
              label="Destinatario / Invitado"
              value={data.destinatarioNombre}
              onChange={(e) => update({ destinatarioNombre: e.target.value })}
            />
          </div>

          <TextAreaInput
            label="Texto de invitación"
            required
            rows={4}
            value={data.motivoInvitacion}
            onChange={(e) => update({ motivoInvitacion: e.target.value })}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextInput
              label="Fecha del evento"
              required
              value={data.fechaEvento}
              onChange={(e) => update({ fechaEvento: e.target.value })}
            />
            <TextInput
              label="Hora"
              required
              value={data.horaEvento}
              onChange={(e) => update({ horaEvento: e.target.value })}
            />
          </div>

          <TextInput
            label="Lugar / Dirección"
            required
            value={data.lugarEvento}
            onChange={(e) => update({ lugarEvento: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextInput
              label="Información adicional (vestuario, nota)"
              value={data.informacionAdicional}
              onChange={(e) => update({ informacionAdicional: e.target.value })}
            />
            <TextInput
              label="Datos de confirmación (RSVP)"
              value={data.datosConfirmacion}
              onChange={(e) => update({ datosConfirmacion: e.target.value })}
            />
          </div>
          <TextInput
            label="Ciudad y fecha de emisión"
            value={data.ciudadFecha}
            onChange={(e) => update({ ciudadFecha: e.target.value })}
          />
        </FormSection>
      )}

      {(data.tipo === 'felicitacion' || data.tipo === 'agradecimiento') && (
        <FormSection
          stepNumber={2}
          title={data.tipo === 'felicitacion' ? 'Mensaje de felicitación' : 'Mensaje de agradecimiento'}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextInput
              label="Nombre del destinatario"
              required
              value={data.destinatarioNombre}
              onChange={(e) => update({ destinatarioNombre: e.target.value })}
            />
            <TextInput
              label="Ciudad y fecha"
              value={data.ciudadFecha}
              onChange={(e) => update({ ciudadFecha: e.target.value })}
            />
          </div>

          <TextAreaInput
            label="Mensaje protocolario"
            required
            rows={4}
            value={data.cuerpoMensaje}
            onChange={(e) => update({ cuerpoMensaje: e.target.value })}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextInput
              label="Nombre de quien envía"
              value={data.remitenteNombre}
              onChange={(e) => update({ remitenteNombre: e.target.value })}
            />
            <TextInput
              label="Cargo"
              value={data.remitenteCargo}
              onChange={(e) => update({ remitenteCargo: e.target.value })}
            />
          </div>
        </FormSection>
      )}

      {data.tipo === 'presentacion' && (
        <FormSection stepNumber={2} title="Datos de la tarjeta de presentación (9 × 5,5 cm)">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextInput
              label="Nombre completo del funcionario"
              required
              value={data.remitenteNombre}
              onChange={(e) => update({ remitenteNombre: e.target.value })}
            />
            <TextInput
              label="Cargo"
              required
              value={data.remitenteCargo}
              onChange={(e) => update({ remitenteCargo: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextInput
              label="Correo electrónico institucional"
              type="email"
              value={data.presentacionCorreo}
              onChange={(e) => update({ presentacionCorreo: e.target.value })}
            />
            <TextInput
              label="Teléfono (opcional — dejar vacío si no está confirmado)"
              value={data.presentacionTelefono}
              onChange={(e) => update({ presentacionTelefono: e.target.value })}
            />
          </div>
        </FormSection>
      )}
    </div>
  );
};
