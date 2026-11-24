import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  HojaVidaAcademico,
  HojaVidaData,
  HojaVidaDistincion,
  HojaVidaExperiencia,
  HojaVidaFormacion,
} from '../../types/documents';
import { FormSection, SelectInput, TextAreaInput, TextInput } from '../FormPrimitives';

interface HojaVidaFormProps {
  data: HojaVidaData;
  onChange: (next: HojaVidaData) => void;
}

const STEPS = [
  { id: 1, label: 'Datos básicos' },
  { id: 2, label: 'Info. laboral' },
  { id: 3, label: 'Académica' },
  { id: 4, label: 'Experiencia' },
];

export const HojaVidaForm: React.FC<HojaVidaFormProps> = ({ data, onChange }) => {
  const [step, setStep] = useState<number>(1);
  const update = (patch: Partial<HojaVidaData>) => onChange({ ...data, ...patch });

  const addAcademico = () => {
    const next: HojaVidaAcademico = {
      id: `ac_${Date.now()}`,
      nivel: 'Profesional',
      institucion: '',
      tituloObtenido: '',
      fechaInicio: '',
      fechaFinalizacion: '',
      ciudadPais: 'Bogotá D.C., Colombia',
    };
    update({ academicos: [...data.academicos, next] });
  };

  const addFormacion = () => {
    const next: HojaVidaFormacion = {
      id: `fc_${Date.now()}`,
      tipo: 'Curso',
      nombre: '',
      institucion: '',
      duracionNivel: '',
      fecha: '',
    };
    update({ formacionComplementaria: [...data.formacionComplementaria, next] });
  };

  const addExperiencia = () => {
    const next: HojaVidaExperiencia = {
      id: `ex_${Date.now()}`,
      empresa: '',
      cargo: '',
      fechaIngreso: '',
      fechaRetiro: '',
      funciones: '',
    };
    update({ experiencias: [...data.experiencias, next] });
  };

  const addDistincion = () => {
    const next: HojaVidaDistincion = {
      id: `di_${Date.now()}`,
      titulo: '',
      entidad: '',
      fecha: '',
    };
    update({ investigacionesDistinciones: [...data.investigacionesDistinciones, next] });
  };

  return (
    <div className="space-y-4">
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
        <FormSection
          stepNumber={1}
          title="Datos básicos del colaborador (Cap. 11)"
          description="El registro institucional GTC 185 se ordena iniciando por Primer Apellido, Segundo Apellido y Nombres."
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <TextInput
              label="Primer apellido"
              required
              value={data.primerApellido}
              onChange={(e) => update({ primerApellido: e.target.value })}
            />
            <TextInput
              label="Segundo apellido"
              value={data.segundoApellido}
              onChange={(e) => update({ segundoApellido: e.target.value })}
            />
            <TextInput
              label="Nombres"
              required
              value={data.nombres}
              onChange={(e) => update({ nombres: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <SelectInput
              label="Tipo de identificación"
              value={data.tipoIdentificacion}
              onChange={(e) => update({ tipoIdentificacion: e.target.value })}
            >
              <option value="Cédula de Ciudadanía">Cédula de Ciudadanía</option>
              <option value="Cédula de Extranjería">Cédula de Extranjería</option>
              <option value="Pasaporte">Pasaporte</option>
              <option value="Permiso por Protección Temporal">PPT</option>
            </SelectInput>
            <TextInput
              label="Número de identificación"
              required
              value={data.numeroIdentificacion}
              onChange={(e) => update({ numeroIdentificacion: e.target.value })}
            />
            <TextInput
              label="Lugar de expedición"
              value={data.lugarExpedicion}
              onChange={(e) => update({ lugarExpedicion: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextInput
              label="Lugar de nacimiento"
              value={data.lugarNacimiento}
              onChange={(e) => update({ lugarNacimiento: e.target.value })}
            />
            <TextInput
              label="Fecha de nacimiento"
              placeholder="AAAA-MM-DD o texto"
              value={data.fechaNacimiento}
              onChange={(e) => update({ fechaNacimiento: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <SelectInput
              label="Género"
              value={data.genero}
              onChange={(e) => update({ genero: e.target.value })}
            >
              <option value="">Seleccionar...</option>
              <option value="Femenino">Femenino</option>
              <option value="Masculino">Masculino</option>
              <option value="Otro / Prefiere no indicar">Otro / Prefiere no indicar</option>
            </SelectInput>
            <SelectInput
              label="Estado civil"
              value={data.estadoCivil}
              onChange={(e) => update({ estadoCivil: e.target.value })}
            >
              <option value="">Seleccionar...</option>
              <option value="Soltero(a)">Soltero(a)</option>
              <option value="Casado(a)">Casado(a)</option>
              <option value="Unión marital de hecho">Unión marital de hecho</option>
              <option value="Divorciado(a)">Divorciado(a)</option>
              <option value="Viudo(a)">Viudo(a)</option>
            </SelectInput>
            <TextInput
              label="Número de hijos"
              value={data.numeroHijos}
              onChange={(e) => update({ numeroHijos: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <TextInput
              label="Dirección de domicilio"
              value={data.direccion}
              onChange={(e) => update({ direccion: e.target.value })}
            />
            <TextInput
              label="Teléfono de contacto"
              value={data.telefono}
              onChange={(e) => update({ telefono: e.target.value })}
            />
            <TextInput
              label="Correo electrónico"
              type="email"
              value={data.correo}
              onChange={(e) => update({ correo: e.target.value })}
            />
          </div>
        </FormSection>
      )}

      {step === 2 && (
        <FormSection stepNumber={2} title="Información laboral en VAQUIMILK S.A.S.">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <TextInput
              label="Fecha de ingreso"
              placeholder="AAAA-MM-DD"
              value={data.fechaIngresoOrg}
              onChange={(e) => update({ fechaIngresoOrg: e.target.value })}
            />
            <TextInput
              label="Sucursal o dependencia"
              value={data.sucursalDependencia}
              onChange={(e) => update({ sucursalDependencia: e.target.value })}
            />
            <SelectInput
              label="Estatus"
              value={data.estatusVinculacion}
              onChange={(e) => update({ estatusVinculacion: e.target.value as HojaVidaData['estatusVinculacion'] })}
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </SelectInput>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <TextInput
              label="Tipo de vinculación"
              placeholder="Contrato laboral / Prestación"
              value={data.tipoVinculacion}
              onChange={(e) => update({ tipoVinculacion: e.target.value })}
            />
            <TextInput
              label="Cargo actual"
              required
              value={data.cargoActual}
              onChange={(e) => update({ cargoActual: e.target.value })}
            />
            <TextInput
              label="Jefe inmediato"
              value={data.jefeInmediato}
              onChange={(e) => update({ jefeInmediato: e.target.value })}
            />
          </div>

          <TextAreaInput
            label="Responsabilidades actuales"
            rows={3}
            value={data.responsabilidadesActuales}
            onChange={(e) => update({ responsabilidadesActuales: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <TextInput
              label="EPS"
              value={data.eps}
              onChange={(e) => update({ eps: e.target.value })}
            />
            <TextInput
              label="Fondo de pensiones"
              value={data.fondoPensiones}
              onChange={(e) => update({ fondoPensiones: e.target.value })}
            />
            <TextInput
              label="ARL"
              value={data.arl}
              onChange={(e) => update({ arl: e.target.value })}
            />
          </div>

          <TextInput
            label="Visas o permisos especiales (opcional)"
            value={data.visasInfo}
            onChange={(e) => update({ visasInfo: e.target.value })}
          />
        </FormSection>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <FormSection stepNumber={3} title="Información académica formal">
            <div className="space-y-3">
              {data.academicos.map((ac, idx) => (
                <div key={ac.id} className="p-3 bg-[#FAF9FC] border border-[#E4E2EC] rounded-md space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#2F2B3D]">Estudio {idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => update({ academicos: data.academicos.filter((x) => x.id !== ac.id) })}
                      className="text-xs text-[#DC2626] hover:underline inline-flex items-center gap-1"
                    >
                      <Trash2 size={12} />
                      <span>Eliminar</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <SelectInput
                      label="Nivel educativo"
                      value={ac.nivel}
                      onChange={(e) =>
                        update({
                          academicos: data.academicos.map((x) => (x.id === ac.id ? { ...x, nivel: e.target.value } : x)),
                        })
                      }
                    >
                      <option value="Bachiller">Bachiller</option>
                      <option value="Técnico">Técnico</option>
                      <option value="Tecnólogo">Tecnólogo</option>
                      <option value="Profesional">Profesional</option>
                      <option value="Especialización">Especialización</option>
                      <option value="Maestría">Maestría</option>
                      <option value="Doctorado">Doctorado</option>
                    </SelectInput>
                    <TextInput
                      label="Título obtenido"
                      value={ac.tituloObtenido}
                      onChange={(e) =>
                        update({
                          academicos: data.academicos.map((x) =>
                            x.id === ac.id ? { ...x, tituloObtenido: e.target.value } : x
                          ),
                        })
                      }
                    />
                    <TextInput
                      label="Institución educativa"
                      value={ac.institucion}
                      onChange={(e) =>
                        update({
                          academicos: data.academicos.map((x) =>
                            x.id === ac.id ? { ...x, institucion: e.target.value } : x
                          ),
                        })
                      }
                    />
                    <TextInput
                      label="Ciudad y país"
                      value={ac.ciudadPais}
                      onChange={(e) =>
                        update({
                          academicos: data.academicos.map((x) =>
                            x.id === ac.id ? { ...x, ciudadPais: e.target.value } : x
                          ),
                        })
                      }
                    />
                    <TextInput
                      label="Fecha de inicio"
                      placeholder="Ej. 2018-02"
                      value={ac.fechaInicio}
                      onChange={(e) =>
                        update({
                          academicos: data.academicos.map((x) =>
                            x.id === ac.id ? { ...x, fechaInicio: e.target.value } : x
                          ),
                        })
                      }
                    />
                    <TextInput
                      label="Fecha de finalización"
                      placeholder="Ej. 2022-11"
                      value={ac.fechaFinalizacion}
                      onChange={(e) =>
                        update({
                          academicos: data.academicos.map((x) =>
                            x.id === ac.id ? { ...x, fechaFinalizacion: e.target.value } : x
                          ),
                        })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addAcademico}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#5B2E7A] border border-[#5B2E7A]/30 rounded-md hover:bg-[#5B2E7A]/[0.05]"
            >
              <Plus size={14} />
              <span>Agregar estudio académico</span>
            </button>
          </FormSection>

          <FormSection title="Formación complementaria e idiomas">
            <div className="space-y-2.5">
              {data.formacionComplementaria.map((fc, idx) => (
                <div key={fc.id} className="p-3 bg-[#FAF9FC] border border-[#E4E2EC] rounded-md space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">Registro {idx + 1}</span>
                    <button
                      type="button"
                      onClick={() =>
                        update({
                          formacionComplementaria: data.formacionComplementaria.filter((x) => x.id !== fc.id),
                        })
                      }
                      className="text-xs text-[#DC2626] hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <SelectInput
                      label="Tipo"
                      value={fc.tipo}
                      onChange={(e) =>
                        update({
                          formacionComplementaria: data.formacionComplementaria.map((x) =>
                            x.id === fc.id ? { ...x, tipo: e.target.value as HojaVidaFormacion['tipo'] } : x
                          ),
                        })
                      }
                    >
                      <option value="Curso">Curso</option>
                      <option value="Seminario">Seminario</option>
                      <option value="Capacitación">Capacitación</option>
                      <option value="Certificación">Certificación</option>
                      <option value="Idioma">Idioma</option>
                    </SelectInput>
                    <TextInput
                      label="Nombre del programa o idioma"
                      value={fc.nombre}
                      onChange={(e) =>
                        update({
                          formacionComplementaria: data.formacionComplementaria.map((x) =>
                            x.id === fc.id ? { ...x, nombre: e.target.value } : x
                          ),
                        })
                      }
                    />
                    <TextInput
                      label="Institución"
                      value={fc.institucion}
                      onChange={(e) =>
                        update({
                          formacionComplementaria: data.formacionComplementaria.map((x) =>
                            x.id === fc.id ? { ...x, institucion: e.target.value } : x
                          ),
                        })
                      }
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <TextInput
                        label="Duración / Nivel"
                        placeholder="40h / B2"
                        value={fc.duracionNivel}
                        onChange={(e) =>
                          update({
                            formacionComplementaria: data.formacionComplementaria.map((x) =>
                              x.id === fc.id ? { ...x, duracionNivel: e.target.value } : x
                            ),
                          })
                        }
                      />
                      <TextInput
                        label="Fecha"
                        value={fc.fecha}
                        onChange={(e) =>
                          update({
                            formacionComplementaria: data.formacionComplementaria.map((x) =>
                              x.id === fc.id ? { ...x, fecha: e.target.value } : x
                            ),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addFormacion}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#5B2E7A] border border-[#5B2E7A]/30 rounded-md hover:bg-[#5B2E7A]/[0.05]"
            >
              <Plus size={14} />
              <span>Agregar capacitación o idioma</span>
            </button>
          </FormSection>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <FormSection stepNumber={4} title="Experiencia laboral cronológica">
            <div className="space-y-3">
              {data.experiencias.map((ex, idx) => (
                <div key={ex.id} className="p-3 bg-[#FAF9FC] border border-[#E4E2EC] rounded-md space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#2F2B3D]">Experiencia {idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => update({ experiencias: data.experiencias.filter((x) => x.id !== ex.id) })}
                      className="text-xs text-[#DC2626] hover:underline inline-flex items-center gap-1"
                    >
                      <Trash2 size={12} />
                      <span>Eliminar</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <TextInput
                      label="Empresa u organización"
                      value={ex.empresa}
                      onChange={(e) =>
                        update({
                          experiencias: data.experiencias.map((x) =>
                            x.id === ex.id ? { ...x, empresa: e.target.value } : x
                          ),
                        })
                      }
                    />
                    <TextInput
                      label="Cargo desempeñado"
                      value={ex.cargo}
                      onChange={(e) =>
                        update({
                          experiencias: data.experiencias.map((x) =>
                            x.id === ex.id ? { ...x, cargo: e.target.value } : x
                          ),
                        })
                      }
                    />
                    <TextInput
                      label="Fecha de ingreso"
                      placeholder="AAAA-MM-DD"
                      value={ex.fechaIngreso}
                      onChange={(e) =>
                        update({
                          experiencias: data.experiencias.map((x) =>
                            x.id === ex.id ? { ...x, fechaIngreso: e.target.value } : x
                          ),
                        })
                      }
                    />
                    <TextInput
                      label="Fecha de retiro"
                      placeholder="AAAA-MM-DD o Actual"
                      value={ex.fechaRetiro}
                      onChange={(e) =>
                        update({
                          experiencias: data.experiencias.map((x) =>
                            x.id === ex.id ? { ...x, fechaRetiro: e.target.value } : x
                          ),
                        })
                      }
                    />
                  </div>
                  <TextAreaInput
                    label="Funciones y logros principales"
                    rows={2}
                    value={ex.funciones}
                    onChange={(e) =>
                      update({
                        experiencias: data.experiencias.map((x) =>
                          x.id === ex.id ? { ...x, funciones: e.target.value } : x
                        ),
                      })
                    }
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addExperiencia}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#5B2E7A] border border-[#5B2E7A]/30 rounded-md hover:bg-[#5B2E7A]/[0.05]"
            >
              <Plus size={14} />
              <span>Agregar experiencia laboral</span>
            </button>
          </FormSection>

          <FormSection title="Investigaciones, publicaciones o distinciones (opcional)">
            <div className="space-y-2">
              {data.investigacionesDistinciones.map((di, idx) => (
                <div key={di.id} className="p-3 bg-[#FAF9FC] border border-[#E4E2EC] rounded-md space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">Distinción {idx + 1}</span>
                    <button
                      type="button"
                      onClick={() =>
                        update({
                          investigacionesDistinciones: data.investigacionesDistinciones.filter((x) => x.id !== di.id),
                        })
                      }
                      className="text-xs text-[#DC2626] hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <TextInput
                      label="Título / Reconocimiento"
                      value={di.titulo}
                      onChange={(e) =>
                        update({
                          investigacionesDistinciones: data.investigacionesDistinciones.map((x) =>
                            x.id === di.id ? { ...x, titulo: e.target.value } : x
                          ),
                        })
                      }
                    />
                    <TextInput
                      label="Entidad"
                      value={di.entidad}
                      onChange={(e) =>
                        update({
                          investigacionesDistinciones: data.investigacionesDistinciones.map((x) =>
                            x.id === di.id ? { ...x, entidad: e.target.value } : x
                          ),
                        })
                      }
                    />
                    <TextInput
                      label="Fecha"
                      value={di.fecha}
                      onChange={(e) =>
                        update({
                          investigacionesDistinciones: data.investigacionesDistinciones.map((x) =>
                            x.id === di.id ? { ...x, fecha: e.target.value } : x
                          ),
                        })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addDistincion}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#5B2E7A] border border-[#5B2E7A]/30 rounded-md hover:bg-[#5B2E7A]/[0.05]"
            >
              <Plus size={14} />
              <span>Agregar publicación o distinción</span>
            </button>
          </FormSection>
        </div>
      )}
    </div>
  );
};
