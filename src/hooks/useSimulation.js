import { useEffect } from 'react';
import { useAgentStore } from '../store/useAgentStore';

export function useSimulation(intervalMs = 3500) {
  const tickSimulation = useAgentStore((s) => s.tickSimulation);

  useEffect(() => {
    const id = setInterval(tickSimulation, intervalMs);
    return () => clearInterval(id);
  }, [tickSimulation, intervalMs]);
}
