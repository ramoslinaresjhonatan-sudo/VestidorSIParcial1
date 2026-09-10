import { BrowserRouter } from 'react-router-dom'
import { QueryProvider } from './QueryProvider'

export function AppProviders({ children }) {
  return (
    <BrowserRouter>
      <QueryProvider>{children}</QueryProvider>
    </BrowserRouter>
  )
}
