import { useEffect, useRef, useState, useCallback } from "react";
import { logMalpracticeEvent } from "../services/attemptService";

export function useMalpractice({ attemptId, studentId, testId, enabled, onTerminate }) {
  const [count, setCount] = useState(0);
  const [lastEvent, setLastEvent] = useState(null);
  const [warningVisible, setWarningVisible] = useState(false);
  const warningTimeout = useRef(null);
  const isTerminatingRef = useRef(false);

  const record = useCallback(
    async (eventType) => {
      if (!enabled || !attemptId) return;
      if (isTerminatingRef.current) return; // prevent duplicate termination
      isTerminatingRef.current = true;

      setCount((c) => c + 1);
      setLastEvent(eventType);
      setWarningVisible(true);
      if (warningTimeout.current) clearTimeout(warningTimeout.current);
      warningTimeout.current = setTimeout(() => setWarningVisible(false), 4000);

      // Immediately trigger termination UI lock before async save
      if (onTerminate) {
        try {
          onTerminate(eventType);
        } catch (e) {
          console.error("onTerminate error", e);
        }
      }

      try {
        await logMalpracticeEvent(attemptId, { studentId, testId, eventType });
      } catch (e) {
        console.error("Failed to log malpractice", e);
      }
    },
    [attemptId, studentId, testId, enabled, onTerminate]
  );

  useEffect(() => {
    if (!enabled) return;

    const handleFullscreen = () => {
      if (!document.fullscreenElement) {
        record("fullscreen_exit");
      }
    };
    const handleVisibility = () => {
      if (document.hidden) record("tab_switch");
    };
    const handleBlur = () => record("window_blur");
    const handleCopy = (e) => {
      e.preventDefault();
      record("copy");
    };
    const handlePaste = (e) => {
      e.preventDefault();
      record("paste");
    };
    const handleCut = (e) => {
      e.preventDefault();
      record("cut");
    };
    const handleContext = (e) => {
      e.preventDefault();
      record("context_menu");
    };
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && ["c", "v", "x", "a", "p", "s"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        record("shortcut");
      }
      if (e.key === "F12" || (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key.toUpperCase()))) {
        e.preventDefault();
        record("shortcut");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreen);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("cut", handleCut);
    document.addEventListener("contextmenu", handleContext);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreen);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("contextmenu", handleContext);
      document.removeEventListener("keydown", handleKey);
      if (warningTimeout.current) clearTimeout(warningTimeout.current);
    };
  }, [enabled, record]);

  return { count, lastEvent, warningVisible, setCount, isTerminatingRef };
}
