import React, { useState } from 'react';
import { Plus, Sparkles, Trash2 } from 'lucide-react';
import { ActaCompromiso, ActaData, ActaFirmante, ActaParticipante, ActaPuntoDesarrollo } from '../../types/documents';
import { ACTA_CLASES } from '../../data/defaults';
import { FormSection, SelectInput, TextAreaInput, TextInput } from '../FormPrimitives';

interface ActaFormProps {
  data: ActaData;
  onChange: (next: ActaData) => void;
  onOpenAiForPoint: (puntoId: string, text: string) => void;
}

const STEPS = [
  { id: 1, label: 'Encabezado' },
  { id: 2, label: 'Participantes' },
  { id: 3, label: 'Orden y Desarrollo' },
  { id: 4, label: 'Compromisos y Firmas' },
];

export const ActaForm: React.FC<ActaFormProps> = ({ data, onChange, onOpenAiForPoint }) => {
  const [step, setStep] = useState<number>(1);
  const update = (patch: Partial<ActaData>) => onChange({ ...data, ...patch });

  const addParticipante = () => {
    const next: ActaParticipante = {
      id: `part_${Date.now()}`,
      nombre: '',
      cargo: '',
      dependencia: '',
      condicion: 'Asistente',
      representacion: '',
    };
    update({ participantes: [...data.participantes, next] });
  };

  const updateParticipante = (id: string, patch: Partial<ActaParticipante>) => {
    update({
      participantes: data.participantes.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    });
  };

  const removeParticipante = (id: string) => {
    update({ participantes: data.participantes.filter((p) => p.id !== id) });
  };

  const addOrdenTema = () => {
    const nextNum = data.ordenDelDia.length + 1;
    const newTopic = `Punto ${nextNum}`;
    const newPunto: ActaPuntoDesarrollo = {
      id: `des_${Date.now()}`,
      numero: nextNum,
      tema: newTopic,
      descripcion: '',
      intervenciones: '',
      decisiones: '',
      votacionAFavor: '',
      votacionEnContra: '',
      votacionBlanco: '',
    };
    update({
      ordenDelDia: [...data.ordenDelDia, newTopic],
      desarrollo: [...data.desarrollo, newPunto],
    });
  };

  const syncOrdenItem = (idx: number, val: string) => {
    const nextOrden = [...data.ordenDelDia];
    nextOrden[idx] = val;
    const nextDes = [...data.desarrollo];
    if (nextDes[idx]) {
      nextDes[idx] = { ...nextDes[idx], tema: val, numero: idx + 1 };
    }
    update({ ordenDelDia: nextOrden, desarrollo: nextDes });
  };

  const removeOrdenItem = (idx: number) => {
    const nextOrden = data.ordenDelDia.filter((_, i) => i !== idx);
    const nextDes = data.desarrollo
      .filter((_, i) => i !== idx)
      .map((d, i) => ({ ...d, numero: i + 1 }));
    update({ ordenDelDia: nextOrden, desarrollo: nextDes });
  };

  const updatePunto = (id: string, patch: Partial<ActaPuntoDesarrollo>) => {
    update({
      desarrollo: data.desarrollo.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    });
  };

  const addCompromiso = () => {
    const next: ActaCompromiso = {
      id: `comp_${Date.now()}`,
      actividad: '',
      responsable: '',
      fechaCumplimiento: '',
      observaciones: '',
    };
    update({ compromisos: [...data.compromisos, next] });
  };

  const updateCompromiso = (id: string, patch: Partial<ActaCompromiso>) => {
    update({
      compromisos: data.compromisos.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });
  };

  const addFirmante = () => {
    const next: ActaFirmante = { id: `firm_${Date.now()}`, nombre: '', cargo: '' };
    update({ firmantes: [...data.firmantes, next] });
  };

  return (
    <div className="space-y-4">
      {/* Progress Indicator */}
      <div className="bg-white border border-[#E4E2EC] rounded-lg p-2 flex items-center gap-1 overflow-x-auto">
        {STEPS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStep(s.id)}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
              step === s.id
                ? 'bg-[#5B2E7A] text-white'
                : 'text-[#5E5972] hover:bg-[#F4F3F8] hover:text-[#181622]'
            }`}
          >
            {s.id}. {s.label}
          </button>
        ))}
      </div>

      {step === 1 && (
        <FormSection stepNumber={1} title="Identificación y datos de la reunión" description="Capítulo 8 GTC 185: suprimir '#' o 'No.' en el número del acta.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SelectInput
              label="Clase de acta"
              value={ACTA_CLASES.includes(data.clase) ? data.clase : 'Otra modalidad organizacional'}
              onChange={(e) => update({ clase: e.target.value })}
            >
              {ACTA_CLASES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </SelectInput>
            <SelectInput
              label="Carácter de la reunión"
              value={data.caracter}
              onChange={(e) => update({ caracter: e.target.value as ActaData['caracter'] })}
            >
              <option value="Ordinaria">Ordinaria</option>
              <option value="Extraordinaria">Extraordinaria</option>
            </SelectInput>
          </div>
          <TextInput
            label="Denominación del grupo o reunión"
            required
            value={data.tituloGrupo}
            onChange={(e) => update({ tituloGrupo: e.target.value })}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextInput
              label="Número consecutivo"
              required
              placeholder="Ej. ACTA 001"
              value={data.numeroActa}
              onChange={(e) => update({ numeroActa: e.target.value })}
            />
            <TextInput
              label="Ciudad y fecha"
              required
              value={data.ciudadFecha}
              onChange={(e) => update({ ciudadFecha: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <TextInput
              label="Hora inicio (24h)"
              type="time"
              value={data.horaInicio}
              onChange={(e) => update({ horaInicio: e.target.value })}
            />
            <TextInput
              label="Hora fin (24h)"
              type="time"
              value={data.horaFin}
              onChange={(e) => update({ horaFin: e.target.value })}
            />
            <TextInput
              label="Lugar de reunión"
              required
              value={data.lugar}
              onChange={(e) => update({ lugar: e.target.value })}
            />
          </div>
        </FormSection>
      )}

      {step === 2 && (
        <FormSection stepNumber={2} title="Asistentes, invitados y ausentes" description="Agrega o elimina participantes dinámicamente.">
          <div className="space-y-3">
            {data.participantes.map((p, idx) => (
              <div key={p.id} className="p-3 bg-[#FAF9FC] border border-[#E4E2EC] rounded-md space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#2F2B3D]">Participante {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeParticipante(p.id)}
                    className="text-xs text-[#DC2626] hover:underline inline-flex items-center gap-1"
                  >
                    <Trash2 size={12} />
                    <span>Eliminar</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <TextInput
                    label="Nombre completo"
                    value={p.nombre}
                    onChange={(e) => updateParticipante(p.id, { nombre: e.target.value })}
                  />
                  <TextInput
                    label="Cargo"
                    value={p.cargo}
                    onChange={(e) => updateParticipante(p.id, { cargo: e.target.value })}
                  />
                  <TextInput
                    label="Dependencia"
                    value={p.dependencia}
                    onChange={(e) => updateParticipante(p.id, { dependencia: e.target.value })}
                  />
                  <SelectInput
                    label="Condición de asistencia"
                    value={p.condicion}
                    onChange={(e) => updateParticipante(p.id, { condicion: e.target.value as ActaParticipante['condicion'] })}
                  >
                    <option value="Asistente">Asistente</option>
                    <option value="Invitado">Invitado</option>
                    <option value="Ausente (con excusa)">Ausente (con excusa)</option>
                    <option value="Ausente (sin excusa)">Ausente (sin excusa)</option>
                  </SelectInput>
                </div>
                <TextInput
                  label="En representación de (opcional)"
                  placeholder="Si representa a otro miembro"
                  value={p.representacion}
                  onChange={(e) => updateParticipante(p.id, { representacion: e.target.value })}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addParticipante}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#5B2E7A] border border-[#5B2E7A]/30 rounded-md hover:bg-[#5B2E7A]/[0.05]"
          >
            <Plus size={14} />
            <span>Agregar participante</span>
          </button>
        </FormSection>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <FormSection stepNumber={3} title="Orden del día">
            <div className="space-y-2">
              {data.ordenDelDia.map((tema, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-mono-code text-[#5E5972] w-6">{idx + 1}.</span>
                  <input
                    type="text"
                    value={tema}
                    onChange={(e) => syncOrdenItem(idx, e.target.value)}
                    className="flex-1 px-3 py-1.5 text-sm border border-[#DCD8E6] rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeOrdenItem(idx)}
                    aria-label="Eliminar punto"
                    className="p-1.5 text-[#DC2626] hover:bg-[#FEF2F2] rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addOrdenTema}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#5B2E7A] border border-[#5B2E7A]/30 rounded-md hover:bg-[#5B2E7A]/[0.05]"
            >
              <Plus size={14} />
              <span>Agregar punto al orden del día</span>
            </button>
          </FormSection>

          <FormSection title="Desarrollo de la reunión" description="Redactar en tiempo pasado (excepto descargos), sin iniciar párrafos con gerundio.">
            <div className="space-y-3">
              {data.desarrollo.map((punto) => (
                <div key={punto.id} className="p-3 bg-[#FAF9FC] border border-[#E4E2EC] rounded-md space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#181622]">
                      {punto.numero}. {punto.tema}
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenAiForPoint(punto.id, punto.descripcion)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#5B2E7A] hover:underline"
                    >
                      <Sparkles size={12} />
                      <span>Mejorar con IA</span>
                    </button>
                  </div>
                  <TextAreaInput
                    label="Descripción de lo tratado"
                    rows={3}
                    value={punto.descripcion}
                    onChange={(e) => updatePunto(punto.id, { descripcion: e.target.value })}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <TextInput
                      label="Intervenciones relevantes (opcional)"
                      value={punto.intervenciones}
                      onChange={(e) => updatePunto(punto.id, { intervenciones: e.target.value })}
                    />
                    <TextInput
                      label="Decisiones tomadas"
                      value={punto.decisiones}
                      onChange={(e) => updatePunto(punto.id, { decisiones: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <TextInput
                      label="Votos a favor"
                      placeholder="Opcional"
                      value={punto.votacionAFavor}
                      onChange={(e) => updatePunto(punto.id, { votacionAFavor: e.target.value })}
                    />
                    <TextInput
                      label="Votos en contra"
                      placeholder="Opcional"
                      value={punto.votacionEnContra}
                      onChange={(e) => updatePunto(punto.id, { votacionEnContra: e.target.value })}
                    />
                    <TextInput
                      label="En blanco"
                      placeholder="Opcional"
                      value={punto.votacionBlanco}
                      onChange={(e) => updatePunto(punto.id, { votacionBlanco: e.target.value })}
                    />
                  </div>
                </div>
              ))}
            </div>
          </FormSection>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <FormSection stepNumber={4} title="Tabla de compromisos">
            <div className="space-y-2.5">
              {data.compromisos.map((c, idx) => (
                <div key={c.id} className="p-3 bg-[#FAF9FC] border border-[#E4E2EC] rounded-md space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold">Compromiso {idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => update({ compromisos: data.compromisos.filter((x) => x.id !== c.id) })}
                      className="text-xs text-[#DC2626] hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <TextInput
                      label="Actividad o compromiso"
                      value={c.actividad}
                      onChange={(e) => updateCompromiso(c.id, { actividad: e.target.value })}
                    />
                    <TextInput
                      label="Responsable"
                      value={c.responsable}
                      onChange={(e) => updateCompromiso(c.id, { responsable: e.target.value })}
                    />
                    <TextInput
                      label="Fecha límite de cumplimiento"
                      value={c.fechaCumplimiento}
                      onChange={(e) => updateCompromiso(c.id, { fechaCumplimiento: e.target.value })}
                    />
                    <TextInput
                      label="Observaciones"
                      value={c.observaciones}
                      onChange={(e) => updateCompromiso(c.id, { observaciones: e.target.value })}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addCompromiso}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#5B2E7A] border border-[#5B2E7A]/30 rounded-md hover:bg-[#5B2E7A]/[0.05]"
            >
              <Plus size={14} />
              <span>Agregar compromiso</span>
            </button>
          </FormSection>

          <FormSection title="Convocatoria siguiente, firmas y anexos">
            <TextInput
              label="Convocatoria próxima reunión (opcional)"
              placeholder="Lugar, dirección, fecha y hora de la siguiente reunión"
              value={data.convocatoriaSiguiente}
              onChange={(e) => update({ convocatoriaSiguiente: e.target.value })}
            />
            <div className="space-y-2">
              <div className="text-xs font-semibold text-[#2F2B3D]">Firmantes responsables</div>
              {data.firmantes.map((f) => (
                <div key={f.id} className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-end">
                  <TextInput
                    label="Nombre completo"
                    value={f.nombre}
                    onChange={(e) =>
                      update({ firmantes: data.firmantes.map((x) => (x.id === f.id ? { ...x, nombre: e.target.value } : x)) })
                    }
                  />
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <TextInput
                        label="Cargo"
                        value={f.cargo}
                        onChange={(e) =>
                          update({ firmantes: data.firmantes.map((x) => (x.id === f.id ? { ...x, cargo: e.target.value } : x)) })
                        }
                      />
                    </div>
                    {data.firmantes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => update({ firmantes: data.firmantes.filter((x) => x.id !== f.id) })}
                        className="p-2 text-[#DC2626] hover:bg-[#FEF2F2] rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addFirmante}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#5B2E7A] border border-[#5B2E7A]/30 rounded-md"
              >
                <Plus size={14} />
                <span>Agregar firmante</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#F0EEF5]">
              <TextInput
                label="Anexos (opcional)"
                value={data.anexos}
                onChange={(e) => update({ anexos: e.target.value })}
              />
              <TextInput
                label="Transcriptor (opcional)"
                value={data.transcriptor}
                onChange={(e) => update({ transcriptor: e.target.value })}
              />
            </div>
          </FormSection>
        </div>
      )}
    </div>
  );
};
