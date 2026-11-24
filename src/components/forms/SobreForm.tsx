import React from 'react';
import { SobreData } from '../../types/documents';
import { SOBRE_DIMENSIONES, TRATAMIENTOS_GTC185 } from '../../data/defaults';
import { FormSection, SelectInput, TextInput } from '../FormPrimitives';

interface SobreFormProps {
  data: SobreData;
  onChange: (next: SobreData) => void;
}

export const SobreForm: React.FC<SobreFormProps> = ({ data, onChange }) => {
  const update = (patch: Partial<SobreData>) => onChange({ ...data, ...patch });

  const handleClaseChange = (clase: SobreData['clase']) => {
    const dim = SOBRE_DIMENSIONES[clase];
    update({
      clase,
      anchoCm: dim.anchoCm,
      altoCm: dim.altoCm,
    });
  };

  return (
    <div className="space-y-4">
      <FormSection
        stepNumber={1}
        title="Dimensiones y clasificación del sobre (Cap. 12)"
        description="Sobres normalizados GTC 185 con diagramación en tercios y zonas postales a escala real."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SelectInput
            label="Clase de sobre"
            value={data.clase}
            onChange={(e) => handleClaseChange(e.target.value as SobreData['clase'])}
          >
            {(Object.keys(SOBRE_DIMENSIONES) as SobreData['clase'][]).map((k) => (
              <option key={k} value={k}>
                {SOBRE_DIMENSIONES[k].label}
              </option>
            ))}
          </SelectInput>

          <SelectInput
            label="Modelo de impresión"
            value={data.modelo}
            onChange={(e) => update({ modelo: e.target.value as SobreData['modelo'] })}
          >
            <option value="modelo1">Modelo 1 (Zona 1 arriba + Zona 2 inferior)</option>
            <option value="modelo2">Modelo 2 (Remitente impreso en solapa posterior)</option>
          </SelectInput>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <TextInput
            label="Ancho (cm)"
            type="number"
            step="0.1"
            min="10"
            max="40"
            value={data.anchoCm}
            onChange={(e) => update({ anchoCm: Number(e.target.value) || 24.1 })}
          />
          <TextInput
            label="Alto (cm)"
            type="number"
            step="0.1"
            min="8"
            max="40"
            value={data.altoCm}
            onChange={(e) => update({ altoCm: Number(e.target.value) || 10.5 })}
          />
          <SelectInput
            label="Tipo de destino"
            value={data.destinoTipo}
            onChange={(e) => update({ destinoTipo: e.target.value as SobreData['destinoTipo'] })}
          >
            <option value="local">Local</option>
            <option value="nacional">Nacional</option>
            <option value="internacional">Internacional</option>
          </SelectInput>
        </div>

        <div className="flex flex-wrap gap-4 pt-1">
          <label className="flex items-center gap-2 text-xs text-[#3E394E] cursor-pointer">
            <input
              type="checkbox"
              checked={data.conVentanilla}
              onChange={(e) => update({ conVentanilla: e.target.checked })}
              className="accent-[#5B2E7A]"
            />
            <span>Sobre con ventanilla</span>
          </label>
          <label className="flex items-center gap-2 text-xs text-[#3E394E] cursor-pointer">
            <input
              type="checkbox"
              checked={data.mostrarGuiasTercios}
              onChange={(e) => update({ mostrarGuiasTercios: e.target.checked })}
              className="accent-[#5B2E7A]"
            />
            <span>Mostrar guías de tercios y Zona 3 postal en vista previa</span>
          </label>
        </div>
      </FormSection>

      <FormSection stepNumber={2} title="Remitente y mención postal (primer tercio)">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextInput
            label="Dependencia remitente (VAQUIMILK S.A.S.)"
            value={data.dependenciaRemitente}
            onChange={(e) => update({ dependenciaRemitente: e.target.value })}
          />
          <TextInput
            label="Mención primer tercio (opcional)"
            placeholder="Ej. CONFIDENCIAL, PERSONAL, URGENTE"
            value={data.mencionTercioIzquierdo}
            onChange={(e) => update({ mencionTercioIzquierdo: e.target.value })}
          />
        </div>
      </FormSection>

      <FormSection
        stepNumber={3}
        title="Datos del destinatario (segundo tercio)"
        description="GTC 185 (12.7.5): escribir dirección completa sin abreviaturas ni símbolo '#'."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SelectInput
            label="Tratamiento"
            value={TRATAMIENTOS_GTC185.includes(data.destTratamiento) ? data.destTratamiento : 'Personalizado'}
            onChange={(e) => {
              if (e.target.value !== 'Personalizado') update({ destTratamiento: e.target.value });
            }}
          >
            {TRATAMIENTOS_GTC185.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
            <option value="Personalizado">Personalizado...</option>
          </SelectInput>
          <TextInput
            label="Tratamiento (texto exacto)"
            value={data.destTratamiento}
            onChange={(e) => update({ destTratamiento: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextInput
            label="Nombre completo"
            required
            value={data.destNombre}
            onChange={(e) => update({ destNombre: e.target.value })}
          />
          <TextInput
            label="Cargo"
            value={data.destCargo}
            onChange={(e) => update({ destCargo: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextInput
            label="Organización"
            value={data.destOrganizacion}
            onChange={(e) => update({ destOrganizacion: e.target.value })}
          />
          <TextInput
            label="Dirección física (sin símbolo '#')"
            required
            placeholder="Ej. Carrera 14T nro. 74-24 Sur"
            value={data.destDireccion}
            onChange={(e) => update({ destDireccion: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <TextInput
            label="Ciudad y departamento"
            value={data.destCiudadDepto}
            onChange={(e) => update({ destCiudadDepto: e.target.value })}
          />
          <TextInput
            label="País"
            value={data.destPais}
            onChange={(e) => update({ destPais: e.target.value })}
          />
          <TextInput
            label="Teléfono especial de entrega (opcional)"
            value={data.destTelefonoEspecial}
            onChange={(e) => update({ destTelefonoEspecial: e.target.value })}
          />
        </div>
      </FormSection>
    </div>
  );
};
