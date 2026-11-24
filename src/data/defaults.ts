import {
  ActaData,
  AnyDocumentData,
  CartaData,
  CertificadoConstanciaData,
  CircularData,
  CorporateConfig,
  DocumentFormatConfig,
  DocumentModuleId,
  DocumentModuleInfo,
  HojaVidaData,
  InformeData,
  MemorandoData,
  MensajeElectronicoData,
  SobreData,
  TarjetaProtocolariaData,
} from '../types/documents';

export const OFFICIAL_LOGO_PATH =
  '/assets/aistudio/WhatsApp_Image_2026-10-05_at_10.24.21_AM_3760ec9b.jpeg';

export const DEFAULT_CORPORATE_CONFIG: CorporateConfig = {
  razonSocial: 'VAQUIMILK S.A.S.',
  nombreComercial: 'VAQUIMILK',
  nit: '901239367-8',
  pais: 'Colombia',
  departamento: 'Bogotá D.C.',
  municipio: 'Bogotá D.C.',
  localidad: 'Usme',
  direccion: 'Carrera 14T #74-24 Sur',
  codigoPostal: '110110',
  correo: 'vaquimilk.lacteos@gmail.com',
  telefonos: '',
  sitioWeb: '',
  representanteLegal: 'María José Sánchez Carvajal',
  cargosAutorizados: [
    'Representante Legal',
    'Gerente General',
    'Dirección Administrativa',
    'Talento Humano',
    'Calidad e Inocuidad',
    'Contabilidad y Finanzas',
  ],
  ciiuPrincipal: '4722',
  ciiuSecundaria: '1040',
  otraActividadRues: '4631',
  logoUrl: OFFICIAL_LOGO_PATH,
  notaDenominacion:
    'Razón social registrada provisionalmente según RUT mientras se verifica el certificado de existencia y representación legal vigente (RUT vs. RUES). Teléfonos corporativos omitidos hasta su confirmación oficial.',
};

export const DOCUMENT_MODULES: DocumentModuleInfo[] = [
  {
    id: 'carta',
    chapter: 'Capítulo 5',
    title: 'Cartas',
    shortDesc: 'Cartas y oficios organizacionales, oficiales o personales con estilos bloque extremo, bloque y semibloque.',
    availableTemplates: ['Carta organizacional estándar', 'Solicitud de cotización', 'Respuesta a solicitud'],
    supportsDistributionStyles: ['bloque_extremo', 'bloque', 'semibloque'],
  },
  {
    id: 'memorando',
    chapter: 'Capítulo 6',
    title: 'Memorandos',
    shortDesc: 'Comunicaciones internas entre dependencias con encabezamiento PARA, DE y ASUNTO en mayúscula sostenida.',
    availableTemplates: ['Memorando informativo', 'Memorando de convocatoria', 'Memorando de solicitud'],
    supportsDistributionStyles: ['bloque_extremo', 'bloque'],
  },
  {
    id: 'circular',
    chapter: 'Capítulo 7',
    title: 'Circulares',
    shortDesc: 'Comunicaciones de interés común dirigidas a grupos internos o externos con control consecutivo.',
    availableTemplates: ['Circular interna general', 'Circular externa clientes/proveedores', 'Carta circular'],
    supportsDistributionStyles: ['bloque_extremo', 'bloque'],
  },
  {
    id: 'acta',
    chapter: 'Capítulo 8',
    title: 'Actas',
    shortDesc: 'Registro estructurado de reuniones administrativas, comités, juntas y tabla dinámica de compromisos.',
    availableTemplates: ['Acta de reunión administrativa', 'Acta de comité de calidad', 'Acta de entrega'],
    supportsDistributionStyles: ['bloque_extremo'],
  },
  {
    id: 'informe',
    chapter: 'Capítulo 9',
    title: 'Informes',
    shortDesc: 'Informes cortos, informes extensos con portada y tabla de contenido, y resúmenes ejecutivos.',
    availableTemplates: ['Informe corto de gestión', 'Resumen ejecutivo', 'Informe extenso con portada'],
    supportsDistributionStyles: ['bloque_extremo'],
  },
  {
    id: 'certificado',
    chapter: 'Capítulo 10',
    title: 'Certificados y constancias',
    shortDesc: 'Documentos probatorios diferenciados: certificados (estilo bloque) y constancias (bloque extremo).',
    availableTemplates: ['Constancia laboral', 'Certificado de cumplimiento', 'Certificado de prestación de servicios'],
    supportsDistributionStyles: ['bloque', 'bloque_extremo'],
  },
  {
    id: 'hoja_vida',
    chapter: 'Capítulo 11',
    title: 'Hojas de vida corporativas',
    shortDesc: 'Registro institucional del historial personal, laboral, académico y complementario del colaborador.',
    availableTemplates: ['Registro de colaborador vinculado', 'Actualización de historia laboral'],
    supportsDistributionStyles: ['bloque_extremo'],
  },
  {
    id: 'sobre',
    chapter: 'Capítulo 12',
    title: 'Sobres comerciales',
    shortDesc: 'Diagramación en tercios y zonas postales para sobres oficio, carta, tarjeta y manila a escala.',
    availableTemplates: ['Sobre oficio institucional', 'Sobre manila carta', 'Sobre para tarjeta'],
    supportsDistributionStyles: ['bloque_extremo'],
  },
  {
    id: 'correo',
    chapter: 'Capítulo 13',
    title: 'Mensajes electrónicos',
    shortDesc: 'Composición estructurada de correos corporativos con firma institucional y asistencia de redacción.',
    availableTemplates: ['Envío de documentos', 'Solicitud de información', 'Notificación formal'],
    supportsDistributionStyles: ['bloque_extremo'],
  },
  {
    id: 'tarjeta',
    chapter: 'Capítulo 14',
    title: 'Tarjetas protocolarias',
    shortDesc: 'Tarjetas de invitación, felicitación, agradecimiento y presentación con identidad VAQUIMILK.',
    availableTemplates: ['Tarjeta de invitación', 'Tarjeta de felicitación', 'Tarjeta de presentación'],
    supportsDistributionStyles: ['bloque_extremo'],
  },
];

export const CARTA_ASUNTO_OPCIONES = [
  'Solicitud de información',
  'Solicitud de cotización',
  'Presentación empresarial',
  'Respuesta a una solicitud',
  'Confirmación de pedido',
  'Envío de documentos',
  'Invitación',
  'Agradecimiento',
  'Reclamación',
  'Notificación',
  'Comunicación organizacional',
  'Otro asunto personalizado',
];

export const CARTA_ESTILOS_REDACCION: CartaData['estiloRedaccion'][] = [
  'Formal y directo',
  'Cordial y empresarial',
  'Explicativo',
  'Breve y concreto',
  'Persuasivo',
  'Informativo',
];

export const TRATAMIENTOS_GTC185 = [
  'Señor',
  'Señora',
  'Doctor',
  'Doctora',
  'Ingeniero',
  'Ingeniera',
  'Licenciado',
  'Licenciada',
  'Contador Público',
  'Contadora Pública',
  'Administrador',
  'Administradora',
];

export const SALUDOS_GTC185 = [
  'Cordial saludo:',
  'Respetado señor:',
  'Respetada señora:',
  'Cordial saludo, señor [Apellido]:',
  'Cordial saludo, señora [Nombre]:',
  'Respetado doctor:',
  'Respetada doctora:',
];

export const DESPEDIDAS_GTC185 = [
  'Cordialmente,',
  'Atentamente,',
  'Respetuosamente,',
  'Sinceramente,',
  'Agradecemos su gentil colaboración.',
  'Hasta una nueva comunicación.',
];

export const MEMORANDO_TIPOS: MemorandoData['tipo'][] = [
  'Informativo',
  'Solicitud',
  'Instrucción',
  'Recordatorio',
  'Comunicación interna',
  'Convocatoria',
  'Otros asuntos organizacionales',
];

export const CIRCULAR_DESTINATARIOS_PRESETS = [
  'TODO EL PERSONAL',
  'COLABORADORES VAQUIMILK S.A.S.',
  'PERSONAL ADMINISTRATIVO',
  'PERSONAL OPERATIVO Y DE PRODUCCIÓN',
  'DEPARTAMENTOS ESPECÍFICOS',
  'CLIENTES',
  'PROVEEDORES',
  'ENTIDADES EXTERNAS',
  'Personalizado',
];

export const ACTA_CLASES = [
  'Acta de reunión administrativa',
  'Acta de comité',
  'Acta de consejo',
  'Acta de asamblea',
  'Acta de junta directiva',
  'Acta de baja de elementos',
  'Acta de entrega',
  'Acta de levantamiento',
  'Otra modalidad organizacional',
];

export const CERTIFICADO_SUBTIPOS = [
  'Certificado laboral',
  'Certificado de prestación de servicios',
  'Certificado de participación',
  'Certificado de cumplimiento',
  'Certificado de asistencia',
  'Certificado personalizado',
];

export const CONSTANCIA_SUBTIPOS = [
  'Constancia laboral',
  'Constancia de asistencia',
  'Constancia de participación',
  'Constancia de vinculación',
  'Constancia de realización de actividades',
  'Constancia personalizada',
];

export const MENSAJE_TIPOS = [
  'Solicitud de información',
  'Envío de documentos',
  'Respuesta empresarial',
  'Confirmación',
  'Invitación',
  'Agradecimiento',
  'Seguimiento',
  'Comunicación interna',
  'Notificación',
  'Otro mensaje personalizado',
];

export const SOBRE_DIMENSIONES: Record<
  SobreData['clase'],
  { label: string; anchoCm: number; altoCm: number }
> = {
  oficio: { label: 'Sobre oficio (24,1 × 10,5 cm)', anchoCm: 24.1, altoCm: 10.5 },
  carta: { label: 'Sobre carta (22,0 × 11,0 cm)', anchoCm: 22.0, altoCm: 11.0 },
  tarjeta: { label: 'Sobre para tarjeta (16,5 × 11,5 cm)', anchoCm: 16.5, altoCm: 11.5 },
  manila_carta: { label: 'Sobre de manila carta (22,9 × 30,5 cm)', anchoCm: 22.9, altoCm: 30.5 },
  manila_oficio: { label: 'Sobre de manila oficio (25,4 × 35,6 cm)', anchoCm: 25.4, altoCm: 35.6 },
  manila_media_carta: { label: 'Sobre de manila media carta (15,2 × 22,9 cm)', anchoCm: 15.2, altoCm: 22.9 },
};

export function getSpanishTodayString(city = 'Bogotá D.C.'): string {
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ];
  const now = new Date();
  return `${city}, ${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()}`;
}

export function getDefaultFormatForModule(moduleId: DocumentModuleId): DocumentFormatConfig {
  const base: DocumentFormatConfig = {
    distributionStyle: moduleId === 'certificado' ? 'bloque' : 'bloque_extremo',
    visualStyle: 'institucional',
    fontFamily: 'Arial',
    fontSizePt: 12,
    pageSize: 'carta',
    margins: {
      topCm: 3.5,
      bottomCm: 2.5,
      leftCm: 3.5,
      rightCm: 2.5,
      duplexSymmetric: false,
    },
    showZona1: true,
    showZona2: !['acta', 'hoja_vida', 'correo'].includes(moduleId),
    showZona3: false,
    radicadoNumero: '',
    radicadoFechaHora: '',
  };

  if (moduleId === 'sobre' || moduleId === 'tarjeta') {
    base.margins = {
      topCm: 1.5,
      bottomCm: 1.5,
      leftCm: 1.5,
      rightCm: 1.5,
      duplexSymmetric: false,
    };
  }
  return base;
}

export function createInitialDataForModule(
  moduleId: DocumentModuleId,
  corp: CorporateConfig
): AnyDocumentData {
  const fechaHoy = getSpanishTodayString(corp.municipio || 'Bogotá D.C.');

  switch (moduleId) {
    case 'carta':
      return {
        clase: 'organizacional',
        alcance: 'externa',
        codigo: 'VQ-GD-001',
        ciudadFecha: fechaHoy,
        destinatarioTratamiento: 'Señor',
        destinatarioNombre: '[Nombre completo del destinatario]',
        destinatarioCargo: '[Cargo del destinatario]',
        destinatarioOrganizacion: '[Organización destinataria]',
        destinatarioDireccion: '[Dirección de entrega]',
        destinatarioCiudadDepto: 'Bogotá D.C.',
        destinatarioPais: '',
        sobreVentanilla: false,
        asuntoCategoria: 'Comunicación organizacional',
        asunto: 'Presentación portafolio comercial',
        saludo: 'Cordial saludo:',
        estiloRedaccion: 'Cordial y empresarial',
        cuerpo:
          'Por medio de la presente, nos permitimos presentar a VAQUIMILK S.A.S., organización dedicada a la comercialización y elaboración de productos lácteos y derivados, comprometida con la calidad e inocuidad en cada etapa de su operación.\n\nPonemos a su disposición nuestra línea de atención administrativa a través del correo electrónico vaquimilk.lacteos@gmail.com para ampliar cualquier información o coordinar una reunión comercial.',
        despedida: 'Cordialmente,',
        remitenteNombre: corp.representanteLegal,
        remitenteCargo: 'Representante Legal',
        incluirLineaFirma: true,
        anexos: '',
        copias: '',
        redactor: '',
        transcriptor: '',
      } as CartaData;

    case 'memorando':
      return {
        tipo: 'Informativo',
        opcionEncabezamiento: 'segunda',
        codigo: 'VQ-MEM-001',
        ciudadFecha: fechaHoy,
        paraTratamiento: 'Señora',
        paraNombre: '[Nombre del colaborador]',
        paraCargo: '[Cargo o dependencia destinataria]',
        deNombre: corp.representanteLegal,
        deCargo: 'Representante Legal',
        asunto: 'Lineamientos gestión documental',
        cuerpo:
          'Con agrado los saludo e informo que, a partir de la fecha, las comunicaciones internas de VAQUIMILK S.A.S. se elaborarán siguiendo los criterios de presentación y claridad definidos en la Guía Técnica Colombiana GTC 185:2009.\n\nAgradecemos su compromiso para mantener la uniformidad y orden en los registros administrativos de cada área.',
        despedida: 'Atentamente,',
        anexos: '',
        copias: '',
        redactor: '',
        transcriptor: '',
      } as MemorandoData;

    case 'circular':
      return {
        clase: 'interna',
        modalidad: 'circular_general',
        consecutivo: 'CIRCULAR 001',
        codigo: 'VQ-CIR-001',
        ciudadFecha: fechaHoy,
        grupoDestinatarioCategoria: 'TODO EL PERSONAL',
        grupoDestinatario: 'TODO EL PERSONAL DE VAQUIMILK S.A.S.',
        cartaDestinatarioTratamiento: 'Señor',
        cartaDestinatarioNombre: '',
        cartaDestinatarioCargo: '',
        cartaDestinatarioOrg: '',
        asunto: 'Actualización procedimientos internos',
        saludo: 'Cordial saludo.',
        cuerpo:
          'Con nuestro cordial saludo, les informamos sobre la actualización de los lineamientos operativos y administrativos vigentes para las actividades de nuestra organización.\n\nSolicitamos a cada responsable de área socializar esta disposición con su equipo de trabajo y remitir las inquietudes al correo institucional.',
        despedida: 'Agradecemos su positiva colaboración.',
        responsableNombre: corp.representanteLegal,
        responsableCargo: 'Representante Legal',
        anexos: '',
        copias: '',
        transcriptor: '',
      } as CircularData;

    case 'acta':
      return {
        clase: 'Acta de reunión administrativa',
        caracter: 'Ordinaria',
        tituloGrupo: 'REUNIÓN ADMINISTRATIVA VAQUIMILK S.A.S.',
        numeroActa: 'ACTA 001',
        ciudadFecha: fechaHoy,
        horaInicio: '09:00',
        horaFin: '10:30',
        lugar: `${corp.direccion}, ${corp.municipio}`,
        participantes: [
          {
            id: 'p1',
            nombre: corp.representanteLegal,
            cargo: 'Representante Legal',
            dependencia: 'Gerencia',
            condicion: 'Asistente',
            representacion: '',
          },
          {
            id: 'p2',
            nombre: '[Nombre del participante]',
            cargo: '[Cargo]',
            dependencia: '[Área]',
            condicion: 'Asistente',
            representacion: '',
          },
        ],
        ordenDelDia: [
          'Verificación del quórum',
          'Lectura y aprobación del acta anterior',
          'Revisión de actividades operativas y administrativas',
          'Proposiciones y varios',
        ],
        desarrollo: [
          {
            id: 'd1',
            numero: 1,
            tema: 'Verificación del quórum',
            descripcion: 'Se verificó la asistencia de los integrantes convocados, confirmando el quórum requerido para iniciar la sesión.',
            intervenciones: '',
            decisiones: 'Se dio apertura formal a la reunión.',
            votacionAFavor: '',
            votacionEnContra: '',
            votacionBlanco: '',
          },
          {
            id: 'd2',
            numero: 2,
            tema: 'Lectura y aprobación del acta anterior',
            descripcion: 'Se dio lectura al acta de la sesión previa para validación de compromisos.',
            intervenciones: '',
            decisiones: 'El acta anterior fue aprobada sin modificaciones.',
            votacionAFavor: '',
            votacionEnContra: '',
            votacionBlanco: '',
          },
        ],
        compromisos: [
          {
            id: 'c1',
            actividad: '[Describir compromiso o actividad]',
            responsable: '[Nombre del responsable]',
            fechaCumplimiento: '[Fecha]',
            observaciones: '',
          },
        ],
        convocatoriaSiguiente: '',
        firmantes: [
          {
            id: 'f1',
            nombre: corp.representanteLegal,
            cargo: 'Representante Legal',
          },
        ],
        anexos: '',
        transcriptor: '',
      } as ActaData;

    case 'informe':
      return {
        clase: 'corto',
        titulo: 'INFORME DE GESTIÓN ADMINISTRATIVA',
        subtitulo: '',
        codigo: 'VQ-INF-001',
        dependencia: 'Dirección Administrativa',
        ciudadFecha: fechaHoy,
        responsables: corp.representanteLegal,
        destinatario: 'Gerencia General VAQUIMILK S.A.S.',
        objetivos: 'Presentar de manera estructurada el estado de las actividades administrativas desarrolladas durante el periodo evaluado.',
        introduccion: '',
        metodologia: '',
        capitulos: [
          {
            id: 'cap1',
            numero: '1',
            titulo: 'DESARROLLO DE ACTIVIDADES',
            contenido:
              'Durante el periodo analizado se consolidaron los registros documentales y operativos conforme a los procedimientos internos de la organización.\n\n[Ingresar aquí los hechos, avances o datos verificados correspondientes al periodo].',
          },
        ],
        resultados: '',
        analisis: '',
        tablas: [],
        graficos: [],
        conclusiones:
          'Los procesos administrativos reportados reflejan la necesidad de mantener el seguimiento periódico sobre la documentación institucional.',
        recomendaciones:
          'Continuar aplicando los lineamientos de presentación documental establecidos para las comunicaciones internas y externas.',
        bibliografia: '',
        anexos: '',
        firmantes: [
          {
            id: 'if1',
            nombre: corp.representanteLegal,
            cargo: 'Representante Legal',
          },
        ],
        incluirRubrica: false,
        transcriptor: '',
      } as InformeData;

    case 'certificado':
      return {
        categoria: 'constancia',
        subtipo: 'Constancia laboral',
        codigo: 'VQ-CON-001',
        ubicacionFecha: 'inicio',
        ciudadFecha: fechaHoy,
        cargoExpide: 'LA REPRESENTANTE LEGAL',
        solicitanteTratamiento: 'señor(a)',
        solicitanteNombre: '[NOMBRE COMPLETO DEL SOLICITANTE]',
        tipoDocumento: 'cédula de ciudadanía',
        numeroDocumento: '[Número de identificación]',
        expedicionDocumento: 'Bogotá D.C.',
        periodoFechas: '[Fecha de inicio] a la fecha',
        cuerpoParrafos:
          'Que [tratamiento] [NOMBRE COMPLETO], identificado(a) con [tipo y número de documento], se encuentra vinculado(a) con VAQUIMILK S.A.S., NIT 901239367-8, desempeñando el cargo de [Cargo] desde el [fecha de ingreso].',
        motivoDestino: 'Esta constancia se expide a solicitud del interesado para los fines que estime pertinentes.',
        expideNombre: corp.representanteLegal,
        expideCargo: 'Representante Legal',
        transcriptor: '',
      } as CertificadoConstanciaData;

    case 'hoja_vida':
      return {
        primerApellido: '[PRIMER APELLIDO]',
        segundoApellido: '[SEGUNDO APELLIDO]',
        nombres: '[NOMBRES COMPLETOS]',
        tipoIdentificacion: 'Cédula de Ciudadanía',
        numeroIdentificacion: '',
        lugarExpedicion: '',
        fechaNacimiento: '',
        lugarNacimiento: '',
        genero: '',
        estadoCivil: '',
        numeroHijos: '',
        direccion: '',
        telefono: '',
        correo: '',
        fechaIngresoOrg: '',
        sucursalDependencia: 'Sede Principal — Bogotá D.C.',
        estatusVinculacion: 'Activo',
        tipoVinculacion: 'Contrato laboral',
        cargoActual: '',
        jefeInmediato: corp.representanteLegal,
        responsabilidadesActuales: '',
        eps: '',
        fondoPensiones: '',
        arl: '',
        visasInfo: '',
        academicos: [
          {
            id: 'ac1',
            nivel: 'Profesional',
            institucion: '[Institución educativa]',
            tituloObtenido: '[Título obtenido]',
            fechaInicio: '',
            fechaFinalizacion: '',
            ciudadPais: 'Bogotá D.C., Colombia',
          },
        ],
        experiencias: [
          {
            id: 'ex1',
            empresa: 'VAQUIMILK S.A.S.',
            cargo: '[Cargo desempeñado]',
            fechaIngreso: '',
            fechaRetiro: 'Actual',
            funciones: '[Descripción de funciones y responsabilidades]',
          },
        ],
        formacionComplementaria: [],
        investigacionesDistinciones: [],
      } as HojaVidaData;

    case 'sobre':
      return {
        clase: 'oficio',
        conVentanilla: false,
        orientacionManila: 'horizontal',
        anchoCm: 24.1,
        altoCm: 10.5,
        modelo: 'modelo1',
        destinoTipo: 'local',
        dependenciaRemitente: 'Dirección Administrativa',
        mencionTercioIzquierdo: '',
        destTratamiento: 'Señor',
        destNombre: '[Nombre completo del destinatario]',
        destCargo: '[Cargo]',
        destOrganizacion: '[Organización destinataria]',
        destDireccion: '[Dirección completa sin abreviaturas]',
        destTelefonoEspecial: '',
        destCiudadDepto: 'Bogotá D.C.',
        destPais: 'Colombia',
        mostrarGuiasTercios: true,
      } as SobreData;

    case 'correo':
      return {
        tipo: 'Envío de documentos',
        remitenteNombre: corp.representanteLegal,
        remitenteCargo: 'Representante Legal',
        remitenteCorreo: corp.correo,
        destinatario: '[destinatario@empresa.com]',
        copiaCC: '',
        copiaOcultaCCO: '',
        asunto: 'Envío documentación solicitada',
        fechaReferencia: fechaHoy,
        saludo: 'Cordial saludo,',
        cuerpo:
          'Por medio del presente mensaje electrónico nos permitimos remitir la documentación solicitada para su revisión y trámite correspondiente.\n\nQuedamos atentos a cualquier inquietud o confirmación de recibido.',
        despedida: 'Atentamente,',
        incluirFirmaInstitucional: true,
        adjuntosReferencia: '[Nombre del archivo adjunto.pdf]',
      } as MensajeElectronicoData;

    case 'tarjeta':
      return {
        tipo: 'invitacion',
        anchoCm: 15,
        altoCm: 10,
        presentacionVisual: 'marco_corporativo',
        incluirLogo: true,
        tipoEvento: 'Reunión Empresarial',
        motivoInvitacion:
          'Tiene el gusto de invitarle a participar en la jornada de presentación institucional y degustación de productos lácteos VAQUIMILK.',
        nombreQuienInvita: `${corp.razonSocial} — ${corp.representanteLegal}`,
        destinatarioNombre: '[Nombre del invitado]',
        fechaEvento: '[Día, fecha de evento]',
        horaEvento: '10:00 horas',
        lugarEvento: `${corp.direccion}, ${corp.localidad}, ${corp.municipio}`,
        informacionAdicional: '',
        datosConfirmacion: `Favor confirmar asistencia al correo ${corp.correo}`,
        motivoMensaje: 'Felicitación institucional',
        cuerpoMensaje:
          'En nombre de VAQUIMILK S.A.S. extendemos un cordial saludo y felicitación por los logros alcanzados en su gestión.',
        ciudadFecha: fechaHoy,
        remitenteNombre: corp.representanteLegal,
        remitenteCargo: 'Representante Legal',
        presentacionTelefono: corp.telefonos,
        presentacionCorreo: corp.correo,
      } as TarjetaProtocolariaData;
  }
}

export function getModuleTemplates(
  moduleId: DocumentModuleId,
  corp: CorporateConfig
): { name: string; description: string; data: Partial<AnyDocumentData>; formatPatch?: Partial<DocumentFormatConfig> }[] {
  const fechaHoy = getSpanishTodayString(corp.municipio || 'Bogotá D.C.');
  switch (moduleId) {
    case 'carta':
      return [
        {
          name: 'Carta organizacional estándar',
          description: 'Presentación corporativa en estilo bloque extremo.',
          data: createInitialDataForModule('carta', corp),
          formatPatch: { distributionStyle: 'bloque_extremo' },
        },
        {
          name: 'Solicitud de cotización',
          description: 'Estilo bloque para requerimiento formal a proveedores.',
          data: {
            ...(createInitialDataForModule('carta', corp) as CartaData),
            asuntoCategoria: 'Solicitud de cotización',
            asunto: 'Solicitud cotización insumos lácteos',
            estiloRedaccion: 'Formal y directo',
            cuerpo:
              'Con nuestro cordial saludo, solicitamos amablemente cotización formal de los productos o insumos requeridos por VAQUIMILK S.A.S., especificando precios unitarios, condiciones de pago, disponibilidad y tiempos de entrega en la ciudad de Bogotá D.C.\n\nAgradecemos remitir su propuesta comercial al correo vaquimilk.lacteos@gmail.com.',
          },
          formatPatch: { distributionStyle: 'bloque' },
        },
        {
          name: 'Respuesta a solicitud',
          description: 'Estilo semibloque con sangría reglamentaria.',
          data: {
            ...(createInitialDataForModule('carta', corp) as CartaData),
            asuntoCategoria: 'Respuesta a una solicitud',
            asunto: 'Respuesta comunicación recibida',
            estiloRedaccion: 'Explicativo',
            cuerpo:
              'En atención a su comunicación recibida el [fecha], nos permitimos dar respuesta formal respecto a los puntos planteados.\n\nUna vez revisados los antecedentes correspondientes, le confirmamos que [detallar respuesta verificada]. Quedamos a su disposición para ampliar cualquier detalle.',
          },
          formatPatch: { distributionStyle: 'semibloque' },
        },
      ];
    case 'memorando':
      return [
        {
          name: 'Memorando informativo',
          description: 'Comunicación interna estándar estilo bloque extremo.',
          data: createInitialDataForModule('memorando', corp),
          formatPatch: { distributionStyle: 'bloque_extremo' },
        },
        {
          name: 'Memorando de convocatoria',
          description: 'Estilo bloque para citar a reunión interna no protocolaria.',
          data: {
            ...(createInitialDataForModule('memorando', corp) as MemorandoData),
            tipo: 'Convocatoria',
            opcionEncabezamiento: 'tercera',
            asunto: 'Convocatoria reunión operativa',
            cuerpo:
              'Tengo el gusto de saludarlos y convocarlos a la reunión operativa que se llevará a cabo el [día y fecha] a las [hora] horas en [lugar], con el propósito de revisar la programación semanal de actividades.\n\nAgradecemos su puntual asistencia.',
          },
          formatPatch: { distributionStyle: 'bloque' },
        },
        {
          name: 'Memorando de solicitud',
          description: 'Primera opción de encabezamiento (solo firma al cierre).',
          data: {
            ...(createInitialDataForModule('memorando', corp) as MemorandoData),
            tipo: 'Solicitud',
            opcionEncabezamiento: 'primera',
            asunto: 'Solicitud reporte inventario',
            cuerpo:
              'Con saludo cordial, solicitamos remitir a más tardar el [fecha] el reporte actualizado correspondiente a su dependencia, con el fin de consolidar la información administrativa del mes.',
          },
          formatPatch: { distributionStyle: 'bloque_extremo' },
        },
      ];
    case 'circular':
      return [
        {
          name: 'Circular interna general',
          description: 'Dirigida a todo el personal de VAQUIMILK S.A.S.',
          data: createInitialDataForModule('circular', corp),
          formatPatch: { distributionStyle: 'bloque_extremo' },
        },
        {
          name: 'Circular externa clientes y proveedores',
          description: 'Comunicación externa en estilo bloque.',
          data: {
            ...(createInitialDataForModule('circular', corp) as CircularData),
            clase: 'externa',
            consecutivo: 'CIRCULAR 002',
            grupoDestinatarioCategoria: 'CLIENTES',
            grupoDestinatario: 'CLIENTES Y PROVEEDORES',
            asunto: 'Horarios atención administrativa',
            cuerpo:
              'Con nuestro cordial saludo, informamos a nuestros clientes y proveedores las disposiciones vigentes sobre horarios de recepción y canales oficiales de comunicación de VAQUIMILK S.A.S.\n\nCualquier comunicación formal será atendida a través de nuestro correo electrónico vaquimilk.lacteos@gmail.com.',
          },
          formatPatch: { distributionStyle: 'bloque' },
        },
        {
          name: 'Carta circular personalizada',
          description: 'Mismo texto de interés común dirigido de forma personalizada.',
          data: {
            ...(createInitialDataForModule('circular', corp) as CircularData),
            clase: 'externa',
            modalidad: 'carta_circular',
            cartaDestinatarioTratamiento: 'Señor(a)',
            cartaDestinatarioNombre: '[NOMBRE COMPLETO]',
            cartaDestinatarioCargo: '[Cargo]',
            cartaDestinatarioOrg: '[Organización]',
            asunto: 'Actualización datos comerciales',
          },
          formatPatch: { distributionStyle: 'bloque_extremo' },
        },
      ];
    case 'acta':
      return [
        {
          name: 'Acta de reunión administrativa',
          description: 'Formato GTC 185 Cap. 8 completo con compromisos.',
          data: createInitialDataForModule('acta', corp),
        },
        {
          name: 'Acta de comité de calidad',
          description: 'Seguimiento de inocuidad, procesos y votaciones.',
          data: {
            ...(createInitialDataForModule('acta', corp) as ActaData),
            clase: 'Acta de comité',
            tituloGrupo: 'COMITÉ DE CALIDAD E INOCUIDAD VAQUIMILK S.A.S.',
            numeroActa: 'ACTA 002',
            ordenDelDia: [
              'Verificación del quórum',
              'Revisión de indicadores de calidad e higiene',
              'Plan de acciones preventivas',
              'Proposiciones y varios',
            ],
          },
        },
        {
          name: 'Acta de entrega',
          description: 'Entrega formal de elementos, cargo o documentación.',
          data: {
            ...(createInitialDataForModule('acta', corp) as ActaData),
            clase: 'Acta de entrega',
            tituloGrupo: 'ACTA DE ENTREGA DE ELEMENTOS Y DOCUMENTACIÓN',
            numeroActa: 'ACTA 003',
            ordenDelDia: [
              'Verificación de asistentes',
              'Relación detallada de elementos o documentos entregados',
              'Observaciones y firma de recibido',
            ],
          },
        },
      ];
    case 'informe':
      return [
        {
          name: 'Informe corto de gestión',
          description: 'De 1 a 10 páginas sin portada, con encabezamiento GTC 185.',
          data: createInitialDataForModule('informe', corp),
        },
        {
          name: 'Resumen ejecutivo',
          description: 'De 1 a 3 páginas con objetivos, numerales y conclusiones.',
          data: {
            ...(createInitialDataForModule('informe', corp) as InformeData),
            clase: 'ejecutivo',
            titulo: 'RESUMEN EJECUTIVO DE ACTIVIDADES',
          },
        },
        {
          name: 'Informe extenso con portada',
          description: 'Estructura completa con portada, tabla de contenido, metodología y anexos.',
          data: {
            ...(createInitialDataForModule('informe', corp) as InformeData),
            clase: 'extenso',
            titulo: 'INFORME INTEGRAL DE OPERACIÓN Y GESTIÓN',
            subtitulo: 'Periodo evaluado',
            introduccion: 'El presente informe detalla de manera objetiva los resultados de gestión del periodo analizado.',
            metodologia: 'Se recopiló la información administrativa y operativa registrada en los archivos de la organización.',
            resultados: 'Los resultados consolidados se presentan en los capítulos y tablas siguientes según los datos verificados.',
            analisis: 'El análisis técnico permite identificar oportunidades de optimización operativa.',
          },
        },
      ];
    case 'certificado':
      return [
        {
          name: 'Constancia laboral (bloque extremo)',
          description: 'Documento probatorio de vinculación laboral vigente.',
          data: createInitialDataForModule('certificado', corp),
          formatPatch: { distributionStyle: 'bloque_extremo' },
        },
        {
          name: 'Certificado de cumplimiento (bloque)',
          description: 'Documento solemne en estilo bloque según Fig. 23 GTC 185.',
          data: {
            ...(createInitialDataForModule('certificado', corp) as CertificadoConstanciaData),
            categoria: 'certificado',
            subtipo: 'Certificado de cumplimiento',
            codigo: 'VQ-CER-001',
            cuerpoParrafos:
              'Que [NOMBRE O RAZÓN SOCIAL], identificado(a) con [NIT o cédula], cumplió a satisfacción con las obligaciones pactadas en [contrato u orden de servicio] durante el periodo comprendido entre [fecha inicio] y [fecha fin].',
            motivoDestino: 'Este certificado se expide para trámites contractuales.',
          },
          formatPatch: { distributionStyle: 'bloque' },
        },
        {
          name: 'Certificado de prestación de servicios',
          description: 'Certificación contractual en estilo bloque.',
          data: {
            ...(createInitialDataForModule('certificado', corp) as CertificadoConstanciaData),
            categoria: 'certificado',
            subtipo: 'Certificado de prestación de servicios',
            codigo: 'VQ-CER-002',
            cuerpoParrafos:
              'Que [NOMBRE COMPLETO], identificado(a) con [documento], prestó sus servicios profesionales en VAQUIMILK S.A.S. ejecutando las actividades de [objeto del contrato] durante el periodo [fechas].',
            motivoDestino: 'Se expide a solicitud del interesado.',
          },
          formatPatch: { distributionStyle: 'bloque' },
        },
      ];
    case 'hoja_vida':
      return [
        {
          name: 'Registro de colaborador vinculado',
          description: 'Formato institucional GTC 185 Cap. 11 ordenado por apellidos.',
          data: createInitialDataForModule('hoja_vida', corp),
        },
        {
          name: 'Actualización de historia laboral',
          description: 'Incluye formación complementaria y cargos internos.',
          data: {
            ...(createInitialDataForModule('hoja_vida', corp) as HojaVidaData),
            formacionComplementaria: [
              {
                id: 'fc1',
                tipo: 'Capacitación',
                nombre: 'Manipulación higiénica de alimentos y BPM',
                institucion: '[Institución]',
                duracionNivel: '[Horas]',
                fecha: '[Fecha]',
              },
            ],
          },
        },
      ];
    case 'sobre':
      return [
        {
          name: 'Sobre oficio institucional',
          description: 'Formato 24,1 × 10,5 cm con distribución en tercios.',
          data: createInitialDataForModule('sobre', corp),
        },
        {
          name: 'Sobre manila carta',
          description: 'Formato 22,9 × 30,5 cm para envío de documentos sin dobleces.',
          data: {
            ...(createInitialDataForModule('sobre', corp) as SobreData),
            clase: 'manila_carta',
            anchoCm: 22.9,
            altoCm: 30.5,
          },
        },
        {
          name: 'Sobre para tarjeta',
          description: 'Formato 16,5 × 11,5 cm para invitaciones o tarjetas.',
          data: {
            ...(createInitialDataForModule('sobre', corp) as SobreData),
            clase: 'tarjeta',
            anchoCm: 16.5,
            altoCm: 11.5,
          },
        },
      ];
    case 'correo':
      return [
        {
          name: 'Envío de documentos',
          description: 'Correo institucional con firma corporativa VAQUIMILK.',
          data: createInitialDataForModule('correo', corp),
        },
        {
          name: 'Solicitud de información',
          description: 'Requerimiento claro y breve a contacto externo.',
          data: {
            ...(createInitialDataForModule('correo', corp) as MensajeElectronicoData),
            tipo: 'Solicitud de información',
            asunto: 'Solicitud información comercial',
            cuerpo:
              'Por medio del presente correo solicitamos amablemente nos remita la información correspondiente a [tema requerido].\n\nAgradecemos de antemano su pronta respuesta.',
          },
        },
        {
          name: 'Notificación formal',
          description: 'Comunicado electrónico breve para múltiples destinatarios con CCO.',
          data: {
            ...(createInitialDataForModule('correo', corp) as MensajeElectronicoData),
            tipo: 'Notificación',
            asunto: 'Notificación programación entrega',
            copiaOcultaCCO: '[lista-destinatarios@empresa.com]',
            cuerpo:
              'Les informamos oportunamente sobre la programación establecida para [actividad o entrega].\n\nAnte cualquier novedad, favor responder a vaquimilk.lacteos@gmail.com.',
          },
        },
      ];
    case 'tarjeta':
      return [
        {
          name: 'Tarjeta de invitación',
          description: 'Formato protocolario 15 × 10 cm para eventos institucionales.',
          data: createInitialDataForModule('tarjeta', corp),
        },
        {
          name: 'Tarjeta de felicitación',
          description: 'Saludo corporativo elegante y sobrio.',
          data: {
            ...(createInitialDataForModule('tarjeta', corp) as TarjetaProtocolariaData),
            tipo: 'felicitacion',
            motivoMensaje: 'Felicitación por reconocimiento o aniversario',
            cuerpoMensaje:
              'En nombre de VAQUIMILK S.A.S. nos complace expresarle nuestras más sinceras felicitaciones y desearle continuos éxitos en su labor.',
            ciudadFecha: fechaHoy,
          },
        },
        {
          name: 'Tarjeta de presentación',
          description: 'Formato ejecutivo 9 × 5,5 cm con datos institucionales.',
          data: {
            ...(createInitialDataForModule('tarjeta', corp) as TarjetaProtocolariaData),
            tipo: 'presentacion',
            anchoCm: 9,
            altoCm: 5.5,
            remitenteNombre: corp.representanteLegal,
            remitenteCargo: 'Representante Legal',
          },
        },
      ];
  }
}
