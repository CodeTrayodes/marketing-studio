import { create } from 'zustand';
import { ALL_CONTENT } from '../data/content';

export const useContentStore = create((set, get) => ({
  assets: ALL_CONTENT,
  filterBU: 'all',
  filterType: 'all',
  filterStatus: 'all',
  filterSearch: '',
  selectedAsset: null,
  sortField: 'createdAt',
  sortDir: 'desc',

  setFilterBU: (v) => set({ filterBU: v }),
  setFilterType: (v) => set({ filterType: v }),
  setFilterStatus: (v) => set({ filterStatus: v }),
  setFilterSearch: (v) => set({ filterSearch: v }),
  setSort: (field) =>
    set((s) => ({
      sortField: field,
      sortDir: s.sortField === field && s.sortDir === 'desc' ? 'asc' : 'desc',
    })),
  selectAsset: (id) => set({ selectedAsset: id ? get().assets.find((a) => a.id === id) : null }),

  getFilteredAssets: () => {
    const { assets, filterBU, filterType, filterStatus, filterSearch, sortField, sortDir } = get();
    let result = assets;

    if (filterBU !== 'all') result = result.filter((a) => a.buId === filterBU);
    if (filterType !== 'all') result = result.filter((a) => a.type === filterType);
    if (filterStatus !== 'all') result = result.filter((a) => a.status === filterStatus);
    if (filterSearch.trim()) {
      const q = filterSearch.toLowerCase();
      result = result.filter(
        (a) => a.title.toLowerCase().includes(q) || a.buName.toLowerCase().includes(q) || a.agentName.toLowerCase().includes(q)
      );
    }

    result = [...result].sort((a, b) => {
      let av = a[sortField];
      let bv = b[sortField];
      if (av instanceof Date) av = av.getTime();
      if (bv instanceof Date) bv = bv.getTime();
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  },

  approveAsset: (id) =>
    set(s => ({ assets: s.assets.map(a => a.id === id ? { ...a, status: 'approved' } : a) })),

  reviseAsset: (id, note) =>
    set(s => ({ assets: s.assets.map(a => a.id === id ? { ...a, status: 'draft', revisionNote: note } : a) })),

  getStats: () => {
    const assets = get().assets;
    return {
      total: assets.length,
      published: assets.filter((a) => a.status === 'published').length,
      inProgress: assets.filter((a) => ['draft', 'qa-review'].includes(a.status)).length,
      pendingGate: assets.filter((a) => ['gate-2-pending', 'gate-3-pending'].includes(a.status)).length,
      approved: assets.filter((a) => a.status === 'approved').length,
      errors: assets.filter((a) => a.status === 'error').length,
      avgQuality: Math.round(
        assets.filter((a) => a.qualityScores?.overall).reduce((s, a) => s + a.qualityScores.overall, 0) /
          assets.filter((a) => a.qualityScores?.overall).length
      ),
    };
  },
}));
