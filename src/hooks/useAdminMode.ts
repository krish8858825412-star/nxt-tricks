import { useEffect, useState, useCallback } from "react";

const KEY = "nxt:admin-mode";
const EVENT = "nxt:admin-mode-changed";

export function useAdminMode() {
  const [enabled, setEnabled] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const sync = () => {
      try {
        setEnabled(sessionStorage.getItem(KEY) === "1");
      } catch {
        /* ignore */
      }
    };
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const enable = useCallback(() => {
    sessionStorage.setItem(KEY, "1");
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const disable = useCallback(() => {
    sessionStorage.removeItem(KEY);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { enabled, enable, disable };
}

export const ADMIN_PWD_KEY = "nxt:admin-pwd";
export const getAdminPassword = (): string => {
  try {
    return sessionStorage.getItem(ADMIN_PWD_KEY) ?? "";
  } catch {
    return "";
  }
};
export const setAdminPassword = (pwd: string) => {
  try {
    sessionStorage.setItem(ADMIN_PWD_KEY, pwd);
  } catch {
    /* ignore */
  }
};