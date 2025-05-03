import { useState, useEffect } from 'react'
import { TimerOverlay } from './components/TimerOverlay'

// Set the background to transparent immediately
if (typeof document !== 'undefined') {
  document.body.style.background = 'transparent'
}

function OverlayApp() {
  const [timeLeft, setTimeLeft] = useState(10)
  const [isRunning, setIsRunning] = useState(false)

  // Handle timer trigger
  useEffect(() => {
    console.log('Setting up timer trigger listener in overlay window')
    const handleTrigger = () => {
      console.log('Timer trigger received in overlay window')
      setTimeLeft(10) // Default to 10 seconds for overlay
      setIsRunning(true)
    }

    const cleanup = window.electronAPI.onTimerTrigger(handleTrigger)
    return () => {
      console.log('Cleaning up timer trigger listener in overlay window')
      cleanup()
    }
  }, [])

  // Handle countdown
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && timeLeft > 0) {
      console.log('Starting countdown in overlay:', timeLeft)
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            console.log('Timer finished in overlay')
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

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'transparent',
      backgroundColor: 'transparent',
    }}>
      <TimerOverlay timeLeft={timeLeft} isRunning={isRunning} />
    </div>
  )
}

export default OverlayApp 