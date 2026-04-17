import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { PlatformProvider } from './context/PlatformContext'
import './index.css'

const basename = import.meta.env.BASE_URL === '/' ? '/' : import.meta.env.BASE_URL.replace(/\/$/, '')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PlatformProvider>
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </PlatformProvider>
  </React.StrictMode>,
)
