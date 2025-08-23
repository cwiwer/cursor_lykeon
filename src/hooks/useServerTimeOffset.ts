import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Retorna diferença (ms) para somar ao Date local e aproximar do horário do servidor */
export function useServerTimeOffset() {
  const [offset, setOffset] = useState(0);
  
  useEffect(() => {
    (async () => {
      try {
        const start = Date.now();
        
        // Tentar usar RPC se existir, senão fazer select simples
        let serverTime: any;
        try {
          const { data, error } = await supabase.rpc("now");
          if (!error && data) {
            serverTime = data;
          }
        } catch {
          // Fallback: SELECT NOW()
          const { data, error } = await supabase
            .from('child_profiles') // usar uma tabela que existe
            .select('created_at')
            .limit(1)
            .single();
          
          if (!error && data) {
            serverTime = data.created_at;
          }
        }
        
        if (serverTime) {
          const end = Date.now();
          const serverMs = new Date(serverTime).getTime();
          // meia latência como aproximação do RTT
          const approx = serverMs + (end - start) / 2 - end;
          setOffset(approx);
        }
      } catch (error) {
        console.warn('Não foi possível sincronizar com o tempo do servidor:', error);
      }
    })();
  }, []);
  
  return offset;
}
