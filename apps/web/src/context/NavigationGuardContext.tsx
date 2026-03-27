import React, { createContext, useContext, useState, useCallback, type PropsWithChildren } from 'react';
import { useNavigate } from 'react-router-dom';

type NavigationGuardContextValue = {
  /** true の間、ナビゲーションをブロックして確認モーダルを表示する */
  blocked: boolean;
  setBlocked: (v: boolean) => void;
  /** ブロック中に遷移しようとした先のパス（モーダル表示中のみ） */
  pendingPath: string | null;
  /** ナビゲーションを試みる。ブロック中なら保留してモーダルを出す */
  guardedNavigate: (path: string) => void;
  /** モーダルで「撤退する」を押した時 */
  confirmNavigation: () => void;
  /** モーダルで「戻る」を押した時 */
  cancelNavigation: () => void;
};

const NavigationGuardContext = createContext<NavigationGuardContextValue | null>(null);

export const NavigationGuardProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const navigate = useNavigate();
  const [blocked, setBlocked] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  const guardedNavigate = useCallback((path: string) => {
    if (blocked) {
      setPendingPath(path);
    } else {
      navigate(path);
    }
  }, [blocked, navigate]);

  const confirmNavigation = useCallback(() => {
    const path = pendingPath;
    setPendingPath(null);
    setBlocked(false);
    if (path) navigate(path);
  }, [pendingPath, navigate]);

  const cancelNavigation = useCallback(() => {
    setPendingPath(null);
  }, []);

  return (
    <NavigationGuardContext.Provider value={{ blocked, setBlocked, pendingPath, guardedNavigate, confirmNavigation, cancelNavigation }}>
      {children}
    </NavigationGuardContext.Provider>
  );
};

export function useNavigationGuard() {
  const ctx = useContext(NavigationGuardContext);
  if (!ctx) throw new Error('useNavigationGuard must be used inside <NavigationGuardProvider>');
  return ctx;
}
