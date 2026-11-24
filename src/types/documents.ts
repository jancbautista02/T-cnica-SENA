export type DocumentModuleId =
  | 'carta'
  | 'memorando'
  | 'circular'
  | 'acta'
  | 'informe'
  | 'certificado'
  | 'hoja_vida'
  | 'sobre'
  | 'correo'
  | 'tarjeta';

export type DistributionStyle = 'bloque_extremo' | 'bloque' | 'semibloque';
export type VisualStyle = 'clasico' | 'moderno' | 'institucional';
export type FontFamilyOption = 'Arial' | 'Times New Roman' | 'Calibri' | 'Verdana';
export type PageSizeOption = 'carta' | 'oficio' | 'a4';

export interface CorporateConfig {
  razonSocial: string;
  nombreComercial: string;
  nit: string;
  pais: string;
  departamento: string;
  municipio: string;
  localidad: string;
  direccion: string;
  codigoPostal: string;
  correo: string;
  telefonos: string;
  sitioWeb: string;
  representanteLegal: string;
  cargosAutorizados: string[];
  ciiuPrincipal: string;
  ciiuSecundaria: string;
  otraActividadRues: string;
  logoUrl: string;
  notaDenominacion: string;
}

export interface DocumentMargins {
  topCm: number;
  bottomCm: number;
  leftCm: number;
  rightCm: number;
  duplexSymmetric: boolean;
}

export interface DocumentFormatConfig {
  distributionStyle: DistributionStyle;
  visualStyle: VisualStyle;
  fontFamily: FontFamilyOption;
  fontSizePt: 10 | 11 | 12;
  pageSize: PageSizeOption;
  margins: DocumentMargins;
  showZona1: boolean;
  showZona2: boolean;
  showZona3: boolean;
  radicadoNumero: string;
  radicadoFechaHora: string;
}

// 1. CARTAS (Cap. 5)
export interface CartaData {
  clase: 'organizacional' | 'oficial' | 'personal';
  alcance: 'externa' | 'interna';
  codigo: string;
  ciudadFecha: string;
  destinatarioTratamiento: string;
  destinatarioNombre: string;
  destinatarioCargo: string;
  destinatarioOrganizacion: string;
  destinatarioDireccion: string;
  destinatarioCiudadDepto: string;
  destinatarioPais: string;
  sobreVentanilla: boolean;
  asuntoCategoria: string;
  asunto: string;
  saludo: string;
  estiloRedaccion:
    | 'Formal y directo'
    | 'Cordial y empresarial'
    | 'Explicativo'
    | 'Breve y concreto'
    | 'Persuasivo'
    | 'Informativo';
  cuerpo: string;
  despedida: string;
  remitenteNombre: string;
  remitenteCargo: string;
  incluirLineaFirma: boolean;
  anexos: string;
  copias: string;
  redactor: string;
  transcriptor: string;
}

// 2. MEMORANDOS (Cap. 6)
export interface MemorandoData {
  tipo:
    | 'Informativo'
    | 'Solicitud'
    | 'Instrucción'
    | 'Recordatorio'
    | 'Comunicación interna'
    | 'Convocatoria'
    | 'Otros asuntos organizacionales';
  opcionEncabezamiento: 'primera' | 'segunda' | 'tercera';
  codigo: string;
  ciudadFecha: string;
  paraTratamiento: string;
  paraNombre: string;
  paraCargo: string;
  deNombre: string;
  deCargo: string;
  asunto: string;
  cuerpo: string;
  despedida: string;
  anexos: string;
  copias: string;
  redactor: string;
  transcriptor: string;
}

// 3. CIRCULARES (Cap. 7)
export interface CircularData {
  clase: 'general' | 'interna' | 'externa';
  modalidad: 'circular_general' | 'carta_circular';
  consecutivo: string;
  codigo: string;
  ciudadFecha: string;
  grupoDestinatarioCategoria: string;
  grupoDestinatario: string;
  cartaDestinatarioTratamiento: string;
  cartaDestinatarioNombre: string;
  cartaDestinatarioCargo: string;
  cartaDestinatarioOrg: string;
  asunto: string;
  saludo: string;
  cuerpo: string;
  despedida: string;
  responsableNombre: string;
  responsableCargo: string;
  anexos: string;
  copias: string;
  transcriptor: string;
}

// 4. ACTAS (Cap. 8)
export interface ActaParticipante {
  id: string;
  nombre: string;
  cargo: string;
  dependencia: string;
  condicion: 'Asistente' | 'Invitado' | 'Ausente (con excusa)' | 'Ausente (sin excusa)';
  representacion: string;
}

export interface ActaPuntoDesarrollo {
  id: string;
  numero: number;
  tema: string;
  descripcion: string;
  intervenciones: string;
  decisiones: string;
  votacionAFavor: string;
  votacionEnContra: string;
  votacionBlanco: string;
}

export interface ActaCompromiso {
  id: string;
  actividad: string;
  responsable: string;
  fechaCumplimiento: string;
  observaciones: string;
}

export interface ActaFirmante {
  id: string;
  nombre: string;
  cargo: string;
}

export interface ActaData {
  clase: string;
  caracter: 'Ordinaria' | 'Extraordinaria';
  tituloGrupo: string;
  numeroActa: string;
  ciudadFecha: string;
  horaInicio: string;
  horaFin: string;
  lugar: string;
  participantes: ActaParticipante[];
  ordenDelDia: string[];
  desarrollo: ActaPuntoDesarrollo[];
  compromisos: ActaCompromiso[];
  convocatoriaSiguiente: string;
  firmantes: ActaFirmante[];
  anexos: string;
  transcriptor: string;
}

// 5. INFORMES (Cap. 9)
export interface InformeTabla {
  id: string;
  titulo: string;
  columnas: string[];
  filas: string[][];
}

export interface InformeGrafico {
  id: string;
  titulo: string;
  unidad: string;
  datos: { etiqueta: string; valor: number }[];
}

export interface InformeCapitulo {
  id: string;
  numero: string;
  titulo: string;
  contenido: string;
}

export interface InformeData {
  clase: 'corto' | 'extenso' | 'ejecutivo';
  titulo: string;
  subtitulo: string;
  codigo: string;
  dependencia: string;
  ciudadFecha: string;
  responsables: string;
  destinatario: string;
  objetivos: string;
  introduccion: string;
  metodologia: string;
  capitulos: InformeCapitulo[];
  resultados: string;
  analisis: string;
  tablas: InformeTabla[];
  graficos: InformeGrafico[];
  conclusiones: string;
  recomendaciones: string;
  bibliografia: string;
  anexos: string;
  firmantes: ActaFirmante[];
  incluirRubrica: boolean;
  transcriptor: string;
}

// 6. CERTIFICADOS Y CONSTANCIAS (Cap. 10)
export interface CertificadoConstanciaData {
  categoria: 'certificado' | 'constancia';
  subtipo: string;
  codigo: string;
  ubicacionFecha: 'inicio' | 'final';
  ciudadFecha: string;
  cargoExpide: string;
  solicitanteTratamiento: string;
  solicitanteNombre: string;
  tipoDocumento: string;
  numeroDocumento: string;
  expedicionDocumento: string;
  periodoFechas: string;
  cuerpoParrafos: string;
  motivoDestino: string;
  expideNombre: string;
  expideCargo: string;
  transcriptor: string;
}

// 7. HOJA DE VIDA CORPORATIVA (Cap. 11)
export interface HojaVidaAcademico {
  id: string;
  nivel: string;
  institucion: string;
  tituloObtenido: string;
  fechaInicio: string;
  fechaFinalizacion: string;
  ciudadPais: string;
}

export interface HojaVidaExperiencia {
  id: string;
  empresa: string;
  cargo: string;
  fechaIngreso: string;
  fechaRetiro: string;
  funciones: string;
}

export interface HojaVidaFormacion {
  id: string;
  tipo: 'Curso' | 'Seminario' | 'Capacitación' | 'Certificación' | 'Idioma';
  nombre: string;
  institucion: string;
  duracionNivel: string;
  fecha: string;
}

export interface HojaVidaDistincion {
  id: string;
  titulo: string;
  entidad: string;
  fecha: string;
}

export interface HojaVidaData {
  primerApellido: string;
  segundoApellido: string;
  nombres: string;
  tipoIdentificacion: string;
  numeroIdentificacion: string;
  lugarExpedicion: string;
  fechaNacimiento: string;
  lugarNacimiento: string;
  genero: string;
  estadoCivil: string;
  numeroHijos: string;
  direccion: string;
  telefono: string;
  correo: string;
  // Información laboral en la organización
  fechaIngresoOrg: string;
  sucursalDependencia: string;
  estatusVinculacion: 'Activo' | 'Inactivo';
  tipoVinculacion: string;
  cargoActual: string;
  jefeInmediato: string;
  responsabilidadesActuales: string;
  eps: string;
  fondoPensiones: string;
  arl: string;
  visasInfo: string;
  academicos: HojaVidaAcademico[];
  experiencias: HojaVidaExperiencia[];
  formacionComplementaria: HojaVidaFormacion[];
  investigacionesDistinciones: HojaVidaDistincion[];
}

// 8. SOBRES COMERCIALES (Cap. 12)
export interface SobreData {
  clase: 'oficio' | 'carta' | 'tarjeta' | 'manila_carta' | 'manila_oficio' | 'manila_media_carta';
  conVentanilla: boolean;
  orientacionManila: 'horizontal' | 'vertical';
  anchoCm: number;
  altoCm: number;
  modelo: 'modelo1' | 'modelo2';
  destinoTipo: 'local' | 'nacional' | 'internacional';
  dependenciaRemitente: string;
  mencionTercioIzquierdo: string;
  destTratamiento: string;
  destNombre: string;
  destCargo: string;
  destOrganizacion: string;
  destDireccion: string;
  destTelefonoEspecial: string;
  destCiudadDepto: string;
  destPais: string;
  mostrarGuiasTercios: boolean;
}

// 9. MENSAJES ELECTRÓNICOS (Cap. 13)
export interface MensajeElectronicoData {
  tipo: string;
  remitenteNombre: string;
  remitenteCargo: string;
  remitenteCorreo: string;
  destinatario: string;
  copiaCC: string;
  copiaOcultaCCO: string;
  asunto: string;
  fechaReferencia: string;
  saludo: string;
  cuerpo: string;
  despedida: string;
  incluirFirmaInstitucional: boolean;
  adjuntosReferencia: string;
}

// 10. TARJETAS PROTOCOLARIAS (Cap. 14)
export interface TarjetaProtocolariaData {
  tipo: 'invitacion' | 'felicitacion' | 'agradecimiento' | 'presentacion';
  anchoCm: number;
  altoCm: number;
  presentacionVisual: 'sobria_crema' | 'marco_corporativo' | 'editorial_blanca';
  incluirLogo: boolean;
  // Invitación
  tipoEvento: string;
  motivoInvitacion: string;
  nombreQuienInvita: string;
  destinatarioNombre: string;
  fechaEvento: string;
  horaEvento: string;
  lugarEvento: string;
  informacionAdicional: string;
  datosConfirmacion: string;
  // Felicitación / Agradecimiento
  motivoMensaje: string;
  cuerpoMensaje: string;
  ciudadFecha: string;
  remitenteNombre: string;
  remitenteCargo: string;
  // Presentación
  presentacionTelefono: string;
  presentacionCorreo: string;
}

export type AnyDocumentData =
  | CartaData
  | MemorandoData
  | CircularData
  | ActaData
  | InformeData
  | CertificadoConstanciaData
  | HojaVidaData
  | SobreData
  | MensajeElectronicoData
  | TarjetaProtocolariaData;

export interface SavedDraft {
  id: string;
  moduleId: DocumentModuleId;
  title: string;
  updatedAt: string;
  format: DocumentFormatConfig;
  data: AnyDocumentData;
}

export interface DocumentModuleInfo {
  id: DocumentModuleId;
  chapter: string;
  title: string;
  shortDesc: string;
  availableTemplates: string[];
  supportsDistributionStyles: DistributionStyle[];
}
