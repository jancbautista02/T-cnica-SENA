import React, { useState } from 'react';
import { Copy, FolderOpen, Search, Trash2, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { DOCUMENT_MODULES } from '../data/defaults';
import { SavedDraft } from '../types/documents';

interface DraftsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadDraft: (draft: SavedDraft) => void;
}

export const DraftsModal: React.FC<DraftsModalProps> = ({ isOpen, onClose, onLoadDraft }) => {
  const { drafts, duplicateDraft, deleteDraft } = useAppContext();
  const [query, setQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('all');

  if (!isOpen) return null;

  const filtered = drafts.filter((d) => {
    const matchesModule = moduleFilter === 'all' || d.moduleId === moduleFilter;
    const matchesQuery =
      !query.trim() || d.title.toLowerCase().includes(query.trim().toLowerCase());
    return matchesModule && matchesQuery;
  });

  const getModuleTitle = (id: string) =>
    DOCUMENT_MODULES.find((m) => m.id === id)?.title || id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="bg-white border border-[#E4E2EC] rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E4E2EC]">
          <div className="flex items-center gap-2">
            <FolderOpen size={18} className="text-[#5B2E7A]" />
            <h2 className="text-sm font-semibold text-[#181622]">
              Borradores guardados ({drafts.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar borradores"
            className="p-1.5 rounded-md text-[#6B6580] hover:text-[#181622] hover:bg-[#F4F3F8]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 border-b border-[#F0EEF5] flex flex-col sm:flex-row gap-2.5 bg-[#FAF9FC]">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9892AA]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar borrador por título..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#DCD8E6] rounded-md focus:outline-none focus:border-[#5B2E7A]"
            />
          </div>
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-[#DCD8E6] rounded-md focus:outline-none focus:border-[#5B2E7A]"
          >
            <option value="all">Todos los tipos documentales</option>
            {DOCUMENT_MODULES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-xs text-[#6B6580]">
              {drafts.length === 0
                ? 'Aún no tienes borradores guardados. Abre cualquier módulo y presiona "Guardar borrador".'
                : 'No se encontraron borradores que coincidan con el filtro.'}
            </div>
          ) : (
            <div className="divide-y divide-[#F0EEF5] border border-[#E4E2EC] rounded-lg">
              {filtered.map((draft) => {
                const updated = new Date(draft.updatedAt).toLocaleString('es-CO', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                });
                return (
                  <div
                    key={draft.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 hover:bg-[#FAF9FC] transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[#181622] truncate">
                        {draft.title}
                      </div>
                      <div className="text-xs text-[#6B6580] mt-0.5 tabular-nums">
                        {getModuleTitle(draft.moduleId)} · Actualizado {updated}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          onLoadDraft(draft);
                          onClose();
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-[#5B2E7A] hover:bg-[#4A2366] rounded-md transition-colors"
                      >
                        Abrir
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateDraft(draft.id)}
                        title="Duplicar borrador"
                        className="p-1.5 text-[#4A465C] hover:text-[#181622] border border-[#DCD8E6] rounded-md"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteDraft(draft.id)}
                        title="Eliminar borrador"
                        className="p-1.5 text-[#DC2626] hover:bg-[#FEF2F2] border border-[#FECACA] rounded-md"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
