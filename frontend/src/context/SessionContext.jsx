import { createContext, useContext, useEffect, useRef, useState } from "react";
import { endSession } from "../api/atm.api";
import { useNavigate } from "react-router-dom";

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();
  const timerRef = useRef(null);
  console.log("SessionProvider rendered");
  console.log("timerRef current:", timerRef.current);

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      handleTimeout();
    }, 30_000);
  };

  const handleTimeout = async () => {
    if (session?.sessionId) {
      await endSession(session.sessionId);
    }
    setSession(null);
    navigate("/", { replace: true });
    sessionStorage.clear();
  };

  const logout = async () => {
    if (session?.sessionId) {
      await endSession(session.sessionId);
    }
    setSession(null);
    navigate("/", { replace: true });
    sessionStorage.clear();
  };

  useEffect(() => {
    if (!session) return;

    resetTimer();

    const events = ["click", "keydown", "mousemove"];
    events.forEach((e) => window.addEventListener(e, resetTimer));

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      clearTimeout(timerRef.current);
    };
  }, [session]);

  return (
    <SessionContext.Provider value={{ session, setSession, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used inside SessionProvider");
  }
  return context;
}
