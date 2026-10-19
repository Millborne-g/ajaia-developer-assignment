import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

type ThemeChoice = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

interface ThemeContextValue {
  theme: ThemeChoice
  resolvedTheme: ResolvedTheme
  setTheme: (theme: ThemeChoice) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => undefined,
})

function getResolvedTheme(choice: ThemeChoice): ResolvedTheme {
  if (choice === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }
  return choice
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeChoice>(() => {
    const stored = localStorage.getItem('theme') as ThemeChoice | null
    return stored === 'light' || stored === 'dark' || stored === 'system'
      ? stored
      : 'system'
  })

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    getResolvedTheme(theme),
  )

  useEffect(() => {
    const root = document.documentElement
    const mq = window.matchMedia('(prefers-color-scheme: dark)')

    function apply() {
      const resolved = getResolvedTheme(theme)
      setResolvedTheme(resolved)
      root.classList.toggle('dark', resolved === 'dark')
    }

    apply()

    if (theme === 'system') {
      mq.addEventListener('change', apply)
      return () => mq.removeEventListener('change', apply)
    }
    return undefined
  }, [theme])

  function setTheme(choice: ThemeChoice) {
    setThemeState(choice)
    localStorage.setItem('theme', choice)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// useTheme is co-located with ThemeProvider to share the private ThemeContext.
// eslint-disable-next-line react-refresh/only-export-components
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext)
}
