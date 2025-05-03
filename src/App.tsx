import { useState, useEffect } from 'react'
import { Timer } from './components/Timer'
import { HotkeySelector } from './components/HotkeySelector'

function App() {
  const [countdownTime, setCountdownTime] = useState(10)
  const [timeLeft, setTimeLeft] = useState(10)
  const [isRunning, setIsRunning] = useState(false)

  // Handle timer trigger
  useEffect(() => {
    console.log('Setting up timer trigger listener in main window')
    const handleTrigger = () => {
      console.log('Timer trigger received in main window')
      setTimeLeft(countdownTime)
      setIsRunning(true)
    }

    const cleanup = window.electronAPI.onTimerTrigger(handleTrigger)
    return () => {
      console.log('Cleaning up timer trigger listener in main window')
      cleanup()
    }
  }, [countdownTime])

  // Handle countdown
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && timeLeft > 0) {
      console.log('Starting countdown:', timeLeft)
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            console.log('Timer finished')
            setIsRunning(false)
            return 0
          }
          return time - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isRunning, timeLeft])

  const toggleOverlay = () => {
    window.electronAPI.toggleOverlayMode(true)
  }

  return (
    <div className="main-window"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'white',
        gap: '2rem',
      }}
    >
      <Timer timeLeft={timeLeft} />
      
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <label>Countdown Time (seconds):</label>
        <input
          type="number"
          min="1"
          value={countdownTime}
          onChange={(e) => {
            const newTime = Math.max(1, parseInt(e.target.value) || 1)
            setCountdownTime(newTime)
            if (!isRunning) {
              setTimeLeft(newTime)
            }
          }}
          style={{ padding: '0.5rem' }}
        />
      </div>
      
      <div>
        <h3>Hotkey Setup</h3>
        <HotkeySelector />
      </div>
      
      <button
        onClick={toggleOverlay}
        style={{
          padding: '0.5rem 1rem',
          cursor: 'pointer',
          background: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
        }}
      >
        Switch to Overlay
      </button>
    </div>
  )
}

export default App
