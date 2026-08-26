// Theme mode constants and helpers (light/dark/auto) shared with the root HTML.

export type ThemeMode = "light" | "dark" | "auto";

export const THEME_STORAGE_KEY = "theme";

export const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('${THEME_STORAGE_KEY}');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`;

export function getInitialMode(): ThemeMode {
  if (typeof window === "undefined") {
    return "auto";
  }
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "auto") {
    return stored;
  }
  return "auto";
}

export function applyThemeMode(mode: ThemeMode) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved = mode === "auto" ? (prefersDark ? "dark" : "light") : mode;

  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(resolved);

  if (mode === "auto") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", mode);
  }

  document.documentElement.style.colorScheme = resolved;
}
