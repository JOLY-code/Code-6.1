import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import projectData from '../config/projectData.js';

const STORAGE_KEY = `${projectData.storage.namespace}:sector`;
const SectorContext = createContext(null);

export function SectorProvider({ children }) {
  const { sectors } = projectData;
  const [sectorId, setSectorId] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const fromUrl = params.get('sector')?.trim().toLowerCase();
      if (fromUrl && sectors.some((s) => s.id === fromUrl)) return fromUrl;
    } catch { /* URL indisponible */ }
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (sectors.some((s) => s.id === saved)) return saved;
    } catch { /* stockage indisponible */ }
    return sectors[0].id;
  });

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, sectorId); } catch { /* ignore */ }
  }, [sectorId]);

  const value = useMemo(
    () => ({ sectors, sectorId, setSectorId, sector: sectors.find((s) => s.id === sectorId) || sectors[0] }),
    [sectors, sectorId],
  );
  return <SectorContext.Provider value={value}>{children}</SectorContext.Provider>;
}

export const useSector = () => {
  const ctx = useContext(SectorContext);
  if (!ctx) throw new Error('useSector doit être utilisé dans <SectorProvider>');
  return ctx;
};
