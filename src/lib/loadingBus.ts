// src/lib/loadingBus.ts
// A tiny global loading event bus used to coordinate loading state across non-React modules and React UI

export type LoadingListener = (isLoading: boolean, activeTags: Set<string>) => void;

class LoadingBus {
  private counter = 0;
  private tags = new Map<string, number>();
  private listeners = new Set<LoadingListener>();

  subscribe(fn: LoadingListener) {
    this.listeners.add(fn);
    // Push current state to new subscriber
    fn(this.isLoading(), this.activeTags());
    return () => {
      this.listeners.delete(fn);
    };
  }

  private emit() {
    const loading = this.isLoading();
    const tags = this.activeTags();
    for (const l of this.listeners) l(loading, tags);
  }

  isLoading() {
    return this.counter > 0;
  }

  activeTags() {
    return new Set(this.tags.keys());
  }

  begin(tag = "global") {
    this.counter++;
    this.tags.set(tag, (this.tags.get(tag) || 0) + 1);
    this.emit();
  }

  end(tag = "global") {
    if (this.counter > 0) this.counter--;
    if (this.tags.has(tag)) {
      const next = (this.tags.get(tag) || 1) - 1;
      if (next <= 0) this.tags.delete(tag);
      else this.tags.set(tag, next);
    }
    this.emit();
  }

  async wrap<T>(promiseOrFn: Promise<T> | (() => Promise<T>), tag = "global"): Promise<T> {
    this.begin(tag);
    try {
      const p = typeof promiseOrFn === "function" ? (promiseOrFn as () => Promise<T>)() : promiseOrFn;
      return await p;
    } finally {
      this.end(tag);
    }
  }
}

export const loadingBus = new LoadingBus();
