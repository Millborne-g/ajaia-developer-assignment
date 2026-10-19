import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from './theme'
import { AuthProvider } from './providers'
import { router } from './router'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  )
}
