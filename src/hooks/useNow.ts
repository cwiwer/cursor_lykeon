import { useEffect, useRef, useState } from "react";

export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState<Date>(() => new Date());
  const timer = useRef<number | null>(null);

  function tick() { 
    setNow(new Date()); 
  }

  useEffect(() => {
    function start() {
      if (timer.current) return;
      timer.current = window.setInterval(tick, intervalMs) as unknown as number;
    }
    
    function stop() {
      if (timer.current) { 
        clearInterval(timer.current); 
        timer.current = null; 
      }
    }
    
    start(); // start on mount
    const vis = () => (document.hidden ? stop() : (tick(), start()));
    document.addEventListener("visibilitychange", vis);
    
    return () => { 
      stop(); 
      document.removeEventListener("visibilitychange", vis); 
    };
  }, [intervalMs]);

  return now;
}
