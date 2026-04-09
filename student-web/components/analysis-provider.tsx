'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type StoredFileMeta = {
  name: string;
  size: number;
  type: string;
  lastModified: number;
};

type SocietyResult = {
  code: string;
  name: string;
  qualifies: boolean;
  level: string | null;
  reason: string;
  qualifyingUnits: number | string | null;
  qualifyingGpa: number | string | null;
  qualifyingCourses: Array<{
    code: string;
    title: string;
    grade: string;
    creditHours: number;
  }>;
};

type AnalysisResult = {
  transcript: {
    name: string;
    studentId: string;
    dob: string;
    major: string;
    gpa: number;
    earnedHours: number;
    currentEnrollmentHours: number;
    completedCourseCount: number;
    inProgressCourseCount: number;
    transcriptSocieties: string[];
    veteranStatusDetected: boolean;
    dd214Detected: boolean;
  };
  qualifiedSocieties: SocietyResult[];
  allSocieties: SocietyResult[];
  upload: {
    fileCount: number;
    fileNames: string[];
    extractedTextLength: number;
  };
};

type AnalysisStoreValue = {
  files: File[];
  fileMeta: StoredFileMeta[];
  result: AnalysisResult | null;
  setFiles: (nextFiles: File[]) => void;
  setResult: (nextResult: AnalysisResult | null) => void;
  clearAnalysis: () => void;
};

const STORAGE_KEY = 'occ-honor-analysis';

const AnalysisStoreContext = createContext<AnalysisStoreValue | null>(null);

function toStoredFileMeta(files: File[]) {
  return files.map((file) => ({
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified
  }));
}

export default function AnalysisProvider({ children }: { children: ReactNode }) {
  const [files, setFilesState] = useState<File[]>([]);
  const [fileMeta, setFileMeta] = useState<StoredFileMeta[]>([]);
  const [result, setResultState] = useState<AnalysisResult | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setHasHydrated(true);
        return;
      }

      const parsed = JSON.parse(raw);
      setFileMeta(Array.isArray(parsed?.fileMeta) ? parsed.fileMeta : []);
      setResultState(parsed?.result || null);
    } catch {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } finally {
      setHasHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    const payload = JSON.stringify({
      fileMeta,
      result
    });

    window.sessionStorage.setItem(STORAGE_KEY, payload);
  }, [fileMeta, hasHydrated, result]);

  const value = useMemo<AnalysisStoreValue>(
    () => ({
      files,
      fileMeta,
      result,
      setFiles: (nextFiles) => {
        setFilesState(nextFiles);
        setFileMeta(toStoredFileMeta(nextFiles));
      },
      setResult: (nextResult) => {
        setResultState(nextResult);
      },
      clearAnalysis: () => {
        setFilesState([]);
        setFileMeta([]);
        setResultState(null);
        window.sessionStorage.removeItem(STORAGE_KEY);
      }
    }),
    [fileMeta, files, result]
  );

  return <AnalysisStoreContext.Provider value={value}>{children}</AnalysisStoreContext.Provider>;
}

export function useAnalysisStore() {
  const context = useContext(AnalysisStoreContext);

  if (!context) {
    throw new Error('useAnalysisStore must be used within AnalysisProvider.');
  }

  return context;
}
