import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'dark' | 'light';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
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

  const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>(getSystemTheme);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: light)');
    const listener = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'light' : 'dark');
    };
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  const resolvedTheme = theme === 'system' ? systemTheme : theme;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', resolvedTheme);
      document.body.classList.remove('theme-dark', 'theme-light');
      document.body.classList.add(`theme-${resolvedTheme}`);
    }
  }, [resolvedTheme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('app-theme', newTheme);
    } catch {}
  };

  const toggleTheme = () => {
    const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext);
  return context || defaultThemeContext;
}
