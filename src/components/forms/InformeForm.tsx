import React, { useState } from 'react';
import { Plus, Sparkles, Trash2 } from 'lucide-react';
import { InformeCapitulo, InformeData, InformeGrafico, InformeTabla } from '../../types/documents';
import { FormSection, SelectInput, TextAreaInput, TextInput } from '../FormPrimitives';

interface InformeFormProps {
  data: InformeData;
  onChange: (next: InformeData) => void;
  onOpenAi: (targetKey: string, currentText: string) => void;
}

const STEPS = [
  { id: 1, label: 'Modalidad y Datos' },
  { id: 2, label: 'Cuerpo y Capítulos' },
  { id: 3, label: 'Tablas y Gráficos' },
  { id: 4, label: 'Cierre y Firmas' },
];

export const InformeForm: React.FC<InformeFormProps> = ({ data, onChange, onOpenAi }) => {
  const [step, setStep] = useState<number>(1);
  const update = (patch: Partial<InformeData>) => onChange({ ...data, ...patch });

  const addCapitulo = () => {
    const num = String(data.capitulos.length + 1);
    const next: InformeCapitulo = {
      id: `cap_${Date.now()}`,
      numero: num,
      titulo: `CAPÍTULO ${num}`,
      contenido: '',
    };
    update({ capitulos: [...data.capitulos, next] });
  };

  const addTabla = () => {
    const next: InformeTabla = {
      id: `tbl_${Date.now()}`,
      titulo: `Tabla ${data.tablas.length + 1}. Datos consolidados`,
      columnas: ['Concepto', 'Valor', 'Observación'],
      filas: [['', '', '']],
    };
    update({ tablas: [...data.tablas, next] });
  };

  const addGrafico = () => {
    const next: InformeGrafico = {
      id: `graf_${Date.now()}`,
      titulo: `Figura ${data.graficos.length + 1}. Indicador operativo`,
      unidad: 'unidades',
      datos: [
        { etiqueta: 'Periodo 1', valor: 0 },
        { etiqueta: 'Periodo 2', valor: 0 },
      ],
    };
    update({ graficos: [...data.graficos, next] });
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
        <FormSection stepNumber={1} title="Modalidad e información general" description="Capítulo 9 GTC 185: selecciona el tipo de informe antes de diligenciar su estructura.">
          <SelectInput
            label="Clase de informe"
            value={data.clase}
            onChange={(e) => update({ clase: e.target.value as InformeData['clase'] })}
          >
            <option value="corto">Informe corto (1 a 10 páginas, sin portada)</option>
            <option value="extenso">Informe extenso (11+ páginas, con portada y contenido)</option>
            <option value="ejecutivo">Resumen ejecutivo (1 a 3 páginas)</option>
          </SelectInput>

          <TextInput
            label="Título del informe"
            required
            value={data.titulo}
            onChange={(e) => update({ titulo: e.target.value })}
          />
          {data.clase === 'extenso' && (
            <TextInput
              label="Subtítulo (opcional)"
              value={data.subtitulo}
              onChange={(e) => update({ subtitulo: e.target.value })}
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <TextInput
              label="Código"
              value={data.codigo}
              onChange={(e) => update({ codigo: e.target.value })}
            />
            <TextInput
              label="Dependencia"
              value={data.dependencia}
              onChange={(e) => update({ dependencia: e.target.value })}
            />
            <TextInput
              label="Ciudad y fecha"
              required
              value={data.ciudadFecha}
              onChange={(e) => update({ ciudadFecha: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextInput
              label="Elaborado por / Responsable(s)"
              required
              value={data.responsables}
              onChange={(e) => update({ responsables: e.target.value })}
            />
            <TextInput
              label="Destinatario"
              value={data.destinatario}
              onChange={(e) => update({ destinatario: e.target.value })}
            />
          </div>

          <TextAreaInput
            label="Objetivo(s) del informe"
            rows={2}
            value={data.objetivos}
            onChange={(e) => update({ objetivos: e.target.value })}
          />
        </FormSection>
      )}

      {step === 2 && (
        <div className="space-y-4">
          {(data.clase === 'extenso' || data.clase === 'corto') && (
            <FormSection stepNumber={2} title="Introducción y metodología">
              <TextAreaInput
                label="Introducción"
                rows={3}
                value={data.introduccion}
                onChange={(e) => update({ introduccion: e.target.value })}
              />
              {data.clase === 'extenso' && (
                <TextAreaInput
                  label="Metodología"
                  rows={3}
                  value={data.metodologia}
                  onChange={(e) => update({ metodologia: e.target.value })}
                />
              )}
            </FormSection>
          )}

          <FormSection title="Capítulos / Numerales de desarrollo" description="Redacta de forma impersonal; la IA ayuda a organizar sin inventar cifras ni hechos.">
            <div className="space-y-3">
              {data.capitulos.map((cap) => (
                <div key={cap.id} className="p-3 bg-[#FAF9FC] border border-[#E4E2EC] rounded-md space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex gap-2 flex-1">
                      <input
                        type="text"
                        value={cap.numero}
                        onChange={(e) =>
                          update({ capitulos: data.capitulos.map((c) => (c.id === cap.id ? { ...c, numero: e.target.value } : c)) })
                        }
                        className="w-16 px-2 py-1 text-xs font-mono-code border border-[#DCD8E6] rounded"
                      />
                      <input
                        type="text"
                        value={cap.titulo}
                        onChange={(e) =>
                          update({ capitulos: data.capitulos.map((c) => (c.id === cap.id ? { ...c, titulo: e.target.value } : c)) })
                        }
                        className="flex-1 px-2.5 py-1 text-xs font-semibold border border-[#DCD8E6] rounded"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => update({ capitulos: data.capitulos.filter((c) => c.id !== cap.id) })}
                      className="text-xs text-[#DC2626] hover:underline"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <TextAreaInput
                    label="Contenido del numeral"
                    rows={4}
                    value={cap.contenido}
                    onChange={(e) =>
                      update({ capitulos: data.capitulos.map((c) => (c.id === cap.id ? { ...c, contenido: e.target.value } : c)) })
                    }
                    rightAction={
                      <button
                        type="button"
                        onClick={() => onOpenAi(`cap:${cap.id}`, cap.contenido)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#5B2E7A] hover:underline"
                      >
                        <Sparkles size={12} />
                        <span>Asistente IA</span>
                      </button>
                    }
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addCapitulo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#5B2E7A] border border-[#5B2E7A]/30 rounded-md"
            >
              <Plus size={14} />
              <span>Agregar capítulo o numeral</span>
            </button>
          </FormSection>

          {data.clase === 'extenso' && (
            <FormSection title="Resultados y análisis">
              <TextAreaInput
                label="Resultados"
                rows={3}
                value={data.resultados}
                onChange={(e) => update({ resultados: e.target.value })}
              />
              <TextAreaInput
                label="Análisis técnico"
                rows={3}
                value={data.analisis}
                onChange={(e) => update({ analisis: e.target.value })}
              />
            </FormSection>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <FormSection stepNumber={3} title="Tablas de datos numéricos">
            {data.tablas.map((tbl) => (
              <div key={tbl.id} className="p-3 bg-[#FAF9FC] border border-[#E4E2EC] rounded-md space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={tbl.titulo}
                    onChange={(e) =>
                      update({ tablas: data.tablas.map((t) => (t.id === tbl.id ? { ...t, titulo: e.target.value } : t)) })
                    }
                    className="flex-1 px-2.5 py-1 text-xs font-semibold border border-[#DCD8E6] rounded"
                  />
                  <button
                    type="button"
                    onClick={() => update({ tablas: data.tablas.filter((t) => t.id !== tbl.id) })}
                    className="text-xs text-[#DC2626]"
                  >
                    Eliminar tabla
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr>
                        {tbl.columnas.map((col, cIdx) => (
                          <th key={cIdx} className="p-1">
                            <input
                              type="text"
                              value={col}
                              onChange={(e) => {
                                const cols = [...tbl.columnas];
                                cols[cIdx] = e.target.value;
                                update({ tablas: data.tablas.map((t) => (t.id === tbl.id ? { ...t, columnas: cols } : t)) });
                              }}
                              className="w-full px-2 py-1 font-semibold bg-white border border-[#DCD8E6] rounded"
                            />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tbl.filas.map((row, rIdx) => (
                        <tr key={rIdx}>
                          {tbl.columnas.map((_, cIdx) => (
                            <td key={cIdx} className="p-1">
                              <input
                                type="text"
                                value={row[cIdx] || ''}
                                onChange={(e) => {
                                  const filas = tbl.filas.map((r, ri) =>
                                    ri === rIdx ? r.map((cell, ci) => (ci === cIdx ? e.target.value : cell)) : r
                                  );
                                  update({ tablas: data.tablas.map((t) => (t.id === tbl.id ? { ...t, filas } : t)) });
                                }}
                                className="w-full px-2 py-1 bg-white border border-[#DCD8E6] rounded"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      update({
                        tablas: data.tablas.map((t) =>
                          t.id === tbl.id ? { ...t, filas: [...t.filas, t.columnas.map(() => '')] } : t
                        ),
                      })
                    }
                    className="text-xs text-[#5B2E7A] hover:underline"
                  >
                    + Agregar fila
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      update({
                        tablas: data.tablas.map((t) =>
                          t.id === tbl.id
                            ? {
                                ...t,
                                columnas: [...t.columnas, `Columna ${t.columnas.length + 1}`],
                                filas: t.filas.map((r) => [...r, '']),
                              }
                            : t
                        ),
                      })
                    }
                    className="text-xs text-[#5B2E7A] hover:underline"
                  >
                    + Agregar columna
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addTabla}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#5B2E7A] border border-[#5B2E7A]/30 rounded-md"
            >
              <Plus size={14} />
              <span>Agregar tabla</span>
            </button>
          </FormSection>

          <FormSection title="Gráficos comparativos con datos reales">
            {data.graficos.map((g) => (
              <div key={g.id} className="p-3 bg-[#FAF9FC] border border-[#E4E2EC] rounded-md space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={g.titulo}
                    onChange={(e) =>
                      update({ graficos: data.graficos.map((gr) => (gr.id === g.id ? { ...gr, titulo: e.target.value } : gr)) })
                    }
                    className="flex-1 px-2.5 py-1 text-xs font-semibold border border-[#DCD8E6] rounded"
                  />
                  <input
                    type="text"
                    placeholder="Unidad"
                    value={g.unidad}
                    onChange={(e) =>
                      update({ graficos: data.graficos.map((gr) => (gr.id === g.id ? { ...gr, unidad: e.target.value } : gr)) })
                    }
                    className="w-28 px-2 py-1 text-xs border border-[#DCD8E6] rounded"
                  />
                  <button
                    type="button"
                    onClick={() => update({ graficos: data.graficos.filter((gr) => gr.id !== g.id) })}
                    className="text-xs text-[#DC2626]"
                  >
                    Eliminar
                  </button>
                </div>
                <div className="space-y-1.5">
                  {g.datos.map((d, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={d.etiqueta}
                        onChange={(e) => {
                          const datos = g.datos.map((x, i) => (i === idx ? { ...x, etiqueta: e.target.value } : x));
                          update({ graficos: data.graficos.map((gr) => (gr.id === g.id ? { ...gr, datos } : gr)) });
                        }}
                        className="flex-1 px-2 py-1 text-xs bg-white border border-[#DCD8E6] rounded"
                      />
                      <input
                        type="number"
                        value={d.valor}
                        onChange={(e) => {
                          const datos = g.datos.map((x, i) => (i === idx ? { ...x, valor: Number(e.target.value) || 0 } : x));
                          update({ graficos: data.graficos.map((gr) => (gr.id === g.id ? { ...gr, datos } : gr)) });
                        }}
                        className="w-28 px-2 py-1 text-xs bg-white border border-[#DCD8E6] rounded tabular-nums"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const datos = [...g.datos, { etiqueta: `Ítem ${g.datos.length + 1}`, valor: 0 }];
                      update({ graficos: data.graficos.map((gr) => (gr.id === g.id ? { ...gr, datos } : gr)) });
                    }}
                    className="text-xs text-[#5B2E7A] hover:underline"
                  >
                    + Agregar barra / serie
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addGrafico}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#5B2E7A] border border-[#5B2E7A]/30 rounded-md"
            >
              <Plus size={14} />
              <span>Agregar gráfico de barras</span>
            </button>
          </FormSection>
        </div>
      )}

      {step === 4 && (
        <FormSection stepNumber={4} title="Conclusiones, recomendaciones, bibliografía y firmas">
          <TextAreaInput
            label="Conclusiones"
            rows={3}
            value={data.conclusiones}
            onChange={(e) => update({ conclusiones: e.target.value })}
            rightAction={
              <button
                type="button"
                onClick={() => onOpenAi('conclusiones', data.conclusiones)}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#5B2E7A] hover:underline"
              >
                <Sparkles size={12} />
                <span>Mejorar con IA</span>
              </button>
            }
          />
          <TextAreaInput
            label="Recomendaciones"
            rows={3}
            value={data.recomendaciones}
            onChange={(e) => update({ recomendaciones: e.target.value })}
          />
          {data.clase === 'extenso' && (
            <TextAreaInput
              label="Bibliografía / Referencias"
              rows={2}
              value={data.bibliografia}
              onChange={(e) => update({ bibliografia: e.target.value })}
            />
          )}
          <div className="space-y-2 pt-2 border-t border-[#F0EEF5]">
            <div className="text-xs font-semibold text-[#2F2B3D]">Autores / Firmantes</div>
            {data.firmantes.map((f) => (
              <div key={f.id} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <TextInput
                  label="Nombre completo"
                  value={f.nombre}
                  onChange={(e) =>
                    update({ firmantes: data.firmantes.map((x) => (x.id === f.id ? { ...x, nombre: e.target.value } : x)) })
                  }
                />
                <TextInput
                  label="Cargo"
                  value={f.cargo}
                  onChange={(e) =>
                    update({ firmantes: data.firmantes.map((x) => (x.id === f.id ? { ...x, cargo: e.target.value } : x)) })
                  }
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
      )}
    </div>
  );
};
