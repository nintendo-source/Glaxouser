import { create } from "zustand";
import { persist } from "zustand/middleware";
import { hostnameOf, titleFromUrl, toBrowseUrl } from "@/lib/browse";

export type PanelId = "none" | "gx" | "color" | "bookmarks" | "history" | "settings";

export type Tab = {
  id: string;
  title: string;
  url: string;
  history: string[];
  historyIndex: number;
  loading: boolean;
};

export type Bookmark = {
  id: string;
  title: string;
  url: string;
  createdAt: number;
};

export type HistoryEntry = {
  id: string;
  title: string;
  url: string;
  visitedAt: number;
};

function nid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function makeTab(url = ""): Tab {
  return {
    id: nid("tab"),
    title: titleFromUrl(url),
    url,
    history: [url],
    historyIndex: 0,
    loading: Boolean(url),
  };
}

type BrowserState = {
  tabs: Tab[];
  activeId: string;
  panel: PanelId;
  addressDraft: string;
  bookmarks: Bookmark[];
  history: HistoryEntry[];
  setPanel: (panel: PanelId) => void;
  togglePanel: (panel: Exclude<PanelId, "none">) => void;
  setAddressDraft: (v: string) => void;
  activeTab: () => Tab;
  newTab: (url?: string) => void;
  closeTab: (id: string) => void;
  selectTab: (id: string) => void;
  navigate: (input: string, opts?: { fromAddress?: boolean }) => void;
  back: () => void;
  forward: () => void;
  reload: () => void;
  home: () => void;
  setTabLoading: (id: string, loading: boolean) => void;
  star: () => void;
  unstar: (id: string) => void;
  isStarred: (url: string) => boolean;
  clearHistory: () => void;
};

function pushHistory(state: BrowserState, url: string, title: string): HistoryEntry[] {
  if (!url) return state.history;
  const next: HistoryEntry = {
    id: nid("h"),
    title,
    url,
    visitedAt: Date.now(),
  };
  return [next, ...state.history.filter((h) => h.url !== url)].slice(0, 80);
}

const initialTab: Tab = {
  id: "tab-home",
  title: "New tab",
  url: "",
  history: [""],
  historyIndex: 0,
  loading: false,
};

export const useBrowserStore = create<BrowserState>()(
  persist(
    (set, get) => ({
      tabs: [initialTab],
      activeId: initialTab.id,
      panel: "none",
      addressDraft: "",
      bookmarks: [
        {
          id: "bm-yt",
          title: "Glaxiblade",
          url: "https://www.youtube.com/embed?listType=search&list=Glaxiblade",
          createdAt: Date.now(),
        },
        {
          id: "bm-wiki",
          title: "Wikipedia",
          url: "https://en.wikipedia.org",
          createdAt: Date.now(),
        },
        {
          id: "bm-g",
          title: "Google",
          url: "https://www.google.com/webhp?igu=1",
          createdAt: Date.now(),
        },
      ],
      history: [],
      setPanel: (panel) => set({ panel }),
      togglePanel: (panel) =>
        set((s) => ({ panel: s.panel === panel ? "none" : panel })),
      setAddressDraft: (addressDraft) => set({ addressDraft }),
      activeTab: () => {
        const s = get();
        return s.tabs.find((t) => t.id === s.activeId) ?? s.tabs[0]!;
      },
      newTab: (url = "") => {
        const tab = makeTab(url);
        set((s) => ({
          tabs: [...s.tabs, tab],
          activeId: tab.id,
          addressDraft: url,
          panel: "none",
        }));
      },
      closeTab: (id) => {
        set((s) => {
          if (s.tabs.length === 1) {
            const tab = makeTab();
            return { tabs: [tab], activeId: tab.id, addressDraft: "" };
          }
          const idx = s.tabs.findIndex((t) => t.id === id);
          const tabs = s.tabs.filter((t) => t.id !== id);
          const next = s.activeId === id ? tabs[Math.max(0, idx - 1)]! : s.tabs.find((t) => t.id === s.activeId)!;
          return { tabs, activeId: next.id, addressDraft: next.url };
        });
      },
      selectTab: (id) => {
        const tab = get().tabs.find((t) => t.id === id);
        if (!tab) return;
        set({ activeId: id, addressDraft: tab.url, panel: "none" });
      },
      navigate: (input, opts) => {
        const url = opts?.fromAddress ? toBrowseUrl(input) : input;
        const title = titleFromUrl(url);
        set((s) => {
          const tabs = s.tabs.map((t) => {
            if (t.id !== s.activeId) return t;
            const history = [...t.history.slice(0, t.historyIndex + 1), url];
            return {
              ...t,
              url,
              title,
              history,
              historyIndex: history.length - 1,
              loading: Boolean(url),
            };
          });
          return {
            tabs,
            addressDraft: url,
            history: pushHistory(s, url, title),
            panel: "none",
          };
        });
      },
      back: () => {
        set((s) => {
          const tabs = s.tabs.map((t) => {
            if (t.id !== s.activeId || t.historyIndex <= 0) return t;
            const historyIndex = t.historyIndex - 1;
            const url = t.history[historyIndex] ?? "";
            return { ...t, historyIndex, url, title: titleFromUrl(url), loading: Boolean(url) };
          });
          const active = tabs.find((t) => t.id === s.activeId)!;
          return { tabs, addressDraft: active.url };
        });
      },
      forward: () => {
        set((s) => {
          const tabs = s.tabs.map((t) => {
            if (t.id !== s.activeId || t.historyIndex >= t.history.length - 1) return t;
            const historyIndex = t.historyIndex + 1;
            const url = t.history[historyIndex] ?? "";
            return { ...t, historyIndex, url, title: titleFromUrl(url), loading: Boolean(url) };
          });
          const active = tabs.find((t) => t.id === s.activeId)!;
          return { tabs, addressDraft: active.url };
        });
      },
      reload: () => {
        set((s) => ({
          tabs: s.tabs.map((t) =>
            t.id === s.activeId && t.url ? { ...t, loading: true } : t,
          ),
        }));
      },
      home: () => {
        set((s) => {
          const tabs = s.tabs.map((t) => {
            if (t.id !== s.activeId) return t;
            const history = [...t.history.slice(0, t.historyIndex + 1), ""];
            return {
              ...t,
              url: "",
              title: "New tab",
              history,
              historyIndex: history.length - 1,
              loading: false,
            };
          });
          return { tabs, addressDraft: "", panel: "none" };
        });
      },
      setTabLoading: (id, loading) =>
        set((s) => ({
          tabs: s.tabs.map((t) => (t.id === id ? { ...t, loading } : t)),
        })),
      star: () => {
        const tab = get().activeTab();
        if (!tab.url) return;
        set((s) => {
          if (s.bookmarks.some((b) => b.url === tab.url)) return s;
          return {
            bookmarks: [
              {
                id: nid("bm"),
                title: tab.title || hostnameOf(tab.url),
                url: tab.url,
                createdAt: Date.now(),
              },
              ...s.bookmarks,
            ],
          };
        });
      },
      unstar: (id) => set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.id !== id) })),
      isStarred: (url) => get().bookmarks.some((b) => b.url === url),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: "glaxigx-browser",
      partialize: (s) => ({
        tabs: s.tabs.map((t) => ({ ...t, loading: false })),
        activeId: s.activeId,
        bookmarks: s.bookmarks,
        history: s.history,
        addressDraft: s.addressDraft,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (!state.activeId || !state.tabs.some((t) => t.id === state.activeId)) {
          state.activeId = state.tabs[0]?.id ?? "";
        }
      },
    },
  ),
);

export function ensureActiveId() {
  const s = useBrowserStore.getState();
  if (!s.activeId && s.tabs[0]) {
    useBrowserStore.setState({ activeId: s.tabs[0].id });
  }
}
