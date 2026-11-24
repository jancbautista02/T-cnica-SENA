import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  ImageRun,
  Packer,
  PageBreak,
  PageNumber,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from 'docx';
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

const TWIPS_PER_CM = 566.93;
const cmToTwips = (cm: number) => Math.round(cm * TWIPS_PER_CM);

const NO_BORDERS = {
  top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
};

const THIN_BORDERS = {
  top: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
  left: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
  right: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD' },
  insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD' },
};

interface LoadedLogo {
  bytes: Uint8Array;
  widthPx: number;
  heightPx: number;
}

async function loadLogoAsPngBytes(url: string): Promise<LoadedLogo | null> {
  if (!url) return null;
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.crossOrigin = 'anonymous';
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Logo load failed'));
      el.src = url;
    });

    const maxDim = 420;
    const scale = Math.min(1, maxDim / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
    const w = Math.max(1, Math.round((img.naturalWidth || 200) * scale));
    const h = Math.max(1, Math.round((img.naturalHeight || 200) * scale));

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, w, h);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) return null;
    const buf = await blob.arrayBuffer();
    return { bytes: new Uint8Array(buf), widthPx: w, heightPx: h };
  } catch {
    return null;
  }
}

function getAccentHex(visualStyle: DocumentFormatConfig['visualStyle']): string {
  if (visualStyle === 'institucional') return '5B2E7A';
  if (visualStyle === 'moderno') return '334155';
  return '1F2937';
}

function makeRun(
  text: string,
  font: string,
  sizePt: number,
  options?: { bold?: boolean; italic?: boolean; color?: string }
): TextRun {
  return new TextRun({
    text,
    font,
    size: sizePt * 2,
    bold: options?.bold,
    italics: options?.italic,
    color: options?.color ?? '111827',
  });
}

function makePara(
  text: string,
  font: string,
  sizePt: number,
  options?: {
    bold?: boolean;
    italic?: boolean;
    color?: string;
    align?: (typeof AlignmentType)[keyof typeof AlignmentType];
    indentFirstLineCm?: number;
    spaceAfterTwips?: number;
    spaceBeforeTwips?: number;
  }
): Paragraph {
  return new Paragraph({
    alignment: options?.align ?? AlignmentType.LEFT,
    indent: options?.indentFirstLineCm ? { firstLine: cmToTwips(options.indentFirstLineCm) } : undefined,
    spacing: {
      before: options?.spaceBeforeTwips ?? 0,
      after: options?.spaceAfterTwips ?? 120,
      line: 276,
    },
    children: [makeRun(text, font, sizePt, options)],
  });
}

function makeRightHalfBlock(
  lines: { text: string; bold?: boolean }[],
  font: string,
  sizePt: number,
  spaceAfterTwips = 160
): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: NO_BORDERS,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: NO_BORDERS,
            children: [new Paragraph({ children: [] })],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: NO_BORDERS,
            children: lines.map((l, idx) =>
              makePara(l.text, font, sizePt, {
                bold: l.bold,
                spaceAfterTwips: idx === lines.length - 1 ? spaceAfterTwips : 40,
              })
            ),
          }),
        ],
      }),
    ],
  });
}

function makePairSignaturesTable(
  signers: { nombre: string; cargo: string }[],
  font: string,
  sizePt: number
): (Paragraph | Table)[] {
  const blocks: (Paragraph | Table)[] = [];
  for (let i = 0; i < signers.length; i += 2) {
    const left = signers[i];
    const right = signers[i + 1];
    if (right) {
      blocks.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: NO_BORDERS,
          rows: [
            new TableRow({
              children: [left, right].map(
                (s) =>
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    borders: NO_BORDERS,
                    children: [
                      makePara('', font, sizePt, { spaceBeforeTwips: 480, spaceAfterTwips: 20 }),
                      makePara('_______________________________', font, sizePt, { spaceAfterTwips: 40 }),
                      makePara(s.nombre.toUpperCase(), font, sizePt, { spaceAfterTwips: 20 }),
                      makePara(s.cargo, font, sizePt, { spaceAfterTwips: 160 }),
                    ],
                  })
              ),
            }),
          ],
        })
      );
    } else {
      blocks.push(
        makePara('', font, sizePt, { spaceBeforeTwips: 480, spaceAfterTwips: 20 }),
        makePara('_______________________________', font, sizePt, {
          align: signers.length > 1 ? AlignmentType.CENTER : AlignmentType.LEFT,
          spaceAfterTwips: 40,
        }),
        makePara(left.nombre.toUpperCase(), font, sizePt, {
          align: signers.length > 1 ? AlignmentType.CENTER : AlignmentType.LEFT,
          spaceAfterTwips: 20,
        }),
        makePara(left.cargo, font, sizePt, {
          align: signers.length > 1 ? AlignmentType.CENTER : AlignmentType.LEFT,
          spaceAfterTwips: 160,
        })
      );
    }
  }
  return blocks;
}

function buildHeader(
  corp: CorporateConfig,
  format: DocumentFormatConfig,
  logo: LoadedLogo | null,
  subsequentLine?: string
): Header {
  const accent = getAccentHex(format.visualStyle);
  const font = format.fontFamily;
  const children: (Paragraph | Table)[] = [];

  if (format.showZona1) {
    const targetH = 54;
    const targetW = logo ? Math.round((logo.widthPx / logo.heightPx) * targetH) : 54;

    const leftChildren: Paragraph[] = [
      makePara(corp.razonSocial, font, 11, { bold: true, color: accent, spaceAfterTwips: 20 }),
      makePara(`NIT ${corp.nit}`, font, 9, { color: '4B5563', spaceAfterTwips: 20 }),
    ];
    if (subsequentLine) {
      leftChildren.push(makePara(subsequentLine, font, 9, { color: '6B7280', spaceAfterTwips: 0 }));
    }

    const rowCells: TableCell[] = [];
    if (logo) {
      rowCells.push(
        new TableCell({
          width: { size: 15, type: WidthType.PERCENTAGE },
          borders: NO_BORDERS,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              children: [
                new ImageRun({
                  type: 'png',
                  data: logo.bytes,
                  transformation: { width: targetW, height: targetH },
                }),
              ],
            }),
          ],
        })
      );
    }
    rowCells.push(
      new TableCell({
        width: { size: format.showZona3 ? 55 : logo ? 85 : 100, type: WidthType.PERCENTAGE },
        borders: NO_BORDERS,
        verticalAlign: VerticalAlign.CENTER,
        children: leftChildren,
      })
    );

    if (format.showZona3) {
      rowCells.push(
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          borders: THIN_BORDERS,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            makePara('REGISTRO Y RADICACIÓN', font, 8, { bold: true, color: accent, spaceAfterTwips: 20 }),
            makePara(`No. ${format.radicadoNumero || '____________'}`, font, 8, { spaceAfterTwips: 20 }),
            makePara(`Fecha: ${format.radicadoFechaHora || '________'}`, font, 8, { spaceAfterTwips: 0 }),
          ],
        })
      );
    }

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: NO_BORDERS,
        rows: [new TableRow({ children: rowCells })],
      })
    );

    children.push(
      new Paragraph({
        border: {
          bottom: { style: BorderStyle.SINGLE, size: format.visualStyle === 'institucional' ? 8 : 4, color: accent },
        },
        spacing: { before: 40, after: 120 },
        children: [],
      })
    );
  } else if (subsequentLine) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          makeRun(`${subsequentLine}   |   Página `, font, 9, { color: '6B7280' }),
          new TextRun({ children: [PageNumber.CURRENT], font, size: 18, color: '6B7280' }),
        ],
      })
    );
  }

  return new Header({ children });
}

function buildFooter(corp: CorporateConfig, format: DocumentFormatConfig): Footer {
  if (!format.showZona2) {
    return new Footer({ children: [] });
  }
  const font = format.fontFamily;
  const parts = [
    `${corp.direccion}, ${corp.municipio}, ${corp.pais}`,
    `Correo: ${corp.correo}`,
  ];
  if (corp.telefonos.trim()) parts.push(`Tel: ${corp.telefonos.trim()}`);
  if (corp.sitioWeb.trim()) parts.push(corp.sitioWeb.trim());

  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'E5E7EB' } },
        spacing: { before: 80, after: 20 },
        children: [makeRun(parts.join('  ·  '), font, 9, { color: '4B5563' })],
      }),
    ],
  });
}

function addMultilineBody(
  target: (Paragraph | Table)[],
  bodyText: string,
  font: string,
  sizePt: number,
  semibloqueIndent: boolean
) {
  const paragraphs = bodyText.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  if (paragraphs.length === 0) return;
  for (const p of paragraphs) {
    target.push(
      makePara(p.replace(/\n/g, ' ').trim(), font, sizePt, {
        indentFirstLineCm: semibloqueIndent ? 1.0 : undefined,
        spaceAfterTwips: 160,
      })
    );
  }
}

function appendSpecialLines(
  target: (Paragraph | Table)[],
  opts: { anexos?: string; copias?: string; redactor?: string; transcriptor?: string },
  font: string,
  baseSizePt: number
) {
  const smallPt = Math.max(9, baseSizePt - 2);
  const lines: string[] = [];
  if (opts.anexos?.trim()) lines.push(`Anexos: ${opts.anexos.trim()}`);
  if (opts.copias?.trim()) lines.push(`Copia: ${opts.copias.trim()}`);
  lines.forEach((l, i) =>
    target.push(makePara(l, font, smallPt, { spaceBeforeTwips: i === 0 ? 160 : 0, spaceAfterTwips: 40 }))
  );
  if (opts.redactor?.trim()) {
    target.push(makePara(`Redactor: ${opts.redactor.trim()}`, font, smallPt, { spaceBeforeTwips: 80, spaceAfterTwips: 20 }));
  }
  if (opts.transcriptor?.trim()) {
    target.push(makePara(`Transcriptor: ${opts.transcriptor.trim()}`, font, smallPt, { spaceAfterTwips: 40 }));
  }
}

export async function exportDocumentToDocx(
  moduleId: DocumentModuleId,
  data: AnyDocumentData,
  format: DocumentFormatConfig,
  corp: CorporateConfig,
  fileName: string
): Promise<void> {
  const logo = await loadLogoAsPngBytes(corp.logoUrl);
  const font = format.fontFamily;
  const pt = format.fontSizePt;
  const accent = getAccentHex(format.visualStyle);

  let pageW = cmToTwips(21.59);
  let pageH = cmToTwips(27.94);
  if (format.pageSize === 'oficio') {
    pageW = cmToTwips(21.59);
    pageH = cmToTwips(33.0);
  } else if (format.pageSize === 'a4') {
    pageW = cmToTwips(21.0);
    pageH = cmToTwips(29.7);
  }

  if (moduleId === 'sobre') {
    const s = data as SobreData;
    pageW = cmToTwips(s.anchoCm || 24.1);
    pageH = cmToTwips(s.altoCm || 10.5);
  } else if (moduleId === 'tarjeta') {
    const t = data as TarjetaProtocolariaData;
    pageW = cmToTwips(t.anchoCm || 15);
    pageH = cmToTwips(t.altoCm || 10);
  }

  const children: (Paragraph | Table)[] = [];
  const isBloqueOrSemi =
    format.distributionStyle === 'bloque' || format.distributionStyle === 'semibloque';
  const isSemi = format.distributionStyle === 'semibloque';

  // BUILD MODULE CONTENT
  if (moduleId === 'carta') {
    const d = data as CartaData;
    if (isBloqueOrSemi) {
      const topLines: { text: string }[] = [];
      if (d.codigo.trim()) topLines.push({ text: d.codigo.trim() });
      topLines.push({ text: d.ciudadFecha });
      children.push(makeRightHalfBlock(topLines, font, pt, 240));
    } else {
      if (d.codigo.trim()) children.push(makePara(d.codigo.trim(), font, pt, { spaceAfterTwips: 120 }));
      children.push(makePara(d.ciudadFecha, font, pt, { spaceAfterTwips: 260 }));
    }

    const destLines = [
      d.destinatarioTratamiento,
      d.destinatarioNombre.toUpperCase(),
      d.destinatarioCargo,
      d.destinatarioOrganizacion,
      d.destinatarioDireccion,
      d.sobreVentanilla ? d.destinatarioCiudadDepto.toUpperCase() : d.destinatarioCiudadDepto,
      d.destinatarioPais ? (d.sobreVentanilla ? d.destinatarioPais.toUpperCase() : d.destinatarioPais) : '',
    ].filter((x) => x && x.trim().length > 0);
    destLines.forEach((line, idx) =>
      children.push(makePara(line, font, pt, { spaceAfterTwips: idx === destLines.length - 1 ? 240 : 20 }))
    );

    if (d.asunto.trim()) {
      children.push(makePara(`Asunto: ${d.asunto}`, font, pt, { spaceAfterTwips: 180 }));
    }
    if (d.saludo.trim()) {
      children.push(makePara(d.saludo, font, pt, { spaceAfterTwips: 180 }));
    }
    addMultilineBody(children, d.cuerpo, font, pt, isSemi);
    if (d.despedida.trim()) {
      children.push(makePara(d.despedida, font, pt, { spaceBeforeTwips: 100, spaceAfterTwips: 420 }));
    }

    const sigLines = [
      ...(d.incluirLineaFirma ? [{ text: '_______________________________' }] : []),
      { text: d.remitenteNombre.toUpperCase() },
      { text: d.remitenteCargo },
    ];
    if (isBloqueOrSemi) {
      children.push(makeRightHalfBlock(sigLines, font, pt, 180));
    } else {
      sigLines.forEach((l, i) =>
        children.push(makePara(l.text, font, pt, { spaceAfterTwips: i === sigLines.length - 1 ? 180 : 20 }))
      );
    }

    appendSpecialLines(children, { anexos: d.anexos, copias: d.copias, redactor: d.redactor, transcriptor: d.transcriptor }, font, pt);
  } else if (moduleId === 'memorando') {
    const d = data as MemorandoData;
    children.push(makePara('MEMORANDO', font, pt, { bold: true, align: AlignmentType.CENTER, color: accent, spaceAfterTwips: 200 }));
    if (isBloqueOrSemi) {
      const topLines: { text: string }[] = [];
      if (d.codigo.trim()) topLines.push({ text: d.codigo.trim() });
      topLines.push({ text: d.ciudadFecha });
      children.push(makeRightHalfBlock(topLines, font, pt, 220));
    } else {
      if (d.codigo.trim()) children.push(makePara(d.codigo.trim(), font, pt, { spaceAfterTwips: 100 }));
      children.push(makePara(d.ciudadFecha, font, pt, { spaceAfterTwips: 220 }));
    }

    const paraVal =
      d.opcionEncabezamiento === 'tercera'
        ? d.paraCargo
        : `${d.paraTratamiento ? d.paraTratamiento + ' ' : ''}${d.paraNombre}, ${d.paraCargo}`;
    const deVal =
      d.opcionEncabezamiento === 'primera' ? `${d.deNombre}, ${d.deCargo}` : d.deCargo;

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: NO_BORDERS,
        rows: [
          ['PARA:', paraVal],
          ['DE:', deVal],
          ['ASUNTO:', d.asunto],
        ].map(
          ([lbl, val]) =>
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 18, type: WidthType.PERCENTAGE },
                  borders: NO_BORDERS,
                  children: [makePara(lbl, font, pt, { spaceAfterTwips: 80 })],
                }),
                new TableCell({
                  width: { size: 82, type: WidthType.PERCENTAGE },
                  borders: NO_BORDERS,
                  children: [makePara(val, font, pt, { spaceAfterTwips: 80 })],
                }),
              ],
            })
        ),
      })
    );

    children.push(makePara('', font, pt, { spaceAfterTwips: 120 }));
    addMultilineBody(children, d.cuerpo, font, pt, false);
    if (d.despedida.trim()) {
      children.push(makePara(d.despedida, font, pt, { spaceBeforeTwips: 100, spaceAfterTwips: 420 }));
    }

    const sigLines =
      d.opcionEncabezamiento === 'primera'
        ? [{ text: '_______________________________' }, { text: 'Firma' }]
        : [{ text: '_______________________________' }, { text: d.deNombre.toUpperCase() }];
    if (isBloqueOrSemi) {
      children.push(makeRightHalfBlock(sigLines, font, pt, 180));
    } else {
      sigLines.forEach((l) => children.push(makePara(l.text, font, pt, { spaceAfterTwips: 30 })));
    }
    appendSpecialLines(children, { anexos: d.anexos, copias: d.copias, redactor: d.redactor, transcriptor: d.transcriptor }, font, pt);
  } else if (moduleId === 'circular') {
    const d = data as CircularData;
    children.push(makePara(d.consecutivo || 'CIRCULAR', font, pt, { bold: true, align: AlignmentType.CENTER, color: accent, spaceAfterTwips: 200 }));
    if (isBloqueOrSemi) {
      const topLines: { text: string }[] = [];
      if (d.codigo.trim()) topLines.push({ text: d.codigo.trim() });
      topLines.push({ text: d.ciudadFecha });
      children.push(makeRightHalfBlock(topLines, font, pt, 220));
    } else {
      if (d.codigo.trim()) children.push(makePara(d.codigo.trim(), font, pt, { spaceAfterTwips: 100 }));
      children.push(makePara(d.ciudadFecha, font, pt, { spaceAfterTwips: 220 }));
    }

    if (d.modalidad === 'circular_general') {
      children.push(makePara(`PARA ${d.grupoDestinatario.toUpperCase()}`, font, pt, { spaceAfterTwips: 160 }));
    } else {
      [
        d.cartaDestinatarioTratamiento,
        d.cartaDestinatarioNombre.toUpperCase(),
        d.cartaDestinatarioCargo,
        d.cartaDestinatarioOrg,
      ]
        .filter(Boolean)
        .forEach((l) => children.push(makePara(l, font, pt, { spaceAfterTwips: 20 })));
      children.push(makePara('', font, pt, { spaceAfterTwips: 120 }));
    }
    children.push(makePara(`ASUNTO: ${d.asunto}`, font, pt, { spaceAfterTwips: 200 }));
    addMultilineBody(children, d.cuerpo, font, pt, false);
    if (d.despedida.trim()) {
      children.push(makePara(d.despedida, font, pt, { spaceBeforeTwips: 100, spaceAfterTwips: 420 }));
    }
    const sigLines = [
      { text: '_______________________________' },
      { text: d.responsableNombre.toUpperCase() },
      { text: d.responsableCargo },
    ];
    if (isBloqueOrSemi) {
      children.push(makeRightHalfBlock(sigLines, font, pt, 160));
    } else {
      sigLines.forEach((l) => children.push(makePara(l.text, font, pt, { spaceAfterTwips: 30 })));
    }
    appendSpecialLines(children, { anexos: d.anexos, copias: d.copias, transcriptor: d.transcriptor }, font, pt);
  } else if (moduleId === 'acta') {
    const d = data as ActaData;
    children.push(makePara(d.tituloGrupo.toUpperCase(), font, pt, { bold: true, align: AlignmentType.CENTER, color: accent, spaceAfterTwips: 80 }));
    children.push(makePara(`${d.numeroActa.toUpperCase()} (${d.caracter.toUpperCase()})`, font, pt, { bold: true, align: AlignmentType.CENTER, spaceAfterTwips: 240 }));

    const asistentes = d.participantes.filter((p) => p.condicion === 'Asistente');
    const invitados = d.participantes.filter((p) => p.condicion === 'Invitado');
    const ausentes = d.participantes.filter((p) => p.condicion.startsWith('Ausente'));

    const metaRows: [string, string[]][] = [
      ['FECHA:', [d.ciudadFecha]],
      ['HORA:', [`De las ${d.horaInicio} horas a las ${d.horaFin} horas`]],
      ['LUGAR:', [d.lugar]],
      [
        'ASISTENTES:',
        asistentes.map(
          (a) =>
            `${a.nombre}, ${a.cargo}${a.dependencia ? ` (${a.dependencia})` : ''}${a.representacion ? ` — en representación de ${a.representacion}` : ''}`
        ),
      ],
    ];
    if (invitados.length > 0) {
      metaRows.push(['INVITADOS:', invitados.map((i) => `${i.nombre}, ${i.cargo}`)]);
    }
    if (ausentes.length > 0) {
      metaRows.push(['AUSENTES:', ausentes.map((a) => `${a.nombre}, ${a.cargo} (${a.condicion.includes('con excusa') ? 'con excusa' : 'sin excusa'})`)]);
    }

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: NO_BORDERS,
        rows: metaRows.map(
          ([lbl, vals]) =>
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 22, type: WidthType.PERCENTAGE },
                  borders: NO_BORDERS,
                  children: [makePara(lbl, font, pt, { bold: true, spaceAfterTwips: 80 })],
                }),
                new TableCell({
                  width: { size: 78, type: WidthType.PERCENTAGE },
                  borders: NO_BORDERS,
                  children: (vals.length ? vals : ['—']).map((v, idx) =>
                    makePara(v, font, pt, { spaceAfterTwips: idx === vals.length - 1 ? 100 : 20 })
                  ),
                }),
              ],
            })
        ),
      })
    );

    children.push(makePara('ORDEN DEL DÍA:', font, pt, { bold: true, spaceBeforeTwips: 160, spaceAfterTwips: 100 }));
    d.ordenDelDia.forEach((tema, idx) => {
      children.push(makePara(`${idx + 1}. ${tema}`, font, pt, { spaceAfterTwips: 60 }));
    });

    children.push(makePara('DESARROLLO:', font, pt, { bold: true, spaceBeforeTwips: 180, spaceAfterTwips: 120 }));
    d.desarrollo.forEach((punto) => {
      children.push(makePara(`${punto.numero}. ${punto.tema}`, font, pt, { bold: true, spaceBeforeTwips: 80, spaceAfterTwips: 80 }));
      if (punto.descripcion.trim()) addMultilineBody(children, punto.descripcion, font, pt, false);
      if (punto.intervenciones.trim()) {
        children.push(makePara(`Intervenciones: ${punto.intervenciones}`, font, pt, { spaceAfterTwips: 80 }));
      }
      if (punto.decisiones.trim()) {
        children.push(makePara(`Decisiones: ${punto.decisiones}`, font, pt, { spaceAfterTwips: 100 }));
      }
      if (punto.votacionAFavor || punto.votacionEnContra || punto.votacionBlanco) {
        children.push(
          makePara(
            `Votación — A favor: ${punto.votacionAFavor || '0'}, En contra: ${punto.votacionEnContra || '0'}, En blanco: ${punto.votacionBlanco || '0'}.`,
            font,
            pt,
            { spaceAfterTwips: 120 }
          )
        );
      }
    });

    if (d.compromisos.length > 0) {
      children.push(makePara('COMPROMISOS:', font, pt, { bold: true, spaceBeforeTwips: 180, spaceAfterTwips: 100 }));
      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: THIN_BORDERS,
          rows: [
            new TableRow({
              children: ['Actividad / Compromiso', 'Responsable', 'Fecha límite', 'Observaciones'].map(
                (h) =>
                  new TableCell({
                    borders: THIN_BORDERS,
                    children: [makePara(h, font, Math.max(9, pt - 1), { bold: true, spaceAfterTwips: 40 })],
                  })
              ),
            }),
            ...d.compromisos.map(
              (c) =>
                new TableRow({
                  children: [c.actividad, c.responsable, c.fechaCumplimiento, c.observaciones].map(
                    (val) =>
                      new TableCell({
                        borders: THIN_BORDERS,
                        children: [makePara(val || '—', font, Math.max(9, pt - 1), { spaceAfterTwips: 40 })],
                      })
                  ),
                })
            ),
          ],
        })
      );
    }

    if (d.convocatoriaSiguiente.trim()) {
      children.push(makePara(`CONVOCATORIA: ${d.convocatoriaSiguiente}`, font, pt, { spaceBeforeTwips: 200, spaceAfterTwips: 140 }));
    }

    children.push(...makePairSignaturesTable(d.firmantes, font, pt));
    appendSpecialLines(children, { anexos: d.anexos, transcriptor: d.transcriptor }, font, pt);
  } else if (moduleId === 'informe') {
    const d = data as InformeData;
    if (d.clase === 'extenso') {
      // Portada GTC 185 Fig. 21
      if (d.codigo.trim()) children.push(makePara(d.codigo, font, pt, { align: AlignmentType.RIGHT, spaceAfterTwips: 600 }));
      children.push(makePara(corp.razonSocial, font, pt + 1, { bold: true, align: AlignmentType.CENTER, color: accent, spaceAfterTwips: 100 }));
      children.push(makePara(d.dependencia.toUpperCase(), font, pt, { align: AlignmentType.CENTER, spaceAfterTwips: 900 }));
      children.push(makePara(d.titulo.toUpperCase(), font, pt + 2, { bold: true, align: AlignmentType.CENTER, spaceAfterTwips: 140 }));
      if (d.subtitulo.trim()) {
        children.push(makePara(d.subtitulo, font, pt, { align: AlignmentType.CENTER, spaceAfterTwips: 600 }));
      }
      children.push(makePara('ELABORADO POR:', font, pt, { bold: true, align: AlignmentType.CENTER, spaceBeforeTwips: 500, spaceAfterTwips: 80 }));
      children.push(makePara(d.responsables.toUpperCase(), font, pt, { align: AlignmentType.CENTER, spaceAfterTwips: 900 }));
      children.push(makePara(d.ciudadFecha.toUpperCase(), font, pt, { align: AlignmentType.CENTER, spaceAfterTwips: 100 }));
      children.push(new Paragraph({ children: [new PageBreak()] }));

      // Tabla de contenido
      children.push(makePara('CONTENIDO', font, pt + 1, { bold: true, align: AlignmentType.CENTER, color: accent, spaceAfterTwips: 220 }));
      if (d.introduccion.trim()) children.push(makePara('INTRODUCCIÓN', font, pt, { spaceAfterTwips: 80 }));
      if (d.objetivos.trim()) children.push(makePara('OBJETIVOS', font, pt, { spaceAfterTwips: 80 }));
      if (d.metodologia.trim()) children.push(makePara('METODOLOGÍA', font, pt, { spaceAfterTwips: 80 }));
      d.capitulos.forEach((c) => children.push(makePara(`${c.numero}. ${c.titulo}`, font, pt, { spaceAfterTwips: 80 })));
      if (d.resultados.trim()) children.push(makePara('RESULTADOS', font, pt, { spaceAfterTwips: 80 }));
      if (d.analisis.trim()) children.push(makePara('ANÁLISIS', font, pt, { spaceAfterTwips: 80 }));
      if (d.conclusiones.trim()) children.push(makePara('CONCLUSIONES', font, pt, { spaceAfterTwips: 80 }));
      if (d.recomendaciones.trim()) children.push(makePara('RECOMENDACIONES', font, pt, { spaceAfterTwips: 80 }));
      if (d.bibliografia.trim()) children.push(makePara('BIBLIOGRAFÍA', font, pt, { spaceAfterTwips: 80 }));
      children.push(new Paragraph({ children: [new PageBreak()] }));
    } else {
      // Encabezamiento informe corto / resumen ejecutivo
      children.push(makePara(`${d.dependencia}${d.codigo ? ` ${d.codigo}` : ''}`, font, pt, { spaceAfterTwips: 160 }));
      children.push(makePara(d.titulo.toUpperCase(), font, pt, { bold: true, align: AlignmentType.CENTER, color: accent, spaceAfterTwips: 220 }));
      children.push(makePara(`FECHA: ${d.ciudadFecha}`, font, pt, { spaceAfterTwips: 80 }));
      children.push(makePara(`ELABORADO POR: ${d.responsables}`, font, pt, { spaceAfterTwips: 80 }));
      if (d.destinatario.trim()) children.push(makePara(`DESTINATARIO: ${d.destinatario}`, font, pt, { spaceAfterTwips: 180 }));
    }

    if (d.introduccion.trim()) {
      children.push(makePara('INTRODUCCIÓN', font, pt, { bold: true, spaceBeforeTwips: 120, spaceAfterTwips: 100 }));
      addMultilineBody(children, d.introduccion, font, pt, false);
    }
    if (d.objetivos.trim()) {
      children.push(makePara('OBJETIVO(S):', font, pt, { bold: true, spaceBeforeTwips: 120, spaceAfterTwips: 100 }));
      addMultilineBody(children, d.objetivos, font, pt, false);
    }
    if (d.metodologia.trim() && d.clase === 'extenso') {
      children.push(makePara('METODOLOGÍA', font, pt, { bold: true, spaceBeforeTwips: 120, spaceAfterTwips: 100 }));
      addMultilineBody(children, d.metodologia, font, pt, false);
    }

    d.capitulos.forEach((cap) => {
      children.push(makePara(`${cap.numero}. ${cap.titulo.toUpperCase()}`, font, pt, { bold: true, spaceBeforeTwips: 160, spaceAfterTwips: 100 }));
      addMultilineBody(children, cap.contenido, font, pt, false);
    });

    if (d.resultados.trim() && d.clase === 'extenso') {
      children.push(makePara('RESULTADOS', font, pt, { bold: true, spaceBeforeTwips: 140, spaceAfterTwips: 100 }));
      addMultilineBody(children, d.resultados, font, pt, false);
    }
    if (d.analisis.trim() && d.clase === 'extenso') {
      children.push(makePara('ANÁLISIS', font, pt, { bold: true, spaceBeforeTwips: 140, spaceAfterTwips: 100 }));
      addMultilineBody(children, d.analisis, font, pt, false);
    }

    for (const tabla of d.tablas) {
      children.push(makePara(tabla.titulo, font, pt, { bold: true, spaceBeforeTwips: 140, spaceAfterTwips: 80 }));
      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: THIN_BORDERS,
          rows: [
            new TableRow({
              children: tabla.columnas.map(
                (col) =>
                  new TableCell({
                    borders: THIN_BORDERS,
                    children: [makePara(col, font, Math.max(9, pt - 1), { bold: true, spaceAfterTwips: 40 })],
                  })
              ),
            }),
            ...tabla.filas.map(
              (row) =>
                new TableRow({
                  children: tabla.columnas.map(
                    (_, cIdx) =>
                      new TableCell({
                        borders: THIN_BORDERS,
                        children: [makePara(row[cIdx] || '', font, Math.max(9, pt - 1), { spaceAfterTwips: 40 })],
                      })
                  ),
                })
            ),
          ],
        })
      );
    }

    for (const g of d.graficos) {
      children.push(makePara(`${g.titulo} (${g.unidad})`, font, pt, { bold: true, spaceBeforeTwips: 140, spaceAfterTwips: 80 }));
      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: THIN_BORDERS,
          rows: g.datos.map(
            (ptDato) =>
              new TableRow({
                children: [
                  new TableCell({ borders: THIN_BORDERS, children: [makePara(ptDato.etiqueta, font, Math.max(9, pt - 1), { spaceAfterTwips: 40 })] }),
                  new TableCell({ borders: THIN_BORDERS, children: [makePara(`${ptDato.valor} ${g.unidad}`, font, Math.max(9, pt - 1), { align: AlignmentType.RIGHT, spaceAfterTwips: 40 })] }),
                ],
              })
          ),
        })
      );
    }

    if (d.conclusiones.trim()) {
      children.push(makePara('CONCLUSIONES', font, pt, { bold: true, spaceBeforeTwips: 160, spaceAfterTwips: 100 }));
      addMultilineBody(children, d.conclusiones, font, pt, false);
    }
    if (d.recomendaciones.trim()) {
      children.push(makePara('RECOMENDACIONES', font, pt, { bold: true, spaceBeforeTwips: 160, spaceAfterTwips: 100 }));
      addMultilineBody(children, d.recomendaciones, font, pt, false);
    }
    if (d.bibliografia.trim()) {
      children.push(makePara('BIBLIOGRAFÍA', font, pt, { bold: true, spaceBeforeTwips: 160, spaceAfterTwips: 100 }));
      addMultilineBody(children, d.bibliografia, font, pt, false);
    }

    children.push(...makePairSignaturesTable(d.firmantes, font, pt));
    appendSpecialLines(children, { anexos: d.anexos, transcriptor: d.transcriptor }, font, pt);
  } else if (moduleId === 'certificado') {
    const d = data as CertificadoConstanciaData;
    const isBloque = format.distributionStyle === 'bloque' || format.distributionStyle === 'semibloque';
    if (d.ubicacionFecha === 'inicio') {
      if (isBloque) {
        const lines = [];
        if (d.codigo.trim()) lines.push({ text: d.codigo });
        lines.push({ text: d.ciudadFecha });
        children.push(makeRightHalfBlock(lines, font, pt, 360));
      } else {
        if (d.codigo.trim()) children.push(makePara(d.codigo, font, pt, { spaceAfterTwips: 120 }));
        children.push(makePara(d.ciudadFecha, font, pt, { spaceAfterTwips: 360 }));
      }
    } else if (d.codigo.trim()) {
      children.push(makePara(d.codigo, font, pt, { align: isBloque ? AlignmentType.RIGHT : AlignmentType.LEFT, spaceAfterTwips: 360 }));
    }

    children.push(makePara(d.cargoExpide.toUpperCase(), font, pt, { bold: true, align: AlignmentType.CENTER, spaceAfterTwips: 360 }));
    children.push(
      makePara(d.categoria === 'certificado' ? 'CERTIFICA:' : 'HACE CONSTAR:', font, pt + 1, {
        bold: true,
        align: AlignmentType.CENTER,
        color: accent,
        spaceAfterTwips: 260,
      })
    );

    addMultilineBody(children, d.cuerpoParrafos, font, pt, false);
    if (d.motivoDestino.trim()) {
      children.push(makePara(d.motivoDestino, font, pt, { spaceAfterTwips: 220 }));
    }
    if (d.ubicacionFecha === 'final') {
      children.push(makePara(d.ciudadFecha, font, pt, { spaceAfterTwips: 360 }));
    }

    const sigLines = [
      { text: '_______________________________' },
      { text: d.expideNombre.toUpperCase() },
      { text: d.expideCargo },
    ];
    if (isBloque) {
      children.push(makeRightHalfBlock(sigLines, font, pt, 200));
    } else {
      sigLines.forEach((l) => children.push(makePara(l.text, font, pt, { spaceAfterTwips: 30 })));
    }
    appendSpecialLines(children, { transcriptor: d.transcriptor }, font, pt);
  } else if (moduleId === 'hoja_vida') {
    const d = data as HojaVidaData;
    children.push(makePara('HOJA DE VIDA CORPORATIVA', font, pt + 1, { bold: true, align: AlignmentType.CENTER, color: accent, spaceAfterTwips: 140 }));
    children.push(
      makePara(`${d.primerApellido} ${d.segundoApellido} ${d.nombres}`.trim().toUpperCase(), font, pt, {
        bold: true,
        align: AlignmentType.CENTER,
        spaceAfterTwips: 220,
      })
    );

    const addSectionTable = (title: string, rows: [string, string][]) => {
      children.push(makePara(title, font, pt, { bold: true, color: accent, spaceBeforeTwips: 140, spaceAfterTwips: 80 }));
      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: THIN_BORDERS,
          rows: rows
            .filter(([, v]) => v && v.trim())
            .map(
              ([k, v]) =>
                new TableRow({
                  children: [
                    new TableCell({ width: { size: 35, type: WidthType.PERCENTAGE }, borders: THIN_BORDERS, children: [makePara(k, font, Math.max(9, pt - 1), { bold: true, spaceAfterTwips: 40 })] }),
                    new TableCell({ width: { size: 65, type: WidthType.PERCENTAGE }, borders: THIN_BORDERS, children: [makePara(v, font, Math.max(9, pt - 1), { spaceAfterTwips: 40 })] }),
                  ],
                })
            ),
        })
      );
    };

    addSectionTable('1. DATOS BÁSICOS', [
      ['Identificación', `${d.tipoIdentificacion} ${d.numeroIdentificacion}${d.lugarExpedicion ? ` de ${d.lugarExpedicion}` : ''}`],
      ['Lugar y fecha de nacimiento', [d.lugarNacimiento, d.fechaNacimiento].filter(Boolean).join(', ')],
      ['Género / Estado civil / Hijos', [d.genero, d.estadoCivil, d.numeroHijos ? `${d.numeroHijos} hijo(s)` : ''].filter(Boolean).join(' · ')],
      ['Domicilio', d.direccion],
      ['Teléfono / Correo', [d.telefono, d.correo].filter(Boolean).join(' · ')],
    ]);

    addSectionTable('2. INFORMACIÓN LABORAL INSTITUCIONAL', [
      ['Organización', `${corp.razonSocial} (NIT ${corp.nit})`],
      ['Cargo actual / Dependencia', [d.cargoActual, d.sucursalDependencia].filter(Boolean).join(' — ')],
      ['Fecha de ingreso / Vinculación', [d.fechaIngresoOrg, d.tipoVinculacion, d.estatusVinculacion].filter(Boolean).join(' · ')],
      ['Jefe inmediato', d.jefeInmediato],
      ['Responsabilidades', d.responsabilidadesActuales],
      ['Seguridad social (EPS / Pensión / ARL)', [d.eps, d.fondoPensiones, d.arl].filter(Boolean).join(' · ')],
      ['Visas vigentes', d.visasInfo],
    ]);

    if (d.academicos.length > 0) {
      children.push(makePara('3. INFORMACIÓN ACADÉMICA', font, pt, { bold: true, color: accent, spaceBeforeTwips: 160, spaceAfterTwips: 80 }));
      d.academicos.forEach((a) => {
        children.push(makePara(`${a.nivel} — ${a.tituloObtenido}`, font, pt, { bold: true, spaceAfterTwips: 20 }));
        children.push(makePara(`${a.institucion} (${a.ciudadPais}) · ${a.fechaInicio} a ${a.fechaFinalizacion}`, font, Math.max(9, pt - 1), { spaceAfterTwips: 100 }));
      });
    }

    if (d.formacionComplementaria.length > 0) {
      children.push(makePara('4. FORMACIÓN COMPLEMENTARIA E IDIOMAS', font, pt, { bold: true, color: accent, spaceBeforeTwips: 160, spaceAfterTwips: 80 }));
      d.formacionComplementaria.forEach((f) => {
        children.push(makePara(`${f.tipo}: ${f.nombre} — ${f.institucion} (${f.duracionNivel}, ${f.fecha})`, font, Math.max(9, pt - 1), { spaceAfterTwips: 60 }));
      });
    }

    if (d.experiencias.length > 0) {
      children.push(makePara('5. EXPERIENCIA LABORAL', font, pt, { bold: true, color: accent, spaceBeforeTwips: 160, spaceAfterTwips: 80 }));
      d.experiencias.forEach((ex) => {
        children.push(makePara(`${ex.empresa} — ${ex.cargo}`, font, pt, { bold: true, spaceAfterTwips: 20 }));
        children.push(makePara(`Periodo: ${ex.fechaIngreso} a ${ex.fechaRetiro}`, font, Math.max(9, pt - 1), { spaceAfterTwips: 20 }));
        if (ex.funciones.trim()) children.push(makePara(ex.funciones, font, Math.max(9, pt - 1), { spaceAfterTwips: 100 }));
      });
    }

    if (d.investigacionesDistinciones.length > 0) {
      children.push(makePara('6. INVESTIGACIONES, PUBLICACIONES Y DISTINCIONES', font, pt, { bold: true, color: accent, spaceBeforeTwips: 160, spaceAfterTwips: 80 }));
      d.investigacionesDistinciones.forEach((inv) => {
        children.push(makePara(`${inv.titulo} — ${inv.entidad} (${inv.fecha})`, font, Math.max(9, pt - 1), { spaceAfterTwips: 60 }));
      });
    }
  } else if (moduleId === 'sobre') {
    const d = data as SobreData;
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: NO_BORDERS,
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 33, type: WidthType.PERCENTAGE },
                borders: NO_BORDERS,
                children: [
                  makePara(corp.razonSocial, font, 10, { bold: true, color: accent, spaceAfterTwips: 20 }),
                  makePara(`NIT ${corp.nit}`, font, 9, { spaceAfterTwips: 20 }),
                  ...(d.dependenciaRemitente ? [makePara(d.dependenciaRemitente, font, 9, { spaceAfterTwips: 180 })] : []),
                  ...(d.mencionTercioIzquierdo ? [makePara(d.mencionTercioIzquierdo.toUpperCase(), font, 11, { bold: true, spaceBeforeTwips: 220, spaceAfterTwips: 40 })] : []),
                ],
              }),
              new TableCell({
                width: { size: 34, type: WidthType.PERCENTAGE },
                borders: NO_BORDERS,
                children: [
                  makePara('', font, pt, { spaceBeforeTwips: 400, spaceAfterTwips: 20 }),
                  makePara(d.destTratamiento, font, pt, { spaceAfterTwips: 20 }),
                  makePara(d.destinoTipo === 'internacional' ? d.destNombre.toUpperCase() : d.destNombre, font, pt, { spaceAfterTwips: 20 }),
                  ...(d.destCargo ? [makePara(d.destCargo, font, pt, { spaceAfterTwips: 20 })] : []),
                  ...(d.destOrganizacion ? [makePara(d.destOrganizacion, font, pt, { spaceAfterTwips: 20 })] : []),
                  makePara(d.destDireccion, font, pt, { spaceAfterTwips: 20 }),
                  ...(d.destTelefonoEspecial ? [makePara(`Tel: ${d.destTelefonoEspecial}`, font, pt, { spaceAfterTwips: 20 })] : []),
                  makePara(d.destCiudadDepto, font, pt, { spaceAfterTwips: 20 }),
                  ...(d.destinoTipo === 'internacional' && d.destPais ? [makePara(d.destPais, font, pt, { spaceAfterTwips: 20 })] : []),
                ],
              }),
              new TableCell({
                width: { size: 33, type: WidthType.PERCENTAGE },
                borders: NO_BORDERS,
                children: [makePara('USO POSTAL', font, 8, { align: AlignmentType.RIGHT, color: '9CA3AF' })],
              }),
            ],
          }),
        ],
      })
    );
  } else if (moduleId === 'correo') {
    const d = data as MensajeElectronicoData;
    children.push(makePara('MENSAJE ELECTRÓNICO CORPORATIVO', font, pt, { bold: true, color: accent, spaceAfterTwips: 160 }));
    const emailMeta: [string, string][] = [
      ['De:', `${d.remitenteNombre} <${d.remitenteCorreo}>`],
      ['Para:', d.destinatario],
      ...(d.copiaCC.trim() ? [['CC:', d.copiaCC] as [string, string]] : []),
      ...(d.copiaOcultaCCO.trim() ? [['CCO:', d.copiaOcultaCCO] as [string, string]] : []),
      ['Asunto:', d.asunto],
      ...(d.adjuntosReferencia.trim() ? [['Adjuntos:', d.adjuntosReferencia] as [string, string]] : []),
    ];
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: THIN_BORDERS,
        rows: emailMeta.map(
          ([k, v]) =>
            new TableRow({
              children: [
                new TableCell({ width: { size: 18, type: WidthType.PERCENTAGE }, borders: THIN_BORDERS, children: [makePara(k, font, Math.max(9, pt - 1), { bold: true, spaceAfterTwips: 40 })] }),
                new TableCell({ width: { size: 82, type: WidthType.PERCENTAGE }, borders: THIN_BORDERS, children: [makePara(v, font, Math.max(9, pt - 1), { spaceAfterTwips: 40 })] }),
              ],
            })
        ),
      })
    );
    children.push(makePara(d.fechaReferencia, font, pt, { spaceBeforeTwips: 180, spaceAfterTwips: 140 }));
    if (d.saludo.trim()) children.push(makePara(d.saludo, font, pt, { spaceAfterTwips: 140 }));
    addMultilineBody(children, d.cuerpo, font, pt, false);
    if (d.despedida.trim()) children.push(makePara(d.despedida, font, pt, { spaceBeforeTwips: 80, spaceAfterTwips: 160 }));
    if (d.incluirFirmaInstitucional) {
      children.push(makePara(d.remitenteNombre, font, pt, { bold: true, spaceAfterTwips: 20 }));
      children.push(makePara(`${d.remitenteCargo} — ${corp.razonSocial}`, font, Math.max(9, pt - 1), { spaceAfterTwips: 20 }));
      children.push(makePara(`${corp.direccion}, ${corp.municipio}, ${corp.pais} · ${corp.correo}`, font, Math.max(9, pt - 2), { color: '4B5563', spaceAfterTwips: 20 }));
    }
  } else if (moduleId === 'tarjeta') {
    const d = data as TarjetaProtocolariaData;
    children.push(makePara(corp.razonSocial, font, pt + 1, { bold: true, align: AlignmentType.CENTER, color: accent, spaceAfterTwips: 160 }));
    if (d.tipo === 'invitacion') {
      if (d.destinatarioNombre.trim()) children.push(makePara(d.destinatarioNombre, font, pt, { align: AlignmentType.CENTER, spaceAfterTwips: 100 }));
      children.push(makePara(d.motivoInvitacion, font, pt, { align: AlignmentType.CENTER, spaceAfterTwips: 180 }));
      children.push(makePara(`Fecha: ${d.fechaEvento}`, font, pt, { spaceAfterTwips: 40 }));
      children.push(makePara(`Hora: ${d.horaEvento}`, font, pt, { spaceAfterTwips: 40 }));
      children.push(makePara(`Lugar: ${d.lugarEvento}`, font, pt, { spaceAfterTwips: 140 }));
      if (d.informacionAdicional.trim()) children.push(makePara(d.informacionAdicional, font, Math.max(9, pt - 1), { spaceAfterTwips: 120 }));
      if (d.datosConfirmacion.trim()) children.push(makePara(d.datosConfirmacion, font, Math.max(9, pt - 1), { italic: true, spaceAfterTwips: 120 }));
      children.push(makePara(d.ciudadFecha, font, Math.max(9, pt - 1), { align: AlignmentType.RIGHT }));
    } else if (d.tipo === 'presentacion') {
      children.push(makePara(d.remitenteNombre, font, pt + 1, { bold: true, align: AlignmentType.CENTER, spaceAfterTwips: 40 }));
      children.push(makePara(d.remitenteCargo, font, pt, { align: AlignmentType.CENTER, spaceAfterTwips: 120 }));
      children.push(makePara(`${corp.direccion}, ${corp.municipio}, ${corp.pais}`, font, 9, { align: AlignmentType.CENTER, spaceAfterTwips: 40 }));
      children.push(makePara(`${d.presentacionCorreo || corp.correo}${d.presentacionTelefono ? ` · ${d.presentacionTelefono}` : ''}`, font, 9, { align: AlignmentType.CENTER }));
    } else {
      if (d.destinatarioNombre.trim()) children.push(makePara(d.destinatarioNombre, font, pt, { bold: true, spaceAfterTwips: 120 }));
      addMultilineBody(children, d.cuerpoMensaje, font, pt, false);
      children.push(makePara(d.remitenteNombre, font, pt, { spaceBeforeTwips: 160, spaceAfterTwips: 20 }));
      children.push(makePara(d.remitenteCargo, font, pt, { spaceAfterTwips: 100 }));
      children.push(makePara(d.ciudadFecha, font, Math.max(9, pt - 1), { align: AlignmentType.RIGHT }));
    }
  }

  const isCartaInterna = moduleId === 'carta' && (data as CartaData).alcance === 'interna';
  const showHeadersFooters = !['sobre', 'tarjeta', 'correo'].includes(moduleId);

  const firstPageHeader = showHeadersFooters ? buildHeader(corp, format, logo) : undefined;
  const subsequentHeader = showHeadersFooters
    ? buildHeader(
        corp,
        isCartaInterna ? { ...format, showZona3: false } : format,
        logo,
        moduleId === 'carta'
          ? `${(data as CartaData).destinatarioNombre} — ${(data as CartaData).ciudadFecha}`
          : moduleId === 'circular'
            ? `${(data as CircularData).consecutivo}`
            : moduleId === 'acta'
              ? `${(data as ActaData).numeroActa}`
              : moduleId === 'informe'
                ? `${(data as InformeData).titulo}`
                : undefined
      )
    : undefined;

  const doc = new Document({
    creator: corp.razonSocial,
    title: fileName,
    description: 'Documento organizacional generado conforme a recomendaciones GTC 185:2009',
    sections: [
      {
        properties: {
          titlePage: isCartaInterna,
          page: {
            size: { width: pageW, height: pageH },
            margin: {
              top: cmToTwips(format.margins.topCm),
              bottom: cmToTwips(format.margins.bottomCm),
              left: cmToTwips(format.margins.leftCm),
              right: cmToTwips(format.margins.rightCm),
            },
          },
        },
        headers: showHeadersFooters
          ? {
              first: firstPageHeader,
              default: subsequentHeader,
            }
          : undefined,
        footers: showHeadersFooters
          ? {
              first: buildFooter(corp, format),
              default: isCartaInterna ? new Footer({ children: [] }) : buildFooter(corp, format),
            }
          : undefined,
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = fileName.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_-]+/g, '_').replace(/^_+|_+$/g, '') || 'documento_vaquimilk';
  a.href = url;
  a.download = `${safeName}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
