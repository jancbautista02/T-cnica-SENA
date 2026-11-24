import React, { useState } from 'react';
import { Building2, Plus, RotateCcw, Trash2, Upload, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { OFFICIAL_LOGO_PATH } from '../data/defaults';
import { CorporateConfig } from '../types/documents';
import { TextAreaInput, TextInput } from './FormPrimitives';

interface CorporateSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CorporateSettingsModal: React.FC<CorporateSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { corporateConfig, updateCorporateConfig, resetCorporateConfig } = useAppContext();
  const [draft, setDraft] = useState<CorporateConfig>(() => ({ ...corporateConfig }));
  const [newCargo, setNewCargo] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!isOpen) return null;

  const update = (patch: Partial<CorporateConfig>) => setDraft((prev) => ({ ...prev, ...patch }));

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Selecciona un archivo de imagen válido (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('La imagen debe pesar menos de 2 MB.');
      return;
    }
    setUploadError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        update({ logoUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const addCargo = () => {
    const clean = newCargo.trim();
    if (!clean) return;
    if (!draft.cargosAutorizados.includes(clean)) {
      update({ cargosAutorizados: [...draft.cargosAutorizados, clean] });
    }
    setNewCargo('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCorporateConfig(draft);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <form
        onSubmit={handleSave}
        className="bg-white border border-[#E4E2EC] rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E4E2EC]">
          <div className="flex items-center gap-2.5">
            <Building2 size={18} className="text-[#5B2E7A]" />
            <h2 className="text-sm font-semibold text-[#181622]">
              Configuración institucional — Identidad corporativa
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar configuración"
            className="p-1.5 rounded-md text-[#6B6580] hover:text-[#181622] hover:bg-[#F4F3F8]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5">
          <div className="text-xs text-[#4A465C] bg-[#FAF9FC] border border-[#E4E2EC] rounded-md p-3">
            Los cambios guardados aquí actualizan de forma inmediata el membrete (Zona 1), pie de página (Zona 2), sobres, firmas y portadas de todos los documentos.
          </div>

          {/* Logo */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 border-b border-[#F0EEF5]">
            <div className="w-24 h-24 border border-[#E4E2EC] rounded-lg bg-[#FAF9FC] flex items-center justify-center p-2 shrink-0">
              {draft.logoUrl ? (
                <img
                  src={draft.logoUrl}
                  alt={draft.razonSocial}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <span className="text-[11px] text-[#9892AA]">Sin logo</span>
              )}
            </div>
            <div className="space-y-2 flex-1">
              <div className="text-xs font-semibold text-[#181622]">Logotipo corporativo (aspecto original preservado)</div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#181622] bg-white border border-[#DCD8E6] hover:bg-[#F7F7FA] rounded-md cursor-pointer transition-colors">
                  <Upload size={13} />
                  <span>Cargar imagen</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
                <button
                  type="button"
                  onClick={() => update({ logoUrl: OFFICIAL_LOGO_PATH })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#5B2E7A] hover:bg-[#5B2E7A]/[0.06] rounded-md transition-colors"
                >
                  <RotateCcw size={13} />
                  <span>Restaurar logotipo oficial</span>
                </button>
              </div>
              {uploadError && <div className="text-xs text-[#DC2626]">{uploadError}</div>}
            </div>
          </div>

          {/* Identification */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <TextInput
              label="Razón social"
              required
              value={draft.razonSocial}
              onChange={(e) => update({ razonSocial: e.target.value })}
            />
            <TextInput
              label="Nombre comercial"
              value={draft.nombreComercial}
              onChange={(e) => update({ nombreComercial: e.target.value })}
            />
            <TextInput
              label="NIT"
              required
              value={draft.nit}
              onChange={(e) => update({ nit: e.target.value })}
            />
          </div>

          <TextAreaInput
            label="Nota de verificación documental (RUT vs. RUES)"
            rows={2}
            value={draft.notaDenominacion}
            onChange={(e) => update({ notaDenominacion: e.target.value })}
          />

          {/* Address */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <TextInput
              label="País"
              value={draft.pais}
              onChange={(e) => update({ pais: e.target.value })}
            />
            <TextInput
              label="Departamento"
              value={draft.departamento}
              onChange={(e) => update({ departamento: e.target.value })}
            />
            <TextInput
              label="Municipio"
              value={draft.municipio}
              onChange={(e) => update({ municipio: e.target.value })}
            />
            <TextInput
              label="Localidad"
              value={draft.localidad}
              onChange={(e) => update({ localidad: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <TextInput
                label="Dirección principal"
                required
                value={draft.direccion}
                onChange={(e) => update({ direccion: e.target.value })}
              />
            </div>
            <TextInput
              label="Código postal"
              value={draft.codigoPostal}
              onChange={(e) => update({ codigoPostal: e.target.value })}
            />
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <TextInput
              label="Correo electrónico oficial"
              type="email"
              required
              value={draft.correo}
              onChange={(e) => update({ correo: e.target.value })}
            />
            <TextInput
              label="Teléfonos corporativos"
              hint="Dejar vacío hasta confirmar"
              placeholder="Sin confirmar"
              value={draft.telefonos}
              onChange={(e) => update({ telefonos: e.target.value })}
            />
            <TextInput
              label="Sitio web (opcional)"
              placeholder="https://..."
              value={draft.sitioWeb}
              onChange={(e) => update({ sitioWeb: e.target.value })}
            />
          </div>

          {/* Representative & CIIU */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <TextInput
                label="Representante legal"
                required
                value={draft.representanteLegal}
                onChange={(e) => update({ representanteLegal: e.target.value })}
              />
            </div>
            <TextInput
              label="CIIU Principal"
              value={draft.ciiuPrincipal}
              onChange={(e) => update({ ciiuPrincipal: e.target.value })}
            />
            <TextInput
              label="CIIU Secundaria / RUES"
              value={`${draft.ciiuSecundaria}${draft.otraActividadRues ? ` / ${draft.otraActividadRues}` : ''}`}
              onChange={(e) => {
                const [sec, rues = ''] = e.target.value.split('/').map((s) => s.trim());
                update({ ciiuSecundaria: sec || '', otraActividadRues: rues });
              }}
            />
          </div>

          {/* Authorized positions */}
          <div className="space-y-2 pt-2 border-t border-[#F0EEF5]">
            <div className="text-xs font-semibold text-[#181622]">Cargos autorizados frecuentes</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {draft.cargosAutorizados.map((cargo, idx) => (
                <div
                  key={`${cargo}-${idx}`}
                  className="flex items-center justify-between px-3 py-1.5 text-xs bg-[#FAF9FC] border border-[#E4E2EC] rounded-md"
                >
                  <span>{cargo}</span>
                  <button
                    type="button"
                    onClick={() =>
                      update({
                        cargosAutorizados: draft.cargosAutorizados.filter((_, i) => i !== idx),
                      })
                    }
                    className="text-[#9892AA] hover:text-[#DC2626]"
                    aria-label={`Eliminar ${cargo}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nuevo cargo autorizado..."
                value={newCargo}
                onChange={(e) => setNewCargo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCargo();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs border border-[#DCD8E6] rounded-md focus:outline-none focus:border-[#5B2E7A]"
              />
              <button
                type="button"
                onClick={addCargo}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#5B2E7A] border border-[#5B2E7A]/30 rounded-md hover:bg-[#5B2E7A]/[0.05]"
              >
                <Plus size={13} />
                <span>Agregar</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 border-t border-[#E4E2EC] bg-[#FAF9FC]">
          <button
            type="button"
            onClick={() => {
              resetCorporateConfig();
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#6B6580] hover:text-[#181622] rounded-md"
          >
            <RotateCcw size={13} />
            <span>Restablecer datos verificados</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-[#4A465C] hover:text-[#181622] rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#5B2E7A] hover:bg-[#4A2366] rounded-md transition-colors"
            >
              Guardar configuración
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
