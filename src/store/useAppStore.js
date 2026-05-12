import { create } from 'zustand';

export const ROLES = {
  MARKETING_HEAD: 'marketing-head',
  CAMPAIGN_LEAD: 'campaign-lead',
  CONTENT_EDITOR: 'content-editor',
  AI_COE: 'ai-coe',
};

export const ROLE_CONFIG = {
  [ROLES.MARKETING_HEAD]: {
    label: 'Marketing Head',
    description: 'Executive overview — ROI, output volume, gate status',
    avatar: 'MH',
    name: 'Director of Marketing',
    visibleNav: ['/', '/performance', '/gates'],
    showTelemetry: false,
    showTokenCosts: false,
    showAgentInternals: false,
  },
  [ROLES.CAMPAIGN_LEAD]: {
    label: 'Campaign Lead',
    description: 'Campaign Studio, gate actions, content calendar',
    avatar: 'CL',
    name: 'Morgan Caldwell',
    visibleNav: ['/', '/pipeline', '/content', '/gates', '/performance'],
    showTelemetry: false,
    showTokenCosts: false,
    showAgentInternals: false,
  },
  [ROLES.CONTENT_EDITOR]: {
    label: 'Content Editor',
    description: 'Content Tracker, quality scores, Gate 2 review queue',
    avatar: 'CE',
    name: 'James Okafor',
    visibleNav: ['/', '/content', '/gates'],
    showTelemetry: false,
    showTokenCosts: false,
    showAgentInternals: false,
  },
  [ROLES.AI_COE]: {
    label: 'AI COE',
    description: 'Full platform access — agents, telemetry, quality, incidents',
    avatar: 'AC',
    name: 'AI Centre of Excellence',
    visibleNav: ['/', '/pipeline', '/content', '/gates', '/performance', '/settings'],
    showTelemetry: true,
    showTokenCosts: true,
    showAgentInternals: true,
  },
};

export const useAppStore = create((set, get) => ({
  role: ROLES.MARKETING_HEAD,
  theme: 'light',
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  activeModal: null,

  setRole: (role) => set({ role }),
  setMobileSidebarOpen: (v) => set({ mobileSidebarOpen: v }),
  setTheme: (theme) => {
    set({ theme });
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },
  toggleTheme: () => {
    const { theme } = get();
    const next = theme === 'light' ? 'dark' : 'light';
    get().setTheme(next);
  },
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),

  getRoleConfig: () => ROLE_CONFIG[get().role],
  canSee: (feature) => {
    const config = ROLE_CONFIG[get().role];
    return config[feature] ?? false;
  },
}));
