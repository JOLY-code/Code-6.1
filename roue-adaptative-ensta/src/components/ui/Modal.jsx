import { useEffect } from 'react';
import Icon from './Icon.jsx';

export default function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm sm:items-center" onMouseDown={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true" aria-label={title}>
      <div className={`card w-full ${wide ? 'max-w-3xl' : 'max-w-xl'} bg-slate-900 p-5 sm:p-6`}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button className="btn-ghost px-2" onClick={onClose} aria-label="Fermer"><Icon name="X" size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

