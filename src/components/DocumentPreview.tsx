import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Mail, Paperclip, ZoomIn, ZoomOut } from 'lucide-react';
import {
  ActaData,
  AnyDocumentData,
  CartaData,
  CertificadoConstanciaData,
  CircularData,
  CorporateConfig,
  DocumentFormatConfig,
  DocumentModuleId,
  HojaVidaData,
  InformeData,
  MemorandoData,
  MensajeElectronicoData,
  SobreData,
  TarjetaProtocolariaData,
} from '../types/documents';

const PX_PER_CM = 37.7952755906;

interface DocumentPreviewProps {
  moduleId: DocumentModuleId;
  data: AnyDocumentData;
  format: DocumentFormatConfig;
  corp: CorporateConfig;
  previewContainerRef: React.RefObject<HTMLDivElement | null>;
}

interface PageDimensions {
  widthCm: number;
  heightCm: number;
}

function getPageSizeCm(
  moduleId: DocumentModuleId,
  format: DocumentFormatConfig,
  data: AnyDocumentData
): PageDimensions {
  if (moduleId === 'sobre') {
    const s = data as SobreData;
    return { widthCm: s.anchoCm || 24.1, heightCm: s.altoCm || 10.5 };
  }
  if (moduleId === 'tarjeta') {
    const t = data as TarjetaProtocolariaData;
    return { widthCm: t.anchoCm || 15, heightCm: t.altoCm || 10 };
  }
  if (format.pageSize === 'oficio') return { widthCm: 21.59, heightCm: 33.0 };
  if (format.pageSize === 'a4') return { widthCm: 21.0, heightCm: 29.7 };
  return { widthCm: 21.59, heightCm: 27.94 };
}

interface FlowBlock {
  key: string;
  estimatedLines: number;
  keepWithNext?: boolean;
  isPageBreak?: boolean;
  render: () => React.ReactNode;
}

function estimateLines(text: string, charsPerLine = 78): number {
  if (!text) return 0;
  return text
    .split('\n')
    .reduce((acc, line) => acc + Math.max(1, Math.ceil(line.trim().length / charsPerLine)), 0);
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  moduleId,
  data,
  format,
  corp,
  previewContainerRef,
}) => {
  const [zoom, setZoom] = useState<number>(0.78);
  const [activePageIdx, setActivePageIdx] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'all' | 'single'>('all');

  const dims = getPageSizeCm(moduleId, format, data);
  const widthPx = dims.widthCm * PX_PER_CM;
  const heightPx = dims.heightCm * PX_PER_CM;

  const accentColor =
    format.visualStyle === 'institucional'
      ? '#5B2E7A'
      : format.visualStyle === 'moderno'
        ? '#334155'
        : '#111827';

  const isBloqueOrSemi =
    format.distributionStyle === 'bloque' || format.distributionStyle === 'semibloque';
  const isSemi = format.distributionStyle === 'semibloque';

  const fontStack =
    format.fontFamily === 'Times New Roman'
      ? '"Times New Roman", Times, serif'
      : format.fontFamily === 'Calibri'
        ? 'Calibri, "Carlito", sans-serif'
        : format.fontFamily === 'Verdana'
          ? 'Verdana, Geneva, sans-serif'
          : 'Arial, Helvetica, sans-serif';

  // Estimate lines that fit per page cleanly
  const usableHeightCm =
    dims.heightCm -
    format.margins.topCm -
    format.margins.bottomCm -
    (format.showZona1 ? 2.1 : 0.4) -
    (format.showZona2 ? 1.1 : 0.2);
  const lineHeightCm = (format.fontSizePt * 1.42 * 2.54) / 72;
  const maxLinesPerPage = Math.max(16, Math.floor(usableHeightCm / lineHeightCm));

  const pages = useMemo<FlowBlock[][]>(() => {
    if (moduleId === 'sobre' || moduleId === 'tarjeta' || moduleId === 'correo') {
      return [[{ key: 'special-single', estimatedLines: 1, render: () => null }]];
    }

    const blocks: FlowBlock[] = [];
    const basePt = format.fontSizePt;
    const smallPt = Math.max(9, basePt - 2);

    const pushParagraphs = (prefix: string, rawText: string, indentSemi = false) => {
      const paras = rawText.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
      paras.forEach((p, idx) => {
        const clean = p.replace(/\n/g, ' ').trim();
        blocks.push({
          key: `${prefix}-p-${idx}`,
          estimatedLines: estimateLines(clean) + 0.8,
          render: () => (
            <p
              style={{
                marginBottom: '0.85em',
                textIndent: indentSemi ? '2.2em' : undefined,
                textAlign: 'justify',
                lineHeight: 1.38,
              }}
            >
              {clean}
            </p>
          ),
        });
      });
    };

    const pushSpecialLines = (opts: {
      anexos?: string;
      copias?: string;
      redactor?: string;
      transcriptor?: string;
    }) => {
      const hasAny =
        opts.anexos?.trim() || opts.copias?.trim() || opts.redactor?.trim() || opts.transcriptor?.trim();
      if (!hasAny) return;
      blocks.push({
        key: 'special-lines',
        estimatedLines: 4,
        render: () => (
          <div style={{ marginTop: '1.4em', fontSize: `${smallPt}pt`, lineHeight: 1.35, color: '#1F2937' }}>
            {opts.anexos?.trim() && <div>Anexos: {opts.anexos.trim()}</div>}
            {opts.copias?.trim() && <div>Copia: {opts.copias.trim()}</div>}
            {(opts.redactor?.trim() || opts.transcriptor?.trim()) && (
              <div style={{ marginTop: '0.7em' }}>
                {opts.redactor?.trim() && <div>Redactor: {opts.redactor.trim()}</div>}
                {opts.transcriptor?.trim() && <div>Transcriptor: {opts.transcriptor.trim()}</div>}
              </div>
            )}
          </div>
        ),
      });
    };

    if (moduleId === 'carta') {
      const d = data as CartaData;
      blocks.push({
        key: 'carta-top',
        estimatedLines: d.codigo.trim() ? 3.5 : 2.5,
        render: () => (
          <div style={{ marginLeft: isBloqueOrSemi ? '50%' : '0', marginBottom: '1.5em' }}>
            {d.codigo.trim() && <div style={{ marginBottom: '0.6em' }}>{d.codigo.trim()}</div>}
            <div>{d.ciudadFecha}</div>
          </div>
        ),
      });

      blocks.push({
        key: 'carta-dest',
        estimatedLines: 7,
        render: () => (
          <div style={{ marginBottom: '1.4em', lineHeight: 1.32 }}>
            {d.destinatarioTratamiento && <div>{d.destinatarioTratamiento}</div>}
            {d.destinatarioNombre && <div>{d.destinatarioNombre.toUpperCase()}</div>}
            {d.destinatarioCargo && <div>{d.destinatarioCargo}</div>}
            {d.destinatarioOrganizacion && <div>{d.destinatarioOrganizacion}</div>}
            {d.destinatarioDireccion && <div>{d.destinatarioDireccion}</div>}
            {d.destinatarioCiudadDepto && (
              <div>{d.sobreVentanilla ? d.destinatarioCiudadDepto.toUpperCase() : d.destinatarioCiudadDepto}</div>
            )}
            {d.destinatarioPais && (
              <div>{d.sobreVentanilla ? d.destinatarioPais.toUpperCase() : d.destinatarioPais}</div>
            )}
          </div>
        ),
      });

      if (d.asunto.trim()) {
        blocks.push({
          key: 'carta-asunto',
          estimatedLines: 2,
          render: () => <div style={{ marginBottom: '1.1em' }}>Asunto: {d.asunto}</div>,
        });
      }
      if (d.saludo.trim()) {
        blocks.push({
          key: 'carta-saludo',
          estimatedLines: 2,
          render: () => <div style={{ marginBottom: '1.0em' }}>{d.saludo}</div>,
        });
      }
      pushParagraphs('carta-body', d.cuerpo, isSemi);
      if (d.despedida.trim()) {
        blocks.push({
          key: 'carta-desp',
          estimatedLines: 2,
          keepWithNext: true,
          render: () => <div style={{ marginTop: '0.9em', marginBottom: '2.6em' }}>{d.despedida}</div>,
        });
      }
      blocks.push({
        key: 'carta-firma',
        estimatedLines: 4,
        render: () => (
          <div style={{ marginLeft: isBloqueOrSemi ? '50%' : '0', lineHeight: 1.3 }}>
            {d.incluirLineaFirma && (
              <div style={{ width: '210px', borderTop: '1px solid #374151', marginBottom: '4px' }} />
            )}
            <div>{d.remitenteNombre.toUpperCase()}</div>
            <div>{d.remitenteCargo}</div>
          </div>
        ),
      });
      pushSpecialLines({
        anexos: d.anexos,
        copias: d.copias,
        redactor: d.redactor,
        transcriptor: d.transcriptor,
      });
    } else if (moduleId === 'memorando') {
      const d = data as MemorandoData;
      blocks.push({
        key: 'mem-title',
        estimatedLines: 2.5,
        render: () => (
          <div
            style={{
              textAlign: 'center',
              fontWeight: 700,
              color: accentColor,
              letterSpacing: '0.04em',
              marginBottom: '1.1em',
            }}
          >
            MEMORANDO
          </div>
        ),
      });
      blocks.push({
        key: 'mem-top',
        estimatedLines: 3.5,
        render: () => (
          <div style={{ marginLeft: isBloqueOrSemi ? '50%' : '0', marginBottom: '1.4em' }}>
            {d.codigo.trim() && <div style={{ marginBottom: '0.5em' }}>{d.codigo.trim()}</div>}
            <div>{d.ciudadFecha}</div>
          </div>
        ),
      });

      const paraVal =
        d.opcionEncabezamiento === 'tercera'
          ? d.paraCargo
          : `${d.paraTratamiento ? d.paraTratamiento + ' ' : ''}${d.paraNombre}, ${d.paraCargo}`;
      const deVal =
        d.opcionEncabezamiento === 'primera' ? `${d.deNombre}, ${d.deCargo}` : d.deCargo;

      blocks.push({
        key: 'mem-header-fields',
        estimatedLines: 6,
        render: () => (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.4em' }}>
            <tbody>
              <tr>
                <td style={{ width: '105px', verticalAlign: 'top', paddingBottom: '6px' }}>PARA:</td>
                <td style={{ verticalAlign: 'top', paddingBottom: '6px' }}>{paraVal}</td>
              </tr>
              <tr>
                <td style={{ width: '105px', verticalAlign: 'top', paddingBottom: '6px' }}>DE:</td>
                <td style={{ verticalAlign: 'top', paddingBottom: '6px' }}>{deVal}</td>
              </tr>
              <tr>
                <td style={{ width: '105px', verticalAlign: 'top' }}>ASUNTO:</td>
                <td style={{ verticalAlign: 'top' }}>{d.asunto}</td>
              </tr>
            </tbody>
          </table>
        ),
      });

      pushParagraphs('mem-body', d.cuerpo, false);
      if (d.despedida.trim()) {
        blocks.push({
          key: 'mem-desp',
          estimatedLines: 2,
          keepWithNext: true,
          render: () => <div style={{ marginTop: '0.9em', marginBottom: '2.6em' }}>{d.despedida}</div>,
        });
      }
      blocks.push({
        key: 'mem-firma',
        estimatedLines: 3.5,
        render: () => (
          <div style={{ marginLeft: isBloqueOrSemi ? '50%' : '0', lineHeight: 1.3 }}>
            <div style={{ width: '210px', borderTop: '1px solid #374151', marginBottom: '4px' }} />
            <div>{d.opcionEncabezamiento === 'primera' ? 'Firma' : d.deNombre.toUpperCase()}</div>
          </div>
        ),
      });
      pushSpecialLines({
        anexos: d.anexos,
        copias: d.copias,
        redactor: d.redactor,
        transcriptor: d.transcriptor,
      });
    } else if (moduleId === 'circular') {
      const d = data as CircularData;
      blocks.push({
        key: 'cir-title',
        estimatedLines: 2.5,
        render: () => (
          <div style={{ textAlign: 'center', fontWeight: 700, color: accentColor, marginBottom: '1.1em' }}>
            {d.consecutivo || 'CIRCULAR'}
          </div>
        ),
      });
      blocks.push({
        key: 'cir-top',
        estimatedLines: 3.5,
        render: () => (
          <div style={{ marginLeft: isBloqueOrSemi ? '50%' : '0', marginBottom: '1.4em' }}>
            {d.codigo.trim() && <div style={{ marginBottom: '0.5em' }}>{d.codigo.trim()}</div>}
            <div>{d.ciudadFecha}</div>
          </div>
        ),
      });
      blocks.push({
        key: 'cir-dest',
        estimatedLines: d.modalidad === 'circular_general' ? 3.5 : 5.5,
        render: () => (
          <div style={{ marginBottom: '1.2em' }}>
            {d.modalidad === 'circular_general' ? (
              <div style={{ marginBottom: '0.9em' }}>PARA {d.grupoDestinatario.toUpperCase()}</div>
            ) : (
              <div style={{ marginBottom: '0.9em', lineHeight: 1.3 }}>
                {d.cartaDestinatarioTratamiento && <div>{d.cartaDestinatarioTratamiento}</div>}
                {d.cartaDestinatarioNombre && <div>{d.cartaDestinatarioNombre.toUpperCase()}</div>}
                {d.cartaDestinatarioCargo && <div>{d.cartaDestinatarioCargo}</div>}
                {d.cartaDestinatarioOrg && <div>{d.cartaDestinatarioOrg}</div>}
              </div>
            )}
            <div>ASUNTO: {d.asunto}</div>
          </div>
        ),
      });
      pushParagraphs('cir-body', d.cuerpo, false);
      if (d.despedida.trim()) {
        blocks.push({
          key: 'cir-desp',
          estimatedLines: 2,
          keepWithNext: true,
          render: () => <div style={{ marginTop: '0.9em', marginBottom: '2.5em' }}>{d.despedida}</div>,
        });
      }
      blocks.push({
        key: 'cir-firma',
        estimatedLines: 4,
        render: () => (
          <div style={{ marginLeft: isBloqueOrSemi ? '50%' : '0', lineHeight: 1.3 }}>
            <div style={{ width: '210px', borderTop: '1px solid #374151', marginBottom: '4px' }} />
            <div>{d.responsableNombre.toUpperCase()}</div>
            <div>{d.responsableCargo}</div>
          </div>
        ),
      });
      pushSpecialLines({ anexos: d.anexos, copias: d.copias, transcriptor: d.transcriptor });
    } else if (moduleId === 'acta') {
      const d = data as ActaData;
      const asistentes = d.participantes.filter((p) => p.condicion === 'Asistente');
      const invitados = d.participantes.filter((p) => p.condicion === 'Invitado');
      const ausentes = d.participantes.filter((p) => p.condicion.startsWith('Ausente'));

      blocks.push({
        key: 'acta-title',
        estimatedLines: 4,
        render: () => (
          <div style={{ textAlign: 'center', marginBottom: '1.4em' }}>
            <div style={{ fontWeight: 700, color: accentColor }}>{d.tituloGrupo.toUpperCase()}</div>
            <div style={{ fontWeight: 700, marginTop: '0.4em' }}>
              {d.numeroActa.toUpperCase()} ({d.caracter.toUpperCase()})
            </div>
          </div>
        ),
      });

      blocks.push({
        key: 'acta-meta',
        estimatedLines: 6 + asistentes.length + invitados.length + ausentes.length,
        render: () => (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.3em', lineHeight: 1.35 }}>
            <tbody>
              <tr>
                <td style={{ width: '130px', verticalAlign: 'top', fontWeight: 700, paddingBottom: '5px' }}>FECHA:</td>
                <td style={{ paddingBottom: '5px' }}>{d.ciudadFecha}</td>
              </tr>
              <tr>
                <td style={{ verticalAlign: 'top', fontWeight: 700, paddingBottom: '5px' }}>HORA:</td>
                <td style={{ paddingBottom: '5px' }}>
                  De las {d.horaInicio} horas a las {d.horaFin} horas
                </td>
              </tr>
              <tr>
                <td style={{ verticalAlign: 'top', fontWeight: 700, paddingBottom: '5px' }}>LUGAR:</td>
                <td style={{ paddingBottom: '5px' }}>{d.lugar}</td>
              </tr>
              <tr>
                <td style={{ verticalAlign: 'top', fontWeight: 700, paddingBottom: '5px' }}>ASISTENTES:</td>
                <td style={{ paddingBottom: '5px' }}>
                  {asistentes.map((a, idx) => (
                    <div key={a.id || idx}>
                      {a.nombre}, {a.cargo}
                      {a.dependencia ? ` (${a.dependencia})` : ''}
                      {a.representacion ? ` — en representación de ${a.representacion}` : ''}
                    </div>
                  ))}
                </td>
              </tr>
              {invitados.length > 0 && (
                <tr>
                  <td style={{ verticalAlign: 'top', fontWeight: 700, paddingBottom: '5px' }}>INVITADOS:</td>
                  <td style={{ paddingBottom: '5px' }}>
                    {invitados.map((inv, idx) => (
                      <div key={inv.id || idx}>
                        {inv.nombre}, {inv.cargo}
                      </div>
                    ))}
                  </td>
                </tr>
              )}
              {ausentes.length > 0 && (
                <tr>
                  <td style={{ verticalAlign: 'top', fontWeight: 700, paddingBottom: '5px' }}>AUSENTES:</td>
                  <td style={{ paddingBottom: '5px' }}>
                    {ausentes.map((au, idx) => (
                      <div key={au.id || idx}>
                        {au.nombre}, {au.cargo} ({au.condicion.includes('con excusa') ? 'con excusa' : 'sin excusa'})
                      </div>
                    ))}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ),
      });

      blocks.push({
        key: 'acta-orden',
        estimatedLines: 2 + d.ordenDelDia.length * 1.2,
        render: () => (
          <div style={{ marginBottom: '1.3em' }}>
            <div style={{ fontWeight: 700, marginBottom: '0.5em' }}>ORDEN DEL DÍA:</div>
            {d.ordenDelDia.map((t, idx) => (
              <div key={idx} style={{ marginBottom: '0.25em' }}>
                {idx + 1}. {t}
              </div>
            ))}
          </div>
        ),
      });

      blocks.push({
        key: 'acta-des-hdr',
        estimatedLines: 1.8,
        keepWithNext: true,
        render: () => <div style={{ fontWeight: 700, marginBottom: '0.6em' }}>DESARROLLO:</div>,
      });

      d.desarrollo.forEach((p, idx) => {
        const lines =
          2 +
          estimateLines(p.descripcion) +
          estimateLines(p.intervenciones) +
          estimateLines(p.decisiones) +
          (p.votacionAFavor || p.votacionEnContra || p.votacionBlanco ? 1.5 : 0);
        blocks.push({
          key: `acta-punto-${p.id || idx}`,
          estimatedLines: lines,
          render: () => (
            <div style={{ marginBottom: '1.1em', lineHeight: 1.38 }}>
              <div style={{ fontWeight: 700, marginBottom: '0.35em' }}>
                {p.numero}. {p.tema}
              </div>
              {p.descripcion.trim() && <p style={{ marginBottom: '0.4em', textAlign: 'justify' }}>{p.descripcion}</p>}
              {p.intervenciones.trim() && (
                <p style={{ marginBottom: '0.35em' }}>
                  <strong>Intervenciones:</strong> {p.intervenciones}
                </p>
              )}
              {p.decisiones.trim() && (
                <p style={{ marginBottom: '0.35em' }}>
                  <strong>Decisiones:</strong> {p.decisiones}
                </p>
              )}
              {(p.votacionAFavor || p.votacionEnContra || p.votacionBlanco) && (
                <p style={{ fontSize: `${smallPt}pt`, color: '#374151' }}>
                  Votación — A favor: {p.votacionAFavor || '0'} | En contra: {p.votacionEnContra || '0'} | En blanco:{' '}
                  {p.votacionBlanco || '0'}.
                </p>
              )}
            </div>
          ),
        });
      });

      if (d.compromisos.length > 0) {
        blocks.push({
          key: 'acta-compromisos',
          estimatedLines: 4 + d.compromisos.length * 2.2,
          render: () => (
            <div style={{ marginTop: '0.8em', marginBottom: '1.3em' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.5em' }}>COMPROMISOS:</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: `${Math.max(9, basePt - 1)}pt` }}>
                <thead>
                  <tr style={{ backgroundColor: '#F3F4F6' }}>
                    <th style={{ border: '1px solid #D1D5DB', padding: '5px 7px', textAlign: 'left' }}>Actividad / Compromiso</th>
                    <th style={{ border: '1px solid #D1D5DB', padding: '5px 7px', textAlign: 'left' }}>Responsable</th>
                    <th style={{ border: '1px solid #D1D5DB', padding: '5px 7px', textAlign: 'left' }}>Fecha límite</th>
                    <th style={{ border: '1px solid #D1D5DB', padding: '5px 7px', textAlign: 'left' }}>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {d.compromisos.map((c, idx) => (
                    <tr key={c.id || idx}>
                      <td style={{ border: '1px solid #D1D5DB', padding: '5px 7px' }}>{c.actividad}</td>
                      <td style={{ border: '1px solid #D1D5DB', padding: '5px 7px' }}>{c.responsable}</td>
                      <td style={{ border: '1px solid #D1D5DB', padding: '5px 7px' }}>{c.fechaCumplimiento}</td>
                      <td style={{ border: '1px solid #D1D5DB', padding: '5px 7px' }}>{c.observaciones || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ),
        });
      }

      if (d.convocatoriaSiguiente.trim()) {
        blocks.push({
          key: 'acta-conv',
          estimatedLines: 3,
          render: () => (
            <div style={{ marginBottom: '1.4em' }}>
              <strong>CONVOCATORIA:</strong> {d.convocatoriaSiguiente}
            </div>
          ),
        });
      }

      blocks.push({
        key: 'acta-firmas',
        estimatedLines: 4 + Math.ceil(d.firmantes.length / 2) * 3.5,
        render: () => (
          <div style={{ marginTop: '2.2em', display: 'grid', gridTemplateColumns: d.firmantes.length > 1 ? '1fr 1fr' : '1fr', gap: '2.2em 1.5em' }}>
            {d.firmantes.map((f, idx) => (
              <div
                key={f.id || idx}
                style={{
                  gridColumn: d.firmantes.length > 1 && d.firmantes.length % 2 === 1 && idx === d.firmantes.length - 1 ? '1 / -1' : undefined,
                  justifySelf: d.firmantes.length > 1 && d.firmantes.length % 2 === 1 && idx === d.firmantes.length - 1 ? 'center' : undefined,
                  lineHeight: 1.3,
                }}
              >
                <div style={{ width: '210px', borderTop: '1px solid #374151', marginBottom: '4px' }} />
                <div>{f.nombre.toUpperCase()}</div>
                <div>{f.cargo}</div>
              </div>
            ))}
          </div>
        ),
      });

      pushSpecialLines({ anexos: d.anexos, transcriptor: d.transcriptor });
    } else if (moduleId === 'informe') {
      const d = data as InformeData;
      if (d.clase === 'extenso') {
        blocks.push({
          key: 'inf-portada',
          estimatedLines: maxLinesPerPage,
          isPageBreak: true,
          render: () => (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: `${usableHeightCm * 0.9}cm`,
                textAlign: 'center',
              }}
            >
              <div>
                {d.codigo.trim() && (
                  <div style={{ textAlign: 'right', marginBottom: '2.2em' }}>
                    <span style={{ border: '1px solid #374151', padding: '3px 10px' }}>{d.codigo}</span>
                  </div>
                )}
                <div style={{ fontWeight: 700, color: accentColor }}>{corp.razonSocial}</div>
                <div style={{ marginTop: '0.5em' }}>{d.dependencia.toUpperCase()}</div>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: `${basePt + 2}pt` }}>{d.titulo.toUpperCase()}</div>
                {d.subtitulo.trim() && <div style={{ marginTop: '0.7em', color: '#4B5563' }}>{d.subtitulo}</div>}
              </div>
              <div>
                <div style={{ fontWeight: 700, marginBottom: '0.5em' }}>ELABORADO POR:</div>
                <div>{d.responsables.toUpperCase()}</div>
              </div>
              <div style={{ fontWeight: 600 }}>{d.ciudadFecha.toUpperCase()}</div>
            </div>
          ),
        });

        blocks.push({
          key: 'inf-toc',
          estimatedLines: maxLinesPerPage,
          isPageBreak: true,
          render: () => (
            <div>
              <div style={{ textAlign: 'center', fontWeight: 700, color: accentColor, marginBottom: '1.5em' }}>
                CONTENIDO
              </div>
              <div style={{ lineHeight: 2 }}>
                {d.introduccion.trim() && <div>INTRODUCCIÓN</div>}
                {d.objetivos.trim() && <div>OBJETIVOS</div>}
                {d.metodologia.trim() && <div>METODOLOGÍA</div>}
                {d.capitulos.map((c) => (
                  <div key={c.id}>
                    {c.numero}. {c.titulo.toUpperCase()}
                  </div>
                ))}
                {d.resultados.trim() && <div>RESULTADOS</div>}
                {d.analisis.trim() && <div>ANÁLISIS</div>}
                {d.conclusiones.trim() && <div>CONCLUSIONES</div>}
                {d.recomendaciones.trim() && <div>RECOMENDACIONES</div>}
                {d.bibliografia.trim() && <div>BIBLIOGRAFÍA</div>}
              </div>
            </div>
          ),
        });
      } else {
        blocks.push({
          key: 'inf-encabezamiento',
          estimatedLines: 7,
          render: () => (
            <div style={{ marginBottom: '1.4em' }}>
              <div style={{ marginBottom: '0.9em' }}>
                {d.dependencia}
                {d.codigo ? ` ${d.codigo}` : ''}
              </div>
              <div style={{ textAlign: 'center', fontWeight: 700, color: accentColor, marginBottom: '1.1em' }}>
                {d.titulo.toUpperCase()}
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '150px', fontWeight: 700, paddingBottom: '4px' }}>FECHA:</td>
                    <td style={{ paddingBottom: '4px' }}>{d.ciudadFecha}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700, paddingBottom: '4px' }}>ELABORADO POR:</td>
                    <td style={{ paddingBottom: '4px' }}>{d.responsables}</td>
                  </tr>
                  {d.destinatario.trim() && (
                    <tr>
                      <td style={{ fontWeight: 700 }}>DESTINATARIO:</td>
                      <td>{d.destinatario}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ),
        });
      }

      if (d.introduccion.trim()) {
        blocks.push({
          key: 'inf-intro-h',
          estimatedLines: 1.5,
          keepWithNext: true,
          render: () => <div style={{ fontWeight: 700, marginBottom: '0.5em' }}>INTRODUCCIÓN</div>,
        });
        pushParagraphs('inf-intro', d.introduccion);
      }

      if (d.objetivos.trim()) {
        blocks.push({
          key: 'inf-obj-h',
          estimatedLines: 1.5,
          keepWithNext: true,
          render: () => <div style={{ fontWeight: 700, marginTop: '0.8em', marginBottom: '0.5em' }}>OBJETIVO(S):</div>,
        });
        pushParagraphs('inf-obj', d.objetivos);
      }

      if (d.metodologia.trim() && d.clase === 'extenso') {
        blocks.push({
          key: 'inf-met-h',
          estimatedLines: 1.5,
          keepWithNext: true,
          render: () => <div style={{ fontWeight: 700, marginTop: '0.8em', marginBottom: '0.5em' }}>METODOLOGÍA</div>,
        });
        pushParagraphs('inf-met', d.metodologia);
      }

      d.capitulos.forEach((cap) => {
        blocks.push({
          key: `inf-cap-h-${cap.id}`,
          estimatedLines: 1.8,
          keepWithNext: true,
          render: () => (
            <div style={{ fontWeight: 700, marginTop: '0.9em', marginBottom: '0.5em' }}>
              {cap.numero}. {cap.titulo.toUpperCase()}
            </div>
          ),
        });
        pushParagraphs(`inf-cap-${cap.id}`, cap.contenido);
      });

      if (d.resultados.trim() && d.clase === 'extenso') {
        blocks.push({
          key: 'inf-res-h',
          estimatedLines: 1.5,
          keepWithNext: true,
          render: () => <div style={{ fontWeight: 700, marginTop: '0.8em', marginBottom: '0.5em' }}>RESULTADOS</div>,
        });
        pushParagraphs('inf-res', d.resultados);
      }

      if (d.analisis.trim() && d.clase === 'extenso') {
        blocks.push({
          key: 'inf-ana-h',
          estimatedLines: 1.5,
          keepWithNext: true,
          render: () => <div style={{ fontWeight: 700, marginTop: '0.8em', marginBottom: '0.5em' }}>ANÁLISIS</div>,
        });
        pushParagraphs('inf-ana', d.analisis);
      }

      d.tablas.forEach((t) => {
        blocks.push({
          key: `inf-tbl-${t.id}`,
          estimatedLines: 4 + t.filas.length * 1.6,
          render: () => (
            <div style={{ margin: '1em 0' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.4em' }}>{t.titulo}</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: `${Math.max(9, basePt - 1)}pt` }}>
                <thead>
                  <tr style={{ backgroundColor: '#F3F4F6' }}>
                    {t.columnas.map((c, idx) => (
                      <th key={idx} style={{ border: '1px solid #D1D5DB', padding: '5px 8px', textAlign: 'left' }}>
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {t.filas.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {t.columnas.map((_, cIdx) => (
                        <td key={cIdx} style={{ border: '1px solid #D1D5DB', padding: '5px 8px' }}>
                          {row[cIdx] || ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ),
        });
      });

      d.graficos.forEach((g) => {
        const maxVal = Math.max(1, ...g.datos.map((x) => Number(x.valor) || 0));
        blocks.push({
          key: `inf-graf-${g.id}`,
          estimatedLines: 4 + g.datos.length * 1.6,
          render: () => (
            <div style={{ margin: '1em 0', border: '1px solid #E5E7EB', padding: '10px 12px', borderRadius: '4px' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.6em' }}>
                {g.titulo} {g.unidad ? `(${g.unidad})` : ''}
              </div>
              {g.datos.map((item, idx) => {
                const pct = Math.max(2, Math.round(((Number(item.valor) || 0) / maxVal) * 100));
                return (
                  <div key={idx} style={{ marginBottom: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: `${smallPt}pt`, marginBottom: '2px' }}>
                      <span>{item.etiqueta}</span>
                      <span>
                        {item.valor} {g.unidad}
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#F3F4F6' }}>
                      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: accentColor }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ),
        });
      });

      if (d.conclusiones.trim()) {
        blocks.push({
          key: 'inf-conc-h',
          estimatedLines: 1.5,
          keepWithNext: true,
          render: () => <div style={{ fontWeight: 700, marginTop: '0.9em', marginBottom: '0.5em' }}>CONCLUSIONES</div>,
        });
        pushParagraphs('inf-conc', d.conclusiones);
      }

      if (d.recomendaciones.trim()) {
        blocks.push({
          key: 'inf-rec-h',
          estimatedLines: 1.5,
          keepWithNext: true,
          render: () => <div style={{ fontWeight: 700, marginTop: '0.9em', marginBottom: '0.5em' }}>RECOMENDACIONES</div>,
        });
        pushParagraphs('inf-rec', d.recomendaciones);
      }

      if (d.bibliografia.trim()) {
        blocks.push({
          key: 'inf-bib-h',
          estimatedLines: 1.5,
          keepWithNext: true,
          render: () => <div style={{ fontWeight: 700, marginTop: '0.9em', marginBottom: '0.5em' }}>BIBLIOGRAFÍA</div>,
        });
        pushParagraphs('inf-bib', d.bibliografia);
      }

      blocks.push({
        key: 'inf-firmas',
        estimatedLines: 4 + Math.ceil(d.firmantes.length / 2) * 3,
        render: () => (
          <div style={{ marginTop: '2.2em', display: 'grid', gridTemplateColumns: d.firmantes.length > 1 ? '1fr 1fr' : '1fr', gap: '2em 1.5em' }}>
            {d.firmantes.map((f, idx) => (
              <div key={f.id || idx} style={{ lineHeight: 1.3 }}>
                <div style={{ width: '210px', borderTop: '1px solid #374151', marginBottom: '4px' }} />
                <div>{f.nombre.toUpperCase()}</div>
                <div>{f.cargo}</div>
              </div>
            ))}
          </div>
        ),
      });

      pushSpecialLines({ anexos: d.anexos, transcriptor: d.transcriptor });
    } else if (moduleId === 'certificado') {
      const d = data as CertificadoConstanciaData;
      if (d.ubicacionFecha === 'inicio') {
        blocks.push({
          key: 'cert-top',
          estimatedLines: 3.5,
          render: () => (
            <div style={{ marginLeft: isBloqueOrSemi ? '50%' : '0', marginBottom: '2.5em' }}>
              {d.codigo.trim() && <div style={{ marginBottom: '0.6em' }}>{d.codigo.trim()}</div>}
              <div>{d.ciudadFecha}</div>
            </div>
          ),
        });
      } else if (d.codigo.trim()) {
        blocks.push({
          key: 'cert-code',
          estimatedLines: 2,
          render: () => (
            <div style={{ textAlign: isBloqueOrSemi ? 'right' : 'left', marginBottom: '2.2em' }}>{d.codigo}</div>
          ),
        });
      }

      blocks.push({
        key: 'cert-cargo',
        estimatedLines: 3,
        render: () => (
          <div style={{ textAlign: 'center', fontWeight: 700, marginBottom: '2.4em' }}>
            {d.cargoExpide.toUpperCase()}
          </div>
        ),
      });

      blocks.push({
        key: 'cert-ident',
        estimatedLines: 2.5,
        render: () => (
          <div style={{ textAlign: 'center', fontWeight: 700, color: accentColor, marginBottom: '1.8em' }}>
            {d.categoria === 'certificado' ? 'CERTIFICA:' : 'HACE CONSTAR:'}
          </div>
        ),
      });

      pushParagraphs('cert-body', d.cuerpoParrafos, false);

      if (d.motivoDestino.trim()) {
        blocks.push({
          key: 'cert-motivo',
          estimatedLines: 2.5,
          render: () => <p style={{ marginBottom: '1.4em', textAlign: 'justify' }}>{d.motivoDestino}</p>,
        });
      }

      if (d.ubicacionFecha === 'final') {
        blocks.push({
          key: 'cert-fecha-fin',
          estimatedLines: 2.5,
          render: () => <div style={{ marginBottom: '2.2em' }}>{d.ciudadFecha}</div>,
        });
      }

      blocks.push({
        key: 'cert-firma',
        estimatedLines: 4,
        render: () => (
          <div style={{ marginTop: '2.4em', marginLeft: isBloqueOrSemi ? '50%' : '0', lineHeight: 1.3 }}>
            <div style={{ width: '210px', borderTop: '1px solid #374151', marginBottom: '4px' }} />
            <div>{d.expideNombre.toUpperCase()}</div>
            <div>{d.expideCargo}</div>
          </div>
        ),
      });

      pushSpecialLines({ transcriptor: d.transcriptor });
    } else if (moduleId === 'hoja_vida') {
      const d = data as HojaVidaData;
      blocks.push({
        key: 'hv-hdr',
        estimatedLines: 4,
        render: () => (
          <div style={{ textAlign: 'center', marginBottom: '1.4em' }}>
            <div style={{ fontWeight: 700, color: accentColor, fontSize: `${basePt + 1}pt` }}>
              HOJA DE VIDA CORPORATIVA
            </div>
            <div style={{ fontWeight: 700, marginTop: '0.5em' }}>
              {`${d.primerApellido} ${d.segundoApellido} ${d.nombres}`.trim().toUpperCase()}
            </div>
          </div>
        ),
      });

      const renderTableSection = (key: string, title: string, rows: [string, string][]) => {
        const filtered = rows.filter(([, v]) => v && v.trim());
        if (filtered.length === 0) return;
        blocks.push({
          key,
          estimatedLines: 2.5 + filtered.length * 1.4,
          render: () => (
            <div style={{ marginBottom: '1.1em' }}>
              <div style={{ fontWeight: 700, color: accentColor, marginBottom: '0.4em', borderBottom: `1px solid ${accentColor}`, paddingBottom: '2px' }}>
                {title}
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: `${Math.max(9, basePt - 1)}pt` }}>
                <tbody>
                  {filtered.map(([k, v], i) => (
                    <tr key={i}>
                      <td style={{ width: '36%', border: '1px solid #E5E7EB', padding: '4px 7px', fontWeight: 600, backgroundColor: '#F9FAFB' }}>
                        {k}
                      </td>
                      <td style={{ width: '64%', border: '1px solid #E5E7EB', padding: '4px 7px' }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ),
        });
      };

      renderTableSection('hv-basicos', '1. DATOS BÁSICOS', [
        ['Documento de identidad', `${d.tipoIdentificacion} ${d.numeroIdentificacion}${d.lugarExpedicion ? ` de ${d.lugarExpedicion}` : ''}`],
        ['Lugar y fecha de nacimiento', [d.lugarNacimiento, d.fechaNacimiento].filter(Boolean).join(', ')],
        ['Género / Estado civil / Hijos', [d.genero, d.estadoCivil, d.numeroHijos ? `${d.numeroHijos} hijo(s)` : ''].filter(Boolean).join(' · ')],
        ['Domicilio', d.direccion],
        ['Teléfono / Correo', [d.telefono, d.correo].filter(Boolean).join(' · ')],
      ]);

      renderTableSection('hv-laboral', '2. INFORMACIÓN LABORAL INSTITUCIONAL', [
        ['Organización', `${corp.razonSocial} · NIT ${corp.nit}`],
        ['Cargo actual / Dependencia', [d.cargoActual, d.sucursalDependencia].filter(Boolean).join(' — ')],
        ['Ingreso / Vinculación / Estatus', [d.fechaIngresoOrg, d.tipoVinculacion, d.estatusVinculacion].filter(Boolean).join(' · ')],
        ['Jefe inmediato', d.jefeInmediato],
        ['Responsabilidades', d.responsabilidadesActuales],
        ['EPS / Fondo de pensiones / ARL', [d.eps, d.fondoPensiones, d.arl].filter(Boolean).join(' · ')],
        ['Visas vigentes', d.visasInfo],
      ]);

      if (d.academicos.length > 0) {
        blocks.push({
          key: 'hv-acad',
          estimatedLines: 2.5 + d.academicos.length * 3,
          render: () => (
            <div style={{ marginBottom: '1.1em' }}>
              <div style={{ fontWeight: 700, color: accentColor, marginBottom: '0.4em', borderBottom: `1px solid ${accentColor}`, paddingBottom: '2px' }}>
                3. INFORMACIÓN ACADÉMICA
              </div>
              {d.academicos.map((a, idx) => (
                <div key={a.id || idx} style={{ marginBottom: '0.55em', fontSize: `${Math.max(9, basePt - 1)}pt` }}>
                  <div style={{ fontWeight: 700 }}>
                    {a.nivel} — {a.tituloObtenido}
                  </div>
                  <div>
                    {a.institucion} ({a.ciudadPais}) · {a.fechaInicio} a {a.fechaFinalizacion}
                  </div>
                </div>
              ))}
            </div>
          ),
        });
      }

      if (d.formacionComplementaria.length > 0) {
        blocks.push({
          key: 'hv-form',
          estimatedLines: 2.5 + d.formacionComplementaria.length * 1.8,
          render: () => (
            <div style={{ marginBottom: '1.1em' }}>
              <div style={{ fontWeight: 700, color: accentColor, marginBottom: '0.4em', borderBottom: `1px solid ${accentColor}`, paddingBottom: '2px' }}>
                4. FORMACIÓN COMPLEMENTARIA E IDIOMAS
              </div>
              {d.formacionComplementaria.map((f, idx) => (
                <div key={f.id || idx} style={{ marginBottom: '0.35em', fontSize: `${Math.max(9, basePt - 1)}pt` }}>
                  <strong>{f.tipo}:</strong> {f.nombre} — {f.institucion} ({f.duracionNivel}, {f.fecha})
                </div>
              ))}
            </div>
          ),
        });
      }

      if (d.experiencias.length > 0) {
        blocks.push({
          key: 'hv-exp',
          estimatedLines: 2.5 + d.experiencias.length * 3.5,
          render: () => (
            <div style={{ marginBottom: '1.1em' }}>
              <div style={{ fontWeight: 700, color: accentColor, marginBottom: '0.4em', borderBottom: `1px solid ${accentColor}`, paddingBottom: '2px' }}>
                5. EXPERIENCIA LABORAL
              </div>
              {d.experiencias.map((ex, idx) => (
                <div key={ex.id || idx} style={{ marginBottom: '0.65em', fontSize: `${Math.max(9, basePt - 1)}pt` }}>
                  <div style={{ fontWeight: 700 }}>
                    {ex.empresa} — {ex.cargo}
                  </div>
                  <div style={{ color: '#4B5563' }}>
                    {ex.fechaIngreso} a {ex.fechaRetiro}
                  </div>
                  {ex.funciones.trim() && <div>{ex.funciones}</div>}
                </div>
              ))}
            </div>
          ),
        });
      }

      if (d.investigacionesDistinciones.length > 0) {
        blocks.push({
          key: 'hv-dist',
          estimatedLines: 2.5 + d.investigacionesDistinciones.length * 1.8,
          render: () => (
            <div style={{ marginBottom: '1.1em' }}>
              <div style={{ fontWeight: 700, color: accentColor, marginBottom: '0.4em', borderBottom: `1px solid ${accentColor}`, paddingBottom: '2px' }}>
                6. INVESTIGACIONES, PUBLICACIONES Y DISTINCIONES
              </div>
              {d.investigacionesDistinciones.map((inv, idx) => (
                <div key={inv.id || idx} style={{ marginBottom: '0.35em', fontSize: `${Math.max(9, basePt - 1)}pt` }}>
                  {inv.titulo} — {inv.entidad} ({inv.fecha})
                </div>
              ))}
            </div>
          ),
        });
      }
    }

    // Paginate blocks cleanly
    const resultPages: FlowBlock[][] = [];
    let currentPage: FlowBlock[] = [];
    let usedLines = 0;

    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      if (b.isPageBreak) {
        if (currentPage.length > 0) {
          resultPages.push(currentPage);
          currentPage = [];
          usedLines = 0;
        }
        resultPages.push([b]);
        continue;
      }

      const nextExtra = b.keepWithNext && blocks[i + 1] ? Math.min(4, blocks[i + 1].estimatedLines) : 0;
      if (currentPage.length > 0 && usedLines + b.estimatedLines + nextExtra > maxLinesPerPage) {
        resultPages.push(currentPage);
        currentPage = [];
        usedLines = 0;
      }
      currentPage.push(b);
      usedLines += b.estimatedLines;
    }

    if (currentPage.length > 0) {
      resultPages.push(currentPage);
    }
    if (resultPages.length === 0) {
      resultPages.push([]);
    }
    return resultPages;
  }, [moduleId, data, format, corp, accentColor, isBloqueOrSemi, isSemi, maxLinesPerPage, usableHeightCm]);

  const safeActivePage = Math.min(activePageIdx, Math.max(0, pages.length - 1));

  const getSubsequentIdLine = (): string => {
    if (moduleId === 'carta') {
      const c = data as CartaData;
      return `${c.destinatarioNombre} · ${c.ciudadFecha}`;
    }
    if (moduleId === 'memorando') {
      const m = data as MemorandoData;
      return `Memorando ${m.codigo || ''} · ${m.ciudadFecha}`.trim();
    }
    if (moduleId === 'circular') {
      const cir = data as CircularData;
      return `${cir.consecutivo} · ${cir.ciudadFecha}`;
    }
    if (moduleId === 'acta') {
      const a = data as ActaData;
      return `${a.numeroActa} — ${a.tituloGrupo}`;
    }
    if (moduleId === 'informe') {
      const inf = data as InformeData;
      return `${inf.titulo}${inf.codigo ? ` (${inf.codigo})` : ''}`;
    }
    return corp.razonSocial;
  };

  const renderZona1 = (pageIndex: number) => {
    if (!format.showZona1) return null;
    const isCartaInternaSubsequent =
      moduleId === 'carta' && (data as CartaData).alcance === 'interna' && pageIndex > 0;

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          paddingBottom: '10px',
          marginBottom: '14px',
          borderBottom:
            format.visualStyle === 'institucional'
              ? `2px solid ${accentColor}`
              : format.visualStyle === 'moderno'
                ? '1px solid #CBD5E1'
                : '1px solid #374151',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          {corp.logoUrl && (
            <img
              src={corp.logoUrl}
              alt={corp.razonSocial}
              referrerPolicy="no-referrer"
              style={{
                height: '52px',
                width: 'auto',
                objectFit: 'contain',
                flexShrink: 0,
              }}
            />
          )}
          {!isCartaInternaSubsequent && (
            <div style={{ lineHeight: 1.25 }}>
              <div style={{ fontWeight: 700, fontSize: '11pt', color: accentColor }}>{corp.razonSocial}</div>
              <div style={{ fontSize: '8.5pt', color: '#4B5563' }}>NIT {corp.nit}</div>
            </div>
          )}
        </div>

        {format.showZona3 && pageIndex === 0 && (
          <div
            style={{
              border: '1px solid #9CA3AF',
              padding: '5px 9px',
              fontSize: '7.8pt',
              lineHeight: 1.3,
              minWidth: '175px',
              color: '#1F2937',
            }}
          >
            <div style={{ fontWeight: 700, color: accentColor, marginBottom: '2px' }}>REGISTRO Y RADICACIÓN</div>
            <div>Radicado: {format.radicadoNumero || '_____________'}</div>
            <div>Fecha: {format.radicadoFechaHora || '_____________'}</div>
          </div>
        )}
      </div>
    );
  };

  const renderZona2Footer = (pageIndex: number) => {
    if (!format.showZona2) return null;
    if (moduleId === 'carta' && (data as CartaData).alcance === 'interna' && pageIndex > 0) {
      return null;
    }
    const parts = [
      `${corp.direccion}, ${corp.municipio}, ${corp.pais}`,
      `Correo: ${corp.correo}`,
    ];
    if (corp.telefonos.trim()) parts.push(`Tel: ${corp.telefonos.trim()}`);
    if (corp.sitioWeb.trim()) parts.push(corp.sitioWeb.trim());

    return (
      <div
        style={{
          marginTop: 'auto',
          paddingTop: '8px',
          borderTop: '1px solid #E5E7EB',
          textAlign: 'center',
          fontSize: '8.2pt',
          color: '#4B5563',
          lineHeight: 1.3,
        }}
      >
        <div>{parts.join('  ·  ')}</div>
      </div>
    );
  };

  // SPECIAL RENDERERS: SOBRE / CORREO / TARJETA
  const renderSobre = () => {
    const d = data as SobreData;
    return (
      <div
        data-doc-page="1"
        className="print-page-sheet"
        style={{
          width: `${widthPx}px`,
          height: `${heightPx}px`,
          backgroundColor: '#FFFFFF',
          color: '#111827',
          fontFamily: fontStack,
          fontSize: `${format.fontSizePt}pt`,
          boxShadow: '0 4px 24px rgba(15, 23, 42, 0.08)',
          border: '1px solid #E2E0EC',
          position: 'relative',
          padding: '0.9cm 1.1cm',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
        }}
      >
        {/* Top Row: Zona 1 (left) and Zona 3 (postal) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '62%' }}>
            {corp.logoUrl && (
              <img
                src={corp.logoUrl}
                alt={corp.razonSocial}
                referrerPolicy="no-referrer"
                style={{ height: '42px', width: 'auto', objectFit: 'contain' }}
              />
            )}
            <div style={{ fontSize: '9pt', lineHeight: 1.25 }}>
              <div style={{ fontWeight: 700, color: accentColor }}>{corp.razonSocial}</div>
              <div style={{ color: '#4B5563' }}>NIT {corp.nit}</div>
              {d.dependenciaRemitente && <div style={{ color: '#374151' }}>{d.dependenciaRemitente}</div>}
            </div>
          </div>

          <div
            style={{
              width: '28%',
              height: '58px',
              border: d.mostrarGuiasTercios ? '1px dashed #CBD5E1' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '7.5pt',
              color: '#9CA3AF',
            }}
          >
            {d.mostrarGuiasTercios ? 'ZONA 3 · USO POSTAL' : ''}
          </div>
        </div>

        {/* Middle Row: Tercios (1: Mención, 2: Destinatario, 3: Postal) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.2fr 0.8fr',
            alignItems: 'center',
            flex: 1,
            gap: '8px',
          }}
        >
          <div
            style={{
              borderRight: d.mostrarGuiasTercios ? '1px dashed #E2E8F0' : 'none',
              height: '75%',
              display: 'flex',
              alignItems: 'center',
              paddingRight: '8px',
              fontWeight: 700,
              fontSize: '9.5pt',
              letterSpacing: '0.03em',
            }}
          >
            {d.mencionTercioIzquierdo ? d.mencionTercioIzquierdo.toUpperCase() : ''}
          </div>

          <div
            style={{
              borderRight: d.mostrarGuiasTercios ? '1px dashed #E2E8F0' : 'none',
              padding: '0 8px',
              lineHeight: 1.3,
              fontSize: `${Math.min(11, format.fontSizePt)}pt`,
            }}
          >
            {d.destTratamiento && <div>{d.destTratamiento}</div>}
            <div>{d.destinoTipo === 'internacional' ? d.destNombre.toUpperCase() : d.destNombre}</div>
            {d.destCargo && <div>{d.destCargo}</div>}
            {d.destOrganizacion && <div>{d.destOrganizacion}</div>}
            <div>{d.destDireccion}</div>
            {d.destTelefonoEspecial && <div>Tel: {d.destTelefonoEspecial}</div>}
            <div>{d.destCiudadDepto}</div>
            {d.destinoTipo === 'internacional' && d.destPais && <div>{d.destPais}</div>}
          </div>

          <div />
        </div>

        {/* Bottom: Zona 2 Remitente */}
        {d.modelo === 'modelo1' && (
          <div
            style={{
              borderTop: '1px solid #E5E7EB',
              paddingTop: '5px',
              textAlign: 'center',
              fontSize: '8pt',
              color: '#4B5563',
            }}
          >
            {corp.direccion} · {corp.municipio}, {corp.pais} · {corp.correo}
            {corp.telefonos.trim() ? ` · Tel: ${corp.telefonos}` : ''}
          </div>
        )}
      </div>
    );
  };

  const renderCorreo = () => {
    const d = data as MensajeElectronicoData;
    return (
      <div
        data-doc-page="1"
        className="print-page-sheet"
        style={{
          width: `${widthPx}px`,
          minHeight: '580px',
          backgroundColor: '#FFFFFF',
          color: '#111827',
          fontFamily: fontStack,
          fontSize: `${format.fontSizePt}pt`,
          boxShadow: '0 4px 24px rgba(15, 23, 42, 0.08)',
          border: '1px solid #D8D4E4',
          borderRadius: '6px',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        {/* Email client header bar */}
        <div
          style={{
            backgroundColor: '#F4F2F8',
            borderBottom: '1px solid #E4E0EE',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '10.5pt', color: accentColor }}>
            <Mail size={16} />
            <span>Vista previa de mensaje electrónico · {d.tipo}</span>
          </div>
          <span style={{ fontSize: '8.5pt', color: '#6B7280' }}>{d.fechaReferencia}</span>
        </div>

        {/* Envelope headers */}
        <div style={{ padding: '14px 24px', borderBottom: '1px solid #E5E7EB', fontSize: '10pt', lineHeight: 1.65 }}>
          <div>
            <span style={{ color: '#6B7280', display: 'inline-block', width: '72px' }}>De:</span>
            <span>
              {d.remitenteNombre} &lt;{d.remitenteCorreo}&gt;
            </span>
          </div>
          <div>
            <span style={{ color: '#6B7280', display: 'inline-block', width: '72px' }}>Para:</span>
            <span>{d.destinatario}</span>
          </div>
          {d.copiaCC.trim() && (
            <div>
              <span style={{ color: '#6B7280', display: 'inline-block', width: '72px' }}>CC:</span>
              <span>{d.copiaCC}</span>
            </div>
          )}
          {d.copiaOcultaCCO.trim() && (
            <div>
              <span style={{ color: '#6B7280', display: 'inline-block', width: '72px' }}>CCO:</span>
              <span>{d.copiaOcultaCCO}</span>
            </div>
          )}
          <div style={{ marginTop: '4px' }}>
            <span style={{ color: '#6B7280', display: 'inline-block', width: '72px' }}>Asunto:</span>
            <strong style={{ color: '#111827' }}>{d.asunto}</strong>
          </div>
          {d.adjuntosReferencia.trim() && (
            <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '9pt', color: '#4B5563' }}>
              <Paperclip size={13} />
              <span>Adjuntos de referencia: {d.adjuntosReferencia}</span>
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '22px 24px', lineHeight: 1.5 }}>
          {d.saludo.trim() && <p style={{ marginBottom: '1em' }}>{d.saludo}</p>}
          {d.cuerpo
            .split(/\n\s*\n/)
            .filter((p) => p.trim())
            .map((p, idx) => (
              <p key={idx} style={{ marginBottom: '1em' }}>
                {p}
              </p>
            ))}
          {d.despedida.trim() && <p style={{ marginTop: '1.2em', marginBottom: '1.4em' }}>{d.despedida}</p>}

          {/* Signature */}
          {d.incluirFirmaInstitucional && (
            <div
              style={{
                borderTop: `2px solid ${accentColor}`,
                paddingTop: '12px',
                marginTop: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              {corp.logoUrl && (
                <img
                  src={corp.logoUrl}
                  alt={corp.razonSocial}
                  referrerPolicy="no-referrer"
                  style={{ height: '54px', width: 'auto', objectFit: 'contain' }}
                />
              )}
              <div style={{ fontSize: '9.5pt', lineHeight: 1.35 }}>
                <div style={{ fontWeight: 700, color: accentColor }}>{d.remitenteNombre}</div>
                <div style={{ color: '#374151' }}>{d.remitenteCargo}</div>
                <div style={{ fontWeight: 600, color: '#111827', marginTop: '2px' }}>
                  {corp.razonSocial} · NIT {corp.nit}
                </div>
                <div style={{ fontSize: '8.5pt', color: '#6B7280' }}>
                  {corp.direccion}, {corp.municipio}, {corp.pais} · {corp.correo}
                  {corp.telefonos.trim() ? ` · Tel: ${corp.telefonos}` : ''}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTarjeta = () => {
    const d = data as TarjetaProtocolariaData;
    const bg = d.presentacionVisual === 'sobria_crema' ? '#FAF8F4' : '#FFFFFF';
    const borderStyle =
      d.presentacionVisual === 'marco_corporativo'
        ? `3px double ${accentColor}`
        : '1px solid #D1D5DB';

    return (
      <div
        data-doc-page="1"
        className="print-page-sheet"
        style={{
          width: `${widthPx}px`,
          height: `${heightPx}px`,
          backgroundColor: bg,
          color: '#111827',
          fontFamily: fontStack,
          fontSize: `${format.fontSizePt}pt`,
          boxShadow: '0 6px 28px rgba(15, 23, 42, 0.1)',
          border: borderStyle,
          padding: d.tipo === 'presentacion' ? '0.6cm 0.8cm' : '1.1cm 1.4cm',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
        }}
      >
        {d.tipo === 'presentacion' ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%', gap: '14px' }}>
            {d.incluirLogo && corp.logoUrl && (
              <img
                src={corp.logoUrl}
                alt={corp.razonSocial}
                referrerPolicy="no-referrer"
                style={{ height: '64px', width: 'auto', objectFit: 'contain' }}
              />
            )}
            <div style={{ flex: 1, lineHeight: 1.32 }}>
              <div style={{ fontWeight: 700, fontSize: '10.5pt', color: accentColor }}>{corp.razonSocial}</div>
              <div style={{ fontWeight: 700, fontSize: '10pt', marginTop: '6px' }}>{d.remitenteNombre}</div>
              <div style={{ fontSize: '8.5pt', color: '#4B5563' }}>{d.remitenteCargo}</div>
              <div style={{ fontSize: '7.5pt', color: '#4B5563', marginTop: '8px' }}>
                <div>{corp.direccion}, {corp.municipio}</div>
                <div>{d.presentacionCorreo || corp.correo}</div>
                {d.presentacionTelefono.trim() && <div>Tel: {d.presentacionTelefono}</div>}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              {d.incluirLogo && corp.logoUrl && (
                <img
                  src={corp.logoUrl}
                  alt={corp.razonSocial}
                  referrerPolicy="no-referrer"
                  style={{ height: '48px', width: 'auto', objectFit: 'contain', marginBottom: '6px' }}
                />
              )}
              <div style={{ fontWeight: 700, color: accentColor, letterSpacing: '0.04em' }}>
                {corp.razonSocial}
              </div>
            </div>

            {d.tipo === 'invitacion' ? (
              <div style={{ textAlign: 'center', lineHeight: 1.4, fontSize: `${Math.min(11, format.fontSizePt)}pt` }}>
                {d.destinatarioNombre.trim() && (
                  <div style={{ fontWeight: 600, marginBottom: '6px' }}>{d.destinatarioNombre}</div>
                )}
                <p style={{ marginBottom: '12px' }}>{d.motivoInvitacion}</p>
                <div style={{ textAlign: 'left', display: 'inline-block', fontSize: `${Math.max(9, format.fontSizePt - 1)}pt` }}>
                  <div><strong>Fecha:</strong> {d.fechaEvento}</div>
                  <div><strong>Hora:</strong> {d.horaEvento}</div>
                  <div><strong>Lugar:</strong> {d.lugarEvento}</div>
                  {d.informacionAdicional.trim() && <div>{d.informacionAdicional}</div>}
                </div>
              </div>
            ) : (
              <div style={{ lineHeight: 1.45, fontSize: `${Math.min(11, format.fontSizePt)}pt` }}>
                {d.destinatarioNombre.trim() && (
                  <div style={{ fontWeight: 700, marginBottom: '8px' }}>{d.destinatarioNombre},</div>
                )}
                <p style={{ marginBottom: '12px' }}>{d.cuerpoMensaje}</p>
                <div style={{ marginTop: '10px' }}>
                  <div>{d.remitenteNombre}</div>
                  <div style={{ fontSize: `${Math.max(9, format.fontSizePt - 1)}pt`, color: '#4B5563' }}>{d.remitenteCargo}</div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '8.5pt', color: '#4B5563' }}>
              <span>{d.tipo === 'invitacion' ? d.datosConfirmacion : ''}</span>
              <span>{d.ciudadFecha}</span>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#EFECE6]/70 border border-[#E2DFEC] rounded-lg overflow-hidden">
      {/* Preview Toolbar */}
      <div className="no-print flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-white border-b border-[#E4E2EC]">
        <div className="flex items-center gap-3 text-xs text-[#4A465C] tabular-nums">
          <span className="font-semibold text-[#181622]">Vista previa documental</span>
          <span aria-hidden="true">·</span>
          <span>
            {dims.widthCm.toFixed(1)} × {dims.heightCm.toFixed(1)} cm
          </span>
          {pages.length > 1 && (
            <>
              <span aria-hidden="true">·</span>
              <span>
                {pages.length} páginas
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {pages.length > 1 && (
            <div className="flex items-center gap-1 bg-[#F4F3F8] p-0.5 rounded-md">
              <button
                type="button"
                onClick={() => setViewMode('all')}
                className={`px-2 py-1 text-xs rounded whitespace-nowrap shrink-0 transition-colors ${
                  viewMode === 'all' ? 'bg-white text-[#181622] shadow-xs font-medium' : 'text-[#5E5972]'
                }`}
              >
                Todas
              </button>
              <button
                type="button"
                onClick={() => setViewMode('single')}
                className={`px-2 py-1 text-xs rounded whitespace-nowrap shrink-0 transition-colors ${
                  viewMode === 'single' ? 'bg-white text-[#181622] shadow-xs font-medium' : 'text-[#5E5972]'
                }`}
              >
                Por página
              </button>
            </div>
          )}

          {pages.length > 1 && viewMode === 'single' && (
            <div className="flex items-center gap-1 text-xs tabular-nums">
              <button
                type="button"
                aria-label="Página anterior"
                onClick={() => setActivePageIdx((p) => Math.max(0, p - 1))}
                disabled={safeActivePage === 0}
                className="p-1 rounded border border-[#E4E2EC] disabled:opacity-40 hover:bg-[#F4F3F8]"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="px-1.5 font-medium">
                {safeActivePage + 1} / {pages.length}
              </span>
              <button
                type="button"
                aria-label="Página siguiente"
                onClick={() => setActivePageIdx((p) => Math.min(pages.length - 1, p + 1))}
                disabled={safeActivePage === pages.length - 1}
                className="p-1 rounded border border-[#E4E2EC] disabled:opacity-40 hover:bg-[#F4F3F8]"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}

          <div className="flex items-center gap-1 border border-[#E4E2EC] rounded-md px-1.5 py-0.5 bg-white">
            <button
              type="button"
              aria-label="Reducir zoom"
              onClick={() => setZoom((z) => Math.max(0.45, Number((z - 0.1).toFixed(2))))}
              className="p-1 text-[#5E5972] hover:text-[#181622]"
            >
              <ZoomOut size={14} />
            </button>
            <span className="text-xs font-mono-code w-10 text-center tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              aria-label="Aumentar zoom"
              onClick={() => setZoom((z) => Math.min(1.25, Number((z + 0.1).toFixed(2))))}
              className="p-1 text-[#5E5972] hover:text-[#181622]"
            >
              <ZoomIn size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Canvas */}
      <div className="flex-1 overflow-auto p-6 flex flex-col items-center gap-6">
        <div
          ref={previewContainerRef}
          className="print-only-root flex flex-col items-center gap-6"
        >
          {moduleId === 'sobre' || moduleId === 'correo' || moduleId === 'tarjeta' ? (
            <div
              style={{
                width: `${widthPx * zoom}px`,
                height: moduleId === 'correo' ? 'auto' : `${heightPx * zoom}px`,
              }}
            >
              <div
                data-zoom-wrapper="true"
                className="print-scale-reset"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: `${widthPx}px` }}
              >
                {moduleId === 'sobre' ? renderSobre() : moduleId === 'correo' ? renderCorreo() : renderTarjeta()}
              </div>
            </div>
          ) : (
            pages.map((pageBlocks, pIdx) => {
              if (viewMode === 'single' && pIdx !== safeActivePage) return null;
              const isPortada = moduleId === 'informe' && (data as InformeData).clase === 'extenso' && pIdx === 0;
              return (
                <div
                  key={pIdx}
                  style={{
                    width: `${widthPx * zoom}px`,
                    height: `${heightPx * zoom}px`,
                  }}
                >
                  <div
                    data-doc-page={pIdx + 1}
                    className="print-page-sheet"
                    style={{
                      transform: `scale(${zoom})`,
                      transformOrigin: 'top left',
                      width: `${widthPx}px`,
                      height: `${heightPx}px`,
                      backgroundColor: '#FFFFFF',
                      color: '#111827',
                      fontFamily: fontStack,
                      fontSize: `${format.fontSizePt}pt`,
                      paddingTop: `${format.margins.topCm}cm`,
                      paddingBottom: `${format.margins.bottomCm}cm`,
                      paddingLeft: `${format.margins.leftCm}cm`,
                      paddingRight: `${format.margins.rightCm}cm`,
                      boxShadow: '0 4px 24px rgba(15, 23, 42, 0.08)',
                      border: '1px solid #E2E0EC',
                      display: 'flex',
                      flexDirection: 'column',
                      boxSizing: 'border-box',
                      overflow: 'hidden',
                    }}
                  >
                    {!isPortada && renderZona1(pIdx)}

                    {/* GTC 185 Identificación de páginas subsiguientes (num. 4.5.1) */}
                    {pIdx > 0 && !isPortada && (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '9.5pt',
                          color: '#374151',
                          marginBottom: '12px',
                        }}
                      >
                        <span>{getSubsequentIdLine()}</span>
                        <span>{pIdx + 1}</span>
                      </div>
                    )}

                    <div style={{ flex: 1 }}>
                      {pageBlocks.map((b) => (
                        <React.Fragment key={b.key}>{b.render()}</React.Fragment>
                      ))}
                    </div>

                    {!isPortada && renderZona2Footer(pIdx)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
