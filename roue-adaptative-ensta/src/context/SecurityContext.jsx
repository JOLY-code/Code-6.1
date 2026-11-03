import { createContext, useCallback, useContext, useState } from 'react';
import storage from '../services/storageService.js';

const SecurityContext = createContext(null);

export function SecurityProvider({ children }) {
  const [adminToken, setAdminTokenState] = useState(() => storage.getAdminToken());
  const [reviewerSession, setReviewerSessionState] = useState(() => storage.getReviewerSession());
  const [validationModalOpen, setValidationModalOpen] = useState(false);

  const isAdminAuthed = Boolean(adminToken);
  const isReviewerAuthed = Boolean(reviewerSession?.authed);
  const isPrivileged = isAdminAuthed || isReviewerAuthed;

  const loginAdmin = useCallback(async (code) => {
    const res = await storage.authenticateAdmin(code);
    if (res.ok && res.token) {
      setAdminTokenState(res.token);
    }
    return res;
  }, []);

  const logoutAdmin = useCallback(() => {
    storage.logoutAdminSession();
    setAdminTokenState('');
  }, []);

  const loginReviewer = useCallback(async (code) => {
    const res = await storage.authenticateReviewer(code);
    if (res.ok) {
      setReviewerSessionState({ authed: true, role: res.role, token: res.token });
    }
    return res;
  }, []);

  const logoutReviewer = useCallback(() => {
    storage.logoutReviewerSession();
    setReviewerSessionState({ authed: false, role: null, token: '' });
  }, []);

  const openValidationModal = useCallback(() => setValidationModalOpen(true), []);
  const closeValidationModal = useCallback(() => setValidationModalOpen(false), []);

  return (
    <SecurityContext.Provider
      value={{
        adminToken,
        isAdminAuthed,
        reviewerSession,
        isReviewerAuthed,
        isPrivileged,
        loginAdmin,
        logoutAdmin,
        loginReviewer,
        logoutReviewer,
        validationModalOpen,
        openValidationModal,
        closeValidationModal,
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const ctx = useContext(SecurityContext);
  if (!ctx) {
    return {
      adminToken: '',
      isAdminAuthed: false,
      reviewerSession: { authed: false, role: null, token: '' },
      isReviewerAuthed: false,
      isPrivileged: false,
      loginAdmin: async () => ({ ok: false }),
      logoutAdmin: () => {},
      loginReviewer: async () => ({ ok: false }),
      logoutReviewer: () => {},
      validationModalOpen: false,
      openValidationModal: () => {},
      closeValidationModal: () => {},
    };
  }
  return ctx;
}

