import { create } from 'zustand';
import { GATES } from '../data/gates';

export const useGateStore = create((set, get) => ({
  gates: GATES.map((g) => ({ ...g })),

  approveGateItem: (gateId) => {
    set((state) => ({
      gates: state.gates.map((g) => {
        if (g.id !== gateId) return g;
        const newApproved = Math.min(g.itemsApproved + 1, g.itemsCount);
        const allApproved = newApproved >= g.itemsCount;
        return {
          ...g,
          itemsApproved: newApproved,
          status: allApproved ? 'completed' : g.status,
        };
      }),
    }));
  },

  approveAllInGate: (gateId) => {
    set((state) => ({
      gates: state.gates.map((g) => {
        if (g.id !== gateId) return g;
        return { ...g, itemsApproved: g.itemsCount, status: 'completed' };
      }),
    }));
  },

  rejectGateItem: (gateId) => {
    set((state) => ({
      gates: state.gates.map((g) => {
        if (g.id !== gateId) return g;
        return { ...g, status: g.status === 'completed' ? 'active' : g.status };
      }),
    }));
  },

  tickSLAs: () => {
    // SLA deadlines are real Date objects — just re-render triggers fresh countdowns
    // No mutation needed; components compute from gate.slaDeadline
  },

  getGateById: (id) => get().gates.find((g) => g.id === id),
  getActiveGates: () => get().gates.filter((g) => g.status === 'active'),
  getOverduGates: () => get().gates.filter((g) => g.status === 'active' && new Date() > g.slaDeadline),
}));
