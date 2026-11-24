import React, { useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { CorporateSettingsModal } from './components/CorporateSettingsModal';
import { DocumentEditor } from './components/DocumentEditor';
import { DraftsModal } from './components/DraftsModal';
import { MainMenu } from './components/MainMenu';
import { DocumentModuleId, SavedDraft } from './types/documents';

interface EditorSession {
  key: string;
  moduleId: DocumentModuleId;
  templateName?: string;
  draft?: SavedDraft | null;
}

const AppShell: React.FC = () => {
  const { corporateConfig } = useAppContext();
  const [session, setSession] = useState<EditorSession | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);

  const openModule = (moduleId: DocumentModuleId, templateName?: string) => {
    setSession({
      key: `${moduleId}_${Date.now()}`,
      moduleId,
      templateName,
      draft: null,
    });
  };

  const loadDraft = (draft: SavedDraft) => {
    setSession({
      key: `draft_${draft.id}_${Date.now()}`,
      moduleId: draft.moduleId,
      draft,
    });
  };

  return (
    <div className="min-h-screen bg-[#F7F7FA] text-[#181622] flex flex-col">
      {/* Top Bar Contract: max 3 zones, single-line controls */}
      <header className="no-print h-[57px] bg-white border-b border-[#E4E2EC] px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0">
        {/* Zone 1: Brand wordmark */}
        <button
          type="button"
          onClick={() => setSession(null)}
          className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0"
        >
          {corporateConfig.logoUrl && (
            <img
              src={corporateConfig.logoUrl}
              alt={corporateConfig.nombreComercial}
              className="h-8 w-auto object-contain shrink-0"
            />
          )}
          <span className="font-display text-sm font-bold tracking-tight text-[#181622]">
            {corporateConfig.razonSocial}
          </span>
        </button>

        {/* Zone 2: Navigation links */}
        <nav className="flex items-center gap-5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setSession(null)}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              session === null ? 'text-[#5B2E7A] font-semibold' : 'text-[#5E5972] hover:text-[#181622]'
            }`}
          >
            Inicio
          </button>
          <button
            type="button"
            onClick={() => setShowDrafts(true)}
            className="whitespace-nowrap shrink-0 text-[#5E5972] hover:text-[#181622] transition-colors"
          >
            Borradores
          </button>
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="whitespace-nowrap shrink-0 text-[#5E5972] hover:text-[#181622] transition-colors"
          >
            Configuración
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <button
          type="button"
          onClick={() => openModule(session ? session.moduleId : 'carta')}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#5B2E7A] hover:bg-[#4A2366] rounded-md whitespace-nowrap shrink-0 transition-colors"
        >
          Nuevo documento
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 min-h-0">
        {session === null ? (
          <MainMenu
            onSelectModule={openModule}
            onOpenDrafts={() => setShowDrafts(true)}
            onLoadDraft={loadDraft}
          />
        ) : (
          <DocumentEditor
            key={session.key}
            moduleId={session.moduleId}
            initialTemplateName={session.templateName}
            loadedDraft={session.draft}
            onBack={() => setSession(null)}
          />
        )}
      </div>

      {/* Institutional Settings Modal */}
      {showSettings && (
        <CorporateSettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Saved Drafts Modal */}
      {showDrafts && (
        <DraftsModal
          isOpen={showDrafts}
          onClose={() => setShowDrafts(false)}
          onLoadDraft={loadDraft}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
