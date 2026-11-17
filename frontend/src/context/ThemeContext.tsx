import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Theme = 'dark' | 'light' | 'system';
export type AccentColor = 'violet' | 'amber' | 'emerald' | 'blue' | 'crimson';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'dark' | 'light';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  accentColor: AccentColor;
  setAccentColor: (accent: AccentColor) => void;
}

function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'dark';
  try {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

const defaultThemeContext: ThemeContextType = {
  theme: 'dark',
  resolvedTheme: 'dark',
  setTheme: (t: Theme) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('app-theme', t);
        const res = t === 'system' ? getSystemTheme() : t;
        document.documentElement.setAttribute('data-theme', res);
        document.body.classList.remove('theme-dark', 'theme-light');
        document.body.classList.add(`theme-${res}`);
      } catch {}
    }
  },
  toggleTheme: () => {
    if (typeof window !== 'undefined') {
      try {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        localStorage.setItem('app-theme', next);
        document.documentElement.setAttribute('data-theme', next);
        document.body.classList.remove('theme-dark', 'theme-light');
        document.body.classList.add(`theme-${next}`);
      } catch {}
    }
  },
  accentColor: 'violet',
  setAccentColor: (a: AccentColor) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('app-accent', a);
        document.documentElement.setAttribute('data-accent', a);
      } catch {}
    }
  },
};

const ThemeContext = createContext<ThemeContextType>(defaultThemeContext);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('app-theme') as Theme | null;
        if (saved && (saved === 'dark' || saved === 'light' || saved === 'system')) {
          return saved;
        }
      } catch {}
    }
    return 'dark'; // Default to dark for RPG app
  });

  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('app-accent') as AccentColor | null;
        if (saved && ['violet', 'amber', 'emerald', 'blue', 'crimson'].includes(saved)) {
          return saved;
        }
      } catch {}
    }
    return 'violet'; // Default to violet as requested
  });

  const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>(getSystemTheme);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    try {
      const media = window.matchMedia('(prefers-color-scheme: light)');
      const listener = (e: MediaQueryListEvent) => {
        setSystemTheme(e.matches ? 'light' : 'dark');
      };
      media.addEventListener?.('change', listener);
      return () => media.removeEventListener?.('change', listener);
    } catch {}
  }, []);

  const resolvedTheme = theme === 'system' ? systemTheme : theme;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', resolvedTheme);
      document.body.classList.remove('theme-dark', 'theme-light');
      document.body.classList.add(`theme-${resolvedTheme}`);
    }
  }, [resolvedTheme]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-accent', accentColor);
    }
  }, [accentColor]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('app-theme', newTheme);
    } catch {}
  };

  const setAccentColor = (newAccent: AccentColor) => {
    setAccentColorState(newAccent);
    try {
      localStorage.setItem('app-accent', newAccent);
    } catch {}
  };

  const toggleTheme = () => {
    const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme, accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext);
  return context || defaultThemeContext;
}
