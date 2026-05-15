import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.jsx'
// 1. Importamos el registrador
import { registerSW } from 'virtual:pwa-register'

// 2. Activamos el registro inmediato
registerSW({ immediate: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)