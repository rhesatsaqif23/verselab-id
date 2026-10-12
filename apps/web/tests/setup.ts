// Global test setup: polyfills used by every test suite.
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = globalThis.ResizeObserver ?? ResizeObserverMock;

// jsdom ships no matchMedia, which responsive hooks (useIsMobile) need.
// Parse the width condition against jsdom's default 1024px window so tests
// behave like a desktop viewport unless a suite overrides innerWidth.
class MediaQueryListMock {
  onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => unknown) | null = null;
  constructor(readonly media: string) {}
  get matches(): boolean {
    const max = /\(max-width:\s*([\d.]+)px\)/.exec(this.media);
    if (max) return window.innerWidth <= Number(max[1]);
    const min = /\(min-width:\s*([\d.]+)px\)/.exec(this.media);
    if (min) return window.innerWidth >= Number(min[1]);
    return false;
  }
  addEventListener() {}
  removeEventListener() {}
  addListener() {}
  removeListener() {}
  dispatchEvent() {
    return true;
  }
}

if (typeof window.matchMedia !== "function") {
  window.matchMedia = (query: string) => new MediaQueryListMock(query) as unknown as MediaQueryList;
}
