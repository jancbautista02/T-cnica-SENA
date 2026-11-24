import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AnyDocumentData,
  CorporateConfig,
  DocumentFormatConfig,
  DocumentModuleId,
  SavedDraft,
} from '../types/documents';
import { DEFAULT_CORPORATE_CONFIG } from '../data/defaults';

const CORP_STORAGE_KEY = 'vaquimilk_gtc185_corporate_config_v1';
const DRAFTS_STORAGE_KEY = 'vaquimilk_gtc185_drafts_v1';

interface AppContextValue {
  corporateConfig: CorporateConfig;
  updateCorporateConfig: (next: CorporateConfig) => void;
  resetCorporateConfig: () => void;
  drafts: SavedDraft[];
  saveDraft: (
    moduleId: DocumentModuleId,
    title: string,
    format: DocumentFormatConfig,
    data: AnyDocumentData,
    existingId?: string
  ) => SavedDraft;
  duplicateDraft: (draftId: string) => SavedDraft | null;
  deleteDraft: (draftId: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [corporateConfig, setCorporateConfig] = useState<CorporateConfig>(() => {
    try {
      const raw = localStorage.getItem(CORP_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<CorporateConfig>;
        return { ...DEFAULT_CORPORATE_CONFIG, ...parsed };
      }
    } catch {
      // ignore corrupted storage
    }
    return DEFAULT_CORPORATE_CONFIG;
  });

  const [drafts, setDrafts] = useState<SavedDraft[]>(() => {
    try {
      const raw = localStorage.getItem(DRAFTS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedDraft[];
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore corrupted storage
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(CORP_STORAGE_KEY, JSON.stringify(corporateConfig));
    } catch {
      // ignore quota errors
    }
  }, [corporateConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
    } catch {
      // ignore quota errors
    }
  }, [drafts]);

  const updateCorporateConfig = (next: CorporateConfig) => {
    setCorporateConfig(next);
  };

  const resetCorporateConfig = () => {
    setCorporateConfig(DEFAULT_CORPORATE_CONFIG);
  };

  const saveDraft = (
    moduleId: DocumentModuleId,
    title: string,
    format: DocumentFormatConfig,
    data: AnyDocumentData,
    existingId?: string
  ): SavedDraft => {
    const nowIso = new Date().toISOString();
    const id = existingId || `draft_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const draft: SavedDraft = {
      id,
      moduleId,
      title: title.trim() || 'Documento sin título',
      updatedAt: nowIso,
      format: JSON.parse(JSON.stringify(format)) as DocumentFormatConfig,
      data: JSON.parse(JSON.stringify(data)) as AnyDocumentData,
    };

    setDrafts((prev) => {
      const idx = prev.findIndex((d) => d.id === id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = draft;
        return copy;
      }
      return [draft, ...prev];
    });
    return draft;
  };

  const duplicateDraft = (draftId: string): SavedDraft | null => {
    const found = drafts.find((d) => d.id === draftId);
    if (!found) return null;
    const copy: SavedDraft = {
      ...JSON.parse(JSON.stringify(found)),
      id: `draft_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title: `${found.title} (Copia)`,
      updatedAt: new Date().toISOString(),
    };
    setDrafts((prev) => [copy, ...prev]);
    return copy;
  };

  const deleteDraft = (draftId: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== draftId));
  };

  return (
    <AppContext.Provider
      value={{
        corporateConfig,
        updateCorporateConfig,
        resetCorporateConfig,
        drafts,
        saveDraft,
        duplicateDraft,
        deleteDraft,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used inside AppProvider');
  }
  return ctx;
}
