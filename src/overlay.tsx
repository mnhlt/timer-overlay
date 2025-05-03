import React from 'react'
import ReactDOM from 'react-dom/client'
import OverlayApp from './OverlayApp'
import './overlay.css'

// Set the background to transparent immediately
document.body.style.background = 'transparent'

// Create a separate root for the overlay
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <OverlayApp />
  </React.StrictMode>,
) 