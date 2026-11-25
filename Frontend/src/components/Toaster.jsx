import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const useToasts = () => useContext(ToastContext);

let idCounter = 1;

export const ToasterProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((toast) => {
    const id = idCounter++;
    setToasts((t) => [{ id, ...toast }, ...t]);
    // auto dismiss
    if (toast.duration !== 0) {
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, toast.duration ?? 3000);
    }
    return id;
  }, []);

  const remove = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  return (
    <ToastContext.Provider value={{ push, remove }}>
      {children}
      <div className="fixed right-4 top-4 z-[9999] flex flex-col-reverse gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`transform transition duration-300 ease-out translate-x-0 flex w-80 items-center gap-3 rounded-lg bg-white shadow-lg ${t.type === 'success' ? 'border-l-4 border-emerald-500' : t.type === 'error' ? 'border-l-4 border-red-500' : 'border-l-4 border-gray-300'}`}
            style={{ animation: 'toast-in 300ms ease' }}
          >
            <div className="px-4 py-3">
              {t.type === 'success' ? (
                <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              ) : t.type === 'error' ? (
                <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : null}
            </div>
            <div className="flex-1 p-3">
              <div className="text-sm font-semibold">{t.title}</div>
              {t.message && <div className="text-xs text-gray-600">{t.message}</div>}
            </div>
            <button onClick={() => remove(t.id)} className="p-3 text-gray-400 hover:text-gray-600">✕</button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toast-in { from { transform: translateX(120%); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
      `}</style>
    </ToastContext.Provider>
  );
};

export default ToasterProvider;
