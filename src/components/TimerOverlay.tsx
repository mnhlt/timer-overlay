import { useState } from 'react'

interface TimerOverlayProps {
  timeLeft: number
  isRunning: boolean
}

export function TimerOverlay({ timeLeft }: TimerOverlayProps) {
  const [isLocked, setIsLocked] = useState(false)

  return (
    <div className="overlay-window" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      WebkitUserSelect: 'none',
      WebkitAppRegion: isLocked ? 'none' : 'drag',
      cursor: isLocked ? 'default' : 'move',
      position: 'relative',
      pointerEvents: isLocked ? 'none' : 'auto',
    } as React.CSSProperties}>
      <div style={{
        fontSize: '48px',
        fontWeight: 'bold',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
        fontFamily: 'monospace',
      }}>
        {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:
        {String(timeLeft % 60).padStart(2, '0')}
      </div>
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        display: 'flex',
        gap: '8px',
        zIndex: 1000,
      }}>
        <button 
          className="overlay-button"
          onClick={() => setIsLocked(!isLocked)}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.3')}
          style={{ 
            pointerEvents: 'auto',
            opacity: isLocked ? 0.3 : undefined 
          } as React.CSSProperties}
        >
          {isLocked ? '🔓' : '🔒'}
        </button>
        <button 
          className="overlay-button"
          onClick={() => window.electronAPI.toggleOverlayMode(false)}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.3')}
          style={{ 
            pointerEvents: isLocked ? 'none' : 'auto',
            display: isLocked ? 'none' : 'block'
          } as React.CSSProperties}
        >
          Main
        </button>
      </div>
    </div>
  )
} 