import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/globals.css'
import { reportContent } from '@/lib/validateContent'
import App from '@/app/App'

// Dev-only structural + timing check on the presentation data.
reportContent()

const container = document.getElementById('root')
if (!container) throw new Error('Root element #root not found.')

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
