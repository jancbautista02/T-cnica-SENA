import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { DocumentFormatConfig, DocumentModuleId, SobreData, TarjetaProtocolariaData, AnyDocumentData } from '../types/documents';

function getPageDimensionsMm(
  moduleId: DocumentModuleId,
  format: DocumentFormatConfig,
  data: AnyDocumentData
): { widthMm: number; heightMm: number; orientation: 'p' | 'l' } {
  if (moduleId === 'sobre') {
    const d = data as SobreData;
    const widthMm = (d.anchoCm || 24.1) * 10;
    const heightMm = (d.altoCm || 10.5) * 10;
    return {
      widthMm,
      heightMm,
      orientation: widthMm >= heightMm ? 'l' : 'p',
    };
  }
  if (moduleId === 'tarjeta') {
    const d = data as TarjetaProtocolariaData;
    const widthMm = (d.anchoCm || 15) * 10;
    const heightMm = (d.altoCm || 10) * 10;
    return {
      widthMm,
      heightMm,
      orientation: widthMm >= heightMm ? 'l' : 'p',
    };
  }

  switch (format.pageSize) {
    case 'oficio':
      return { widthMm: 215.9, heightMm: 330.0, orientation: 'p' };
    case 'a4':
      return { widthMm: 210.0, heightMm: 297.0, orientation: 'p' };
    case 'carta':
    default:
      return { widthMm: 215.9, heightMm: 279.4, orientation: 'p' };
  }
}

export async function exportPreviewToPdf(
  containerEl: HTMLElement,
  fileName: string,
  moduleId: DocumentModuleId,
  format: DocumentFormatConfig,
  data: AnyDocumentData
): Promise<void> {
  const pageNodes = Array.from(containerEl.querySelectorAll<HTMLElement>('[data-doc-page]'));
  if (pageNodes.length === 0) {
    throw new Error('No se encontraron páginas en la vista previa para exportar.');
  }

  const { widthMm, heightMm, orientation } = getPageDimensionsMm(moduleId, format, data);
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: [widthMm, heightMm],
    compress: true,
  });

  for (let i = 0; i < pageNodes.length; i++) {
    const node = pageNodes[i];
    // Temporarily reset transform if zoomed
    const prevTransform = node.style.transform;
    node.style.transform = 'none';
    const zoomWrapper = node.closest<HTMLElement>('[data-zoom-wrapper="true"]');
    const prevWrapperTransform = zoomWrapper ? zoomWrapper.style.transform : '';
    if (zoomWrapper) {
      zoomWrapper.style.transform = 'none';
    }

    const canvas = await html2canvas(node, {
      scale: 2.5,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    node.style.transform = prevTransform;
    if (zoomWrapper) {
      zoomWrapper.style.transform = prevWrapperTransform;
    }

    const imgData = canvas.toDataURL('image/png', 1.0);
    if (i > 0) {
      pdf.addPage([widthMm, heightMm], orientation);
    }
    pdf.addImage(imgData, 'PNG', 0, 0, widthMm, heightMm, undefined, 'FAST');
  }

  const safeName = fileName.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_-]+/g, '_').replace(/^_+|_+$/g, '') || 'documento_vaquimilk';
  pdf.save(`${safeName}.pdf`);
}
