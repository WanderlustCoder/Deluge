"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface LiveRegionContextType {
  announce: (message: string, priority?: "polite" | "assertive") => void;
}

const LiveRegionContext = createContext<LiveRegionContextType>({
  announce: () => {},
});

export function useLiveRegion() {
  return useContext(LiveRegionContext);
}

export function LiveRegionProvider({ children }: { children: ReactNode }) {
  const [politeMessage, setPoliteMessage] = useState("");
  const [assertiveMessage, setAssertiveMessage] = useState("");

  const announce = useCallback((message: string, priority: "polite" | "assertive" = "polite") => {
    if (priority === "assertive") {
      setAssertiveMessage("");
      setTimeout(() => setAssertiveMessage(message), 100);
    } else {
      setPoliteMessage("");
      setTimeout(() => setPoliteMessage(message), 100);
    }
  }, []);

  return (
    <LiveRegionContext.Provider value={{ announce }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {politeMessage}
      </div>
      <div
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        role="alert"
      >
        {assertiveMessage}
      </div>
    </LiveRegionContext.Provider>
  );
}
