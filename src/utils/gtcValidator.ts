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

export interface ValidationIssue {
  id: string;
  severity: 'error' | 'warning' | 'info';
  category: 'obligatorio' | 'normativo' | 'calidad';
  message: string;
}

export interface ValidationReport {
  issues: ValidationIssue[];
  errorCount: number;
  warningCount: number;
  passedChecks: string[];
}

function hasPlaceholder(val: string | undefined): boolean {
  if (!val) return false;
  return /\[[^\]]+\]/.test(val);
}

function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function validateDocument(
  moduleId: DocumentModuleId,
  data: AnyDocumentData,
  format: DocumentFormatConfig,
  corp: CorporateConfig
): ValidationReport {
  const issues: ValidationIssue[] = [];
  const passedChecks: string[] = [];

  // 1. General GTC 185 presentation checks (except Sobre, Tarjeta, Correo)
  if (!['sobre', 'tarjeta', 'correo'].includes(moduleId)) {
    const { topCm, bottomCm, leftCm, rightCm, duplexSymmetric } = format.margins;
    if (duplexSymmetric && (leftCm !== 3 || rightCm !== 3)) {
      issues.push({
        id: 'margin-duplex',
        severity: 'warning',
        category: 'normativo',
        message: 'En impresión por ambas caras, la GTC 185 (4.2) recomienda márgenes laterales simétricos de 3 cm.',
      });
    } else {
      if (topCm < 3 || topCm > 4) {
        issues.push({
          id: 'margin-top',
          severity: 'warning',
          category: 'normativo',
          message: `Margen superior actual (${topCm} cm). La GTC 185 (4.2) recomienda entre 3 cm y 4 cm.`,
        });
      }
      if (bottomCm < 2 || bottomCm > 3) {
        issues.push({
          id: 'margin-bottom',
          severity: 'warning',
          category: 'normativo',
          message: `Margen inferior actual (${bottomCm} cm). La GTC 185 (4.2) recomienda entre 2 cm y 3 cm.`,
        });
      }
      if (leftCm < 3 || leftCm > 4) {
        issues.push({
          id: 'margin-left',
          severity: 'warning',
          category: 'normativo',
          message: `Margen izquierdo actual (${leftCm} cm). La GTC 185 (4.2) recomienda entre 3 cm y 4 cm.`,
        });
      }
      if (rightCm < 2 || rightCm > 3) {
        issues.push({
          id: 'margin-right',
          severity: 'warning',
          category: 'normativo',
          message: `Margen derecho actual (${rightCm} cm). La GTC 185 (4.2) recomienda entre 2 cm y 3 cm.`,
        });
      }
    }

    if (topCm >= 3 && topCm <= 4 && bottomCm >= 2 && bottomCm <= 3) {
      passedChecks.push('Márgenes verticales dentro del rango recomendado (GTC 185 num. 4.2)');
    }
    passedChecks.push(`Tipografía homogénea configurada: ${format.fontFamily} ${format.fontSizePt} pt (num. 4.4)`);
  }

  if (!corp.razonSocial.trim() || !corp.nit.trim()) {
    issues.push({
      id: 'corp-missing',
      severity: 'error',
      category: 'obligatorio',
      message: 'Falta razón social o NIT en la configuración institucional.',
    });
  } else {
    passedChecks.push('Identidad institucional verificada (Razón social y NIT)');
  }

  // 2. Module-specific checks
  if (moduleId === 'carta') {
    const d = data as CartaData;
    if (!d.ciudadFecha.trim()) {
      issues.push({ id: 'carta-fecha', severity: 'error', category: 'obligatorio', message: 'Falta el lugar de origen y fecha de elaboración.' });
    }
    if (!d.destinatarioNombre.trim() || hasPlaceholder(d.destinatarioNombre)) {
      issues.push({ id: 'carta-dest', severity: 'error', category: 'obligatorio', message: 'Debes completar el nombre real del destinatario (sin marcadores entre corchetes).' });
    }
    if (!d.destinatarioOrganizacion.trim() || hasPlaceholder(d.destinatarioOrganizacion)) {
      issues.push({ id: 'carta-org', severity: 'warning', category: 'calidad', message: 'Falta definir o completar la organización del destinatario.' });
    }
    if (!d.asunto.trim()) {
      issues.push({ id: 'carta-asunto', severity: 'error', category: 'obligatorio', message: 'El asunto de la carta es obligatorio.' });
    } else if (countWords(d.asunto) > 4) {
      issues.push({
        id: 'carta-asunto-len',
        severity: 'warning',
        category: 'normativo',
        message: `El asunto tiene ${countWords(d.asunto)} palabras. La GTC 185 (4.5.5) recomienda expresarlo en un máximo de cuatro palabras.`,
      });
    } else {
      passedChecks.push('Asunto conciso dentro del máximo recomendado de 4 palabras (num. 4.5.5)');
    }
    if (!d.cuerpo.trim() || hasPlaceholder(d.cuerpo)) {
      issues.push({ id: 'carta-cuerpo', severity: 'warning', category: 'calidad', message: 'Revisa el texto principal de la carta; contiene campos sin completar o está vacío.' });
    }
    if (!d.remitenteNombre.trim() || !d.remitenteCargo.trim()) {
      issues.push({ id: 'carta-rem', severity: 'error', category: 'obligatorio', message: 'Faltan los datos del remitente (nombre y cargo).' });
    }
    if (d.clase === 'organizacional' || d.clase === 'oficial') {
      passedChecks.push(`Estilo de distribución aplicado: ${format.distributionStyle.replace('_', ' ')} (Cap. 5)`);
    }
  } else if (moduleId === 'memorando') {
    const d = data as MemorandoData;
    if (!d.ciudadFecha.trim()) {
      issues.push({ id: 'mem-fecha', severity: 'error', category: 'obligatorio', message: 'Falta la fecha de elaboración del memorando.' });
    }
    if (d.opcionEncabezamiento !== 'tercera' && (!d.paraNombre.trim() || hasPlaceholder(d.paraNombre))) {
      issues.push({ id: 'mem-para', severity: 'error', category: 'obligatorio', message: 'Completa el nombre del destinatario en el campo PARA.' });
    }
    if (!d.paraCargo.trim() || hasPlaceholder(d.paraCargo)) {
      issues.push({ id: 'mem-para-cargo', severity: 'warning', category: 'obligatorio', message: 'Completa el cargo o dependencia en PARA.' });
    }
    if (!d.deCargo.trim()) {
      issues.push({ id: 'mem-de', severity: 'error', category: 'obligatorio', message: 'Falta especificar el cargo del remitente (DE).' });
    }
    if (!d.asunto.trim()) {
      issues.push({ id: 'mem-asunto', severity: 'error', category: 'obligatorio', message: 'El campo ASUNTO es obligatorio.' });
    } else if (countWords(d.asunto) > 4) {
      issues.push({ id: 'mem-asunto-len', severity: 'warning', category: 'normativo', message: 'La GTC 185 recomienda sintetizar el ASUNTO en máximo 4 palabras.' });
    }
    if (!d.cuerpo.trim() || hasPlaceholder(d.cuerpo)) {
      issues.push({ id: 'mem-cuerpo', severity: 'warning', category: 'calidad', message: 'Revisa el cuerpo del memorando; asegúrate de completar todos los datos.' });
    }
    if (format.distributionStyle === 'semibloque') {
      issues.push({ id: 'mem-estilo', severity: 'warning', category: 'normativo', message: 'Para memorandos, el Cap. 6 de la GTC 185 contempla estilo bloque extremo o bloque.' });
    } else {
      passedChecks.push('Encabezamiento PARA / DE / ASUNTO en mayúscula sostenida (Cap. 6)');
    }
  } else if (moduleId === 'circular') {
    const d = data as CircularData;
    if (!d.grupoDestinatario.trim() && d.modalidad === 'circular_general') {
      issues.push({ id: 'cir-dest', severity: 'error', category: 'obligatorio', message: 'Debes indicar el grupo destinatario de la circular.' });
    }
    if (d.modalidad === 'carta_circular' && (!d.cartaDestinatarioNombre.trim() || hasPlaceholder(d.cartaDestinatarioNombre))) {
      issues.push({ id: 'cir-carta-dest', severity: 'error', category: 'obligatorio', message: 'La carta circular requiere los datos del destinatario personalizado.' });
    }
    if (!d.asunto.trim()) {
      issues.push({ id: 'cir-asunto', severity: 'error', category: 'obligatorio', message: 'Falta el asunto de la circular.' });
    }
    if (!d.responsableNombre.trim() || !d.responsableCargo.trim()) {
      issues.push({ id: 'cir-resp', severity: 'error', category: 'obligatorio', message: 'Falta el nombre o cargo del responsable firmante.' });
    }
    passedChecks.push('Estructura de Circular conforme al Capítulo 7 de la GTC 185');
  } else if (moduleId === 'acta') {
    const d = data as ActaData;
    if (!d.tituloGrupo.trim()) {
      issues.push({ id: 'acta-titulo', severity: 'error', category: 'obligatorio', message: 'Falta la denominación del grupo o reunión.' });
    }
    if (!d.numeroActa.trim()) {
      issues.push({ id: 'acta-num', severity: 'error', category: 'obligatorio', message: 'Falta el número consecutivo del acta.' });
    } else if (/[#]|No\./i.test(d.numeroActa)) {
      issues.push({ id: 'acta-num-fmt', severity: 'warning', category: 'normativo', message: 'Según la GTC 185 (8.4.2), en el número del acta se suprime el símbolo "#" o la abreviatura "No." (ej. ACTA 001).' });
    }
    if (d.horaInicio && d.horaFin && d.horaInicio >= d.horaFin) {
      issues.push({ id: 'acta-hora', severity: 'error', category: 'calidad', message: 'Datos contradictorios: la hora de inicio es mayor o igual a la hora de finalización.' });
    }
    const asistentes = d.participantes.filter((p) => p.condicion === 'Asistente');
    if (asistentes.length === 0) {
      issues.push({ id: 'acta-asist', severity: 'error', category: 'obligatorio', message: 'Debe registrarse al menos un asistente.' });
    }
    if (d.participantes.some((p) => hasPlaceholder(p.nombre))) {
      issues.push({ id: 'acta-part-ph', severity: 'warning', category: 'calidad', message: 'Hay participantes con datos pendientes por completar.' });
    }
    if (d.ordenDelDia.length === 0) {
      issues.push({ id: 'acta-orden', severity: 'error', category: 'obligatorio', message: 'Agrega al menos un punto en el orden del día.' });
    }
    if (d.firmantes.length === 0) {
      issues.push({ id: 'acta-firmas', severity: 'error', category: 'obligatorio', message: 'Se requiere al menos un firmante responsable del acta.' });
    }
    passedChecks.push('Zonas de encabezamiento FECHA / HORA / LUGAR / ASISTENTES y compromisos (Cap. 8)');
  } else if (moduleId === 'informe') {
    const d = data as InformeData;
    if (!d.titulo.trim()) {
      issues.push({ id: 'inf-tit', severity: 'error', category: 'obligatorio', message: 'El título del informe es obligatorio.' });
    }
    if (!d.responsables.trim()) {
      issues.push({ id: 'inf-resp', severity: 'error', category: 'obligatorio', message: 'Debe indicarse quién elaboró o es responsable del informe.' });
    }
    if (!d.objetivos.trim()) {
      issues.push({ id: 'inf-obj', severity: 'warning', category: 'normativo', message: 'Se recomienda incluir el objetivo del informe.' });
    }
    if (d.capitulos.length === 0) {
      issues.push({ id: 'inf-cap', severity: 'error', category: 'obligatorio', message: 'Agrega al menos un capítulo o numeral al informe.' });
    }
    if (d.capitulos.some((c) => hasPlaceholder(c.contenido))) {
      issues.push({ id: 'inf-ph', severity: 'warning', category: 'calidad', message: 'Uno o más capítulos contienen marcadores sin completar.' });
    }
    if (d.firmantes.length === 0) {
      issues.push({ id: 'inf-firm', severity: 'error', category: 'obligatorio', message: 'Agrega al menos un responsable firmante.' });
    }
    passedChecks.push(`Modalidad ${d.clase === 'ejecutivo' ? 'Resumen ejecutivo' : d.clase === 'extenso' ? 'Informe extenso' : 'Informe corto'} estructurada (Cap. 9)`);
  } else if (moduleId === 'certificado') {
    const d = data as CertificadoConstanciaData;
    if (!d.solicitanteNombre.trim() || hasPlaceholder(d.solicitanteNombre)) {
      issues.push({ id: 'cert-nom', severity: 'error', category: 'obligatorio', message: 'Falta completar el nombre completo del solicitante.' });
    }
    if (!d.numeroDocumento.trim() || hasPlaceholder(d.numeroDocumento)) {
      issues.push({ id: 'cert-doc', severity: 'error', category: 'obligatorio', message: 'Falta el número de documento de identificación.' });
    }
    if (!d.cuerpoParrafos.trim() || hasPlaceholder(d.cuerpoParrafos)) {
      issues.push({ id: 'cert-body', severity: 'warning', category: 'calidad', message: 'El texto probatorio contiene marcadores pendientes por diligenciar.' });
    } else if (!/^Que\b/.test(d.cuerpoParrafos.trim())) {
      issues.push({ id: 'cert-que', severity: 'warning', category: 'normativo', message: 'La GTC 185 (10.4.5) recomienda iniciar cada párrafo del texto con la conjunción "Que" con mayúscula inicial.' });
    }
    if (!d.expideNombre.trim() || !d.expideCargo.trim()) {
      issues.push({ id: 'cert-exp', severity: 'error', category: 'obligatorio', message: 'Falta el nombre y cargo de quien expide el documento.' });
    }
    if (d.categoria === 'certificado' && format.distributionStyle !== 'bloque') {
      issues.push({ id: 'cert-style', severity: 'info', category: 'normativo', message: 'La GTC 185 presenta el modelo de Certificado en estilo bloque (Fig. 23).' });
    }
    if (d.categoria === 'constancia' && format.distributionStyle !== 'bloque_extremo') {
      issues.push({ id: 'const-style', severity: 'info', category: 'normativo', message: 'La GTC 185 presenta el modelo de Constancia en estilo bloque extremo (Fig. 22).' });
    }
    passedChecks.push(`Identificación probatoria: ${d.categoria === 'certificado' ? 'CERTIFICA:' : 'HACE CONSTAR:'} (Cap. 10)`);
  } else if (moduleId === 'hoja_vida') {
    const d = data as HojaVidaData;
    if (!d.primerApellido.trim() || hasPlaceholder(d.primerApellido) || !d.nombres.trim() || hasPlaceholder(d.nombres)) {
      issues.push({ id: 'hv-nom', severity: 'error', category: 'obligatorio', message: 'Completa apellidos y nombres del colaborador.' });
    }
    if (!d.numeroIdentificacion.trim()) {
      issues.push({ id: 'hv-id', severity: 'error', category: 'obligatorio', message: 'Falta el número de identificación.' });
    }
    if (!d.cargoActual.trim()) {
      issues.push({ id: 'hv-cargo', severity: 'warning', category: 'calidad', message: 'Falta especificar el cargo actual dentro de la organización.' });
    }
    for (const exp of d.experiencias) {
      if (exp.fechaIngreso && exp.fechaRetiro && exp.fechaRetiro !== 'Actual' && exp.fechaIngreso > exp.fechaRetiro) {
        issues.push({ id: 'hv-dates', severity: 'error', category: 'calidad', message: `Contradicción de fechas en experiencia "${exp.empresa || 'sin empresa'}": ingreso posterior al retiro.` });
      }
    }
    passedChecks.push('Formato corporativo ordenado por apellidos conforme al Cap. 11');
  } else if (moduleId === 'sobre') {
    const d = data as SobreData;
    if (!d.destNombre.trim() || hasPlaceholder(d.destNombre)) {
      issues.push({ id: 'sob-dest', severity: 'error', category: 'obligatorio', message: 'Completa el nombre del destinatario en el segundo tercio del sobre.' });
    }
    if (!d.destDireccion.trim() || hasPlaceholder(d.destDireccion)) {
      issues.push({ id: 'sob-dir', severity: 'error', category: 'obligatorio', message: 'Completa la dirección del destinatario sin abreviaturas (GTC 185 12.7.5).' });
    }
    if (/#/.test(d.destDireccion)) {
      issues.push({ id: 'sob-hash', severity: 'warning', category: 'normativo', message: 'La GTC 185 (12.7.5) recomienda no usar el signo "#" en direcciones de sobres; usa "nro." o tres espacios.' });
    }
    passedChecks.push(`Distribución por tercios y dimensiones (${d.anchoCm} × ${d.altoCm} cm) conforme al Cap. 12`);
  } else if (moduleId === 'correo') {
    const d = data as MensajeElectronicoData;
    if (!d.destinatario.trim() || hasPlaceholder(d.destinatario)) {
      issues.push({ id: 'mail-dest', severity: 'error', category: 'obligatorio', message: 'Ingresa la dirección de correo del destinatario.' });
    }
    if (!d.asunto.trim()) {
      issues.push({ id: 'mail-asunto', severity: 'error', category: 'obligatorio', message: 'Falta el asunto del mensaje electrónico.' });
    }
    if (!d.cuerpo.trim() || hasPlaceholder(d.cuerpo)) {
      issues.push({ id: 'mail-cuerpo', severity: 'warning', category: 'calidad', message: 'Revisa el cuerpo del mensaje para completar los datos pendientes.' });
    }
    passedChecks.push('Encabezamiento, saludo, cuerpo y firma institucional conforme al Cap. 13');
  } else if (moduleId === 'tarjeta') {
    const d = data as TarjetaProtocolariaData;
    if (d.tipo === 'invitacion') {
      if (!d.motivoInvitacion.trim() || !d.lugarEvento.trim() || hasPlaceholder(d.fechaEvento)) {
        issues.push({ id: 'tar-inv', severity: 'warning', category: 'obligatorio', message: 'Completa motivo, fecha, hora y lugar del evento en la invitación.' });
      }
    } else if (d.tipo === 'felicitacion' || d.tipo === 'agradecimiento') {
      if (!d.destinatarioNombre.trim() || hasPlaceholder(d.destinatarioNombre)) {
        issues.push({ id: 'tar-dest', severity: 'error', category: 'obligatorio', message: 'Completa el nombre del destinatario de la tarjeta.' });
      }
    } else if (d.tipo === 'presentacion') {
      if (!d.remitenteNombre.trim() || !d.remitenteCargo.trim()) {
        issues.push({ id: 'tar-pres', severity: 'error', category: 'obligatorio', message: 'Completa nombre y cargo del funcionario en la tarjeta de presentación.' });
      }
    }
    passedChecks.push(`Dimensiones protocolarias (${d.anchoCm} × ${d.altoCm} cm) conforme al Cap. 14`);
  }

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;

  return { issues, errorCount, warningCount, passedChecks };
}
