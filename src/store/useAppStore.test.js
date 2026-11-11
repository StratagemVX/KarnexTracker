import { beforeAll, describe, expect, it } from "vitest";

let useAppStore;

beforeAll(async () => {
  const memory = new Map();
  globalThis.localStorage = {
    getItem: (k) => (memory.has(k) ? memory.get(k) : null),
    setItem: (k, v) => memory.set(k, String(v)),
    removeItem: (k) => memory.delete(k),
    clear: () => memory.clear(),
  };
  ({ useAppStore } = await import("./useAppStore.js"));
});

describe("KarnexTracker store", () => {
  it("adds, updates, toggles habits, and removes tasks cleanly", () => {
    const store = useAppStore.getState();
    store.addTask({ id: "t-1", title: "Audit release", done: false });
    expect(useAppStore.getState().tasks).toHaveLength(1);

    useAppStore.getState().updateTask("t-1", { done: true });
    expect(useAppStore.getState().tasks[0].done).toBe(true);

    useAppStore.getState().addHabit({ id: "h-1", name: "Daily tests", logs: {} });
    useAppStore.getState().toggleHabitLog("h-1", "2026-11-11");
    expect(useAppStore.getState().habits[0].logs["2026-11-11"]).toBe(true);

    useAppStore.getState().deleteTask("t-1");
    expect(useAppStore.getState().tasks).toHaveLength(0);
  });
});
